//next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@radix-ui/react-dropdown-menu', '@radix-ui/react-label', '@radix-ui/react-menubar', '@radix-ui/react-navigation-menu', '@radix-ui/react-slot', '@radix-ui/themes', '@shadcn/ui', '@supabase/ssr', '@supabase/supabase-js', 'lucide-react', 'react-icons']
  },
  images: {
    domains: ['rzwvyxkjdwrezfeyrtbg.supabase.co']
  }
};

export default nextConfig;
