'use client';

import { api } from '@/lib/fetch';
import { page } from '@/lib/responsive/pattrens/forms';
import { useLoad } from '@/lib/useLoad';
import { SurveyForm } from './SurveyForm';

/** Loads a form for the public page. */
export function SurveyLoader({ formId }: { formId: string }) {
  const { data, error, loading } = useLoad(
    () => api('/forms/:id', { params: { id: formId } }),
    formId,
  );
  if (loading) {
    return <p className={page.muted}>Loading...</p>;
  }
  if (error || !data) {
    return <p className={page.error}>{error ?? 'Form not found'}</p>;
  }
  return (
    <>
      <h1 className={page.heading}>{data.title}</h1>
      {data.description && <p className={page.muted}>{data.description}</p>}
      <SurveyForm form={data} />
    </>
  );
}
