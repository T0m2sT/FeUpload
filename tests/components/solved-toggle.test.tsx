import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { SolvedToggle } from '../../components/solved-toggle';
import { darkPalette } from '../../constants/theme';
import { useAppTheme } from '../../hooks/use-app-theme';

jest.mock('../../hooks/use-app-theme');

describe('SolvedToggle', () => {
  beforeEach(() => {
    (useAppTheme as jest.Mock).mockReturnValue(darkPalette);
  });

  it('renders both pills with PT labels', () => {
    const { getByText } = render(<SolvedToggle value="unsolved" onChange={jest.fn()} />);
    expect(getByText('Não resolvido')).toBeDefined();
    expect(getByText('Resolvido')).toBeDefined();
  });

  it('marks the active pill via accessibilityState.selected', () => {
    const { getByLabelText, rerender } = render(
      <SolvedToggle value="unsolved" onChange={jest.fn()} />
    );
    expect(getByLabelText('Ver materiais não resolvidos').props.accessibilityState.selected).toBe(true);
    expect(getByLabelText('Ver materiais resolvidos').props.accessibilityState.selected).toBe(false);

    rerender(<SolvedToggle value="solved" onChange={jest.fn()} />);
    expect(getByLabelText('Ver materiais resolvidos').props.accessibilityState.selected).toBe(true);
    expect(getByLabelText('Ver materiais não resolvidos').props.accessibilityState.selected).toBe(false);
  });

  it('fires onChange with the new value on tap', () => {
    const onChange = jest.fn();
    const { getByLabelText } = render(<SolvedToggle value="unsolved" onChange={onChange} />);
    fireEvent.press(getByLabelText('Ver materiais resolvidos'));
    expect(onChange).toHaveBeenCalledWith('solved');

    onChange.mockClear();
    fireEvent.press(getByLabelText('Ver materiais não resolvidos'));
    expect(onChange).toHaveBeenCalledWith('unsolved');
  });
});
