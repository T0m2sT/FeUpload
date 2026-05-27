import { renderHook, act } from '@testing-library/react-native';
import { useDeleteThreadLogic } from '../utils/thread-delete-test-helper';
import { deleteThread } from '../../services/threads';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

jest.mock('../../services/threads', () => ({
  deleteThread: jest.fn(),
}));
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));
jest.mock('react-native', () => ({
  Alert: { alert: jest.fn() },
}));

describe('useDeleteThreadLogic', () => {
  it('prevents multiple deletions', async () => {
    (deleteThread as jest.Mock).mockReturnValue(new Promise(resolve => setTimeout(resolve, 100)));
    const routerBack = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ back: routerBack });

    const { result } = renderHook(() => useDeleteThreadLogic('t1'));

    // Trigger alert
    act(() => {
      result.current.handleDelete();
    });
    
    // Find alert callback and execute it
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const deleteButton = alertCall[2][1];
    
    await act(async () => {
      deleteButton.onPress();
      deleteButton.onPress(); // Should be ignored
    });

    expect(deleteThread).toHaveBeenCalledTimes(1);
  });
});
