import { getCatalog, getLesson } from './catalog';

describe('catalog', () => {
  it('loads and validates the bundled course', () => {
    const { course, lessons } = getCatalog();
    expect(course.id).toBe('antike');
    expect(lessons).toHaveLength(3);
  });

  it('finds lessons by id', () => {
    expect(getLesson('die-republik')?.title).toBe('Die Republik');
    expect(getLesson('gibt-es-nicht')).toBeUndefined();
  });
});
