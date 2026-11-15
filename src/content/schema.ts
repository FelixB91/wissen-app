/**
 * Content schema (single source of truth for courses, lessons and cards).
 *
 * Kept in one file without relative imports so that scripts/validate-content.js can
 * load it directly with Node's TypeScript support. Pure data checks only – no React.
 */
import { z } from 'zod';

/** Maximum number of distinct concepts a lesson may teach (content guideline). */
export const MAX_CONCEPTS_PER_LESSON = 3;

const idSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be kebab-case (a-z, 0-9, -)');
const textSchema = z.string().trim().min(1, 'must not be empty');

export const depthSchema = z.enum(['hook', 'core', 'deep']);
export const reviewStatusSchema = z.enum(['draft', 'in_review', 'published']);

export const sourceSchema = z.strictObject({
  title: textSchema,
  url: z.url().refine((url) => url.startsWith('https://'), 'must use https'),
  kind: z.enum(['wikipedia', 'web', 'book']),
});

const cardBase = {
  id: idSchema,
  depth: depthSchema,
  concepts: z.array(idSchema).min(1, 'at least one concept required'),
  sources: z.array(sourceSchema).min(1, 'at least one source required'),
  review_status: reviewStatusSchema,
};

const questionBase = {
  ...cardBase,
  prompt: textSchema,
  explanation: textSchema,
};

const optionsSchema = z
  .array(textSchema)
  .min(2)
  .max(6)
  .refine((options) => new Set(options).size === options.length, 'options must be unique');

const answerIndexSchema = z.int().min(0);

export const explainCardSchema = z.strictObject({
  ...cardBase,
  type: z.literal('explain'),
  title: textSchema,
  body: textSchema,
  /** The "Merke" sentence shown at the end of an explanation. */
  remember: textSchema.optional(),
});

export const multipleChoiceCardSchema = z
  .strictObject({
    ...questionBase,
    type: z.literal('multiple_choice'),
    options: optionsSchema,
    answer: answerIndexSchema,
  })
  .refine((card) => card.answer < card.options.length, {
    message: 'answer must be a valid option index',
    path: ['answer'],
  });

export const trueFalseCardSchema = z.strictObject({
  ...questionBase,
  type: z.literal('true_false'),
  answer: z.boolean(),
});

export const BLANK_MARKER = '___';

export const fillBlankCardSchema = z
  .strictObject({
    ...questionBase,
    type: z.literal('fill_blank'),
    options: optionsSchema,
    answer: answerIndexSchema,
  })
  .refine((card) => card.answer < card.options.length, {
    message: 'answer must be a valid option index',
    path: ['answer'],
  })
  .refine((card) => card.prompt.split(BLANK_MARKER).length === 2, {
    message: `prompt must contain the blank marker "${BLANK_MARKER}" exactly once`,
    path: ['prompt'],
  });

export const cardSchema = z.discriminatedUnion('type', [
  explainCardSchema,
  multipleChoiceCardSchema,
  trueFalseCardSchema,
  fillBlankCardSchema,
]);

export const lessonSchema = z
  .strictObject({
    id: idSchema,
    title: textSchema,
    est_minutes: z.int().min(1).max(15),
    cards: z.array(cardSchema).min(1),
  })
  .superRefine((lesson, ctx) => {
    const ids = lesson.cards.map((card) => card.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({ code: 'custom', message: 'card ids must be unique', path: ['cards'] });
    }
    if (!lesson.cards.some((card) => card.depth === 'core')) {
      ctx.addIssue({
        code: 'custom',
        message: 'at least one card with depth "core" required',
        path: ['cards'],
      });
    }
    const concepts = new Set(lesson.cards.flatMap((card) => card.concepts));
    if (concepts.size > MAX_CONCEPTS_PER_LESSON) {
      ctx.addIssue({
        code: 'custom',
        message: `at most ${MAX_CONCEPTS_PER_LESSON} concepts per lesson (found ${concepts.size})`,
        path: ['cards'],
      });
    }
  });

export const conceptSchema = z.strictObject({
  id: idSchema,
  title: textSchema,
  summary: textSchema,
  /** Concepts that should be understood first (loose, see plan.md). */
  requires: z.array(idSchema).default([]),
});

