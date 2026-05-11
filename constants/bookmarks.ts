export type BookmarkCollection = {
  id: string;
  name: string;
  color: string;
  description?: string;
  item_count: number;
  created_at?: string; // Optional because we often compute this on the fly
};

export type CollectionItem = {
  id: string;
  materials: {
    id: string;
    title: string;
    type: 'exam' | 'exercise' | 'summary' | 'notes';
    file_url?: string;
    courses: {
      code: string;
      name: string;
    };
    reviews?: Array<{ rating: number }>;
  };
  added_at: string;
};

/**
 * Standard palette for bookmark colors used throughout the app.
 */
export const BOOKMARK_COLORS = [
  '#FF6B6B', // Coral Red
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky Blue
  '#96CEB4', // Sage Green
  '#FFEAA7', // Pastel Yellow
  '#DDA15E', // Earthy Orange
  '#BC6C25', // Bronze
  '#A8DADC', // Light Blue
  '#457B9D', // Steel Blue
  '#E63946', // Crimson
];

/**
 * Fallback empty state for collections
 */
export const EMPTY_COLLECTION: BookmarkCollection = {
  id: 'none',
  name: 'Geral',
  color: '#CCCCCC',
  item_count: 0,
};
