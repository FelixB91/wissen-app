import { render, screen } from '@testing-library/react-native';

import { PlaceholderScreen } from './placeholder-screen';

describe('PlaceholderScreen', () => {
  it('renders title and text', async () => {
    await render(<PlaceholderScreen title="Lernen" text="Hallo Welt" />);
    expect(screen.getByText('Lernen')).toBeTruthy();
    expect(screen.getByText('Hallo Welt')).toBeTruthy();
  });
});
