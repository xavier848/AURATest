import { MAX_QTY } from '../lib/cart';
import { MinusIcon, PlusIcon } from './Icons';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
}

export function QuantityStepper({ value, onChange, label, min = 1 }: QuantityStepperProps) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Menge verringern">
        <MinusIcon size={16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} aria-label="Menge erhöhen">
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
