import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { LessonStatus } from '@/engine/learning-path';
import { colors, fontSizes, radii, spacing } from '@/theme';

type Props = {
  title: string;
  estMinutes: number;
  status: LessonStatus;
  onPress: () => void;
};

const statusLabel: Record<LessonStatus, string> = {
  completed: 'abgeschlossen',
  open: 'offen',
  locked: 'gesperrt',
};

const statusMarker: Record<LessonStatus, string> = {
  completed: '✓',
  open: '●',
  locked: '🔒',
};

const actionLabel: Record<LessonStatus, string | null> = {
  completed: 'Nochmal',
  open: 'Starten',
  locked: null,
};

export function LessonRow({ title, estMinutes, status, onPress }: Props) {
  const locked = status === 'locked';
  const action = actionLabel[status];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${statusLabel[status]}, ${estMinutes} Minuten`}
      accessibilityState={{ disabled: locked }}
      disabled={locked}
      onPress={onPress}
      style={({ pressed }) => [styles.row, locked && styles.rowLocked, pressed && styles.pressed]}>
      <Text
        style={[
          styles.marker,
          status === 'completed' && styles.markerCompleted,
          status === 'open' && styles.markerOpen,
        ]}>
        {statusMarker[status]}
      </Text>
      <View style={styles.texts}>
        <Text style={[styles.title, locked && styles.titleLocked]}>{title}</Text>
        <Text style={styles.meta}>{estMinutes} Min.</Text>
      </View>
      {action ? (
        <View style={[styles.action, status === 'completed' && styles.actionSecondary]}>
          <Text style={[styles.actionText, status === 'completed' && styles.actionTextSecondary]}>
            {action}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowLocked: { opacity: 0.6 },
  pressed: { opacity: 0.8 },
  marker: { width: 28, textAlign: 'center', fontSize: fontSizes.title, color: colors.muted },
  markerCompleted: { color: colors.success },
  markerOpen: { color: colors.primary },
  texts: { flex: 1, gap: spacing.xs },
  title: { fontSize: fontSizes.body, fontWeight: '600', color: colors.text },
  titleLocked: { color: colors.textSecondary },
  meta: { fontSize: fontSizes.small, color: colors.textSecondary },
  action: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.md,
  },
  actionSecondary: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: { fontSize: fontSizes.small, fontWeight: '700', color: colors.onPrimary },
  actionTextSecondary: { color: colors.text },
});
