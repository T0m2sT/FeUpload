import React from 'react';
import { render } from '@testing-library/react-native';
import ParallaxScrollView from '../../components/parallax-scroll-view';
import { Text, View } from 'react-native';

// Mock Animated and Reanimated
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const View = ({ children, style }: any) => React.createElement('View', { style }, children);
  const ScrollView = ({ children, style }: any) => React.createElement('ScrollView', { style }, children);
  return {
    __esModule: true,
    default: {
      ScrollView,
      View,
    },
    useAnimatedRef: jest.fn(() => ({ current: null })),
    useAnimatedStyle: jest.fn(() => ({})),
    useScrollOffset: jest.fn(() => ({ value: 0 })),
    interpolate: jest.fn(),
  };
});

describe('ParallaxScrollView', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <ParallaxScrollView headerImage={<Text>Header</Text>} headerBackgroundColor={{ light: 'white', dark: 'black' }}>
        <Text>Content</Text>
      </ParallaxScrollView>
    );

    expect(getByText('Header')).toBeDefined();
    expect(getByText('Content')).toBeDefined();
  });
});
