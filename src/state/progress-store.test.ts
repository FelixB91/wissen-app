import { useProgressStore } from './progress-store';

describe('progress store', () => {
  beforeEach(() => useProgressStore.getState().reset());

  it('starts empty', () => {
    expect(useProgressStore.getState().completedLessonIds).toEqual([]);
  });

  it('records a completed lesson once', () => {
    useProgressStore.getState().completeLesson('a');
    useProgressStore.getState().completeLesson('a');
    expect(useProgressStore.getState().completedLessonIds).toEqual(['a']);
  });
});