export const unitSchema = z.strictObject({
  id: idSchema,
  title: textSchema,
  /** Lesson ids in learning order; each id is a file lessons/<id>.json. */
  lessons: z.array(idSchema).min(1),
});

export const courseSchema = z.strictObject({
  id: idSchema,
  title: textSchema,
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  domain: z.strictObject({ id: idSchema, title: textSchema }),
  units: z.array(unitSchema).min(1),
  concepts: z.array(conceptSchema).min(1),
});

export type Depth = z.infer<typeof depthSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Card = z.infer<typeof cardSchema>;
export type ExplainCard = z.infer<typeof explainCardSchema>;
export type MultipleChoiceCard = z.infer<typeof multipleChoiceCardSchema>;
export type TrueFalseCard = z.infer<typeof trueFalseCardSchema>;
export type FillBlankCard = z.infer<typeof fillBlankCardSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Concept = z.infer<typeof conceptSchema>;
export type Unit = z.infer<typeof unitSchema>;
export type Course = z.infer<typeof courseSchema>;

export type RawLessonFile = {
  /** File name without extension; must equal the lesson id. */
  name: string;
  data: unknown;
};

export type CourseBundleResult =
  { ok: true; course: Course; lessons: Lesson[] } | { ok: false; errors: string[] };

function formatIssues(scope: string, error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `.${issue.path.join('.')}` : '';
    return `${scope}${path}: ${issue.message}`;
  });
}

/**
 * Validates a course and its lessons, including cross-references:
 * lesson files match the units, every card concept exists, concept prerequisites exist.
 */
export function validateCourseBundle(
  rawCourse: unknown,
  rawLessons: RawLessonFile[],
): CourseBundleResult {
  const errors: string[] = [];

  const courseResult = courseSchema.safeParse(rawCourse);
  if (!courseResult.success) {
    errors.push(...formatIssues('course', courseResult.error));
  }

  const lessons: Lesson[] = [];
  for (const file of rawLessons) {
    const result = lessonSchema.safeParse(file.data);
    if (!result.success) {
      errors.push(...formatIssues(`lessons/${file.name}`, result.error));
      continue;
    }
    if (result.data.id !== file.name) {
      errors.push(`lessons/${file.name}: lesson id "${result.data.id}" must equal the file name`);
    }
    lessons.push(result.data);
  }

  if (!courseResult.success) {
    return { ok: false, errors };
  }
  const course = courseResult.data;

  const conceptIds = new Set(course.concepts.map((concept) => concept.id));
  if (conceptIds.size !== course.concepts.length) {
    errors.push('course.concepts: concept ids must be unique');
  }
  for (const concept of course.concepts) {
    for (const required of concept.requires) {
      if (required === concept.id) {
        errors.push(`course.concepts.${concept.id}: concept must not require itself`);
      } else if (!conceptIds.has(required)) {
        errors.push(`course.concepts.${concept.id}: unknown prerequisite "${required}"`);
      }
    }
  }

  const referenced = course.units.flatMap((unit) => unit.lessons);
  if (new Set(referenced).size !== referenced.length) {
    errors.push('course.units: a lesson is listed more than once');
  }
  const unitIds = course.units.map((unit) => unit.id);
  if (new Set(unitIds).size !== unitIds.length) {
    errors.push('course.units: unit ids must be unique');
  }
  const lessonIds = new Set(lessons.map((lesson) => lesson.id));
  for (const id of referenced) {
    if (!lessonIds.has(id)) {
      errors.push(`course.units: lesson "${id}" has no valid file in lessons/`);
    }
  }
  for (const id of lessonIds) {
    if (!referenced.includes(id)) {
      errors.push(`lessons/${id}: lesson is not listed in any unit`);
    }
  }

  for (const lesson of lessons) {
    for (const card of lesson.cards) {
      for (const concept of card.concepts) {
        if (!conceptIds.has(concept)) {
          errors.push(`lessons/${lesson.id}.cards.${card.id}: unknown concept "${concept}"`);
        }
      }
    }
  }

  return errors.length > 0 ? { ok: false, errors } : { ok: true, course, lessons };
}
