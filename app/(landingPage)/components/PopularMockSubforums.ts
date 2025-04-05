// components/popular-mock-subforums.ts
export interface Thread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
  tag: string;
  createdAt: Date;
}

export interface Subforum {
  id: string;
  name: string;
  description: string;
  threads: Thread[];
}

export const popularMockSubforums: Subforum[] = [
  {
    id: '1',
    name: 'Next.js Help',
    description: 'Get help with Next.js projects',
    threads: [
      {
        id: 't1',
        title: 'How to optimize SSR in Next.js 14',
        author: {
          name: 'Jane Doe',
          avatar: 'https://github.com/janedoe.png'
        },
        tag: 'Help',
        createdAt: new Date('2023-06-10')
      },
      {
        id: 't2',
        title: 'App Router migration guide',
        author: {
          name: 'John Smith',
          avatar: 'https://github.com/johnsmith.png'
        },
        tag: 'Guide',
        createdAt: new Date('2023-06-08')
      },
      {
        id: 't3',
        title: 'Server Actions not working in production',
        author: {
          name: 'Alex Johnson'
        },
        tag: 'Bug',
        createdAt: new Date('2023-06-05')
      },
      {
        id: 't4',
        title: 'Best practices for API routes',
        author: {
          name: 'Sarah Wilson',
          avatar: 'https://github.com/sarahwilson.png'
        },
        tag: 'Discussion',
        createdAt: new Date('2023-06-03')
      },
      {
        id: 't5',
        title: 'Next.js vs Remix in 2023',
        author: {
          name: 'Mike Chen',
          avatar: 'https://github.com/mikechen.png'
        },
        tag: 'Comparison',
        createdAt: new Date('2023-05-30')
      },
      {
        id: 't6',
        title: 'Dynamic OG image generation',
        author: {
          name: 'Emma Davis',
          avatar: 'https://github.com/emmadavis.png'
        },
        tag: 'Feature',
        createdAt: new Date('2023-05-28')
      },
      {
        id: 't7',
        title: 'Middleware redirect issues',
        author: {
          name: 'David Kim'
        },
        tag: 'Help',
        createdAt: new Date('2023-05-25')
      },
      {
        id: 't8',
        title: 'NextAuth.js configuration',
        author: {
          name: 'Lisa Park',
          avatar: 'https://github.com/lisapark.png'
        },
        tag: 'Tutorial',
        createdAt: new Date('2023-05-22')
      },
      {
        id: 't9',
        title: 'ISR not revalidating',
        author: {
          name: 'Robert Taylor'
        },
        tag: 'Bug',
        createdAt: new Date('2023-05-20')
      },
      {
        id: 't10',
        title: 'Portfolio built with Next.js',
        author: {
          name: 'Sophia Lee',
          avatar: 'https://github.com/sophialee.png'
        },
        tag: 'Showcase',
        createdAt: new Date('2023-05-18')
      }
    ]
  },
  {
    id: '2',
    name: 'React Discussions',
    description: 'General React.js conversations',
    threads: [
      {
        id: 't11',
        title: 'React 19 new features',
        author: {
          name: 'Dan Abramov',
          avatar: 'https://github.com/gaearon.png'
        },
        tag: 'News',
        createdAt: new Date('2023-06-09')
      },
      {
        id: 't12',
        title: 'Context API vs Zustand',
        author: {
          name: 'Max Stoiber',
          avatar: 'https://github.com/mxstbr.png'
        },
        tag: 'Comparison',
        createdAt: new Date('2023-06-07')
      },
      {
        id: 't13',
        title: 'React.memo performance tips',
        author: {
          name: 'Sophie Alpert'
        },
        tag: 'Performance',
        createdAt: new Date('2023-06-05')
      },
      {
        id: 't14',
        title: 'Building custom hooks',
        author: {
          name: 'Ryan Florence',
          avatar: 'https://github.com/ryanflorence.png'
        },
        tag: 'Tutorial',
        createdAt: new Date('2023-06-03')
      },
      {
        id: 't15',
        title: 'React Native web compatibility',
        author: {
          name: 'Nicolas Gallagher',
          avatar: 'https://github.com/necolas.png'
        },
        tag: 'React Native',
        createdAt: new Date('2023-05-31')
      },
      {
        id: 't16',
        title: 'Server Components explained',
        author: {
          name: 'Sebastian Markbåge',
          avatar: 'https://github.com/sebmarkbage.png'
        },
        tag: 'Guide',
        createdAt: new Date('2023-05-29')
      },
      {
        id: 't17',
        title: 'React DevTools not working',
        author: {
          name: 'Brian Vaughn'
        },
        tag: 'Debugging',
        createdAt: new Date('2023-05-27')
      },
      {
        id: 't18',
        title: 'React Router v6 examples',
        author: {
          name: 'Michael Jackson',
          avatar: 'https://github.com/mjackson.png'
        },
        tag: 'Examples',
        createdAt: new Date('2023-05-25')
      },
      {
        id: 't19',
        title: 'React 18 Strict Mode issues',
        author: {
          name: 'Andrew Clark'
        },
        tag: 'Help',
        createdAt: new Date('2023-05-23')
      },
      {
        id: 't20',
        title: 'React Conf 2023 highlights',
        author: {
          name: 'Rachel Nabors',
          avatar: 'https://github.com/rachelnabors.png'
        },
        tag: 'Conference',
        createdAt: new Date('2023-05-21')
      }
    ]
  },
  {
    id: '3',
    name: 'TypeScript Help',
    description: 'TypeScript questions and solutions',
    threads: [
      {
        id: 't21',
        title: 'Advanced type utilities',
        author: {
          name: 'Anders Hejlsberg',
          avatar: 'https://github.com/ahejlsberg.png'
        },
        tag: 'Advanced',
        createdAt: new Date('2023-06-07')
      },
      {
        id: 't22',
        title: 'Generics explained simply',
        author: {
          name: 'Orta Therox',
          avatar: 'https://github.com/orta.png'
        },
        tag: 'Beginner',
        createdAt: new Date('2023-06-05')
      },
      {
        id: 't23',
        title: 'TypeScript 5.0 features',
        author: {
          name: 'Daniel Rosenwasser',
          avatar: 'https://github.com/DanielRosenwasser.png'
        },
        tag: 'News',
        createdAt: new Date('2023-06-03')
      },
      {
        id: 't24',
        title: 'Discriminated unions pattern',
        author: {
          name: 'Ryan Cavanaugh'
        },
        tag: 'Patterns',
        createdAt: new Date('2023-06-01')
      },
      {
        id: 't25',
        title: 'Type challenges solutions',
        author: {
          name: 'Anthony Fu',
          avatar: 'https://github.com/antfu.png'
        },
        tag: 'Exercises',
        createdAt: new Date('2023-05-30')
      },
      {
        id: 't26',
        title: 'React + TypeScript cheatsheet',
        author: {
          name: 'Swyx',
          avatar: 'https://github.com/swyx.png'
        },
        tag: 'Cheatsheet',
        createdAt: new Date('2023-05-28')
      },
      {
        id: 't27',
        title: 'Type declaration files guide',
        author: {
          name: 'Basarat Ali Syed',
          avatar: 'https://github.com/basarat.png'
        },
        tag: 'Guide',
        createdAt: new Date('2023-05-26')
      },
      {
        id: 't28',
        title: 'Zod vs TypeBox comparison',
        author: {
          name: 'Colin McDonnell',
          avatar: 'https://github.com/colinhacks.png'
        },
        tag: 'Validation',
        createdAt: new Date('2023-05-24')
      },
      {
        id: 't29',
        title: 'TSConfig options explained',
        author: {
          name: 'Matt Pocock',
          avatar: 'https://github.com/mattpocock.png'
        },
        tag: 'Configuration',
        createdAt: new Date('2023-05-22')
      },
      {
        id: 't30',
        title: 'Type narrowing techniques',
        author: {
          name: 'Titian Cernicova-Dragomir'
        },
        tag: 'Techniques',
        createdAt: new Date('2023-05-20')
      }
    ]
  },
  {
    id: '4',
    name: 'CSS & Design',
    description: 'Styling and UI discussions',
    threads: [
      {
        id: 't31',
        title: 'CSS Container Queries',
        author: {
          name: 'Lea Verou',
          avatar: 'https://github.com/leaverou.png'
        },
        tag: 'CSS',
        createdAt: new Date('2023-06-06')
      },
      {
        id: 't32',
        title: 'Tailwind vs CSS Modules',
        author: {
          name: 'Adam Wathan',
          avatar: 'https://github.com/adamwathan.png'
        },
        tag: 'Comparison',
        createdAt: new Date('2023-06-04')
      },
      {
        id: 't33',
        title: 'CSS Nesting tutorial',
        author: {
          name: 'Miriam Suzanne',
          avatar: 'https://github.com/mirisuzanne.png'
        },
        tag: 'Tutorial',
        createdAt: new Date('2023-06-02')
      },
      {
        id: 't34',
        title: 'Design system implementation',
        author: {
          name: 'Brad Frost',
          avatar: 'https://github.com/bradfrost.png'
        },
        tag: 'Design Systems',
        createdAt: new Date('2023-05-31')
      },
      {
        id: 't35',
        title: 'CSS :has() selector examples',
        author: {
          name: 'Jen Simmons',
          avatar: 'https://github.com/jensimmons.png'
        },
        tag: 'Examples',
        createdAt: new Date('2023-05-29')
      },
      {
        id: 't36',
        title: 'Dark mode implementation',
        author: {
          name: 'Adam Argyle',
          avatar: 'https://github.com/argyleink.png'
        },
        tag: 'Dark Mode',
        createdAt: new Date('2023-05-27')
      },
      {
        id: 't37',
        title: 'CSS Grid layout patterns',
        author: {
          name: 'Rachel Andrew',
          avatar: 'https://github.com/rachelandrew.png'
        },
        tag: 'Grid',
        createdAt: new Date('2023-05-25')
      },
      {
        id: 't38',
        title: 'Accessible color contrast',
        author: {
          name: 'Adrian Roselli'
        },
        tag: 'Accessibility',
        createdAt: new Date('2023-05-23')
      },
      {
        id: 't39',
        title: 'CSS-in-JS performance',
        author: {
          name: 'Kye Hohenberger',
          avatar: 'https://github.com/tkh44.png'
        },
        tag: 'Performance',
        createdAt: new Date('2023-05-21')
      },
      {
        id: 't40',
        title: 'SVG animation techniques',
        author: {
          name: 'Sarah Drasner',
          avatar: 'https://github.com/sdras.png'
        },
        tag: 'Animation',
        createdAt: new Date('2023-05-19')
      }
    ]
  },
  {
    id: '5',
    name: 'Career Advice',
    description: 'Developer career growth',
    threads: [
      {
        id: 't41',
        title: 'Negotiating salary as mid-level dev',
        author: {
          name: 'Emma Bostian',
          avatar: 'https://github.com/emmabostian.png'
        },
        tag: 'Salary',
        createdAt: new Date('2023-06-04')
      },
      {
        id: 't42',
        title: 'Transitioning to tech lead role',
        author: {
          name: 'Camille Fournier',
          avatar: 'https://github.com/skamille.png'
        },
        tag: 'Leadership',
        createdAt: new Date('2023-06-02')
      },
      {
        id: 't43',
        title: 'Building a personal brand',
        author: {
          name: 'Ali Spittel',
          avatar: 'https://github.com/aspittel.png'
        },
        tag: 'Branding',
        createdAt: new Date('2023-05-31')
      },
      {
        id: 't44',
        title: 'Effective remote work habits',
        author: {
          name: 'David Heinemeier Hansson',
          avatar: 'https://github.com/dhh.png'
        },
        tag: 'Remote Work',
        createdAt: new Date('2023-05-29')
      },
      {
        id: 't45',
        title: 'Developer portfolio examples',
        author: {
          name: 'Tania Rascia',
          avatar: 'https://github.com/taniarascia.png'
        },
        tag: 'Portfolio',
        createdAt: new Date('2023-05-27')
      },
      {
        id: 't46',
        title: 'Freelancing vs full-time',
        author: {
          name: 'Philip Walton'
        },
        tag: 'Freelancing',
        createdAt: new Date('2023-05-25')
      },
      {
        id: 't47',
        title: 'Technical interview preparation',
        author: {
          name: 'Gayle McDowell',
          avatar: 'https://github.com/gayle.png'
        },
        tag: 'Interviews',
        createdAt: new Date('2023-05-23')
      },
      {
        id: 't48',
        title: 'Open source contributions guide',
        author: {
          name: 'Kent C. Dodds',
          avatar: 'https://github.com/kentcdodds.png'
        },
        tag: 'Open Source',
        createdAt: new Date('2023-05-21')
      },
      {
        id: 't49',
        title: 'Burnout recovery strategies',
        author: {
          name: 'Emma Wedekind'
        },
        tag: 'Wellbeing',
        createdAt: new Date('2023-05-19')
      },
      {
        id: 't50',
        title: 'Tech conference speaking tips',
        author: {
          name: 'Anjana Vakil',
          avatar: 'https://github.com/vakila.png'
        },
        tag: 'Public Speaking',
        createdAt: new Date('2023-05-17')
      }
    ]
  }
];
