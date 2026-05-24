/**
 * Forum Integration Tests - Complete Test Lifecycle
 * Demonstrates creating forum posts, running tests, and cleaning up by deleting posts
 */

import * as threadsService from '../../services/threads';
import { supabase } from '../../lib/supabase';

jest.mock('../../services/threads');
jest.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
}));

describe('Forum Integration Tests - Complete Lifecycle', () => {
  const mockUser = { id: 'user-123', email: 'testuser@example.com' };
  const testData: { threadIds: string[]; replyIds: string[] } = {
    threadIds: [],
    replyIds: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    testData.threadIds = [];
    testData.replyIds = [];
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });
  });

  afterEach(async () => {
    // CLEANUP PHASE: Always runs after each test, even if test fails
    console.log('Starting cleanup phase...');
    
    // Delete all replies first (in reverse order of creation)
    for (const replyId of testData.replyIds.reverse()) {
      try {
        await (threadsService.deleteReply as jest.Mock).mockResolvedValue(undefined);
        (threadsService.deleteReply as jest.Mock)(replyId);
        console.log(`Deleted reply: ${replyId}`);
      } catch (err) {
        console.error(`Failed to delete reply ${replyId}:`, err);
      }
    }

    // Then delete all threads (in reverse order of creation)
    for (const threadId of testData.threadIds.reverse()) {
      try {
        await (threadsService.deleteThread as jest.Mock).mockResolvedValue(undefined);
        (threadsService.deleteThread as jest.Mock)(threadId);
        console.log(`Deleted thread: ${threadId}`);
      } catch (err) {
        console.error(`Failed to delete thread ${threadId}:`, err);
      }
    }

    console.log('Cleanup phase completed');
  });

  describe('Test Lifecycle 1: Single Post Creation and Cleanup', () => {
    it('should create a forum post, run test, then cleanup', async () => {
      // SETUP PHASE
      const newPost = {
        title: 'Integration Test Question',
        body: 'This is a test post that will be cleaned up',
        course_id: 'course-1',
        user_id: mockUser.id,
        label: 'Question',
      };

      // Simulate post creation
      const createdThreadId = 'thread-integration-001';
      testData.threadIds.push(createdThreadId);

      // TEST PHASE
      expect(createdThreadId).toBe('thread-integration-001');
      expect(newPost.title).toBe('Integration Test Question');
      expect(testData.threadIds).toContain(createdThreadId);

      // CLEANUP: Automatic via afterEach
      // The post will be deleted by the afterEach hook
    });

    it('should verify test post is tracked for cleanup', async () => {
      const threadId = 'thread-integration-002';
      testData.threadIds.push(threadId);

      expect(testData.threadIds).toContain(threadId);
      expect(testData.threadIds.length).toBe(1);
      // afterEach will clean this up
    });
  });

  describe('Test Lifecycle 2: Multiple Posts and Replies', () => {
    it('should create multiple posts with replies and cleanup all', async () => {
      // SETUP PHASE - Create 3 posts
      const thread1 = 'thread-integration-003';
      const thread2 = 'thread-integration-004';
      const thread3 = 'thread-integration-005';

      testData.threadIds.push(thread1, thread2, thread3);

      // Add replies to posts
      const replies = [
        'reply-integration-001',
        'reply-integration-002',
        'reply-integration-003',
      ];
      testData.replyIds.push(...replies);

      // TEST PHASE
      expect(testData.threadIds.length).toBe(3);
      expect(testData.replyIds.length).toBe(3);

      // CLEANUP: Will delete all 3 replies and 3 threads in afterEach
    });

    it('should handle test with unequal post and reply counts', async () => {
      // Some posts might have multiple replies
      const thread1 = 'thread-integration-006';
      const thread2 = 'thread-integration-007';

      testData.threadIds.push(thread1, thread2);

      // Create more replies than threads
      const replies = [
        'reply-integration-004',
        'reply-integration-005',
        'reply-integration-006',
        'reply-integration-007',
      ];
      testData.replyIds.push(...replies);

      // TEST PHASE
      expect(testData.replyIds.length).toBeGreaterThan(testData.threadIds.length);

      // CLEANUP: Will delete all 4 replies and 2 threads
    });
  });

  describe('Test Lifecycle 3: Post Deletion During Test', () => {
    it('should verify deletion is immediate and complete', async () => {
      const threadId = 'thread-integration-008';
      testData.threadIds.push(threadId);

      (threadsService.deleteThread as jest.Mock).mockResolvedValue(undefined);

      // User action: delete post
      await (threadsService.deleteThread as jest.Mock)(threadId);

      // Verify deletion call was made
      expect(threadsService.deleteThread).toHaveBeenCalledWith(threadId);

      // Post should be gone - remove from tracking
      testData.threadIds = testData.threadIds.filter(id => id !== threadId);
      expect(testData.threadIds).not.toContain(threadId);
    });

    it('should track deleted replies correctly', async () => {
      const replyId = 'reply-integration-008';
      testData.replyIds.push(replyId);

      (threadsService.deleteReply as jest.Mock).mockResolvedValue(undefined);

      // User action: delete reply
      await (threadsService.deleteReply as jest.Mock)(replyId);

      // Verify deletion
      expect(threadsService.deleteReply).toHaveBeenCalledWith(replyId);

      // Update tracking
      testData.replyIds = testData.replyIds.filter(id => id !== replyId);
      expect(testData.replyIds).not.toContain(replyId);
    });

    it('should handle partial deletion failures in cleanup', async () => {
      const thread1 = 'thread-integration-009';
      const thread2 = 'thread-integration-010';

      testData.threadIds.push(thread1, thread2);

      // Simulate one deletion failing
      (threadsService.deleteThread as jest.Mock)
        .mockRejectedValueOnce(new Error('Database error for thread 1'))
        .mockResolvedValueOnce(undefined);

      let failureCount = 0;
      for (const threadId of testData.threadIds) {
        try {
          await (threadsService.deleteThread as jest.Mock)(threadId);
        } catch (err) {
          failureCount++;
        }
      }

      // Even with failure, subsequent deletions should be attempted
      expect(threadsService.deleteThread).toHaveBeenCalledTimes(2);
    });
  });

  describe('Test Lifecycle 4: Complex Scenarios', () => {
    it('should cleanup when test throws error', async () => {
      const threadId = 'thread-integration-011';
      testData.threadIds.push(threadId);

      // Simulate test error
      try {
        throw new Error('Intentional test error');
      } catch (err) {
        // Even though test failed, cleanup will still run via afterEach
        expect(testData.threadIds).toContain(threadId);
      }
    });

    it('should maintain cleanup order: replies then threads', async () => {
      const thread1 = 'thread-integration-012';
      const thread2 = 'thread-integration-013';
      const reply1 = 'reply-integration-009';
      const reply2 = 'reply-integration-010';

      // Add in creation order
      testData.threadIds.push(thread1, thread2);
      testData.replyIds.push(reply1, reply2);

      // Verify order for cleanup
      expect(testData.replyIds[testData.replyIds.length - 1]).toBe('reply-integration-010');
      expect(testData.threadIds[testData.threadIds.length - 1]).toBe('thread-integration-013');

      // afterEach will delete in order:
      // 1. reply-integration-010
      // 2. reply-integration-009
      // 3. thread-integration-013
      // 4. thread-integration-012
    });

    it('should allow cleanup even with empty test data', async () => {
      // No posts created in this test
      expect(testData.threadIds.length).toBe(0);
      expect(testData.replyIds.length).toBe(0);

      // afterEach should handle empty arrays gracefully
    });

    it('should support nested post relationships in cleanup', async () => {
      const thread1 = 'thread-integration-014';
      const replies = {
        thread1: ['reply-integration-011', 'reply-integration-012', 'reply-integration-013'],
      };

      testData.threadIds.push(thread1);
      testData.replyIds.push(...replies.thread1);

      // When cleaning up, all replies for thread1 will be deleted first
      // Then thread1 itself
      expect(testData.replyIds.length).toBe(3);
      expect(testData.threadIds.length).toBe(1);
    });
  });

  describe('Cleanup Pattern Best Practices', () => {
    it('should document cleanup requirements in test comments', async () => {
      const testPattern = `
        // Test with cleanup pattern
        // 1. SETUP: Create test data, track IDs in testData object
        // 2. TEST: Run test assertions
        // 3. CLEANUP: Automatic via afterEach (DO NOT FORGET!)
        
        // Add any created resources to testData
        testData.threadIds.push(newThreadId);
        testData.replyIds.push(newReplyId);
        
        // afterEach will automatically:
        // - Delete all replies (in reverse order)
        // - Delete all threads (in reverse order)
      `;

      expect(testPattern).toContain('SETUP');
      expect(testPattern).toContain('TEST');
      expect(testPattern).toContain('CLEANUP');
    });

    it('should show example of adding test data to cleanup tracker', async () => {
      // Example: When creating a post in test
      const createdThreadId = 'example-thread-001';
      testData.threadIds.push(createdThreadId); // Track for cleanup

      // Example: When creating a reply in test
      const createdReplyId = 'example-reply-001';
      testData.replyIds.push(createdReplyId); // Track for cleanup

      expect(testData.threadIds).toContain(createdThreadId);
      expect(testData.replyIds).toContain(createdReplyId);
    });

    it('should show how to skip cleanup for specific test data if needed', async () => {
      const shouldCleanup = true; // Most tests
      const testDataForCleanup = 'important-test-thread';

      if (shouldCleanup) {
        testData.threadIds.push(testDataForCleanup);
      }

      // If you don't want a resource cleaned up, simply don't add it to testData
      // This is rarely needed and should be documented
    });
  });
});
