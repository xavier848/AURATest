import { useId, type CSSProperties } from 'react';
import type { MetalTone } from '../data/products';

export const DISPLAY_FONT = "'Cormorant Garamond', Garamond, 'Times New Roman', serif";
export const SANS_FONT = "'Inter Variable', Inter, system-ui, sans-serif";

export const METALS: Record<MetalTone, string[]> = {
  gold: ['#7A6342', '#CDB68C', '#F5ECDA', '#B59C72', '#E8D9BC', '#806947'],
  rose: ['#7D5550', '#C99A92', '#F6E1DB', '#B5837D', '#E9C6BE', '#84605A'],
  bronze: ['#4A3020', '#9C6F49', '#E2C29C', '#87603F', '#C99A6B', '#55382A'],
};
const METAL_STOPS = [0, 0.18, 0.36, 0.55, 0.78, 1];

export function useSvgIds() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return {
    id: (name: string) => `${uid}-${name}`,
    url: (name: string) => `url(#${uid}-${name})`,
  };
}

interface FlaconProps {
  liquid: [string, string];
  metal: MetalTone;
  /** Zeile unter AURA, z. B. „N°01“ */
  subtitle: string;
  /** Kleine Zeile darunter, z. B. „The Glow“ */
  name: string;
  reflection?: boolean;
  /** Flüssigkeit über die CSS-Variablen --liquid-a/--liquid-b einfärben (Hero-Animation) */
  animated?: boolean;
  className?: string;
  label?: string;
}

/** Glasflakon als Vektorgrafik: schwerer Glaskörper, gebürstete Metallkappe, Etikett. */
export function Flacon({
  liquid,
  metal,
  subtitle,
  name,
  reflection = false,
  animated = false,
  className,
  label,
}: FlaconProps) {
  const { id, url } = useSvgIds();
  const top: CSSProperties | undefined = animated ? { stopColor: 'var(--liquid-a)' } : undefined;
  const bottom: CSSProperties | undefined = animated ? { stopColor: 'var(--liquid-b)' } : undefined;
  const tint: CSSProperties | undefined = animated ? { fill: 'var(--liquid-a)' } : undefined;

  return (
    <svg
      className={className}
      viewBox={`0 0 240 ${reflection ? 520 : 400}`}
      role="img"
      aria-label={label ?? `Flakon AURA ${subtitle} ${name}`}
    >
      <defs>
        <linearGradient id={id('metal')} x1="0" x2="1" y1="0" y2="0">
          {METALS[metal].map((color, i) => (
            <stop key={color + i} offset={METAL_STOPS[i]} stopColor={color} />
          ))}
        </linearGradient>
        <linearGradient id={id('metal-top')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('liquid')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={liquid[0]} style={top} />
          <stop offset="1" stopColor={liquid[1]} style={bottom} />
        </linearGradient>
        <linearGradient id={id('shade')} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <stop offset="0.22" stopColor="#000" stopOpacity="0" />
          <stop offset="0.7" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.86" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#000" stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id={id('glass')} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.6" />
          <stop offset="0.1" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.04" />
          <stop offset="0.9" stopColor="#fff" stopOpacity="0.18" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={id('streak')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0.25" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('shadow')}>
          <stop offset="0" stopColor="#17151A" stopOpacity="0.34" />
          <stop offset="1" stopColor="#17151A" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('fade')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.36" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={id('mask')} maskUnits="userSpaceOnUse" x="0" y="383" width="240" height="137">
          <rect x="0" y="383" width="240" height="137" fill={url('fade')} />
        </mask>
      </defs>

      <ellipse cx="120" cy="384" rx="108" ry="7" fill={url('shadow')} />

      <g id={id('bottle')}>
        <rect x="24" y="112" width="192" height="270" rx="28" fill={liquid[0]} fillOpacity="0.3" style={tint} />
        <rect x="40" y="148" width="160" height="208" rx="16" fill={url('liquid')} />
        <rect x="40" y="148" width="160" height="208" rx="16" fill={url('shade')} />
        <rect x="46" y="148" width="148" height="5" rx="2.5" fill="#fff" opacity="0.42" />
        <rect x="30" y="356" width="180" height="22" rx="11" fill="#fff" opacity="0.2" />
        <rect
          x="24"
          y="112"
          width="192"
          height="270"
          rx="28"
          fill={url('glass')}
          stroke="#fff"
          strokeOpacity="0.85"
          strokeWidth="1.5"
        />
        <rect x="23" y="111" width="194" height="272" rx="29" fill="none" stroke="#17151A" strokeOpacity="0.16" />
        <rect x="33" y="124" width="10" height="244" rx="5" fill={url('streak')} />
        <rect x="202" y="134" width="3" height="214" rx="1.5" fill="#fff" opacity="0.5" />
        <path d="M60 119 H180" stroke="#fff" strokeOpacity="0.75" strokeLinecap="round" />

        <rect x="72" y="204" width="96" height="100" fill="#F7F3EE" fillOpacity="0.9" />
        <rect
          x="76"
          y="208"
          width="88"
          height="92"
          fill="none"
          stroke="#17151A"
          strokeOpacity="0.28"
          strokeWidth="0.6"
        />
        <text
          x="122.5"
          y="238"
          textAnchor="middle"
          fontFamily={DISPLAY_FONT}
          fontSize="17"
          letterSpacing="5"
          fill="#17151A"
        >
          AURA
        </text>
        <line x1="106" y1="249" x2="134" y2="249" stroke="#17151A" strokeOpacity="0.4" strokeWidth="0.6" />
        <text
          x="120"
          y="271"
          textAnchor="middle"
          fontFamily={DISPLAY_FONT}
          fontStyle="italic"
          fontSize="15"
          fill="#17151A"
        >
          {subtitle}
        </text>
        <text
          x="120.8"
          y="288"
          textAnchor="middle"
          fontFamily={SANS_FONT}
          fontSize="5.6"
          fontWeight="500"
          letterSpacing="1.6"
          fill="#17151A"
          fillOpacity="0.72"
        >
          {name.toUpperCase()}
        </text>

        <rect x="98" y="92" width="44" height="22" fill={url('metal')} />
        <rect x="98" y="110" width="44" height="3" fill="#000" opacity="0.2" />
        <rect x="74" y="8" width="92" height="86" rx="3" fill={url('metal')} />
        <rect x="74" y="8" width="92" height="12" rx="3" fill={url('metal-top')} />
        <rect x="74" y="90" width="92" height="4" fill="#000" opacity="0.14" />
      </g>

      {reflection && (
        <g mask={url('mask')}>
          <use href={`#${id('bottle')}`} transform="matrix(1 0 0 -1 0 766)" />
        </g>
      )}
    </svg>
  );
}
