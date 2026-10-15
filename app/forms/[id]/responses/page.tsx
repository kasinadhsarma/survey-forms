import { Suspense } from 'react';
import { ResponsesView } from '@/components/ResponsesView';
import { page } from '@/lib/responsive/pattrens/forms';

/** Params are awaited inside Suspense, as Cache Components requires. */
async function Responses({ params }: PageProps<'/forms/[id]/responses'>) {
  const { id } = await params;
  return <ResponsesView formId={id} />;
}

export default function ResponsesPage(
  props: PageProps<'/forms/[id]/responses'>,
) {
  return (
    <main className={page.main}>
      <Suspense fallback={<p className={page.muted}>Loading...</p>}>
        <Responses {...props} />
      </Suspense>
    </main>
  );
}
