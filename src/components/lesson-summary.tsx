import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ExplainCard, Source } from '@/content/schema';
import { colors, fontSizes, radii, spacing } from '@/theme';

import { Button } from './button';
import { SourceLinks } from './source-links';

type Props = {
  lessonTitle: string;
  correct: number;
  total: number;
  /** Optional deep-dive cards, shown collapsed ("Mehr erfahren"). */
  deepCards: readonly ExplainCard[];
  /** Further reading: all sources of the lesson. */
  sources: readonly Source[];
  onDone: () => void;
};

export function LessonSummary({ lessonTitle, correct, total, deepCards, sources, onDone }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>GESCHAFFT</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {lessonTitle}
      </Text>
      {total > 0 ? (
        <Text style={styles.result}>
          {correct} von {total} Fragen richtig beantwortet.
        </Text>
      ) : null}

      {deepCards.map((card) => {
        const open = openId === card.id;
        return (
          <View key={card.id} style={styles.deep}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => setOpenId(open ? null : card.id)}>
              <Text style={styles.deepTitle}>
                {open ? '▾' : '▸'} {card.title}
              </Text>
            </Pressable>
            {open ? <Text style={styles.deepBody}>{card.body}</Text> : null}
          </View>
        );
      })}

      <View style={styles.reading}>
        <Text accessibilityRole="header" style={styles.readingTitle}>
          Weiterlesen
        </Text>
        <SourceLinks sources={sources} label="Quelle" />
      </View>

      <Button label="Fertig" onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  label: { fontSize: fontSizes.small, fontWeight: '700', color: colors.success, letterSpacing: 1 },
  title: { fontSize: fontSizes.hero, fontWeight: '700', color: colors.text },
  result: { fontSize: fontSizes.body, color: colors.textSecondary },
  deep: {
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
  },
  deepTitle: { fontSize: fontSizes.body, fontWeight: '600', color: colors.text },
  deepBody: { fontSize: fontSizes.body, lineHeight: 24, color: colors.text },
  reading: { gap: spacing.sm, marginVertical: spacing.sm },
  readingTitle: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textSecondary },
});
