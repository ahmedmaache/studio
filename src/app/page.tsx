import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/admin/announcements/new');
  return null; // Or a loading spinner, but redirect is usually fast
}
