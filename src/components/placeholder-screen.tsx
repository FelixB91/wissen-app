import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, fontSizes, maxContentWidth, spacing } from '@/theme';

type Props = {
  title: string;
  text: string;
};

export function PlaceholderScreen({ title, text }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.column}>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { alignItems: 'center', padding: spacing.md },
  column: { width: '100%', maxWidth: maxContentWidth, gap: spacing.sm },
  title: { fontSize: fontSizes.hero, fontWeight: '700', color: colors.text },
  text: { fontSize: fontSizes.body, lineHeight: 24, color: colors.textSecondary },
});
