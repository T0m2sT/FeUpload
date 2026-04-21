import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../../components/themed-text';
import { useThemeColor } from '../../hooks/use-theme-color';

jest.mock('../../hooks/use-theme-color');

describe('ThemedText', () => {
  beforeEach(() => {
    (useThemeColor as jest.Mock).mockReturnValue('#000');
  });

  it('renders correctly with default type', () => {
    const { getByText } = render(<ThemedText>Hello</ThemedText>);
    const text = getByText('Hello');
    expect(text).toBeDefined();
    expect(text.props.style).toContainEqual({ color: '#000' });
  });

  it('applies default font styles', () => {
    const { getByText } = render(<ThemedText>Default</ThemedText>);
    expect(getByText('Default').props.style).toContainEqual({ fontSize: 16, lineHeight: 24 });
  });

  it('applies title styles when type is title', () => {
    const { getByText } = render(<ThemedText type="title">Title</ThemedText>);
    expect(getByText('Title').props.style).toContainEqual({ fontSize: 32, fontWeight: 'bold', lineHeight: 32 });
  });

  it('applies defaultSemiBold styles when type is defaultSemiBold', () => {
    const { getByText } = render(<ThemedText type="defaultSemiBold">SemiBold</ThemedText>);
    expect(getByText('SemiBold').props.style).toContainEqual({ fontSize: 16, lineHeight: 24, fontWeight: '600' });
  });

  it('applies subtitle styles when type is subtitle', () => {
    const { getByText } = render(<ThemedText type="subtitle">Subtitle</ThemedText>);
    expect(getByText('Subtitle').props.style).toContainEqual({ fontSize: 20, fontWeight: 'bold' });
  });

  it('applies link styles when type is link', () => {
    const { getByText } = render(<ThemedText type="link">Link</ThemedText>);
    expect(getByText('Link').props.style).toContainEqual({ lineHeight: 30, fontSize: 16, color: '#0a7ea4' });
  });

  it('passes other props to the Text component', () => {
    const { getByText } = render(<ThemedText numberOfLines={2}>Multi line</ThemedText>);
    expect(getByText('Multi line').props.numberOfLines).toBe(2);
  });

  it('passes custom lightColor and darkColor to useThemeColor', () => {
    render(<ThemedText lightColor="white" darkColor="black">Colored</ThemedText>);
    expect(useThemeColor).toHaveBeenCalledWith({ light: 'white', dark: 'black' }, 'text');
  });

  it('merges custom style with generated styles', () => {
    const { getByText } = render(
      <ThemedText style={{ marginTop: 8 }}>Styled</ThemedText>
    );
    expect(getByText('Styled').props.style).toContainEqual({ marginTop: 8 });
  });
});
