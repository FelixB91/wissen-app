// Validates everything under content/ against src/content/schema.ts.
//
// Layout: content/<course-id>/course.json and content/<course-id>/lessons/<lesson-id>.json
// Needs Node with TypeScript support (22.18+ / 24+), which loads the schema file directly.
const { existsSync, readdirSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const { validateCourseBundle } = require('../src/content/schema.ts');

const contentDir = join(__dirname, '..', 'content');

function readJson(file, errors) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    errors.push(`${file}: cannot read JSON (${error.message})`);
    return undefined;
  }
}

const courseDirs = readdirSync(contentDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

let failed = false;
let cardCount = 0;
let lessonCount = 0;

for (const dir of courseDirs) {
  const courseFile = join(contentDir, dir, 'course.json');
  if (!existsSync(courseFile)) {
    console.error(`content/${dir}: course.json is missing`);
    failed = true;
    continue;
  }

  const readErrors = [];
  const course = readJson(courseFile, readErrors);

  const lessonsDir = join(contentDir, dir, 'lessons');
  const lessonFiles = existsSync(lessonsDir)
    ? readdirSync(lessonsDir).filter((name) => name.endsWith('.json'))
    : [];
  const lessons = lessonFiles.map((name) => ({
    name: name.replace(/\.json$/, ''),
    data: readJson(join(lessonsDir, name), readErrors),
  }));

  const result = validateCourseBundle(course, lessons);
  const errors = [...readErrors, ...(result.ok ? [] : result.errors)];

  if (errors.length > 0) {
    failed = true;
    console.error(`content/${dir}: ${errors.length} problem(s)`);
    for (const message of errors) {
      console.error(`  - ${message}`);
    }
  } else {
    lessonCount += result.lessons.length;
    cardCount += result.lessons.reduce((sum, lesson) => sum + lesson.cards.length, 0);
    console.log(`content/${dir}: ok (${result.lessons.length} lessons)`);
  }
}

if (failed) {
  process.exit(1);
}
console.log(
  `validate:content – ${courseDirs.length} course(s), ${lessonCount} lesson(s), ${cardCount} card(s) valid.`,
);
