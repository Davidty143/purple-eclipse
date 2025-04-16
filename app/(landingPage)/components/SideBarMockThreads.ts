// components/sidebar-mock-threads.ts
export interface SidebarThread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar?: string;
  };
}

export const sidebarMockThreads: SidebarThread[] = [
  {
    id: 's1',
    title: 'Next.js 15 beta features released today',
    author: {
      name: 'Tim Neutkens',
      avatar: 'https://github.com/timneutkens.png'
    }
  },
  {
    id: 's2',
    title: 'React Server Components deep dive',
    author: {
      name: 'Dan Abramov',
      avatar: 'https://github.com/gaearon.png'
    }
  },
  {
    id: 's3',
    title: 'My AI-powered developer tools',
    author: {
      name: 'Swyx',
      avatar: 'https://github.com/sw-yx.png'
    }
  },
  {
    id: 's4',
    title: 'TypeScript 5.5 beta features',
    author: {
      name: 'Anders Hejlsberg',
      avatar: 'https://github.com/ahejlsberg.png'
    }
  },
  {
    id: 's5',
    title: 'Web performance in 2025',
    author: {
      name: 'Addy Osmani',
      avatar: 'https://github.com/addyosmani.png'
    }
  },
  {
    id: 's6',
    title: 'State of CSS 2025 survey results',
    author: {
      name: 'Lea Verou',
      avatar: 'https://github.com/leaverou.png'
    }
  },
  {
    id: 's7',
    title: 'Building accessible components',
    author: {
      name: 'Marcy Sutton',
      avatar: 'https://github.com/marcysutton.png'
    }
  },
  {
    id: 's8',
    title: 'Rust for frontend developers',
    author: {
      name: 'Steve Klabnik',
      avatar: 'https://github.com/steveklabnik.png'
    }
  },
  {
    id: 's9',
    title: 'My journey learning Three.js',
    author: {
      name: 'Bruno Simon',
      avatar: 'https://github.com/brunosimon.png'
    }
  },
  {
    id: 's10',
    title: 'CSS nesting best practices',
    author: {
      name: 'Adam Argyle',
      avatar: 'https://github.com/argyleink.png'
    }
  },
  {
    id: 's11',
    title: 'The future of state management in React',
    author: {
      name: 'Michel Weststrate',
      avatar: 'https://github.com/mweststrate.png'
    }
  },
  {
    id: 's12',
    title: 'Building microfrontends with Next.js',
    author: {
      name: 'Zack Jackson',
      avatar: 'https://github.com/ScriptedAlchemy.png'
    }
  },
  {
    id: 's13',
    title: 'Advanced TypeScript patterns',
    author: {
      name: 'Matt Pocock',
      avatar: 'https://github.com/mattpocock.png'
    }
  },
  {
    id: 's14',
    title: 'WebAssembly for frontend developers',
    author: {
      name: 'Lin Clark',
      avatar: 'https://github.com/linclark.png'
    }
  },
  {
    id: 's15',
    title: 'Design systems in 2025',
    author: {
      name: 'Brad Frost',
      avatar: 'https://github.com/bradfrost.png'
    }
  }
];
