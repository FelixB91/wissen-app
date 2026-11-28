import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Source } from '@/content/schema';
import { colors, fontSizes, spacing } from '@/theme';

type Props = {
  sources: readonly Source[];
  /** Label in front of each source, e.g. "Quelle". */
  label?: string;
};

/** Opens sources in a new tab on the web and in the system browser on native. */
export function SourceLinks({ sources, label = 'Mehr dazu' }: Props) {
  return (
    <View style={styles.list}>
      {sources.map((source) => (
        <Pressable
          key={source.url}
          accessibilityRole="link"
          accessibilityLabel={`${label}: ${source.title}`}
          onPress={() => {
            void Linking.openURL(source.url);
          }}>
          <Text style={styles.link}>
            {label}: {source.title} ↗
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  link: { fontSize: fontSizes.small, color: colors.primary, textDecorationLine: 'underline' },
});
