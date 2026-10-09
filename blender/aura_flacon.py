"""AURA Flakon: prozedurales, fotorealistisches Blender-Modell (Bernstein-Variante).

Aufruf (Blender 4.2+):
    blender -b -P blender/aura_flacon.py -- --blend blender/aura_flacon.blend
    blender -b -P blender/aura_flacon.py -- --out vorschau.png --samples 32 --res 480 600

Optionen siehe parse_args(). 1 Blender-Einheit entspricht 10 cm.
"""

import argparse
import math
import os
import random
import sys
import urllib.request

import bmesh
import bpy
from mathutils import Vector, noise
from mathutils.bvhtree import BVHTree

HERE = os.path.dirname(os.path.abspath(__file__))
HDRI_NAME = "studio_small_09_2k.exr"
HDRI_URL = "https://dl.polyhaven.org/file/ph-assets/HDRIs/exr/2k/" + HDRI_NAME

TAU = 2.0 * math.pi
FRONT = -math.pi / 2  # Winkel, der zur Kamera zeigt (-Y)


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    p = argparse.ArgumentParser()
    p.add_argument("--out", default=os.path.join(HERE, "renders", "aura_flacon_bernstein.png"))
    p.add_argument("--samples", type=int, default=256)
    p.add_argument("--res", type=int, nargs=2, default=[1600, 2000])
    p.add_argument("--blend", default=None, help="Szene zusätzlich als .blend speichern")
    p.add_argument("--hdri", default=os.path.join(HERE, "hdri", HDRI_NAME))
    p.add_argument("--no-render", action="store_true")
    return p.parse_known_args(argv)[0]


# ---------------------------------------------------------------- Hilfen


def lerp(a, b, t):
    return a + (b - a) * t


def smoothstep(e0, e1, x):
    t = min(max((x - e0) / (e1 - e0), 0.0), 1.0)
    return t * t * (3.0 - 2.0 * t)


def smax(a, b, k):
    """Weiches Maximum, damit Übergänge keine Knicke bekommen."""
    return 0.5 * (a + b + math.sqrt((a - b) ** 2 + k * k))


def wrap(a):
    return (a + math.pi) % TAU - math.pi


def interp(table, z):
    if z <= table[0][0]:
        return table[0][1]
    for (z0, r0), (z1, r1) in zip(table, table[1:]):
        if z <= z1:
            return lerp(r0, r1, (z - z0) / (z1 - z0))
    return table[-1][1]


