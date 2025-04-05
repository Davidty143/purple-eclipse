// ./components/MockThreads.ts
import { Thread } from './SubforumThreadRow';

export const mockThreads: Thread[] = [
  {
    id: '1',
    title: 'How to use ShadCN components in Next.js',
    author: {
      name: 'John Doe',
      avatar: 'https://github.com/shadcn.png'
    },
    tag: 'Help',
    createdAt: new Date('2025-03-10'),
    replies: 14,
    views: 256,
    lastComment: {
      author: {
        name: 'Benjie Saqin',
        avatar: 'https://github.com/benjie.png'
      },
      createdAt: new Date('2025-03-11T02:11:00')
    }
  },
  {
    id: '2',
    title: 'Best practices for forum UI design',
    author: {
      name: 'Alice Johnson',
      avatar: 'https://github.com/alice.png'
    },
    tag: 'Design',
    createdAt: new Date('2025-03-09'),
    replies: 8,
    views: 142,
    lastComment: {
      author: {
        name: 'Mark Taylor',
        avatar: 'https://github.com/mark.png'
      },
      createdAt: new Date('2025-03-10T14:30:00')
    }
  },
  {
    id: '3',
    title: 'Introduction to Next.js 14',
    author: {
      name: 'Sam Wilson',
      avatar: 'https://github.com/vercel.png'
    },
    tag: 'Tutorial',
    createdAt: new Date('2025-03-08'),
    replies: 23,
    views: 512,
    lastComment: {
      author: {
        name: 'Taylor Swift',
        avatar: 'https://github.com/taylor.png'
      },
      createdAt: new Date('2025-03-09T15:30:00')
    }
  },
  {
    id: '4',
    title: 'State management in React - 2025 update',
    author: {
      name: 'Emma Davis',
      avatar: 'https://github.com/emma.png'
    },
    tag: 'Discussion',
    createdAt: new Date('2025-03-07'),
    replies: 42,
    views: 1024,
    lastComment: {
      author: {
        name: 'Chris Wong',
        avatar: 'https://github.com/chris.png'
      },
      createdAt: new Date('2025-03-08T10:45:00')
    }
  },
  {
    id: '5',
    title: 'Getting started with TypeScript',
    author: {
      name: 'Mike Chen',
      avatar: 'https://github.com/mike.png'
    },
    tag: 'Tutorial',
    createdAt: new Date('2025-03-05'),
    replies: 5,
    views: 89,
    lastComment: {
      author: {
        name: 'Sarah Miller',
        avatar: 'https://github.com/sarah.png'
      },
      createdAt: new Date('2025-03-06T09:15:00')
    }
  },
  {
    id: '6',
    title: 'CSS Grid vs Flexbox - when to use which?',
    author: {
      name: 'Lisa Park',
      avatar: 'https://github.com/lisa.png'
    },
    tag: 'CSS',
    createdAt: new Date('2025-03-04'),
    replies: 31,
    views: 678,
    lastComment: {
      author: {
        name: 'David Kim',
        avatar: 'https://github.com/david.png'
      },
      createdAt: new Date('2025-03-05T14:20:00')
    }
  },
  {
    id: '7',
    title: 'Database optimization techniques',
    author: {
      name: 'Robert Taylor',
      avatar: 'https://github.com/robert.png'
    },
    tag: 'Database',
    createdAt: new Date('2025-03-03'),
    replies: 12,
    views: 345,
    lastComment: {
      author: {
        name: 'Jennifer Lopez',
        avatar: 'https://github.com/jennifer.png'
      },
      createdAt: new Date('2025-03-04T11:30:00')
    }
  },
  {
    id: '8',
    title: 'Showcase: My new portfolio built with Next.js',
    author: {
      name: 'Sophia Lee',
      avatar: 'https://github.com/sophia.png'
    },
    tag: 'Showcase',
    createdAt: new Date('2025-03-02'),
    replies: 27,
    views: 589,
    lastComment: {
      author: {
        name: 'Alex Johnson',
        avatar: 'https://github.com/alex.png'
      },
      createdAt: new Date('2025-03-03T18:30:00')
    }
  },
  {
    id: '9',
    title: 'Career advice for junior developers',
    author: {
      name: 'James Wilson',
      avatar: 'https://github.com/james.png'
    },
    tag: 'Career',
    createdAt: new Date('2025-03-01'),
    replies: 56,
    views: 1245,
    lastComment: {
      author: {
        name: 'Olivia Brown',
        avatar: 'https://github.com/olivia.png'
      },
      createdAt: new Date('2025-03-02T11:10:00')
    }
  },
  {
    id: '10',
    title: 'Upcoming JavaScript features to watch for',
    author: {
      name: 'Daniel Smith',
      avatar: 'https://github.com/daniel.png'
    },
    tag: 'JavaScript',
    createdAt: new Date('2025-02-28'),
    replies: 19,
    views: 432,
    lastComment: {
      author: {
        name: 'Grace Wilson',
        avatar: 'https://github.com/grace.png'
      },
      createdAt: new Date('2025-03-01T16:45:00')
    }
  }
];
