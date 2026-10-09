import { describe, expect, it } from 'vitest';
import type { Answers } from '../data/quiz';
import { computeMatch, decodeAnswers, encodeAnswers, isComplete } from './matching';

const fresh: Answers = {
  energy: ['fresh-effortless'],
  universe: ['golden-morning'],
  families: ['fresh-citrus', 'clean-musky'],
  feeling: ['fresh-start'],
  occasions: ['every-day', 'work-study'],
  intensity: ['subtle'],
  sweetness: ['fresh-woody'],
  avoid: ['none'],
  adventure: ['effortless'],
  purpose: ['everyday'],
};

const floral: Answers = {
  energy: ['soft-elegant'],
  universe: ['soft-romance'],
  families: ['floral-soft', 'clean-musky'],
  feeling: ['beautiful-escape'],
  occasions: ['every-day', 'dates-dinners'],
  intensity: ['balanced'],
  sweetness: ['a-little'],
  avoid: ['strong-spices'],
  adventure: ['little-different'],
  purpose: ['signature'],
};

const warm: Answers = {
  energy: ['warm-magnetic'],
  universe: ['midnight-velvet'],
  families: ['sweet-gourmand', 'warm-spicy'],
  feeling: ['little-mystery'],
  occasions: ['dates-dinners', 'events-nights'],
  intensity: ['bold'],
  sweetness: ['love-it'],
  avoid: ['none'],
  adventure: ['statement'],
  purpose: ['special'],
};

describe('computeMatch', () => {
  it('empfiehlt The Glow für frische, dezente Vorlieben', () => {
    const result = computeMatch(fresh);
    expect(result.primary).toBe('glow');
    expect(result.fit).toBe('clear');
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('empfiehlt The Muse für florale, weiche Vorlieben', () => {
    expect(computeMatch(floral).primary).toBe('muse');
  });

  it('empfiehlt The Afterglow für warme, süße, intensive Vorlieben', () => {
    const result = computeMatch(warm);
    expect(result.primary).toBe('afterglow');
    expect(result.profile.intensity).toBe(5);
  });

  it('lässt die Bildwelt allein nicht entscheiden', () => {
    const result = computeMatch({ ...fresh, universe: ['midnight-velvet'] });
    expect(result.primary).toBe('glow');
  });

  it('empfiehlt keinen ausdrücklich gemiedenen Duft, auch wenn die Vorlieben dorthin zeigen', () => {
    const result = computeMatch({ ...warm, avoid: ['very-sweet'] });
    expect(result.primary).not.toBe('afterglow');
    expect(result.alternative).not.toBe('afterglow');
    expect(result.fit).toBe('compromise');
    expect(result.blocked?.id).toBe('afterglow');
    expect(result.recommendation.productSlug).toBe('discovery-set');
    expect(result.exclusionNotes.join(' ')).toContain('AURA 03');
  });

  it('bevorzugt bei dezenter Intensität einen leichten Duft', () => {
    const neutral: Answers = {
      ...floral,
      energy: ['creative-unexpected'],
      families: ['woody-earthy'],
      intensity: ['subtle'],
    };
    expect(computeMatch(neutral).primary).not.toBe('afterglow');
  });

  it('zeigt bei unbekannten Duftvorlieben nur eine erste Orientierung', () => {
    const result = computeMatch({ ...floral, families: ['not-sure'], sweetness: ['not-sure'] });
    expect(result.fit).toBe('orientation');
    expect(result.recommendation.kind).toBe('discovery');
  });

  it('übersetzt Geschenk und Budget in das passende Format', () => {
    expect(computeMatch({ ...floral, purpose: ['gift'], budget: ['30-60'] }).recommendation.productSlug).toBe(
      'gift-experience',
    );
    expect(computeMatch({ ...floral, budget: ['30-60'] }).recommendation).toMatchObject({
      productSlug: 'aura-02-the-muse',
      variantId: '30ml',
    });
    expect(computeMatch({ ...floral, budget: ['under-30'] }).recommendation.productSlug).toBe('discovery-set');
  });

  it('ignoriert eine Budgetangabe, wenn die Budgetfrage nicht angezeigt wird', () => {
    const result = computeMatch({ ...floral, purpose: ['exploring'], budget: ['60-90'] });
    expect(result.rows.some((r) => r.question.id === 'budget')).toBe(false);
    expect(result.recommendation.kind).toBe('discovery');
  });
});

describe('Antworten kodieren', () => {
  it('stellt Antworten aus einem geteilten Link exakt wieder her', () => {
    const answers = { ...warm, budget: ['60-90'] };
    const code = encodeAnswers(answers);
    expect(code).toMatch(/^[a-z0-9.]+$/);
    const decoded = decodeAnswers(code);
    expect(decoded).not.toBeNull();
    expect(computeMatch(decoded as Answers)).toEqual(computeMatch(answers));
  });

  it('lehnt ungültige Codes ab', () => {
    expect(decodeAnswers('x1.y2')).toBeNull();
    expect(decodeAnswers('e9')).toBeNull();
  });

  it('verlangt alle zehn Pflichtfragen, das Budget ist optional', () => {
    expect(isComplete(warm)).toBe(true);
    const incomplete = { ...warm };
    delete incomplete.avoid;
    expect(isComplete(incomplete)).toBe(false);
  });
});
