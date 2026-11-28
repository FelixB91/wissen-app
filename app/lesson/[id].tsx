import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getLesson } from '@/content/catalog';
import { useProgressStore } from '@/state/progress-store';
import { colors, fontSizes, maxContentWidth, radii, spacing } from '@/theme';

/** Placeholder until the lesson player (Phase 1, step 4) replaces it. */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const completeLesson = useProgressStore((state) => state.completeLesson);
  const lesson = getLesson(id);

  return (
    <View style={styles.screen}>
      <View style={styles.column}>
        <Text accessibilityRole="header" style={styles.title}>
          {lesson ? lesson.title : 'Lektion nicht gefunden'}
        </Text>
        <Text style={styles.text}>Der Lektion-Player folgt im nächsten Schritt.</Text>
        {lesson ? (
          <Pressable
            accessibilityRole="button"
            style={styles.button}
            onPress={() => {
              completeLesson(lesson.id);
              router.back();
            }}>
            <Text style={styles.buttonText}>Lektion abschließen (Platzhalter)</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text style={styles.link}>Zurück</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  column: { width: '100%', maxWidth: maxContentWidth, gap: spacing.md },
  title: { fontSize: fontSizes.hero, fontWeight: '700', color: colors.text },
  text: { fontSize: fontSizes.body, color: colors.textSecondary },
  button: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
  },
  buttonText: { fontSize: fontSizes.body, fontWeight: '700', color: colors.onPrimary },
  link: { fontSize: fontSizes.body, color: colors.primary },
});
