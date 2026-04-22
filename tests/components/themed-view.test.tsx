import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedView } from '../../components/themed-view';
import { useThemeColor } from '../../hooks/use-theme-color';

jest.mock('../../hooks/use-theme-color');

describe('ThemedView', () => {
  beforeEach(() => {
    (useThemeColor as jest.Mock).mockReturnValue('#fff');
  });

  it('renders correctly', () => {
    const { getByTestId } = render(
      <ThemedView testID="view">
        <></>
      </ThemedView>
    );
    const view = getByTestId('view');
    expect(view.props.style).toContainEqual({ backgroundColor: '#fff' });
  });

  it('applies custom styles', () => {
    const { getByTestId } = render(
      <ThemedView testID="view" style={{ marginTop: 10 }}>
        <></>
      </ThemedView>
    );
    const view = getByTestId('view');
    expect(view.props.style).toContainEqual({ marginTop: 10 });
  });
});
