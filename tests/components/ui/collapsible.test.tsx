import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Collapsible } from '../../../components/ui/collapsible';
import { Text } from 'react-native';

jest.mock('@/components/themed-text', () => {
  const { Text } = require('react-native');
  return {
    ThemedText: ({ children }: any) => <Text>{children}</Text>,
  };
});

jest.mock('@/components/themed-view', () => {
  const { View } = require('react-native');
  return {
    ThemedView: ({ children, style }: any) => <View style={style}>{children}</View>,
  };
});

jest.mock('@/components/ui/icon-symbol', () => {
  const { View } = require('react-native');
  return {
    IconSymbol: ({ testID, style }: any) => <View testID={testID || 'icon'} style={style} />,
  };
});

const mockUseColorScheme = jest.fn(() => 'light');
jest.mock('@/hooks/use-color-scheme', () => ({
  useColorScheme: () => mockUseColorScheme(),
}));

describe('Collapsible', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseColorScheme.mockReturnValue('light');
  });

  it('is closed by default and shows only title', () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Click Me">
        <Text>Hidden Content</Text>
      </Collapsible>
    );

    expect(getByText('Click Me')).toBeDefined();
    expect(queryByText('Hidden Content')).toBeNull();
  });

  it('opens content when header is pressed', () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Click Me">
        <Text>Hidden Content</Text>
      </Collapsible>
    );

    fireEvent.press(getByText('Click Me'));
    expect(queryByText('Hidden Content')).not.toBeNull();
  });

  it('closes content when header is pressed again', () => {
    const { getByText, queryByText } = render(
      <Collapsible title="Click Me">
        <Text>Hidden Content</Text>
      </Collapsible>
    );

    fireEvent.press(getByText('Click Me'));
    fireEvent.press(getByText('Click Me'));
    expect(queryByText('Hidden Content')).toBeNull();
  });

  it('renders with dark theme icon color', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { getByTestId } = render(
      <Collapsible title="Dark Mode">
        <Text>Content</Text>
      </Collapsible>
    );

    // Icon is rendered - just verifies the dark branch executes
    expect(getByTestId('icon')).toBeDefined();
  });

  it('renders children when open', () => {
    const { getByText } = render(
      <Collapsible title="Open Me">
        <Text>Child One</Text>
        <Text>Child Two</Text>
      </Collapsible>
    );

    fireEvent.press(getByText('Open Me'));
    expect(getByText('Child One')).toBeDefined();
    expect(getByText('Child Two')).toBeDefined();
  });
});
