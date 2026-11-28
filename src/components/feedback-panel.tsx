import { StyleSheet, Text, View } from 'react-native';

import type { Source } from '@/content/schema';
import { colors, fontSizes, radii, spacing } from '@/theme';

import { Button } from './button';
import { SourceLinks } from './source-links';

type Props = {
  correct: boolean;
  /** Label of the correct answer, shown when the answer was wrong. */
  correctLabel: string;
  explanation: string;
  sources: readonly Source[];
  onContinue: () => void;
};

/** Shown after checking an answer. Always explains, also for correct answers. */
export function FeedbackPanel({ correct, correctLabel, explanation, sources, onContinue }: Props) {
  return (
    <View style={[styles.panel, correct ? styles.panelCorrect : styles.panelWrong]}>
      <Text
        accessibilityLiveRegion="polite"
        style={[styles.heading, correct ? styles.headingCorrect : styles.headingWrong]}>
        {correct ? '✓ Richtig' : '✗ Nicht ganz'}
      </Text>
      {correct ? null : <Text style={styles.answer}>Richtig wäre: {correctLabel}</Text>}
      <Text style={styles.explanation}>
        <Text style={styles.why}>Warum? </Text>
        {explanation}
      </Text>
      <SourceLinks sources={sources} />
      <Button label="Weiter" onPress={onContinue} />
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { gap: spacing.sm, padding: spacing.md, borderRadius: radii.lg },
  panelCorrect: { backgroundColor: colors.successSoft },
  panelWrong: { backgroundColor: colors.errorSoft },
  heading: { fontSize: fontSizes.title, fontWeight: '700' },
  headingCorrect: { color: colors.success },
  headingWrong: { color: colors.error },
  answer: { fontSize: fontSizes.body, fontWeight: '600', color: colors.text },
  explanation: { fontSize: fontSizes.body, lineHeight: 24, color: colors.text },
  why: { fontWeight: '700' },
});
