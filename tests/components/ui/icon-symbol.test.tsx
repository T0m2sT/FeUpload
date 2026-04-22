import React from 'react';
import { render } from '@testing-library/react-native';
import { IconSymbol } from '../../../components/ui/icon-symbol';

describe('IconSymbol', () => {
  it('renders correctly with testID', () => {
    const { getByTestId } = render(
      <IconSymbol name="house.fill" size={30} color="red" testID="icon" />
    );
    expect(getByTestId('icon')).toBeDefined();
  });

  it('renders without testID', () => {
    // Should render without throwing
    expect(() =>
      render(<IconSymbol name="house.fill" size={24} color="blue" />)
    ).not.toThrow();
  });

  it('renders all mapped icon names without throwing', () => {
    const mappedNames = [
      'house.fill',
      'paperplane.fill',
      'chevron.left.forwardslash.chevron.right',
      'chevron.right',
    ] as const;

    mappedNames.forEach((name) => {
      expect(() =>
        render(<IconSymbol name={name} size={24} color="#000" testID={`icon-${name}`} />)
      ).not.toThrow();
    });
  });

  it('accepts custom size', () => {
    const { getByTestId } = render(
      <IconSymbol name="house.fill" size={48} color="green" testID="sized-icon" />
    );
    expect(getByTestId('sized-icon')).toBeDefined();
  });
});
