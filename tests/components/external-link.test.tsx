import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExternalLink } from '../../components/external-link';
import { openBrowserAsync } from 'expo-web-browser';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
  WebBrowserPresentationStyle: { AUTOMATIC: 0 },
}));

jest.mock('expo-router', () => ({
  Link: ({ children, onPress, href }: any) => {
    const { Text } = require('react-native');
    return <Text onPress={(e: any) => onPress(e)}>{children}</Text>;
  },
}));

describe('ExternalLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens in-app browser on native when pressed', async () => {
    const { getByText } = render(
      <ExternalLink href="https://example.com">Visit</ExternalLink>
    );

    const mockEvent = { preventDefault: jest.fn() };
    await fireEvent.press(getByText('Visit'), mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
    expect(openBrowserAsync).toHaveBeenCalledWith('https://example.com', expect.any(Object));
  });

  it('renders its children', () => {
    const { getByText } = render(
      <ExternalLink href="https://example.com">Click here</ExternalLink>
    );
    expect(getByText('Click here')).toBeDefined();
  });

  it('passes the correct href to the browser', async () => {
    const { getByText } = render(
      <ExternalLink href="https://docs.expo.dev">Docs</ExternalLink>
    );

    const mockEvent = { preventDefault: jest.fn() };
    await fireEvent.press(getByText('Docs'), mockEvent);

    expect(openBrowserAsync).toHaveBeenCalledWith('https://docs.expo.dev', expect.any(Object));
  });

  it('passes WebBrowserPresentationStyle.AUTOMATIC to the browser', async () => {
    const { getByText } = render(
      <ExternalLink href="https://example.com">Link</ExternalLink>
    );

    const mockEvent = { preventDefault: jest.fn() };
    await fireEvent.press(getByText('Link'), mockEvent);

    expect(openBrowserAsync).toHaveBeenCalledWith(
      'https://example.com',
      { presentationStyle: 0 }
    );
  });
});
