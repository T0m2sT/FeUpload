export type Material = {
  id: string;
  title: string;
  type: 'exam' | 'exercise' | 'summary' | 'notes';
  subtitle?: string;
  rating?: number;
  ratingCount?: number;
  pdf?: string;
  pdf_solved?: string;
  is_solved?: boolean;
  created_at?: string;
  class_code?: string;
};

export type ThreadReply = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

export type Thread = {
  id: string;
  title: string;
  author: string;
  body: string;
  createdAt: string;
  replyCount: number;
  replies: ThreadReply[];
};

export type Course = {
  id: string;
  name: string;
  code: string;
  materials: Material[];
  threads: Thread[];
};
