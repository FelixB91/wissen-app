import { StyleSheet, Text, View } from 'react-native';

import type { ExplainCard } from '@/content/schema';
import { colors, fontSizes, radii, spacing } from '@/theme';

type Props = {
  card: ExplainCard;
};

export function ExplainCardView({ card }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{card.depth === 'hook' ? 'WUSSTEST DU?' : 'LERNE'}</Text>
      <Text accessibilityRole="header" style={styles.title}>
        {card.title}
      </Text>
      <Text style={styles.body}>{card.body}</Text>
      {card.remember ? (
        <View style={styles.remember}>
          <Text style={styles.rememberText}>
            <Text style={styles.rememberLabel}>Merke: </Text>
            {card.remember}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  label: { fontSize: fontSizes.small, fontWeight: '700', color: colors.primary, letterSpacing: 1 },
  title: { fontSize: fontSizes.title, fontWeight: '700', color: colors.text },
  body: { fontSize: fontSizes.body, lineHeight: 26, color: colors.text },
  remember: { padding: spacing.md, backgroundColor: colors.primarySoft, borderRadius: radii.md },
  rememberText: { fontSize: fontSizes.body, lineHeight: 24, color: colors.text },
  rememberLabel: { fontWeight: '700' },
});
