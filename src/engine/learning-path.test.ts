import { buildLearningPath } from './learning-path';

const course = {
  units: [
    { id: 'unit-1', title: 'Einheit 1', lessons: ['a', 'b'] },
    { id: 'unit-2', title: 'Einheit 2', lessons: ['c'] },
  ],
};

const lessons = [
  { id: 'a', title: 'Lektion A', est_minutes: 5 },
  { id: 'b', title: 'Lektion B', est_minutes: 6 },
  { id: 'c', title: 'Lektion C', est_minutes: 7 },
];

const statuses = (completed: string[]) =>
  buildLearningPath(course, lessons, completed).flatMap((unit) =>
    unit.lessons.map((lesson) => lesson.status),
  );

describe('buildLearningPath', () => {
  it('opens only the first lesson when nothing is completed', () => {
    expect(statuses([])).toEqual(['open', 'locked', 'locked']);
  });

  it('opens the next lesson after completing one', () => {
    expect(statuses(['a'])).toEqual(['completed', 'open', 'locked']);
  });

  it('unlocks across unit boundaries', () => {
    expect(statuses(['a', 'b'])).toEqual(['completed', 'completed', 'open']);
  });

  it('marks everything completed when all lessons are done', () => {
    expect(statuses(['a', 'b', 'c'])).toEqual(['completed', 'completed', 'completed']);
  });

  it('keeps an earlier open lesson open if a later one is completed out of order', () => {
    expect(statuses(['b'])).toEqual(['open', 'completed', 'open']);
  });

  it('keeps unit structure and lesson details', () => {
    const path = buildLearningPath(course, lessons, []);
    expect(path.map((unit) => unit.id)).toEqual(['unit-1', 'unit-2']);
    expect(path[0].lessons[1]).toEqual({
      id: 'b',
      title: 'Lektion B',
      estMinutes: 6,
      status: 'locked',
    });
  });

  it('throws when a unit lists an unknown lesson', () => {
    expect(() => buildLearningPath(course, lessons.slice(0, 2), [])).toThrow(/"c"/);
  });
});
