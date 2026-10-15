'use client';

import { useState } from 'react';
import { api } from '@/lib/fetch';
import { page, shared, table as t } from '@/lib/responsive/pattrens/forms';
import { useLoad } from '@/lib/useLoad';

const PAGE_SIZE = 20;

/** Table with one column per question and paging; file answers are links. */
export function ResponsesView({ formId }: { formId: string }) {
  const [pageNumber, setPageNumber] = useState(1);
  const { data, error, loading } = useLoad(async () => {
    const [form, responses] = await Promise.all([
      api('/forms/:id', { params: { id: formId } }),
      api('/forms/:id/submissions', {
        params: { id: formId },
        query: { page: pageNumber, limit: PAGE_SIZE },
      }),
    ]);
    return { form, responses };
  }, `${formId}:${pageNumber}`);

  if (loading) {
    return <p className={page.muted}>Loading...</p>;
  }
  if (error || !data) {
    return <p className={page.error}>{error}</p>;
  }
  const { form, responses } = data;
  const pages = Math.max(1, Math.ceil(responses.total / PAGE_SIZE));

  return (
    <>
      <h1 className={page.heading}>{form.title}: responses</h1>
      <div className={t.wrap}>
        <table className={t.table}>
          <thead>
            <tr>
              <th className={t.th}>Submitted</th>
              {form.questions.map((q) => (
                <th key={q.id} className={t.th}>
                  {q.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {responses.items.map((item) => (
              <tr key={item.id}>
                <td className={t.td}>
                  {new Date(item.createdAt).toLocaleString()}
                </td>
                {form.questions.map((q) => {
                  const value = item.answers[q.id];
                  return (
                    <td key={q.id} className={t.td}>
                      {q.type === 'file' && typeof value === 'string' ? (
                        <a className={shared.link} href={value}>
                          Download
                        </a>
                      ) : Array.isArray(value) ? (
                        value.join(', ')
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={t.pager}>
        <button
          className={shared.buttonGhost}
          disabled={pageNumber <= 1}
          onClick={() => setPageNumber(pageNumber - 1)}
        >
          Previous
        </button>
        <span>
          Page {pageNumber} of {pages}
        </span>
        <button
          className={shared.buttonGhost}
          disabled={pageNumber >= pages}
          onClick={() => setPageNumber(pageNumber + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}
