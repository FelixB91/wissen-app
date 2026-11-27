import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { LessonRow } from '@/components/lesson-row';
import { getCatalog } from '@/content/catalog';
import { buildLearningPath } from '@/engine/learning-path';
import { useProgressStore } from '@/state/progress-store';
import { colors, fontSizes, maxContentWidth, spacing } from '@/theme';

export default function LernenScreen() {
  const router = useRouter();
  const completedLessonIds = useProgressStore((state) => state.completedLessonIds);
  const { course, lessons } = getCatalog();
  const path = useMemo(
    () => buildLearningPath(course, lessons, completedLessonIds),
    [course, lessons, completedLessonIds],
  );

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.column}>
        <Text accessibilityRole="header" style={styles.title}>
          {course.domain.title} · {course.title}
        </Text>
        {path.map((unit, index) => (
          <View key={unit.id} style={styles.unit}>
            <Text accessibilityRole="header" style={styles.unitTitle}>
              Einheit {index + 1}: {unit.title}
            </Text>
            {unit.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                title={lesson.title}
                estMinutes={lesson.estMinutes}
                status={lesson.status}
                onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })}
              />
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  content: { alignItems: 'center', padding: spacing.md },
  column: { width: '100%', maxWidth: maxContentWidth, gap: spacing.lg },
  title: { fontSize: fontSizes.hero, fontWeight: '700', color: colors.text },
  unit: { gap: spacing.sm },
  unitTitle: { fontSize: fontSizes.body, fontWeight: '700', color: colors.textSecondary },
});
