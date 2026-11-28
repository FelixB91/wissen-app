import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import type { Card, Lesson } from '@/content/schema';

import { LessonPlayer } from './lesson-player';

const source = {
  title: 'Testquelle – Wikipedia',
  url: 'https://de.wikipedia.org/wiki/Test',
  kind: 'wikipedia' as const,
};
const common = { concepts: ['c'], sources: [source], review_status: 'draft' as const };

const cards: Card[] = [
  { ...common, id: 'k1', type: 'explain', depth: 'hook', title: 'Aufhänger', body: 'Hook-Text' },
  {
    ...common,
    id: 'k2',
    type: 'explain',
    depth: 'core',
    title: 'Kernwissen',
    body: 'Kern-Text',
    remember: 'Merksatz',
  },
  {
    ...common,
    id: 'k3',
    type: 'multiple_choice',
    depth: 'core',
    prompt: 'Frage eins?',
    options: ['Falsch A', 'Richtig B'],
    answer: 1,
    explanation: 'Darum B.',
  },
  {
    ...common,
    id: 'k4',
    type: 'true_false',
    depth: 'core',
    prompt: 'Aussage zwei.',
    answer: false,
    explanation: 'Darum falsch.',
  },
  {
    ...common,
    id: 'k5',
    type: 'fill_blank',
    depth: 'core',
    prompt: 'Der Himmel ist ___.',
    options: ['blau', 'grün'],
    answer: 0,
    explanation: 'Wegen der Streuung.',
  },
  {
    ...common,
    id: 'k6',
    type: 'explain',
    depth: 'deep',
    title: 'Mehr erfahren: Details',
    body: 'Detail-Text',
  },
];

const lesson: Lesson = { id: 'test-lektion', title: 'Testlektion', est_minutes: 5, cards };

const press = (name: string | RegExp) => fireEvent.press(screen.getByRole('button', { name }));

describe('LessonPlayer', () => {
  it('plays a lesson from hook to summary', async () => {
    const onComplete = jest.fn();
    const onExit = jest.fn();
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    await render(<LessonPlayer lesson={lesson} onComplete={onComplete} onExit={onExit} />);

    // Hook and core explanation (the deep card is not part of the flow)
    expect(screen.getByText('Hook-Text')).toBeTruthy();
    expect(screen.getByText('1/5')).toBeTruthy();
    await press('Weiter');
    expect(screen.getByText('Kern-Text')).toBeTruthy();
    expect(screen.getByText(/Merksatz/)).toBeTruthy();
    await press('Weiter');

    // Multiple choice: "Prüfen" needs an answer first, then a wrong answer gets explained
    expect(screen.getByRole('button', { name: 'Prüfen' })).toBeDisabled();
    await press('Falsch A');
    await press('Prüfen');
    expect(screen.getByText('✗ Nicht ganz')).toBeTruthy();
    expect(screen.getByText('Richtig wäre: Richtig B')).toBeTruthy();
    expect(screen.getByText(/Darum B\./)).toBeTruthy();
    await fireEvent.press(screen.getByRole('link', { name: /Testquelle/ }));
    expect(openURL).toHaveBeenCalledWith(source.url);
    await press('Weiter');

    // True/false answered correctly
    await press('Falsch');
    await press('Prüfen');
    expect(screen.getByText('✓ Richtig')).toBeTruthy();
    expect(screen.getByText(/Darum falsch\./)).toBeTruthy();
    await press('Weiter');

    // Fill blank shows the chosen option in the sentence
    await press('blau');
    expect(screen.getByText('Der Himmel ist blau.')).toBeTruthy();
    await press('Prüfen');
    expect(onComplete).not.toHaveBeenCalled();
    await press('Weiter');

    // Summary
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Testlektion')).toBeTruthy();
    expect(screen.getByText('2 von 3 Fragen richtig beantwortet.')).toBeTruthy();
    expect(screen.queryByText('Detail-Text')).toBeNull();
    await press(/Mehr erfahren: Details/);
    expect(screen.getByText('Detail-Text')).toBeTruthy();
    expect(screen.getByText('Weiterlesen')).toBeTruthy();
    expect(screen.getAllByRole('link')).toHaveLength(1);

    await press('Fertig');
    expect(onExit).toHaveBeenCalledTimes(1);
    openURL.mockRestore();
  });

  it('lets the user leave at any time', async () => {
    const onExit = jest.fn();
    await render(<LessonPlayer lesson={lesson} onComplete={jest.fn()} onExit={onExit} />);
    await press('Lektion beenden');
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});
