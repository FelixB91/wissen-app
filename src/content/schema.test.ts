import { cardSchema, lessonSchema, validateCourseBundle } from './schema';

const source = {
  title: 'Römische Republik – Wikipedia',
  url: 'https://de.wikipedia.org/wiki/R%C3%B6mische_Republik',
  kind: 'wikipedia',
};

const base = {
  depth: 'core',
  concepts: ['rom-republik'],
  sources: [source],
  review_status: 'draft',
};

const explainCard = {
  ...base,
  id: 'rom-republik-001',
  type: 'explain',
  title: 'Die Römische Republik',
  body: '509 v. Chr. vertrieben die Römer ihren König.',
  remember: 'Machtteilung statt Alleinherrschaft',
};

const multipleChoice = {
  ...base,
  id: 'rom-republik-002',
  type: 'multiple_choice',
  prompt: 'Welche Staatsform löste das Königtum ab?',
  options: ['Republik', 'Kaiserreich', 'Tyrannis'],
  answer: 0,
  explanation: 'Zwei jährlich gewählte Konsuln teilten sich die Macht.',
};

const trueFalse = {
  ...base,
  id: 'rom-republik-003',
  type: 'true_false',
  prompt: 'Die Konsuln regierten auf Lebenszeit.',
  answer: false,
  explanation: 'Konsuln wurden jeweils nur für ein Jahr gewählt.',
};

const fillBlank = {
  ...base,
  id: 'rom-republik-004',
  type: 'fill_blank',
  prompt: 'Rom wurde von zwei ___ regiert.',
  options: ['Konsuln', 'Königen'],
  answer: 0,
  explanation: 'Die beiden Konsuln kontrollierten sich gegenseitig.',
};

const lesson = {
  id: 'die-republik',
  title: 'Die Republik',
  est_minutes: 6,
  cards: [explainCard, multipleChoice, trueFalse, fillBlank],
};

const course = {
  id: 'antike',
  title: 'Antike',
  level: 'beginner',
  domain: { id: 'geschichte', title: 'Geschichte' },
  units: [{ id: 'roemisches-reich', title: 'Römisches Reich', lessons: ['die-republik'] }],
  concepts: [{ id: 'rom-republik', title: 'Römische Republik', summary: 'Staatsform Roms.' }],
};

describe('cardSchema', () => {
  it.each([explainCard, multipleChoice, trueFalse, fillBlank])('accepts a valid card', (card) => {
    expect(cardSchema.safeParse(card).success).toBe(true);
  });

  it('rejects a card without sources', () => {
    expect(cardSchema.safeParse({ ...multipleChoice, sources: [] }).success).toBe(false);
  });

  it('rejects a card without depth', () => {
    const { depth: _depth, ...withoutDepth } = multipleChoice;
    expect(cardSchema.safeParse(withoutDepth).success).toBe(false);
  });

  it('rejects an unknown depth', () => {
    expect(cardSchema.safeParse({ ...multipleChoice, depth: 'expert' }).success).toBe(false);
  });

  it('rejects non-https sources', () => {
    const http = { ...source, url: 'http://de.wikipedia.org/wiki/Rom' };
    expect(cardSchema.safeParse({ ...multipleChoice, sources: [http] }).success).toBe(false);
  });

  it('rejects an answer index outside the options', () => {
    expect(cardSchema.safeParse({ ...multipleChoice, answer: 3 }).success).toBe(false);
  });

  it('rejects duplicate options', () => {
    const duplicate = { ...multipleChoice, options: ['Republik', 'Republik'] };
    expect(cardSchema.safeParse(duplicate).success).toBe(false);
  });

  it('requires exactly one blank marker in fill_blank prompts', () => {
    expect(cardSchema.safeParse({ ...fillBlank, prompt: 'Kein Platzhalter' }).success).toBe(false);
    expect(cardSchema.safeParse({ ...fillBlank, prompt: '___ und ___' }).success).toBe(false);
  });

  it('rejects unknown fields (typos)', () => {
    expect(cardSchema.safeParse({ ...trueFalse, explaination: 'x' }).success).toBe(false);
  });

  it('rejects an unknown card type', () => {
    expect(cardSchema.safeParse({ ...trueFalse, type: 'ordering' }).success).toBe(false);
  });
});

describe('lessonSchema', () => {
  it('accepts a valid lesson', () => {
    expect(lessonSchema.safeParse(lesson).success).toBe(true);
  });

  it('rejects duplicate card ids', () => {
    const duplicate = { ...lesson, cards: [explainCard, { ...trueFalse, id: explainCard.id }] };
    expect(lessonSchema.safeParse(duplicate).success).toBe(false);
  });

  it('requires at least one core card', () => {
    const hookOnly = { ...lesson, cards: [{ ...explainCard, depth: 'hook' }] };
    expect(lessonSchema.safeParse(hookOnly).success).toBe(false);
  });

  it('allows at most three distinct concepts', () => {
    const cards = ['a', 'b', 'c', 'd'].map((concept, index) => ({
      ...trueFalse,
      id: `card-${index}`,
      concepts: [`concept-${concept}`],
    }));
    expect(lessonSchema.safeParse({ ...lesson, cards }).success).toBe(false);
    expect(lessonSchema.safeParse({ ...lesson, cards: cards.slice(0, 3) }).success).toBe(true);
  });
});

describe('validateCourseBundle', () => {
  const files = [{ name: 'die-republik', data: lesson }];

  it('accepts a consistent course', () => {
    const result = validateCourseBundle(course, files);
    expect(result.ok).toBe(true);
  });

  it('reports a lesson listed in a unit but missing as file', () => {
    const result = validateCourseBundle(course, []);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join('\n')).toContain('has no valid file');
    }
  });

  it('reports a lesson file that no unit lists', () => {
    const extra = { name: 'punische-kriege', data: { ...lesson, id: 'punische-kriege' } };
    const result = validateCourseBundle(course, [...files, extra]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join('\n')).toContain('not listed in any unit');
    }
  });

  it('reports a file name that differs from the lesson id', () => {
    const result = validateCourseBundle(course, [{ name: 'andere-datei', data: lesson }]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join('\n')).toContain('must equal the file name');
    }
  });

  it('reports unknown concepts on cards', () => {
    const unknown = { ...lesson, cards: [{ ...explainCard, concepts: ['gibt-es-nicht'] }] };
    const result = validateCourseBundle(course, [{ name: 'die-republik', data: unknown }]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.join('\n')).toContain('unknown concept "gibt-es-nicht"');
    }
  });

  it('reports unknown and self-referencing prerequisites', () => {
    const concepts = [
      { id: 'rom-republik', title: 'A', summary: 'a', requires: ['rom-republik', 'fehlt'] },
    ];
    const result = validateCourseBundle({ ...course, concepts }, files);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      const text = result.errors.join('\n');
      expect(text).toContain('must not require itself');
      expect(text).toContain('unknown prerequisite "fehlt"');
    }
  });

  it('reports schema errors with their location', () => {
    const result = validateCourseBundle({ ...course, level: 'expert' }, files);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors[0]).toMatch(/^course\.level:/);
    }
  });
});
