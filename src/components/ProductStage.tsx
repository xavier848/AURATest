import type { CSSProperties } from 'react';
import type { Product } from '../data/products';
import { Flacon } from './Flacon';
import { DiscoverySetArt, GiftArt } from './SetArt';

interface ProductStageProps {
  product: Product;
  reflection?: boolean;
  className?: string;
}

/** Farbige Bühne mit Aura-Licht hinter dem Produkt. */
export function ProductStage({ product, reflection = false, className = '' }: ProductStageProps) {
  const { theme } = product;
  const style = {
    '--panel': theme.panel,
    '--halo-a': theme.halo[0],
    '--halo-b': theme.halo[1],
  } as CSSProperties;

  return (
    <div className={`stage grain ${theme.dark ? 'stage--dark' : ''} ${className}`} style={style}>
      <div className="stage__halo" aria-hidden="true" />
      {product.kind === 'parfum' ? (
        <div className={`stage__art ${reflection ? 'stage__art--reflect' : ''}`}>
          <Flacon
            liquid={theme.liquid}
            metal={theme.metal}
            subtitle={`N°${product.number}`}
            name={product.name}
            reflection={reflection}
            label={`Flakon ${product.fullName}`}
          />
        </div>
      ) : (
        <div className="stage__art stage__art--wide">
          {product.id === 'gift-experience' ? <GiftArt /> : <DiscoverySetArt />}
        </div>
      )}
    </div>
  );
}
