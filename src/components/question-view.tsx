import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BLANK_MARKER } from '@/content/schema';
import type { Answer, QuestionCard } from '@/engine/lesson-session';
import { colors, fontSizes, radii, spacing } from '@/theme';

type Props = {
  card: QuestionCard;
  answer: Answer | null;
  checked: boolean;
  onSelect: (answer: Answer) => void;
};

type Option = { value: Answer; label: string };

const caption: Record<QuestionCard['type'], string> = {
  multiple_choice: 'WÄHLE DIE RICHTIGE ANTWORT',
  true_false: 'WAHR ODER FALSCH?',
  fill_blank: 'ERGÄNZE DIE LÜCKE',
};

export function getOptions(card: QuestionCard): Option[] {
  if (card.type === 'true_false') {
    return [
      { value: true, label: 'Wahr' },
      { value: false, label: 'Falsch' },
    ];
  }
  return card.options.map((label, index) => ({ value: index, label }));
}

/** Label of the correct answer, for feedback texts. */
export function getCorrectLabel(card: QuestionCard): string {
  return getOptions(card).find((option) => option.value === card.answer)?.label ?? '';
}

function getPrompt(card: QuestionCard, answer: Answer | null): string {
  if (card.type !== 'fill_blank') {
    return card.prompt;
  }
  const filled = typeof answer === 'number' ? card.options[answer] : undefined;
  return card.prompt.replace(BLANK_MARKER, filled ?? '_____');
}

type OptionState = 'idle' | 'selected' | 'correct' | 'wrong' | 'dimmed';

function getOptionState(
  card: QuestionCard,
  option: Option,
  answer: Answer | null,
  checked: boolean,
): OptionState {
  if (!checked) {
    return option.value === answer ? 'selected' : 'idle';
  }
  if (option.value === card.answer) {
    return 'correct';
  }
  return option.value === answer ? 'wrong' : 'dimmed';
}

export function QuestionView({ card, answer, checked, onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.caption}>{caption[card.type]}</Text>
      <Text accessibilityRole="header" style={styles.prompt}>
        {getPrompt(card, answer)}
      </Text>
      <View style={styles.options}>
        {getOptions(card).map((option) => {
          const state = getOptionState(card, option, answer, checked);
          return (
            <Pressable
              key={option.label}
              accessibilityRole="button"
              accessibilityState={{ selected: state === 'selected', disabled: checked }}
              disabled={checked}
              onPress={() => onSelect(option.value)}
              style={[styles.option, optionStyles[state]]}>
              <Text style={styles.optionText}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  caption: {
    fontSize: fontSizes.small,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },
  prompt: { fontSize: fontSizes.title, fontWeight: '700', color: colors.text },
  options: { gap: spacing.sm, marginTop: spacing.sm },
  option: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  optionText: { fontSize: fontSizes.body, color: colors.text },
});

const optionStyles = StyleSheet.create({
  idle: {},
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  correct: { borderColor: colors.success, backgroundColor: colors.successSoft },
  wrong: { borderColor: colors.error, backgroundColor: colors.errorSoft },
  dimmed: { opacity: 0.5 },
});
