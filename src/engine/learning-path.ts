/** Learning path: derives the status of every lesson from the completed lessons. */

export type LessonStatus = 'completed' | 'open' | 'locked';

export type PathLesson = {
  id: string;
  title: string;
  estMinutes: number;
  status: LessonStatus;
};

export type PathUnit = {
  id: string;
  title: string;
  lessons: PathLesson[];
};

type CourseStructure = {
  units: readonly { id: string; title: string; lessons: readonly string[] }[];
};

type LessonInfo = { id: string; title: string; est_minutes: number };

/**
 * Builds the path for a course. Lessons unlock linearly across all units: a lesson is
 * open once its predecessor is completed; the first lesson is always open.
 * (Concept prerequisites are not part of unlocking yet.)
 */
export function buildLearningPath(
  course: CourseStructure,
  lessons: readonly LessonInfo[],
  completedIds: readonly string[],
): PathUnit[] {
  const byId = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const completed = new Set(completedIds);
  let previousCompleted = true;

  return course.units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    lessons: unit.lessons.map((lessonId) => {
      const lesson = byId.get(lessonId);
      if (!lesson) {
        throw new Error(`Lesson "${lessonId}" is listed in unit "${unit.id}" but missing`);
      }
      const isCompleted = completed.has(lessonId);
      const status: LessonStatus = isCompleted
        ? 'completed'
        : previousCompleted
          ? 'open'
          : 'locked';
      previousCompleted = isCompleted;
      return { id: lesson.id, title: lesson.title, estMinutes: lesson.est_minutes, status };
    }),
  }));
}
