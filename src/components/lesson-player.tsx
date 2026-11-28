import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ExplainCard, Lesson } from '@/content/schema';
import {
  advance,
  checkAnswer,
  collectSources,
  initialSession,
  isFinished,
  isQuestion,
  progressFraction,
  selectAnswer,
  splitLessonCards,
  summarize,
  type Answer,
} from '@/engine/lesson-session';
import { colors, fontSizes, maxContentWidth, spacing } from '@/theme';

import { Button } from './button';
import { ExplainCardView } from './explain-card-view';
import { FeedbackPanel } from './feedback-panel';
import { LessonSummary } from './lesson-summary';
import { ProgressBar } from './progress-bar';
import { getCorrectLabel, QuestionView } from './question-view';

type Props = {
  lesson: Lesson;
  /** Called once when the last card was passed (lesson counts as completed). */
  onComplete: () => void;
  /** Called when the user leaves the lesson (✕ or "Fertig"). */
  onExit: () => void;
};

export function LessonPlayer({ lesson, onComplete, onExit }: Props) {
  const [state, setState] = useState(initialSession);
  const { flow, deep } = useMemo(() => splitLessonCards(lesson), [lesson]);
  const deepCards = useMemo(
    () => deep.filter((card): card is ExplainCard => card.type === 'explain'),
    [deep],
  );

  const finished = isFinished(state, flow.length);
  const card = finished ? undefined : flow[state.index];

  const goOn = () => {
    const next = advance(state);
    setState(next);
    if (isFinished(next, flow.length)) {
      onComplete();
    }
  };

  let content: React.ReactNode = null;
  let footer: React.ReactNode = null;

  if (finished) {
    const { correct, total } = summarize(state);
    content = (
      <LessonSummary
        lessonTitle={lesson.title}
        correct={correct}
        total={total}
        deepCards={deepCards}
        sources={collectSources(lesson.cards)}
        onDone={onExit}
      />
    );
  } else if (card && isQuestion(card)) {
    content = (
      <QuestionView
        card={card}
        answer={state.answer}
        checked={state.checked}
        onSelect={(answer: Answer) => setState((current) => selectAnswer(current, answer))}
      />
    );
    footer = state.checked ? (
      <FeedbackPanel
        correct={state.results[card.id] === true}
        correctLabel={getCorrectLabel(card)}
        explanation={card.explanation}
        sources={card.sources}
        onContinue={goOn}
      />
    ) : (
      <Button
        label="Prüfen"
        disabled={state.answer === null}
        onPress={() => setState((current) => checkAnswer(current, card))}
      />
    );
  } else if (card) {
    content = <ExplainCardView card={card} />;
    footer = <Button label="Weiter" onPress={goOn} />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Lektion beenden"
            onPress={onExit}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
          <ProgressBar fraction={progressFraction(state, flow.length)} />
          <Text style={styles.counter}>
            {Math.min(state.index + 1, flow.length)}/{flow.length}
          </Text>
        </View>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.column}>{content}</View>
      </ScrollView>
      {footer ? (
        <View style={styles.footer}>
          <View style={styles.column}>{footer}</View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: { alignItems: 'center', padding: spacing.md },
  headerRow: {
    width: '100%',
    maxWidth: maxContentWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  close: { fontSize: fontSizes.title, color: colors.textSecondary },
  counter: { fontSize: fontSizes.small, color: colors.textSecondary },
  scroll: { flex: 1 },
  scrollContent: { alignItems: 'center', padding: spacing.md },
  column: { width: '100%', maxWidth: maxContentWidth },
  footer: { alignItems: 'center', padding: spacing.md },
});
