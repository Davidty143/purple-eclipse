// components/subforum-card.tsx
interface SubforumCardProps {
  name: string;
}

export function SubforumCard({ name }: SubforumCardProps) {
  return (
    <div className="py-4 px-6 border rounded-lg">
      <h3 className="font-medium">{name}</h3>
    </div>
  );
}
