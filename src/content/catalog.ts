import antikeCourse from '../../content/antike/course.json';
import antikeGruendung from '../../content/antike/lessons/gruendungsmythos-und-koenige.json';
import antikePunischeKriege from '../../content/antike/lessons/punische-kriege.json';
import antikeRepublik from '../../content/antike/lessons/die-republik.json';

import { validateCourseBundle, type Course, type Lesson } from './schema';

export type Catalog = {
  course: Course;
  lessons: Lesson[];
};

let cached: Catalog | undefined;

/** Content bundled with the app (Phase 1–2: JSON in the repo). Validated on first access. */
export function getCatalog(): Catalog {
  if (cached) {
    return cached;
  }
  const result = validateCourseBundle(antikeCourse, [
    { name: 'gruendungsmythos-und-koenige', data: antikeGruendung },
    { name: 'die-republik', data: antikeRepublik },
    { name: 'punische-kriege', data: antikePunischeKriege },
  ]);
  if (!result.ok) {
    throw new Error(`Bundled content is invalid:\n${result.errors.join('\n')}`);
  }
  cached = { course: result.course, lessons: result.lessons };
  return cached;
}

export function getLesson(id: string): Lesson | undefined {
  return getCatalog().lessons.find((lesson) => lesson.id === id);
}
