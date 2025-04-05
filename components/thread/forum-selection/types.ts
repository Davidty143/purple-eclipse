export interface Forum {
  forum_id: number;
  forum_name: string;
  forum_description: string;
  subforums: SubforumWithCounts[];
}

export interface Subforum {
  subforum_id: number;
  subforum_name: string;
  subforum_description: string;
}

export interface SubforumWithCounts extends Subforum {
  thread_count: number;
  post_count: number;
}

export interface ForumSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (subforumId: number, subforumName: string) => void;
}
