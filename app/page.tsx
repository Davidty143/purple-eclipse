import { createClientForServer } from '@/utils/supabase/server';
import Image from 'next/image';

export default async function Home() {
  const supabase = await createClientForServer();

  const session = await supabase.auth.getUser();

  if (!session.data.user) return <div className="flex flex-col p-10 h-screen relative items-center justify-start"></div>;

  const {
    data: {
      user: { user_metadata, app_metadata }
    }
  } = session;

  const { name, email, username, avatar_url } = user_metadata;

  const userName = username ? `@${username}` : 'User Name Not Set';

  // console.log(session)

  return (
    <div className="">
      {/* continer at the center of the page  */}
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-4xl font-bold">{name}</h1>
        <p className="text-xl">User Name: {userName}</p>
        <p className="text-xl">Email: {email}</p>
        <p className="text-xl">Created with: {app_metadata.provider}</p>
      </div>
    </div>
  );
}
