import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { HapticTab } from '../../components/haptic-tab';
import * as Haptics from 'expo-haptics';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light' },
}));

describe('HapticTab', () => {
  it('triggers haptic feedback on iOS when pressed', () => {
    const originalEnv = process.env.EXPO_OS;
    process.env.EXPO_OS = 'ios';
    
    const mockOnPressIn = jest.fn();
    const { getByTestId } = render(
      <NavigationContainer>
        <HapticTab onPressIn={mockOnPressIn} testID="tab" />
      </NavigationContainer>
    );

    fireEvent(getByTestId('tab'), 'pressIn');
    expect(Haptics.impactAsync).toHaveBeenCalledWith('Light');
    expect(mockOnPressIn).toHaveBeenCalled();

    process.env.EXPO_OS = originalEnv;
  });
});
