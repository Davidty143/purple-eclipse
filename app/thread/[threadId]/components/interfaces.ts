export interface Comment {
  comment_id: number;
  comment_content: string;
  comment_created: string;
  comment_deleted: boolean;
  parent_comment_id?: number | null;
  author: {
    account_username: string;
    account_email: string;
    avatar_url?: string | null;
  };
  replies?: Comment[];
}

export interface ThreadImage {
  thread_image_id: number;
  image_url: string;
  storage_path: string;
  created_at: string;
}

export interface Thread {
  thread_id: number;
  thread_title: string;
  thread_content: string;
  thread_created: string;
  thread_deleted: boolean;
  author: {
    account_username: string;
    account_email: string;
    avatar_url?: string | null;
  };
  subforum: {
    subforum_name: string;
    subforum_id: number;
    forum: {
      forum_name: string;
    };
  };
  comments: Comment[];
  images: ThreadImage[];
}

export interface ThreadViewProps {
  thread: Thread;
}
