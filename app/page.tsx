import Link from 'next/link';
import { FormList } from '@/components/FormList';
import { list, page, shared } from '@/lib/responsive/pattrens/forms';

/** Dashboard: the "New form" button and the list of forms. */
export default function Home() {
  return (
    <main className={page.main}>
      <div className={list.header}>
        <h1 className={page.heading}>Survey forms</h1>
        <Link className={shared.button} href="/forms/new">
          New form
        </Link>
      </div>
      <FormList />
    </main>
  );
}
