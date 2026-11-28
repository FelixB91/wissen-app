import type { Card, Lesson } from '@/content/schema';

import {
  advance,
  checkAnswer,
  collectSources,
  initialSession,
  isCorrectAnswer,
  isFinished,
  isQuestion,
  progressFraction,
  selectAnswer,
  splitLessonCards,
  summarize,
  type QuestionCard,
} from './lesson-session';

const wiki = (slug: string) => ({
  title: slug,
  url: `https://de.wikipedia.org/wiki/${slug}`,
  kind: 'wikipedia' as const,
});

const common = { depth: 'core' as const, concepts: ['c'], review_status: 'draft' as const };

const explain: Card = {
  ...common,
  id: 'e1',
  type: 'explain',
  title: 'T',
  body: 'B',
  sources: [wiki('A')],
};
const deep: Card = { ...explain, id: 'e2', depth: 'deep', sources: [wiki('A'), wiki('B')] };
const mc: QuestionCard = {
  ...common,
  id: 'q1',
  type: 'multiple_choice',
  prompt: 'P',
  options: ['x', 'y'],
  answer: 1,
  explanation: 'E',
  sources: [wiki('C')],
};
const tf: QuestionCard = {
  ...common,
  id: 'q2',
  type: 'true_false',
  prompt: 'P',
  answer: false,
  explanation: 'E',
  sources: [wiki('C')],
};

describe('isCorrectAnswer', () => {
  it('compares option indices and booleans strictly', () => {
    expect(isCorrectAnswer(mc, 1)).toBe(true);
    expect(isCorrectAnswer(mc, 0)).toBe(false);
    expect(isCorrectAnswer(tf, false)).toBe(true);
    expect(isCorrectAnswer(tf, true)).toBe(false);
  });

  it('does not treat a boolean as an index', () => {
    expect(isCorrectAnswer(mc, true)).toBe(false);
  });
});

describe('isQuestion', () => {
  it('is false for explain cards only', () => {
    expect(isQuestion(explain)).toBe(false);
    expect(isQuestion(mc)).toBe(true);
    expect(isQuestion(tf)).toBe(true);
  });
});

describe('splitLessonCards', () => {
  it('moves deep cards out of the flow', () => {
    const lesson = { cards: [explain, deep, mc] } as Pick<Lesson, 'cards'>;
    const { flow, deep: deepCards } = splitLessonCards(lesson);
    expect(flow.map((card) => card.id)).toEqual(['e1', 'q1']);
    expect(deepCards.map((card) => card.id)).toEqual(['e2']);
  });
});

describe('answering', () => {
  it('stores the selected answer', () => {
    expect(selectAnswer(initialSession, 1).answer).toBe(1);
  });

  it('can change the selection before checking', () => {
    const state = selectAnswer(selectAnswer(initialSession, 0), 1);
    expect(state.answer).toBe(1);
  });

  it('does nothing when checking without an answer', () => {
    expect(checkAnswer(initialSession, mc)).toBe(initialSession);
  });

  it('records a correct result when checking', () => {
    const state = checkAnswer(selectAnswer(initialSession, 1), mc);
    expect(state.checked).toBe(true);
    expect(state.results).toEqual({ q1: true });
  });

  it('records a wrong result when checking', () => {
    const state = checkAnswer(selectAnswer(initialSession, 0), mc);
    expect(state.results).toEqual({ q1: false });
  });

  it('locks the answer after checking', () => {
    const checked = checkAnswer(selectAnswer(initialSession, 0), mc);
    expect(selectAnswer(checked, 1)).toBe(checked);
    expect(checkAnswer(checked, mc)).toBe(checked);
  });
});

describe('advance and progress', () => {
  it('resets answer state but keeps results', () => {
    const checked = checkAnswer(selectAnswer(initialSession, 1), mc);
    const next = advance(checked);
    expect(next).toEqual({ index: 1, answer: null, checked: false, results: { q1: true } });
  });

  it('knows when the lesson is finished', () => {
    expect(isFinished({ ...initialSession, index: 2 }, 3)).toBe(false);
    expect(isFinished({ ...initialSession, index: 3 }, 3)).toBe(true);
  });

  it('computes the progress fraction', () => {
    expect(progressFraction({ ...initialSession, index: 1 }, 4)).toBe(0.25);
    expect(progressFraction({ ...initialSession, index: 9 }, 4)).toBe(1);
    expect(progressFraction(initialSession, 0)).toBe(1);
  });
});

describe('summarize', () => {
  it('counts correct answers and questions', () => {
    const state = { ...initialSession, results: { q1: true, q2: false, q3: true } };
    expect(summarize(state)).toEqual({ correct: 2, total: 3 });
  });

  it('is zero without questions', () => {
    expect(summarize(initialSession)).toEqual({ correct: 0, total: 0 });
  });
});

describe('collectSources', () => {
  it('returns distinct sources in order of first appearance', () => {
    const urls = collectSources([explain, deep, mc, tf]).map((source) => source.title);
    expect(urls).toEqual(['A', 'B', 'C']);
  });
});
