import { Link } from 'react-router-dom';
import { lowestPrice, type Product } from '../data/products';
import { formatPrice } from '../lib/format';
import { ProductStage } from './ProductStage';

export function ProductCard({ product, badge }: { product: Product; badge?: string }) {
  const to = `/shop/${product.slug}`;
  const from = product.variants.length > 1 ? 'ab ' : '';
  return (
    <article className="pcard">
      <Link to={to} className="pcard__media" tabIndex={-1} aria-hidden="true">
        <ProductStage product={product} />
        {badge && <span className="pcard__badge">{badge}</span>}
      </Link>
      <div className="pcard__body">
        <div className="pcard__meta">
          <span>{product.number ? `AURA N°${product.number}` : 'Set'}</span>
          <span className="pcard__price">
            {from}
            {formatPrice(lowestPrice(product))}
          </span>
        </div>
        <h3 className="pcard__name">
          <Link to={to}>{product.name}</Link>
        </h3>
        <p className="pcard__character">{product.character}</p>
        <ul className="pcard__notes" aria-label="Duftnoten">
          {product.keyNotes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <Link to={to} className="btn btn--ghost btn--sm pcard__cta">
          {product.kind === 'parfum' ? 'Discover fragrance' : 'Explore the set'}
        </Link>
      </div>
    </article>
  );
}
