import { Suspense } from 'react';
import { SurveyLoader } from '@/components/SurveyLoader';
import { page } from '@/lib/responsive/pattrens/forms';

/** Params are awaited inside Suspense, as Cache Components requires. */
async function Survey({ params }: PageProps<'/f/[formId]'>) {
  const { formId } = await params;
  return <SurveyLoader formId={formId} />;
}

export default function SurveyPage(props: PageProps<'/f/[formId]'>) {
  return (
    <main className={page.main}>
      <Suspense fallback={<p className={page.muted}>Loading...</p>}>
        <Survey {...props} />
      </Suspense>
    </main>
  );
}
