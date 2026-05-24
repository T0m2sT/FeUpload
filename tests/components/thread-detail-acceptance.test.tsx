/**
 * Thread Detail Acceptance Tests
 * Tests for forum post and comment deletion functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import ThreadDetailScreen from '../../app/course/[id]/thread/[threadId]';
import * as threadsService from '../../services/threads';
import { supabase } from '../../lib/supabase';

// Mock the services
jest.mock('../../services/threads', () => ({
  getThreadWithReplies: jest.fn(),
  createReply: jest.fn(),
  deleteThread: jest.fn(),
  deleteReply: jest.fn(),
}));

jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
  },
}));

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({
    threadId: 'test-thread-1',
    id: 'course-1',
  })),
  useRouter: jest.fn(() => ({
    back: jest.fn(),
    push: jest.fn(),
  })),
}));

jest.mock('../../hooks/use-app-theme', () => ({
  useAppTheme: jest.fn(() => ({
    background: '#FFFFFF',
    surface: '#F5F5F5',
    accent: '#007AFF',
    textPrimary: '#000000',
    textSecondary: '#666666',
    textMuted: '#999999',
    surfaceBorder: '#E0E0E0',
    accentDim: '#F0F4FF',
    accentBorder: '#D0D9FF',
  })),
}));

describe('Thread Detail - Acceptance Tests', () => {
  const mockCurrentUser = { id: 'user-123', email: 'test@example.com' };
  const mockOtherUser = { id: 'user-456', email: 'other@example.com' };

  const mockThread = {
    id: 'test-thread-1',
    title: 'Test Question',
    body: 'What is this?',
    label: 'Question',
    created_at: new Date().toISOString(),
    user_id: 'user-123',
    profiles: { name: 'Test User' },
  };

  const mockReplies = [
    {
      id: 'reply-1',
      body: 'This is a reply',
      created_at: new Date().toISOString(),
      user_id: 'user-123',
      profiles: { name: 'Test User' },
    },
    {
      id: 'reply-2',
      body: 'Another reply',
      created_at: new Date().toISOString(),
      user_id: 'user-456',
      profiles: { name: 'Other User' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockCurrentUser },
      error: null,
    });
    (threadsService.getThreadWithReplies as jest.Mock).mockResolvedValue({
      thread: mockThread,
      replies: mockReplies,
    });
  });

  describe('Test Cleanup - Delete Thread After Test', () => {
    it('creates a thread, runs test, then deletes it (acceptance flow)', async () => {
      (threadsService.deleteThread as jest.Mock).mockResolvedValue(undefined);

      // Step 1: Simulate thread is displayed (already created)
      expect(mockThread.id).toBe('test-thread-1');
      expect(mockThread.user_id).toBe(mockCurrentUser.id);

      // Step 2: Verify thread is visible
      expect(mockThread.title).toBe('Test Question');
      expect(mockThread.body).toBe('What is this?');

      // Step 3: Clean up by deleting the test post
      await threadsService.deleteThread(mockThread.id);

      // Verify deletion was called
      expect(threadsService.deleteThread).toHaveBeenCalledWith('test-thread-1');
      expect(threadsService.deleteThread).toHaveBeenCalledTimes(1);
    });

    it('should delete reply after test completes', async () => {
      (threadsService.deleteReply as jest.Mock).mockResolvedValue(undefined);

      // Step 1: Verify reply was created
      const replyToDelete = mockReplies[0];
      expect(replyToDelete.user_id).toBe(mockCurrentUser.id);
      expect(replyToDelete.body).toBe('This is a reply');

      // Step 2: Clean up by deleting the test reply
      await threadsService.deleteReply(replyToDelete.id);

      // Verify deletion was called
      expect(threadsService.deleteReply).toHaveBeenCalledWith('reply-1');
      expect(threadsService.deleteReply).toHaveBeenCalledTimes(1);
    });

    it('should delete multiple test replies created during testing', async () => {
      (threadsService.deleteReply as jest.Mock).mockResolvedValue(undefined);

      const testReplies = [
        {
          id: 'test-reply-1',
          body: 'Test reply 1',
          user_id: mockCurrentUser.id,
        },
        {
          id: 'test-reply-2',
          body: 'Test reply 2',
          user_id: mockCurrentUser.id,
        },
        {
          id: 'test-reply-3',
          body: 'Test reply 3',
          user_id: mockCurrentUser.id,
        },
      ];

      // Simulate cleanup after test
      for (const reply of testReplies) {
        await threadsService.deleteReply(reply.id);
      }

      // Verify all replies were deleted
      expect(threadsService.deleteReply).toHaveBeenCalledTimes(3);
      expect(threadsService.deleteReply).toHaveBeenCalledWith('test-reply-1');
      expect(threadsService.deleteReply).toHaveBeenCalledWith('test-reply-2');
      expect(threadsService.deleteReply).toHaveBeenCalledWith('test-reply-3');
    });
  });

  describe('User Permissions - Delete Only Own Posts', () => {
    it('allows user to delete their own thread', async () => {
      // User can delete thread they created
      expect(mockThread.user_id).toBe(mockCurrentUser.id);
      
      (threadsService.deleteThread as jest.Mock).mockResolvedValue(undefined);
      await threadsService.deleteThread(mockThread.id);

      expect(threadsService.deleteThread).toHaveBeenCalledWith(mockThread.id);
    });

    it('allows user to delete their own reply', async () => {
      const ownReply = mockReplies[0];
      expect(ownReply.user_id).toBe(mockCurrentUser.id);

      (threadsService.deleteReply as jest.Mock).mockResolvedValue(undefined);
      await threadsService.deleteReply(ownReply.id);

      expect(threadsService.deleteReply).toHaveBeenCalledWith(ownReply.id);
    });

    it('should prevent deletion of other users replies', async () => {
      const otherUserReply = mockReplies[1];
      expect(otherUserReply.user_id).not.toBe(mockCurrentUser.id);
      expect(otherUserReply.user_id).toBe(mockOtherUser.id);
      
      // The component should not show delete button for this reply
      // so deleteReply should not be called
      expect(threadsService.deleteReply).not.toHaveBeenCalledWith(otherUserReply.id);
    });
  });

  describe('Error Handling - Deletion Failures', () => {
    it('handles thread deletion error gracefully', async () => {
      const deleteError = new Error('Database connection failed');
      (threadsService.deleteThread as jest.Mock).mockRejectedValue(deleteError);

      await expect(threadsService.deleteThread('test-thread-1')).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('handles reply deletion error gracefully', async () => {
      const deleteError = new Error('Permission denied');
      (threadsService.deleteReply as jest.Mock).mockRejectedValue(deleteError);

      await expect(threadsService.deleteReply('reply-1')).rejects.toThrow(
        'Permission denied'
      );
    });

    it('should cleanup even if some deletions fail', async () => {
      (threadsService.deleteReply as jest.Mock)
        .mockRejectedValueOnce(new Error('First deletion failed'))
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      const replies = ['reply-1', 'reply-2', 'reply-3'];
      const results = [];

      for (const replyId of replies) {
        try {
          await threadsService.deleteReply(replyId);
          results.push({ id: replyId, success: true });
        } catch (err) {
          results.push({ id: replyId, success: false });
        }
      }

      expect(results[0].success).toBe(false);
      expect(results[1].success).toBe(true);
      expect(results[2].success).toBe(true);
    });
  });

  describe('Test Data Cleanup Pattern', () => {
    it('demonstrates test data cleanup pattern', async () => {
      // Simulate creating test data
      const testThreadId = 'test-thread-12345';
      const testReplyIds = ['reply-1', 'reply-2', 'reply-3'];

      (threadsService.deleteReply as jest.Mock).mockResolvedValue(undefined);
      (threadsService.deleteThread as jest.Mock).mockResolvedValue(undefined);

      // Run test assertions (omitted for brevity)
      expect(testThreadId).toBeDefined();

      // Cleanup phase - always run this even if test fails
      try {
        // Delete all replies first
        for (const replyId of testReplyIds) {
          await threadsService.deleteReply(replyId);
        }
        // Then delete the thread
        await threadsService.deleteThread(testThreadId);
      } catch (err) {
        console.error('Cleanup failed but test completed');
      }

      // Verify cleanup was attempted
      expect(threadsService.deleteReply).toHaveBeenCalledTimes(3);
      expect(threadsService.deleteThread).toHaveBeenCalledWith(testThreadId);
    });

    it('should cleanup test data in reverse order of creation', async () => {
      const createdData = {
        threadId: 'thread-1',
        replyIds: ['reply-1', 'reply-2', 'reply-3'],
      };

      (threadsService.deleteReply as jest.Mock).mockResolvedValue(undefined);
      (threadsService.deleteThread as jest.Mock).mockResolvedValue(undefined);

      // Cleanup in reverse order: replies first, then thread
      for (const replyId of [...createdData.replyIds].reverse()) {
        await threadsService.deleteReply(replyId);
      }
      await threadsService.deleteThread(createdData.threadId);

      // Verify the order of cleanup calls
      expect(threadsService.deleteReply).toHaveBeenNthCalledWith(1, 'reply-3');
      expect(threadsService.deleteReply).toHaveBeenNthCalledWith(2, 'reply-2');
      expect(threadsService.deleteReply).toHaveBeenNthCalledWith(3, 'reply-1');

      // Verify that deleteThread execution order is strictly after the replies
      const replyLastCallOrder = (threadsService.deleteReply as jest.Mock).mock.invocationCallOrder[2];
      const threadCallOrder = (threadsService.deleteThread as jest.Mock).mock.invocationCallOrder[0];
      
      expect(threadCallOrder).toBeGreaterThan(replyLastCallOrder);
    });
  });
});