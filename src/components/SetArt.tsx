import { DISPLAY_FONT, METALS, SANS_FONT, useSvgIds } from './Flacon';

const VIAL_LIQUIDS: [string, string][] = [
  ['#F8EACB', '#DDB879'],
  ['#F8DCDE', '#D594A3'],
  ['#A8596E', '#45192F'],
];

/** Discovery Set: drei Proben in einer Box, dahinter die Karte mit QR-Code zur AURA Identity. */
export function DiscoverySetArt({ className }: { className?: string }) {
  const { id, url } = useSvgIds();
  const qr = ['1110111', '1010101', '1110111', '0001000', '1101011', '0110110', '1011101'];
  return (
    <svg className={className} viewBox="0 0 360 300" role="img" aria-label="AURA Discovery Set mit drei Duftproben">
      <defs>
        <linearGradient id={id('metal')} x1="0" x2="1">
          {METALS.gold.map((c, i) => (
            <stop key={c + i} offset={i / (METALS.gold.length - 1)} stopColor={c} />
          ))}
        </linearGradient>
        {VIAL_LIQUIDS.map(([a, b], i) => (
          <linearGradient key={a} id={id(`liquid-${i}`)} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
        ))}
        <linearGradient id={id('box')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2A262E" />
          <stop offset="1" stopColor="#141217" />
        </linearGradient>
        <radialGradient id={id('shadow')}>
          <stop offset="0" stopColor="#17151A" stopOpacity="0.32" />
          <stop offset="1" stopColor="#17151A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="180" cy="282" rx="160" ry="9" fill={url('shadow')} />

      <g transform="rotate(-6 276 112)">
        <rect x="222" y="36" width="108" height="146" fill="#FBF9F6" stroke="#17151A" strokeOpacity="0.14" />
        <text
          x="277.7"
          y="64"
          textAnchor="middle"
          fontFamily={DISPLAY_FONT}
          fontSize="13"
          letterSpacing="3.5"
          fill="#17151A"
        >
          AURA
        </text>
        <text
          x="276.7"
          y="78"
          textAnchor="middle"
          fontFamily={SANS_FONT}
          fontSize="5"
          letterSpacing="1.4"
          fill="#6B5E55"
        >
          YOUR AURA IDENTITY
        </text>
        <g transform="translate(255 94)">
          {qr.flatMap((row, y) =>
            [...row].map((cell, x) =>
              cell === '1' ? (
                <rect key={`${x}-${y}`} x={x * 6} y={y * 6} width="5.2" height="5.2" fill="#17151A" />
              ) : null,
            ),
          )}
        </g>
      </g>

      {VIAL_LIQUIDS.map((_, i) => {
        const x = 84 + i * 46;
        return (
          <g key={i}>
            <rect x={x} y="40" width="30" height="38" rx="2" fill={url('metal')} />
            <rect x={x + 7} y="76" width="16" height="8" fill={url('metal')} />
            <rect
              x={x - 3}
              y="84"
              width="36"
              height="150"
              rx="9"
              fill="#fff"
              fillOpacity="0.3"
              stroke="#fff"
              strokeOpacity="0.9"
            />
            <rect x={x - 3} y="84" width="36" height="150" rx="9" fill="none" stroke="#17151A" strokeOpacity="0.14" />
            <rect x={x + 2} y="108" width="26" height="118" rx="5" fill={url(`liquid-${i}`)} />
            <rect x={x + 2} y="92" width="5" height="130" rx="2.5" fill="#fff" opacity="0.55" />
          </g>
        );
      })}

      <rect x="40" y="170" width="280" height="110" fill={url('box')} />
      <rect x="40" y="170" width="280" height="7" fill="#000" opacity="0.35" />
      <line x1="40" y1="170.5" x2="320" y2="170.5" stroke="#fff" strokeOpacity="0.18" />
      <text
        x="183"
        y="226"
        textAnchor="middle"
        fontFamily={DISPLAY_FONT}
        fontSize="21"
        letterSpacing="7"
        fill="#F7F3EE"
      >
        AURA
      </text>
      <text
        x="181"
        y="247"
        textAnchor="middle"
        fontFamily={SANS_FONT}
        fontSize="6.4"
        letterSpacing="2.4"
        fill="#D7C3A4"
      >
        THE DISCOVERY SET
      </text>
    </svg>
  );
}

/** Gift Experience: Box mit Schleife und Grußkarte. */
export function GiftArt({ className }: { className?: string }) {
  const { id, url } = useSvgIds();
  return (
    <svg className={className} viewBox="0 0 360 300" role="img" aria-label="AURA Gift Experience mit Grußkarte">
      <defs>
        <linearGradient id={id('box')} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#F3DAD3" />
          <stop offset="1" stopColor="#D9AEB1" />
        </linearGradient>
        <linearGradient id={id('lid')} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#F8E6E0" />
          <stop offset="1" stopColor="#E4BFBF" />
        </linearGradient>
        <linearGradient id={id('ribbon')} x1="0" x2="1">
          <stop offset="0" stopColor="#3B1F31" />
          <stop offset="0.5" stopColor="#6A3A57" />
          <stop offset="1" stopColor="#3B1F31" />
        </linearGradient>
        <radialGradient id={id('shadow')}>
          <stop offset="0" stopColor="#17151A" stopOpacity="0.3" />
          <stop offset="1" stopColor="#17151A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="190" cy="276" rx="140" ry="9" fill={url('shadow')} />
      <rect x="92" y="120" width="196" height="152" fill={url('box')} />
      <rect x="92" y="120" width="196" height="8" fill="#000" opacity="0.08" />
      <rect x="80" y="96" width="220" height="32" fill={url('lid')} />
      <rect x="180" y="96" width="20" height="176" fill={url('ribbon')} />
      <path d="M190 96 C 160 64, 128 70, 140 90 C 148 102, 172 100, 190 96 Z" fill={url('ribbon')} />
      <path d="M190 96 C 220 64, 252 70, 240 90 C 232 102, 208 100, 190 96 Z" fill={url('ribbon')} />
      <rect x="183" y="88" width="14" height="14" rx="3" fill="#4C293F" />

      <g transform="rotate(-8 110 214)">
        <rect x="44" y="176" width="128" height="84" fill="#FBF9F6" stroke="#17151A" strokeOpacity="0.14" />
        <text
          x="108"
          y="214"
          textAnchor="middle"
          fontFamily={DISPLAY_FONT}
          fontStyle="italic"
          fontSize="21"
          fill="#17151A"
        >
          For you
        </text>
        <line x1="84" y1="228" x2="132" y2="228" stroke="#17151A" strokeOpacity="0.3" strokeWidth="0.6" />
        <text
          x="108.6"
          y="243"
          textAnchor="middle"
          fontFamily={SANS_FONT}
          fontSize="5"
          letterSpacing="1.4"
          fill="#6B5E55"
        >
          DISCOVER YOUR AURA
        </text>
      </g>
    </svg>
  );
}
