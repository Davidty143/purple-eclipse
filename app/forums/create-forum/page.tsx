// app/(forums)/create-forum/page.tsx
import CreateForumForm from './components/CreateForumForm';

export default function CreateForumPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <CreateForumForm />
    </main>
  );
}
