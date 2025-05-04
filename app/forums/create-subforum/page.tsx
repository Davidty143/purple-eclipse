import CreateSubforumForm from './components/CreateSubforumForm';

interface PageProps {
  params: Promise<{
    subforumId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { subforumId } = await params;

  return (
    <div className="container mx-auto py-8">
      <CreateSubforumForm parentId={Number(subforumId)} />
    </div>
  );
}
