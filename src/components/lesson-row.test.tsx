import { fireEvent, render, screen } from '@testing-library/react-native';

import { LessonRow } from './lesson-row';

describe('LessonRow', () => {
  it('shows a start button for an open lesson and reacts to presses', async () => {
    const onPress = jest.fn();
    await render(<LessonRow title="Die Republik" estMinutes={8} status="open" onPress={onPress} />);
    expect(screen.getByText('Starten')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('offers a repeat for completed lessons', async () => {
    await render(
      <LessonRow title="Die Republik" estMinutes={8} status="completed" onPress={jest.fn()} />,
    );
    expect(screen.getByText('Nochmal')).toBeTruthy();
  });

  it('disables locked lessons and hides the action', async () => {
    const onPress = jest.fn();
    await render(
      <LessonRow title="Die Republik" estMinutes={8} status="locked" onPress={onPress} />,
    );
    expect(screen.queryByText('Starten')).toBeNull();
    expect(screen.getByRole('button', { name: /gesperrt/ })).toBeDisabled();
  });
});