def material(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    return m, m.node_tree.nodes, m.node_tree.links, m.node_tree.nodes["Principled BSDF"]


# ---------------------------------------------------------------- Glaskörper

# Halbe Breite des Flakons über der Höhe (z, r), aus der Silhouette der Referenz
# gemessen (Gesamthöhe mit Kappe 1.45). Tiefe = Breite * DEPTH.
OUTER_PROFILE = [
    (0.00, 0.30),
    (0.08, 0.32),
    (0.19, 0.37),
    (0.30, 0.42),
    (0.41, 0.47),
    (0.52, 0.51),
    (0.63, 0.537),
    (0.70, 0.545),
    (0.80, 0.53),
    (0.94, 0.44),
    (1.03, 0.33),
    (1.12, 0.19),
]
DEPTH = 0.70
WIDTH = 0.93  # Gesamtskalierung der Breite
GLASS_LIFT = 0.0008  # minimal über dem Boden, damit keine Flächen zusammenfallen
FACET_ROUND = 0.05  # Kantenradius der Facetten
WALL = 0.075  # Glaswand
BASE = 0.13  # Glasboden


def gem_points(profile, levels, per_level, rng, rjit, zjit, depth):
    pts = []
    last = len(levels) - 1
    for li, z0 in enumerate(levels):
        n = per_level[li]
        off = rng.uniform(0.0, TAU)
        for k in range(n):
            a = off + TAU * k / n + rng.uniform(-0.28, 0.28) * TAU / n
            z = z0 if li in (0, last) else z0 + rng.uniform(-zjit, zjit)
            r = interp(profile, z) * WIDTH * (1.0 + rng.uniform(-rjit, rjit))
            pts.append(Vector((r * math.cos(a), r * depth * math.sin(a), z)))
    return pts


def hull(points):
    bm = bmesh.new()
    verts = [bm.verts.new(p) for p in points]
    res = bmesh.ops.convex_hull(bm, input=verts)
    junk = set(res["geom_interior"]) | set(res["geom_unused"])
    bmesh.ops.delete(bm, geom=[v for v in junk if isinstance(v, bmesh.types.BMVert)], context="VERTS")
    bmesh.ops.dissolve_limit(bm, angle_limit=math.radians(2.0), verts=bm.verts[:], edges=bm.edges[:])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    return bm


def append_bm(dst, src, flip=False):
    vmap = {v: dst.verts.new(v.co) for v in src.verts}
    for f in src.faces:
        vs = [vmap[v] for v in f.verts]
        if flip:
            vs.reverse()
        dst.faces.new(vs)


def bm_to_object(bm, name):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    for poly in me.polygons:
        poly.use_smooth = True
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    return ob


def soften(ob, levels=2, render_levels=3):
    """Flache Facetten mit runden Kanten (Bevel als Stützkanten, dann Subdivision).
    Die Standfläche bleibt eben (volle Crease an ihren Kanten)."""
    me = ob.data
    keys = {tuple(sorted(e.vertices)): e.index for e in me.edges}
    values = [0.0] * len(me.edges)
    for poly in me.polygons:
        if poly.normal.z < -0.999 and poly.center.z < 0.01:
            for k in poly.edge_keys:
                values[keys[tuple(sorted(k))]] = 1.0
    attr = me.attributes.new("crease_edge", "FLOAT", "EDGE")
    attr.data.foreach_set("value", values)
    bev = ob.modifiers.new("Kanten", "BEVEL")
    bev.width = FACET_ROUND
    bev.segments = 2
    bev.limit_method = "ANGLE"
    bev.angle_limit = math.radians(5.0)
    mod = ob.modifiers.new("Weich", "SUBSURF")
    mod.levels = levels
    mod.render_levels = render_levels
    mod.use_creases = True
    mod.quality = 4
    return mod


def evaluated_bvh(ob):
    dg = bpy.context.evaluated_depsgraph_get()
    ev = ob.evaluated_get(dg)
    me = ev.to_mesh()
    bvh = BVHTree.FromPolygons([v.co.copy() for v in me.vertices], [p.vertices[:] for p in me.polygons])
    verts = [v.co.copy() for v in me.vertices]
    ev.to_mesh_clear()
    return bvh, verts


def build_glass(seed=7):
    rng = random.Random(seed)
    outer_pts = gem_points(
        OUTER_PROFILE,
        levels=[0.0, 0.24, 0.48, 0.70, 0.94, 1.12],
        per_level=[5, 6, 6, 6, 5, 5],
        rng=rng,
        rjit=0.07,
        zjit=0.05,
        depth=DEPTH,
    )
    for p in outer_pts:
        p.z += GLASS_LIFT
    bm_out = hull(outer_pts)
    planes = [(f.normal.copy(), f.calc_center_median()) for f in bm_out.faces]

    def sdist(p):
        return max(n.dot(p - c) for n, c in planes)

    # Innenraum: nach innen versetzte Außenform, damit die Wand überall gleich dick
    # wirkt; der Boden bleibt deutlich dicker
    cav_pts = []
    for v in bm_out.verts:
        p = v.co - v.normal * WALL
        p.z = max(p.z, BASE + GLASS_LIFT)
        p.z = min(p.z, 1.04)
        cav_pts.append(p)
    for p in cav_pts:
        for _ in range(80):
            if sdist(p) < -WALL * 0.8:
                break
            p.x *= 0.98
            p.y *= 0.98
    bm_cav = hull(cav_pts)

    # Außenhaut allein auswerten: daran wird die Kappe angepasst
    probe = bm_to_object(bm_out.copy(), "tmp_aussen")
    soften(probe, levels=3)
    bvh, _ = evaluated_bvh(probe)
    bpy.data.objects.remove(probe)

    bm_glass = bmesh.new()
    append_bm(bm_glass, bm_out)
    append_bm(bm_glass, bm_cav, flip=True)
    glass = bm_to_object(bm_glass, "Flakon_Glas")
    soften(glass)

    # Flüssigkeit überlappt die Innenwand minimal (übliches Vorgehen in Cycles)
    for v in bm_cav.verts:
        v.co += v.normal * 0.0025
    liquid = bm_to_object(bm_cav, "Flakon_Fluessigkeit")
    soften(liquid)

    _, liquid_verts = evaluated_bvh(liquid)
    gap = min((bvh.find_nearest(v)[0] - v).length for v in liquid_verts)
    print(f"Mindestwandstärke Glas: {gap:.4f}")
    return glass, liquid, bvh


# ---------------------------------------------------------------- Goldkappe

CAP_TOP = 1.45
CAP_GAP = 0.034  # Wandstärke der Kappe am Rand
TOP_HALF = (0.172, 0.125)  # Deckfläche, halbe Breite/Tiefe
TOP_ROT = 0.35

# Falten: (Winkel am Rand, Drehung bis oben, Breite, Höhe relativ zum Radius, Start t)
FOLDS = [
    (FRONT + 0.10, 0.35, 0.34, -0.220, 0.25),  # Mittelfalte von oben
    (FRONT - 0.85, 0.90, 1.00, +0.170, 0.00),  # großer Bauch links
    (FRONT + 0.85, 1.10, 0.40, -0.190, 0.05),  # schräge Falte rechts
    (FRONT + 1.55, 0.90, 0.90, +0.150, 0.00),
    (FRONT + 2.60, 1.00, 0.80, +0.150, 0.00),
    (FRONT + 3.30, 1.20, 0.36, -0.170, 0.10),
    (FRONT + 4.20, 0.90, 0.90, +0.160, 0.00),
    (FRONT + 4.90, 1.00, 0.36, -0.150, 0.20),
]
LUMPS = 0.11  # großflächige, organische Dellen


# Unterkante der Kappe: Höhe in gleichen Winkelschritten, beginnend vorn, dann nach rechts
RIM = [0.975, 1.0, 0.95, 0.87, 0.81, 0.84, 0.90, 0.94, 0.95, 0.93, 0.89, 0.84, 0.79, 0.86, 0.95, 1.0]


def rim_height(a):
    """Periodische Catmull-Rom-Kurve durch die RIM-Stützpunkte."""
    n = len(RIM)
    u = ((a - FRONT) % TAU) / TAU * n
    i = int(u)
    t = u - i
    p0, p1, p2, p3 = (RIM[(i + k) % n] for k in (-1, 0, 1, 2))
    return 0.5 * (
        2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t**3
    )


def top_radius(a):
    a = a - TOP_ROT
    ax, ay = TOP_HALF
    n = 3.2
    return (abs(math.cos(a) / ax) ** n + abs(math.sin(a) / ay) ** n) ** (-1.0 / n)


def fold(a, t):
    s = 0.0
    for a0, twist, width, amp, t0 in FOLDS:
        d = wrap(a - a0 - twist * t)
        if abs(d) < width:
            if amp < 0:  # Täler schmal und scharf, Bäuche breit und weich
                bump = (1.0 - abs(d) / width) ** 2
            else:
                bump = 0.5 * (1.0 + math.cos(math.pi * d / width))
            s += amp * bump * smoothstep(t0, t0 + 0.3, t + 0.15)
    s += LUMPS * noise.noise(Vector((math.cos(a) * 1.6, math.sin(a) * 1.6, t * 1.8 + 3.1)))
    s += 0.4 * LUMPS * noise.noise(Vector((math.cos(a) * 3.5 + 7.0, math.sin(a) * 3.5, t * 3.5)))
    env = 0.2 + 0.8 * smoothstep(0.0, 0.35, t)
    env *= 1.0 - 0.3 * smoothstep(0.8, 1.0, t)
    return s * env


def build_cap(bvh, nt=144, nr=56):
    def glass_r(a, z):
        o = Vector((0.0, 0.0, z))
        hit = bvh.ray_cast(o, Vector((math.cos(a), math.sin(a), 0.0)), 5.0)
        return (hit[0] - o).length if hit[0] is not None else 0.0

    angles = [TAU * j / nt for j in range(nt)]
    rings = []

    def ring(fn):
        rings.append([fn(a) for a in angles])

    def at(a, r, z):
        return Vector((r * math.cos(a), r * math.sin(a), z))

    # Innenseite (versteckt) und Rand
    ring(lambda a: at(a, glass_r(a, rim_height(a) + 0.12) + 0.002, rim_height(a) + 0.12))
    ring(lambda a: at(a, glass_r(a, rim_height(a) + 0.03) + 0.0015, rim_height(a) + 0.03))
    ring(lambda a: at(a, glass_r(a, rim_height(a) - 0.004) + 0.0015, rim_height(a) - 0.004))
    ring(lambda a: at(a, glass_r(a, rim_height(a) - 0.008) + CAP_GAP * 0.35, rim_height(a) - 0.008))
    ring(lambda a: at(a, glass_r(a, rim_height(a) - 0.006) + CAP_GAP * 0.85, rim_height(a) - 0.006))

    # Außenhaut
    for i in range(nr + 1):
        t = i / nr

        def outer(a, t=t):
            zr = rim_height(a)
            z = lerp(zr, CAP_TOP, t)
            r_rim = glass_r(a, zr) + CAP_GAP
            r = lerp(r_rim, top_radius(a), t)
            r = smax(r, glass_r(a, z) + CAP_GAP, 0.025)
            r *= 1.0 + fold(a, t)
            r = smax(r, glass_r(a, z) + CAP_GAP * 0.5, 0.01)
            return at(a, r, z)

        ring(outer)

    # Abgerundete Deckfläche
    top = rings[-1]
    for scale, dz in ((0.93, 0.010), (0.75, 0.020), (0.45, 0.026), (0.18, 0.028)):
        rings.append([Vector((p.x * scale, p.y * scale, CAP_TOP + dz)) for p in top])

    bm = bmesh.new()
    vrings = [[bm.verts.new(p) for p in r] for r in rings]
    for r0, r1 in zip(vrings, vrings[1:]):
        for j in range(nt):
            k = (j + 1) % nt
            bm.faces.new((r0[j], r0[k], r1[k], r1[j]))
    bottom_c = bm.verts.new(Vector((0.0, 0.0, sum(p.z for p in rings[0]) / nt + 0.05)))
    top_c = bm.verts.new(Vector((0.0, 0.0, CAP_TOP + 0.0285)))
    for j in range(nt):
        k = (j + 1) % nt
        bm.faces.new((bottom_c, vrings[0][k], vrings[0][j]))
        bm.faces.new((top_c, vrings[-1][j], vrings[-1][k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])

    cap = bm_to_object(bm, "Flakon_Kappe")
    sub = cap.modifiers.new("Glatt", "SUBSURF")
    sub.levels = 2
    sub.render_levels = 2
    return cap


# ---------------------------------------------------------------- Materialien


def mat_glass():
    m, nodes, links, p = material("Glas_Bernstein")
    p.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["Roughness"].default_value = 0.0
    p.inputs["IOR"].default_value = 1.52
    vol = nodes.new("ShaderNodeVolumeAbsorption")
    vol.inputs["Color"].default_value = (0.98, 0.88, 0.40, 1.0)
    vol.inputs["Density"].default_value = 3.0
    links.new(vol.outputs[0], nodes["Material Output"].inputs["Volume"])
    return m


def mat_liquid():
    m, nodes, links, p = material("Parfum_Bernstein")
    p.inputs["Base Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    p.inputs["Transmission Weight"].default_value = 1.0
    p.inputs["Roughness"].default_value = 0.0
    p.inputs["IOR"].default_value = 1.36
    vol = nodes.new("ShaderNodeVolumeAbsorption")
    vol.inputs["Color"].default_value = (0.95, 0.68, 0.0, 1.0)
    vol.inputs["Density"].default_value = 8.0
    links.new(vol.outputs[0], nodes["Material Output"].inputs["Volume"])
    return m


def mat_gold():
    m, nodes, links, p = material("Gold_poliert")
    p.inputs["Base Color"].default_value = (1.0, 0.45, 0.08, 1.0)
    p.inputs["Metallic"].default_value = 1.0
    p.inputs["Roughness"].default_value = 0.09
    p.inputs["Specular Tint"].default_value = (1.0, 0.75, 0.40, 1.0)
    return m


def mat_studio():
    m, nodes, links, p = material("Studio_Weiss")
    p.inputs["Base Color"].default_value = (0.9, 0.9, 0.9, 1.0)
    p.inputs["Roughness"].default_value = 0.06
    p.inputs["IOR"].default_value = 1.49
    # Selbstleuchtende Hohlkehle: Boden etwas dunkler (Reflexion bleibt sichtbar),
    # Rückwand knapp über Weiß wie ein ausgeleuchteter Studiohintergrund
    coord = nodes.new("ShaderNodeTexCoord")
    sep = nodes.new("ShaderNodeSeparateXYZ")
    ramp = nodes.new("ShaderNodeMapRange")
    ramp.inputs["From Min"].default_value = 0.5
    ramp.inputs["From Max"].default_value = 1.6
    ramp.inputs["To Min"].default_value = STUDIO_FLOOR_GLOW
    ramp.inputs["To Max"].default_value = STUDIO_WALL_GLOW
    links.new(coord.outputs["Object"], sep.inputs[0])
    links.new(sep.outputs["Y"], ramp.inputs["Value"])
    # Wie ein freigestelltes Produktfoto: die Kamera sieht reines Weiß, im Glas
    # und im Gold spiegelt sich eine gedämpftere Studioumgebung
    path = nodes.new("ShaderNodeLightPath")
    seen = nodes.new("ShaderNodeMapRange")
    seen.inputs["To Min"].default_value = STUDIO_INDIRECT
    seen.inputs["To Max"].default_value = 1.0
    links.new(path.outputs["Is Camera Ray"], seen.inputs["Value"])
    glow = nodes.new("ShaderNodeMath")
    glow.operation = "MULTIPLY"
    links.new(ramp.outputs[0], glow.inputs[0])
    links.new(seen.outputs[0], glow.inputs[1])
    p.inputs["Emission Color"].default_value = (1.0, 1.0, 1.0, 1.0)
    links.new(glow.outputs[0], p.inputs["Emission Strength"])
    return m


# ---------------------------------------------------------------- Studio

STUDIO_FLOOR_GLOW = 0.30
STUDIO_WALL_GLOW = 0.80
STUDIO_INDIRECT = 0.45  # Anteil des Leuchtens, den Glas und Gold sehen
LIGHT = {"links": 2.5, "rechts": 2.0, "oben": 1.5, "vorn": 0.6, "streif": 4.0}  # Leuchtdichte
WORLD_STRENGTH = 0.4


def build_studio():
    # Hohlkehle: Boden, Rundung, Rückwand
    prof = []
    for y in (-14.0, -6.0, 0.0, 2.0):
        prof.append((y, 0.0))
    radius = 2.5
    for i in range(1, 17):
        ang = (math.pi / 2) * i / 16
        prof.append((2.0 + math.sin(ang) * radius, radius - math.cos(ang) * radius))
    prof.append((2.0 + radius, 12.0))
    bm = bmesh.new()
    rows = [[bm.verts.new((x, y, z)) for (y, z) in prof] for x in (-14.0, 14.0)]
    for i in range(len(prof) - 1):
        bm.faces.new((rows[0][i], rows[1][i], rows[1][i + 1], rows[0][i + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    for f in bm.faces:
        if f.normal.z < 0 and abs(f.normal.y) < 0.5:
            f.normal_flip()
    ob = bm_to_object(bm, "Studio_Hohlkehle")
    ob.data.materials.append(mat_studio())
    return ob


def softbox(name, loc, target, size, strength):
    """Leuchtfläche mit fester Leuchtdichte: so hell erscheint sie auch in Spiegelungen."""
    m, nodes, links, p = material(name)
    emit = nodes.new("ShaderNodeEmission")
    emit.inputs["Strength"].default_value = strength
    links.new(emit.outputs[0], nodes["Material Output"].inputs["Surface"])
    nodes.remove(p)
    bpy.ops.mesh.primitive_plane_add(size=1.0, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (size[0], size[1], 1.0)
    direction = Vector(target) - Vector(loc)
    ob.rotation_euler = direction.to_track_quat("Z", "Y").to_euler()
    ob.data.materials.append(m)
    ob.visible_camera = False
    return ob


def build_lights():
    # Streifen-Softboxen links und rechts, flaches Deckenlicht, große Fläche hinter der Kamera
    softbox("Softbox_Links", (-3.2, -1.6, 1.4), (0, 0, 0.7), (0.9, 4.0), LIGHT["links"])
    softbox("Softbox_Rechts", (3.4, -0.6, 1.3), (0, 0, 0.7), (0.7, 4.0), LIGHT["rechts"])
    softbox("Deckenlicht", (0.0, -1.5, 4.5), (0, 0, 0.6), (3.5, 3.0), LIGHT["oben"])
    # Schmale Streiflichter für glänzende Glaskanten
    softbox("Streiflicht_Links", (-2.3, -2.4, 1.0), (0, 0, 0.6), (0.22, 4.0), LIGHT["streif"])
    softbox("Streiflicht_Rechts", (2.5, -2.0, 1.0), (0, 0, 0.6), (0.22, 4.0), LIGHT["streif"])
    softbox("Frontflaeche", (0.0, -4.0, 3.6), (0, 0, 1.1), (5.0, 1.3), LIGHT["vorn"])


def build_flags():
    """Schwarze Abschatter neben dem Flakon: geben dem Glas dunkle Kanten."""
    m, nodes, links, p = material("Abschatter_Schwarz")
    p.inputs["Base Color"].default_value = (0.01, 0.01, 0.01, 1.0)
    p.inputs["Roughness"].default_value = 0.7
    for name, x in (("Abschatter_Links", -1.05), ("Abschatter_Rechts", 1.05)):
        bpy.ops.mesh.primitive_plane_add(size=1.0, location=(x, 0.45, 1.4))
        ob = bpy.context.active_object
        ob.name = name
        ob.scale = (1.2, 1.0, 2.8)
        ob.rotation_euler = (math.pi / 2, 0.0, math.copysign(math.radians(70), x))
        ob.data.materials.append(m)


def build_world(hdri_path):
    world = bpy.data.worlds.new("Studio")
    bpy.context.scene.world = world
    world.use_nodes = True
    nodes, links = world.node_tree.nodes, world.node_tree.links
    bg = nodes["Background"]
    bg.inputs["Strength"].default_value = WORLD_STRENGTH
    if hdri_path and os.path.exists(hdri_path):
        env = nodes.new("ShaderNodeTexEnvironment")
        env.image = bpy.data.images.load(hdri_path)
        mapping = nodes.new("ShaderNodeMapping")
        mapping.inputs["Rotation"].default_value = (0.0, 0.0, math.radians(110))
        coord = nodes.new("ShaderNodeTexCoord")
        links.new(coord.outputs["Generated"], mapping.inputs["Vector"])
        links.new(mapping.outputs[0], env.inputs["Vector"])
        links.new(env.outputs["Color"], bg.inputs["Color"])
    else:
        bg.inputs["Color"].default_value = (0.5, 0.5, 0.5, 1.0)


def build_camera():
    cd = bpy.data.cameras.new("Kamera")
    cd.lens = 100
    cd.sensor_width = 36
    cam = bpy.data.objects.new("Kamera", cd)
    bpy.context.collection.objects.link(cam)
    cam.location = (0.0, -5.6, 1.15)
    target = Vector((0.0, 0.0, 0.70))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    bpy.context.scene.camera = cam
    return cam


def setup_render(args):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    cy = sc.cycles
    cy.device = "CPU"
    cy.samples = args.samples
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.008
    cy.use_denoising = True
    cy.denoiser = "OPENIMAGEDENOISE"
    cy.max_bounces = 32
    cy.diffuse_bounces = 3
    cy.glossy_bounces = 12
    cy.transmission_bounces = 32
    cy.transparent_max_bounces = 16
    cy.volume_bounces = 2
    cy.caustics_reflective = True
    cy.caustics_refractive = True
    cy.blur_glossy = 0.0
    cy.sample_clamp_indirect = 12.0
    sc.render.resolution_x, sc.render.resolution_y = args.res
    sc.render.resolution_percentage = 100
    sc.render.film_transparent = False
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = 0.0
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGB"
    sc.render.image_settings.color_depth = "8"


def ensure_hdri(path):
    if os.path.exists(path):
        return path
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        urllib.request.urlretrieve(HDRI_URL, path)
        return path
    except Exception as exc:  # ohne Netz: neutrale Umgebung
        print("HDRI nicht verfügbar:", exc)
        return None


def main():
    args = parse_args()
    bpy.ops.wm.read_factory_settings(use_empty=True)

    glass, liquid, bvh = build_glass()
    glass.data.materials.append(mat_glass())
    liquid.data.materials.append(mat_liquid())
    cap = build_cap(bvh)
    cap.data.materials.append(mat_gold())

    build_studio()
    build_lights()
    build_flags()
    build_world(ensure_hdri(args.hdri))
    build_camera()
    setup_render(args)

    if args.blend:
        bpy.ops.file.pack_all()
        bpy.ops.wm.save_as_mainfile(filepath=os.path.abspath(args.blend))
    if not args.no_render:
        os.makedirs(os.path.dirname(os.path.abspath(args.out)), exist_ok=True)
        if args.out.endswith(".exr"):
            settings = bpy.context.scene.render.image_settings
            settings.file_format, settings.color_depth = "OPEN_EXR", "32"
        bpy.context.scene.render.filepath = os.path.abspath(args.out)
        bpy.ops.render.render(write_still=True)


main()
