import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/button';
import { LessonPlayer } from '@/components/lesson-player';
import { getLesson } from '@/content/catalog';
import { useProgressStore } from '@/state/progress-store';
import { colors, fontSizes, spacing } from '@/theme';

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const completeLesson = useProgressStore((state) => state.completeLesson);
  const lesson = getLesson(id);

  // Deep links have no history to go back to, so fall back to the learning path.
  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!lesson) {
    return (
      <View style={styles.missing}>
        <Text accessibilityRole="header" style={styles.title}>
          Lektion nicht gefunden
        </Text>
        <Button label="Zurück" onPress={leave} />
      </View>
    );
  }

  return (
    <LessonPlayer lesson={lesson} onComplete={() => completeLesson(lesson.id)} onExit={leave} />
  );
}

const styles = StyleSheet.create({
  missing: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background,
  },
  title: { fontSize: fontSizes.title, fontWeight: '700', color: colors.text },
});
