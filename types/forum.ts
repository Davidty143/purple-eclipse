export interface ThreadAuthor {
  account_username: string | null;
  account_email: string | null;
  account_avatar_url?: string | null;
}

export interface ThreadData {
  thread_id: number;
  thread_title: string;
  thread_created: string;
  thread_category: string | null; // Change this from string to string | null
  author: ThreadAuthor;
  comments?: { count: number }[];
}

export interface SubforumData {
  subforum_id: number;
  subforum_name: string | null;
  subforum_description: string | null;
  subforum_icon?: string | null;
  threads: ThreadData[];
}
