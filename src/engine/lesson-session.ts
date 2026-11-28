/** Lesson session: pure state transitions for playing through one lesson. */
import type {
  Card,
  FillBlankCard,
  Lesson,
  MultipleChoiceCard,
  Source,
  TrueFalseCard,
} from '@/content/schema';

export type QuestionCard = MultipleChoiceCard | TrueFalseCard | FillBlankCard;

/** Option index (multiple choice, fill blank) or boolean (true/false). */
export type Answer = number | boolean;

export type SessionState = {
  /** Index of the current card in the lesson flow. */
  index: number;
  /** Answer picked for the current question, not yet checked when `checked` is false. */
  answer: Answer | null;
  /** True once the current answer was checked and feedback is shown. */
  checked: boolean;
  /** Result per question card id (true = answered correctly). */
  results: Readonly<Record<string, boolean>>;
};

export const initialSession: SessionState = {
  index: 0,
  answer: null,
  checked: false,
  results: {},
};

export function isQuestion(card: Card): card is QuestionCard {
  return card.type !== 'explain';
}

export function isCorrectAnswer(card: QuestionCard, answer: Answer): boolean {
  return card.answer === answer;
}

/**
 * Splits a lesson into the main flow and the optional deep-dive cards.
 * Deep cards are not part of the flow; they are offered at the end ("Mehr erfahren").
 */
export function splitLessonCards(lesson: Pick<Lesson, 'cards'>): { flow: Card[]; deep: Card[] } {
  return {
    flow: lesson.cards.filter((card) => card.depth !== 'deep'),
    deep: lesson.cards.filter((card) => card.depth === 'deep'),
  };
}

/** Picks an answer. Ignored once the answer was checked. */
export function selectAnswer(state: SessionState, answer: Answer): SessionState {
  return state.checked ? state : { ...state, answer };
}

/** Checks the picked answer and records the result. Ignored without an answer. */
export function checkAnswer(state: SessionState, card: QuestionCard): SessionState {
  if (state.checked || state.answer === null) {
    return state;
  }
  return {
    ...state,
    checked: true,
    results: { ...state.results, [card.id]: isCorrectAnswer(card, state.answer) },
  };
}

/** Moves on to the next card. */
export function advance(state: SessionState): SessionState {
  return { index: state.index + 1, answer: null, checked: false, results: state.results };
}

export function isFinished(state: SessionState, cardCount: number): boolean {
  return state.index >= cardCount;
}

/** Share of cards already passed, between 0 and 1. */
export function progressFraction(state: SessionState, cardCount: number): number {
  return cardCount === 0 ? 1 : Math.min(1, state.index / cardCount);
}

export function summarize(state: SessionState): { correct: number; total: number } {
  const values = Object.values(state.results);
  return { correct: values.filter(Boolean).length, total: values.length };
}

/** All distinct sources of the given cards (by URL), in order of first appearance. */
export function collectSources(cards: readonly Card[]): Source[] {
  const seen = new Set<string>();
  const sources: Source[] = [];
  for (const card of cards) {
    for (const source of card.sources) {
      if (!seen.has(source.url)) {
        seen.add(source.url);
        sources.push(source);
      }
    }
  }
  return sources;
}
