import type { Product } from '../data/products';

const LAYERS = [
  { key: 'top', label: 'Kopfnote', hint: 'die ersten Minuten' },
  { key: 'heart', label: 'Herznote', hint: 'nach etwa 20 bis 30 Minuten' },
  { key: 'base', label: 'Basisnote', hint: 'bleibt über Stunden' },
] as const;

export function NotesPyramid({ notes }: { notes: NonNullable<Product['notes']> }) {
  return (
    <dl className="pyramid">
      {LAYERS.map((layer) => (
        <div className="pyramid__row" key={layer.key}>
          <dt>
            <span className="pyramid__label">{layer.label}</span>
            <span className="pyramid__hint">{layer.hint}</span>
          </dt>
          <dd>{notes[layer.key].join(' · ')}</dd>
        </div>
      ))}
    </dl>
  );
}
