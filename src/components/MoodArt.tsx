import type { ReactNode } from 'react';
import type { Art, MoodPalette, Motif } from '../data/quiz';
import { useSvgIds } from './Flacon';

/*
 * Abstrakte Stimmungsbilder für die Antwortkarten des Duftfinders.
 * Zeichenfläche 300 × 375 (4:5). Wichtige Formen liegen zwischen y = 115 und 260,
 * damit sie auch in quadratischen und breiten Karten sichtbar bleiben.
 */

type Ids = ReturnType<typeof useSvgIds>;
type Renderer = (p: MoodPalette, ids: Ids, level: 1 | 2 | 3) => ReactNode;

const CX = 150;
const CY = 188;

const polar = (r: number, deg: number, cx = CX, cy = CY) => {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)] as const;
};

const STARS = [
  [48, 96, 1.2],
  [82, 150, 0.8],
  [236, 112, 1.1],
  [258, 196, 0.7],
  [62, 244, 0.9],
  [214, 262, 1],
  [120, 104, 0.6],
  [182, 86, 0.9],
] as const;

const MOTIFS: Record<Motif, Renderer> = {
  sun: (p, { url }) => (
    <>
      <circle cx={CX} cy="196" r="132" fill={url('glow')} />
      <circle cx={CX} cy="196" r="58" fill={p.accent} opacity="0.75" filter={url('soft')} />
      <circle cx={CX} cy="196" r="48" fill={p.glow} />
      <rect x="0" y="232" width="300" height="143" fill={p.bg[1]} opacity="0.62" />
      {[246, 258, 272, 290].map((y, i) => (
        <line
          key={y}
          x1={96 + i * 10}
          x2={204 - i * 10}
          y1={y}
          y2={y}
          stroke={p.glow}
          strokeWidth="2"
          opacity={0.85 - i * 0.18}
          strokeLinecap="round"
        />
      ))}
    </>
  ),
  sunrise: (p, { url }) => (
    <>
      <circle cx={CX} cy="232" r="140" fill={url('glow')} />
      {Array.from({ length: 9 }, (_, i) => {
        const [x1, y1] = polar(66, 180 + i * 22.5, CX, 232);
        const [x2, y2] = polar(108, 180 + i * 22.5, CX, 232);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={p.line}
            strokeOpacity="0.45"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        );
      })}
      <path d={`M${CX - 52} 232 A52 52 0 0 1 ${CX + 52} 232 Z`} fill={p.accent} opacity="0.85" />
      <path d={`M${CX - 44} 232 A44 44 0 0 1 ${CX + 44} 232 Z`} fill={p.glow} opacity="0.9" />
      <line x1="30" x2="270" y1="232.5" y2="232.5" stroke={p.line} strokeOpacity="0.5" />
    </>
  ),
  breeze: (p, { url }) => (
    <>
      <circle cx="214" cy="134" r="110" fill={url('glow')} />
      {[136, 160, 184, 208, 232, 256].map((y, i) => (
        <path
          key={y}
          d={`M-10 ${y} C 60 ${y - 22}, 110 ${y + 22}, 160 ${y} S 260 ${y - 22}, 310 ${y}`}
          fill="none"
          stroke={p.line}
          strokeOpacity={0.2 + (i % 3) * 0.18}
          strokeWidth={i % 2 ? 1 : 1.6}
        />
      ))}
    </>
  ),
  petals: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="130" fill={url('glow')} />
      <g transform={`translate(${CX} ${CY})`} filter={url('soft')}>
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-46"
            rx="30"
            ry="56"
            fill={p.accent}
            opacity="0.32"
            transform={`rotate(${i * 60})`}
          />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse
            key={`b${i}`}
            cx="0"
            cy="-30"
            rx="20"
            ry="38"
            fill={p.glow}
            opacity="0.55"
            transform={`rotate(${i * 60 + 30})`}
          />
        ))}
      </g>
      <circle cx={CX} cy={CY} r="9" fill={p.glow} />
    </>
  ),
  flower: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="120" fill={url('glow')} />
      <g transform={`translate(${CX} ${CY})`}>
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-40"
            rx="21"
            ry="42"
            fill={p.glow}
            fillOpacity="0.5"
            stroke={p.line}
            strokeOpacity="0.7"
            strokeWidth="1.2"
            transform={`rotate(${i * 60})`}
          />
        ))}
        <circle r="11" fill={p.accent} opacity="0.7" />
        <circle r="11" fill="none" stroke={p.line} strokeOpacity="0.7" strokeWidth="1.2" />
      </g>
    </>
  ),
  velvet: (p, { url }) => (
    <>
      <circle cx="206" cy="128" r="150" fill={url('accent')} opacity="0.9" />
      <g filter={url('blur')}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={`M ${-60 + i * 70} 400 C ${10 + i * 70} 280, ${-20 + i * 80} 150, ${70 + i * 70} -20`}
            fill="none"
            stroke={p.glow}
            strokeOpacity={0.06 + i * 0.035}
            strokeWidth="38"
          />
        ))}
      </g>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${-20 + i * 90} 400 C ${50 + i * 90} 280, ${20 + i * 90} 150, ${110 + i * 90} -20`}
          fill="none"
          stroke={p.glow}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
      ))}
    </>
  ),
  arch: (p, { url }) => (
    <>
      <rect x="0" y="0" width="300" height="375" fill={url('glow')} opacity="0.6" />
      <path d="M86 300 V178 A64 64 0 0 1 214 178 V300 Z" fill={p.bg[1]} />
      <path d="M102 300 V182 A48 48 0 0 1 198 182 V300" fill="none" stroke={p.line} strokeOpacity="0.45" />
      <line x1="34" x2="266" y1="300.5" y2="300.5" stroke={p.line} strokeOpacity="0.6" />
      <rect x="52" y="232" width="20" height="68" fill={p.line} opacity="0.88" />
      <circle cx="198" cy="262" r="38" fill={url('sphere')} />
    </>
  ),
  streaks: (p, { url }) => {
    const colors = [p.accent, '#D9A7B0', p.glow, '#E7C79C'];
    return (
      <>
        <circle cx="210" cy="150" r="150" fill={url('accent')} opacity="0.55" />
        <g filter={url('blur')}>
          {colors.map((c, i) => (
            <line
              key={i}
              x1={-30 + i * 52}
              y1="375"
              x2={190 + i * 52}
              y2="0"
              stroke={c}
              strokeWidth="12"
              opacity="0.5"
            />
          ))}
        </g>
        {colors.map((c, i) => (
          <line
            key={`l${i}`}
            x1={-30 + i * 52}
            y1="375"
            x2={190 + i * 52}
            y2="0"
            stroke={c}
            strokeWidth={i % 2 ? 1.2 : 2}
          />
        ))}
        {STARS.slice(0, 5).map(([x, y, s]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={s * 1.6} fill={p.glow} />
        ))}
      </>
    );
  },
  citrus: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="128" fill={url('glow')} />
      <circle cx={CX} cy={CY} r="66" fill={p.accent} opacity="0.32" />
      <circle cx={CX} cy={CY} r="66" fill="none" stroke={p.line} strokeOpacity="0.75" strokeWidth="1.4" />
      <circle cx={CX} cy={CY} r="57" fill="none" stroke={p.line} strokeOpacity="0.45" />
      {Array.from({ length: 10 }, (_, i) => {
        const [x, y] = polar(56, i * 36);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke={p.line} strokeOpacity="0.5" />;
      })}
      <circle cx={CX} cy={CY} r="5" fill={p.line} opacity="0.55" />
    </>
  ),
  drop: (p, { url }) => (
    <>
      <circle cx={CX} cy="196" r="124" fill={url('glow')} />
      <path
        transform={`translate(${CX} 196)`}
        d="M0 -78 C 22 -44, 48 -16, 48 16 A48 48 0 1 1 -48 16 C -48 -16, -22 -44, 0 -78 Z"
        fill={p.accent}
        fillOpacity="0.35"
        stroke={p.line}
        strokeOpacity="0.7"
        strokeWidth="1.3"
      />
      <path
        transform={`translate(${CX - 18} 206)`}
        d="M0 -14 C 4 -8, 8 -3, 8 3 A8 8 0 1 1 -8 3 C -8 -3, -4 -8, 0 -14 Z"
        fill={p.glow}
        opacity="0.85"
      />
    </>
  ),
  drops: (p, { url }, level) => {
    const count = level;
    const spacing = 58;
    const start = CX - ((count - 1) * spacing) / 2;
    return (
      <>
        <circle cx={CX} cy={CY} r="124" fill={url('glow')} />
        {Array.from({ length: count }, (_, i) => (
          <path
            key={i}
            transform={`translate(${start + i * spacing} ${CY + (i % 2 ? 14 : -4)}) scale(${count === 1 ? 1.25 : 0.82})`}
            d="M0 -50 C 14 -28, 30 -10, 30 10 A30 30 0 1 1 -30 10 C -30 -10, -14 -28, 0 -50 Z"
            fill={p.accent}
            fillOpacity="0.38"
            stroke={p.line}
            strokeOpacity="0.7"
            strokeWidth="1.3"
          />
        ))}
      </>
    );
  },
  rings: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="130" fill={url('glow')} />
      {Array.from({ length: 7 }, (_, i) => (
        <ellipse
          key={i}
          cx={CX + i * 1.6}
          cy={CY - i * 1.2}
          rx={14 + i * 13}
          ry={11 + i * 11}
          fill="none"
          stroke={p.line}
          strokeOpacity={0.75 - i * 0.08}
          strokeWidth={i % 3 === 0 ? 1.6 : 1}
        />
      ))}
      <path d={`M${CX + 6} ${CY} L ${CX + 70} ${CY + 54}`} stroke={p.line} strokeOpacity="0.35" />
    </>
  ),
  star: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="130" fill={url('accent')} opacity="0.75" />
      <g transform={`translate(${CX} ${CY})`}>
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-38"
            rx="12"
            ry="36"
            fill={p.accent}
            fillOpacity="0.45"
            stroke={p.line}
            strokeOpacity="0.8"
            strokeWidth="1.2"
            transform={`rotate(${i * 45})`}
          />
        ))}
        <circle r="8" fill={p.glow} />
      </g>
    </>
  ),
  ripple: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="70" fill={url('glow')} />
      {Array.from({ length: 7 }, (_, i) => (
        <circle
          key={i}
          cx={CX}
          cy={CY}
          r={18 + i * 20}
          fill="none"
          stroke={p.line}
          strokeOpacity={0.6 - i * 0.075}
          strokeWidth="1.1"
        />
      ))}
    </>
  ),
  mist: (p, { url }) => (
    <>
      <g filter={url('blur')}>
        <circle cx="110" cy="170" r="70" fill={p.accent} opacity="0.35" />
        <circle cx="196" cy="214" r="64" fill={p.glow} opacity="0.9" />
        <circle cx="168" cy="140" r="44" fill={p.bg[1]} opacity="0.9" />
      </g>
      <circle
        cx={CX}
        cy={CY}
        r="62"
        fill="none"
        stroke={p.line}
        strokeOpacity="0.6"
        strokeWidth="1.6"
        strokeDasharray="1 7"
        strokeLinecap="round"
      />
    </>
  ),
  embrace: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="130" fill={url('glow')} />
      <circle cx="124" cy={CY} r="62" fill={p.accent} opacity="0.4" />
      <circle cx="176" cy={CY} r="62" fill={p.glow} opacity="0.75" />
      <circle cx="124" cy={CY} r="62" fill="none" stroke={p.line} strokeOpacity="0.45" />
      <circle cx="176" cy={CY} r="62" fill="none" stroke={p.line} strokeOpacity="0.45" />
    </>
  ),
  moon: (p, { url, id }) => (
    <>
      <circle cx={CX} cy={CY} r="140" fill={url('accent')} opacity="0.6" />
      <mask id={id('crescent')}>
        <rect width="300" height="375" fill="#fff" />
        <circle cx="174" cy="170" r="52" fill="#000" />
      </mask>
      <circle cx={CX} cy={CY} r="58" fill={p.glow} mask={url('crescent')} filter={url('soft-sm')} />
      <circle cx={CX} cy={CY} r="58" fill={p.glow} mask={url('crescent')} />
      {STARS.map(([x, y, s]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={s * 1.4} fill={p.glow} opacity="0.85" />
      ))}
    </>
  ),
  spark: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="140" fill={url('glow')} opacity="0.8" />
      <path
        transform={`translate(${CX} ${CY})`}
        d="M0 -84 C 6 -22, 22 -6, 84 0 C 22 6, 6 22, 0 84 C -6 22, -22 6, -84 0 C -22 -6, -6 -22, 0 -84 Z"
        fill={p.glow}
        filter={url('soft-sm')}
      />
      <path
        transform={`translate(${CX} ${CY})`}
        d="M0 -84 C 6 -22, 22 -6, 84 0 C 22 6, 6 22, 0 84 C -6 22, -22 6, -84 0 C -22 -6, -6 -22, 0 -84 Z"
        fill={p.glow}
      />
      <path
        transform="translate(222 124) scale(0.22)"
        d="M0 -84 C 6 -22, 22 -6, 84 0 C 22 6, 6 22, 0 84 C -6 22, -22 6, -84 0 C -22 -6, -6 -22, 0 -84 Z"
        fill={p.accent}
      />
      <path
        transform="translate(84 246) scale(0.16)"
        d="M0 -84 C 6 -22, 22 -6, 84 0 C 22 6, 6 22, 0 84 C -6 22, -22 6, -84 0 C -22 -6, -6 -22, 0 -84 Z"
        fill={p.accent}
      />
    </>
  ),
  orbit: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="130" fill={url('glow')} />
      <ellipse
        cx={CX}
        cy={CY}
        rx="118"
        ry="36"
        fill="none"
        stroke={p.line}
        strokeOpacity="0.5"
        transform={`rotate(-18 ${CX} ${CY})`}
      />
      <ellipse
        cx={CX}
        cy={CY}
        rx="104"
        ry="30"
        fill="none"
        stroke={p.line}
        strokeOpacity="0.35"
        transform={`rotate(26 ${CX} ${CY})`}
      />
      <circle cx={CX} cy={CY} r="36" fill={url('sphere')} />
      <circle cx="252" cy="160" r="6" fill={p.accent} />
      <circle cx="62" cy="234" r="4" fill={p.line} opacity="0.6" />
    </>
  ),
  grid: (p, { url }) => (
    <>
      {Array.from({ length: 14 }, (_, i) => (
        <line key={`h${i}`} x1="0" x2="300" y1={22 + i * 26} y2={22 + i * 26} stroke={p.line} strokeOpacity="0.12" />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`v${i}`} y1="0" y2="375" x1={10 + i * 26} x2={10 + i * 26} stroke={p.line} strokeOpacity="0.12" />
      ))}
      <circle cx="166" cy="176" r="56" fill={p.accent} opacity="0.35" />
      <circle cx="166" cy="176" r="56" fill="none" stroke={p.line} strokeOpacity="0.5" />
      <line x1="70" y1="260" x2="214" y2="116" stroke={p.line} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="166" cy="176" r="120" fill={url('glow')} opacity="0.5" />
    </>
  ),
  candle: (p, { url }) => (
    <>
      <circle cx={CX} cy="150" r="150" fill={url('accent')} opacity="0.85" />
      <circle cx={CX} cy="150" r="70" fill={url('glow')} />
      <path
        d={`M${CX} 108 C ${CX + 22} 140, ${CX + 22} 168, ${CX} 190 C ${CX - 22} 168, ${CX - 22} 140, ${CX} 108 Z`}
        fill={p.glow}
        filter={url('soft-sm')}
      />
      <path
        d={`M${CX} 128 C ${CX + 11} 148, ${CX + 11} 166, ${CX} 180 C ${CX - 11} 166, ${CX - 11} 148, ${CX} 128 Z`}
        fill={p.accent}
      />
      <line x1={CX} x2={CX} y1="182" y2="196" stroke={p.line} strokeOpacity="0.7" strokeWidth="1.4" />
      <rect x={CX - 18} y="196" width="36" height="140" rx="2" fill={p.glow} opacity="0.88" />
    </>
  ),
  globe: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="128" fill={url('glow')} />
      <circle
        cx={CX}
        cy={CY}
        r="70"
        fill={p.accent}
        fillOpacity="0.18"
        stroke={p.line}
        strokeOpacity="0.7"
        strokeWidth="1.3"
      />
      {[0.32, 0.66].map((k) => (
        <ellipse key={k} cx={CX} cy={CY} rx={70 * k} ry="70" fill="none" stroke={p.line} strokeOpacity="0.45" />
      ))}
      {[-38, 0, 38].map((dy) => (
        <ellipse
          key={dy}
          cx={CX}
          cy={CY + dy}
          rx={Math.sqrt(70 * 70 - dy * dy)}
          ry="9"
          fill="none"
          stroke={p.line}
          strokeOpacity="0.4"
        />
      ))}
    </>
  ),
  halo: (p, { url }, level) => (
    <>
      <circle cx={CX} cy={CY} r={40 + level * 30} fill={url('glow')} />
      <g filter={url('soft')}>
        {Array.from({ length: level * 2 }, (_, i) => (
          <circle
            key={i}
            cx={CX}
            cy={CY}
            r={26 + i * 18}
            fill="none"
            stroke={i % 2 ? p.glow : p.accent}
            strokeOpacity={0.75 - i * 0.08}
            strokeWidth="6"
          />
        ))}
      </g>
      <circle cx={CX} cy={CY} r="12" fill={p.glow} />
      <circle cx={CX} cy={CY} r="12" fill="none" stroke={p.line} strokeOpacity="0.5" />
    </>
  ),
  leaf: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="128" fill={url('glow')} />
      <g transform={`rotate(-24 ${CX} ${CY})`}>
        <path
          d={`M${CX} 96 C ${CX + 70} 136, ${CX + 70} 244, ${CX} 284 C ${CX - 70} 244, ${CX - 70} 136, ${CX} 96 Z`}
          fill={p.accent}
          fillOpacity="0.35"
          stroke={p.line}
          strokeOpacity="0.7"
          strokeWidth="1.3"
        />
        <line x1={CX} x2={CX} y1="108" y2="300" stroke={p.line} strokeOpacity="0.6" />
        {[140, 172, 204, 236].map((y) => (
          <g key={y}>
            <path
              d={`M${CX} ${y + 14} Q ${CX + 22} ${y + 4}, ${CX + 40} ${y - 10}`}
              fill="none"
              stroke={p.line}
              strokeOpacity="0.4"
            />
            <path
              d={`M${CX} ${y + 14} Q ${CX - 22} ${y + 4}, ${CX - 40} ${y - 10}`}
              fill="none"
              stroke={p.line}
              strokeOpacity="0.4"
            />
          </g>
        ))}
      </g>
    </>
  ),
  bottle: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="134" fill={url('glow')} />
      <rect x={CX - 20} y="110" width="40" height="34" rx="2" fill={p.line} opacity="0.85" />
      <rect x={CX - 9} y="144" width="18" height="10" fill={p.line} opacity="0.7" />
      <rect
        x={CX - 52}
        y="154"
        width="104"
        height="128"
        rx="16"
        fill={p.glow}
        fillOpacity="0.55"
        stroke={p.line}
        strokeOpacity="0.55"
      />
      <rect x={CX - 42} y="176" width="84" height="98" rx="10" fill={p.accent} opacity="0.6" />
      <rect x={CX - 24} y="204" width="48" height="40" fill={p.glow} opacity="0.9" />
      <rect x={CX - 47} y="164" width="5" height="108" rx="2.5" fill={p.glow} opacity="0.8" />
    </>
  ),
  gift: (p, { url }) => (
    <>
      <circle cx={CX} cy={CY} r="134" fill={url('glow')} />
      <rect
        x={CX - 62}
        y="178"
        width="124"
        height="96"
        fill={p.accent}
        opacity="0.45"
        stroke={p.line}
        strokeOpacity="0.5"
      />
      <rect x={CX - 70} y="158" width="140" height="24" fill={p.glow} stroke={p.line} strokeOpacity="0.5" />
      <rect x={CX - 7} y="158" width="14" height="116" fill={p.line} opacity="0.75" />
      <path
        d={`M${CX} 158 C ${CX - 22} 128, ${CX - 52} 136, ${CX - 40} 152 C ${CX - 32} 160, ${CX - 12} 160, ${CX} 158 Z`}
        fill="none"
        stroke={p.line}
        strokeOpacity="0.75"
        strokeWidth="1.4"
      />
      <path
        d={`M${CX} 158 C ${CX + 22} 128, ${CX + 52} 136, ${CX + 40} 152 C ${CX + 32} 160, ${CX + 12} 160, ${CX} 158 Z`}
        fill="none"
        stroke={p.line}
        strokeOpacity="0.75"
        strokeWidth="1.4"
      />
    </>
  ),
  compass: (p, { url }) => (
    <>
      <circle cx="226" cy="120" r="120" fill={url('glow')} />
      <path
        d="M44 284 C 104 244, 64 176, 148 172 S 222 112, 244 92"
        fill="none"
        stroke={p.line}
        strokeOpacity="0.75"
        strokeWidth="2"
        strokeDasharray="0.5 8"
        strokeLinecap="round"
      />
      <circle cx="44" cy="284" r="6" fill="none" stroke={p.line} strokeOpacity="0.8" strokeWidth="1.3" />
      <circle cx="148" cy="172" r="4" fill={p.accent} />
      <path
        transform="translate(244 92) scale(0.2)"
        d="M0 -84 C 6 -22, 22 -6, 84 0 C 22 6, 6 22, 0 84 C -6 22, -22 6, -84 0 C -22 -6, -6 -22, 0 -84 Z"
        fill={p.line}
      />
    </>
  ),
};

export function MoodArt({ art, className }: { art: Art; className?: string }) {
  const ids = useSvgIds();
  const { id, url } = ids;
  const p = art.palette;
  return (
    <svg
      className={className}
      viewBox="0 0 300 375"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={id('bg')} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={p.bg[0]} />
          <stop offset="1" stopColor={p.bg[1]} />
        </linearGradient>
        <radialGradient id={id('glow')}>
          <stop offset="0" stopColor={p.glow} stopOpacity="0.95" />
          <stop offset="1" stopColor={p.glow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('accent')}>
          <stop offset="0" stopColor={p.accent} stopOpacity="0.9" />
          <stop offset="1" stopColor={p.accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id('sphere')} cx="0.36" cy="0.32" r="0.75">
          <stop offset="0" stopColor={p.glow} />
          <stop offset="0.55" stopColor={p.accent} />
          <stop offset="1" stopColor={p.line} stopOpacity="0.8" />
        </radialGradient>
        <filter id={id('blur')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <filter id={id('soft')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={id('soft-sm')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <rect width="300" height="375" fill={url('bg')} />
      {MOTIFS[art.motif](p, ids, art.level ?? 2)}
    </svg>
  );
}
