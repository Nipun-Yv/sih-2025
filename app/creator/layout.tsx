import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CreatorSidebar from './components/CreatorSidebar';

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-orange-50/30">
      <div className="flex">
        <CreatorSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}