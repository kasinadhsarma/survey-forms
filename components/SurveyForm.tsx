'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { api, getErrorMessage } from '@/lib/fetch';
import { page, shared, survey as p } from '@/lib/responsive/pattrens/forms';
import type { Form } from '@/lib/schemas/form';
import { buildAnswerSchema } from '@/lib/schemas/submission';
import { QuestionField } from './QuestionField';

/** Fills in a survey with a schema built from its questions, then submits. */
export function SurveyForm({ form }: { form: Form }) {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  // The same rules the API applies, built from this form's own questions.
  const schema = useMemo(
    () => buildAnswerSchema(form.questions),
    [form.questions],
  );
  const defaults = useMemo(
    () =>
      Object.fromEntries(
        form.questions.map((q) => [q.id, q.type === 'multi_choice' ? [] : '']),
      ),
    [form.questions],
  );
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FieldValues>({
    // The generic schema is checked on the server again.
    resolver: zodResolver(schema as never),
    defaultValues: defaults,
  });

  async function onSubmit(answers: FieldValues) {
    setServerError(null);
    try {
      await api('@post/forms/:id/submissions', {
        params: { id: form.id },
        body: { answers },
      });
      setDone(true);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  if (done) {
    return <p>Thank you. Your response was recorded.</p>;
  }

  return (
    <form className={p.form} onSubmit={handleSubmit(onSubmit)}>
      {form.questions.map((question) => (
        <QuestionField
          key={question.id}
          question={question}
          control={control}
          error={errors[question.id]?.message as string | undefined}
        />
      ))}
      {serverError && <p className={page.error}>{serverError}</p>}
      <button type="submit" className={shared.button} disabled={isSubmitting}>
        Submit
      </button>
    </form>
  );
}
