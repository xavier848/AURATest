import type { ArchetypeId } from '../data/products';
import type { Answers } from '../data/quiz';
import { readJSON, removeKey, writeJSON } from './storage';

const PROGRESS_KEY = 'aura.quiz.progress.v1';
const RESULT_KEY = 'aura.quiz.result.v1';

export interface QuizProgress {
  answers: Answers;
  step: number;
  updatedAt: number;
}

export interface SavedResult {
  code: string;
  primary: ArchetypeId;
  alternative: ArchetypeId | null;
  savedAt: number;
}

export const loadProgress = () => readJSON<QuizProgress | null>(PROGRESS_KEY, null);
export const saveProgress = (progress: QuizProgress) => writeJSON(PROGRESS_KEY, progress);
export const clearProgress = () => removeKey(PROGRESS_KEY);

export const loadResult = () => readJSON<SavedResult | null>(RESULT_KEY, null);
export const saveResult = (result: SavedResult) => writeJSON(RESULT_KEY, result);
