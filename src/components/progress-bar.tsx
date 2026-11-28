import { StyleSheet, View } from 'react-native';

import { colors, radii } from '@/theme';

type Props = {
  /** Value between 0 and 1. */
  fraction: number;
};

export function ProgressBar({ fraction }: Props) {
  const percent = Math.round(Math.min(1, Math.max(0, fraction)) * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={styles.track}>
      <View style={[styles.fill, { width: `${percent}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flex: 1, height: 10, backgroundColor: colors.border, borderRadius: radii.md },
  fill: { height: '100%', backgroundColor: colors.success, borderRadius: radii.md },
});
