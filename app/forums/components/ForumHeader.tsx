// components/ForumHeader.tsx
import { Button } from '@/components/ui/button';

export function ForumHeader() {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">GeneralForum</h1>
        <span className="text-sm text-muted-foreground">4 ti</span>
        <span className="text-sm text-muted-foreground">©</span>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Newest
        </Button>
        <Button variant="outline" size="sm">
          Popular
        </Button>
        <Button variant="outline" size="sm">
          Following
        </Button>
      </div>
    </div>
  );
}
