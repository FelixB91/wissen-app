import { create } from 'zustand';

type ProgressState = {
  completedLessonIds: string[];
  completeLesson: (lessonId: string) => void;
  reset: () => void;
};

/**
 * In-memory progress (Phase 1). Persistence via src/db follows in Phase 2,
 * so progress is lost on reload for now.
 */
export const useProgressStore = create<ProgressState>((set) => ({
  completedLessonIds: [],
  completeLesson: (lessonId) =>
    set((state) =>
      state.completedLessonIds.includes(lessonId)
        ? state
        : { completedLessonIds: [...state.completedLessonIds, lessonId] },
    ),
  reset: () => set({ completedLessonIds: [] }),
}));
