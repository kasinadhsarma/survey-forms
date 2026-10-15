'use client';

import Link from 'next/link';
import { api } from '@/lib/fetch';
import { list, page, shared } from '@/lib/responsive/pattrens/forms';
import { useLoad } from '@/lib/useLoad';

/** Dashboard list with links to the survey and its responses. */
export function FormList() {
  const { data, error, loading } = useLoad(() => api('/forms'), 'forms');
  if (loading) {
    return <p className={page.muted}>Loading...</p>;
  }
  if (error || !data) {
    return <p className={page.error}>{error}</p>;
  }
  if (data.length === 0) {
    return <p className={page.muted}>No forms yet.</p>;
  }
  return (
    <ul>
      {data.map((form) => (
        <li key={form.id} className={list.item}>
          <div>
            <div>{form.title}</div>
            <div className={page.muted}>
              {form.questionCount} questions, {form.responseCount} responses
            </div>
          </div>
          <div className={list.actions}>
            <Link className={shared.link} href={`/f/${form.id}`}>
              Open
            </Link>
            <Link className={shared.link} href={`/forms/${form.id}/responses`}>
              Responses
            </Link>
          </div>
        </li>
      ))}
    </ul>
  );
}
