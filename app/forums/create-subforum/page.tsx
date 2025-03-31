import CreateSubforumForm from './components/CreateSubforumForm';

interface PageProps {
  params: {
    subforumId: string; // This is the parent subforum ID
  };
}

export default function Page({ params }: PageProps) {
  return (
    <div className="container mx-auto py-8">
      <CreateSubforumForm parentId={Number(params.subforumId)} />
    </div>
  );
}
