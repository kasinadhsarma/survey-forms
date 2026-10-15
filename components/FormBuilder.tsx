'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { api, getErrorMessage } from '@/lib/fetch';
import { builder as p, page, shared } from '@/lib/responsive/pattrens/forms';
import {
  builderFormSchema,
  toCreateFormPayload,
  type BuilderForm,
} from '@/lib/schemas/builder';
import { isChoiceType, questionTypes } from '@/lib/schemas/question';
import { OptionsEditor } from './OptionsEditor';

const emptyQuestion: BuilderForm['questions'][number] = {
  label: '',
  type: 'short_text',
  required: false,
  options: [],
};

/** Create a form: react-hook-form with a field array and builderFormSchema. */
export function FormBuilder() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BuilderForm>({
    resolver: zodResolver(builderFormSchema),
    defaultValues: { title: '', description: '', questions: [emptyQuestion] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });
  const questions = useWatch({ control, name: 'questions' });

  /** Sends the payload; on success go to the dashboard. */
  async function onSubmit(values: BuilderForm) {
    setServerError(null);
    try {
      await api('@post/forms', { body: toCreateFormPayload(values) });
      router.push('/');
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  }

  return (
    <form className={p.form} onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className={shared.label}>Title</label>
        <input className={shared.input} {...register('title')} />
        {errors.title && <p className={page.error}>{errors.title.message}</p>}
      </div>
      <div>
        <label className={shared.label}>Description</label>
        <textarea className={shared.input} {...register('description')} />
      </div>

      {fields.map((field, index) => {
        const type = questions?.[index]?.type;
        return (
          <div key={field.id} className={p.card}>
            <input
              className={shared.input}
              placeholder="Question"
              {...register(`questions.${index}.label`)}
            />
            {errors.questions?.[index]?.label && (
              <p className={page.error}>
                {errors.questions[index]?.label?.message}
              </p>
            )}
            <div className={p.row}>
              <select
                className={shared.input}
                {...register(`questions.${index}.type`)}
              >
                {questionTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.replace('_', ' ')}
                  </option>
                ))}
              </select>
              <label className={p.row}>
                <input
                  type="checkbox"
                  className={p.checkbox}
                  {...register(`questions.${index}.required`)}
                />
                Required
              </label>
              <button
                type="button"
                className={shared.buttonGhost}
                onClick={() => remove(index)}
              >
                Delete
              </button>
            </div>
            {isChoiceType(type) && (
              <OptionsEditor
                index={index}
                control={control}
                register={register}
              />
            )}
          </div>
        );
      })}

      <button
        type="button"
        className={shared.buttonGhost}
        onClick={() => append(emptyQuestion)}
      >
        Add question
      </button>
      {serverError && <p className={page.error}>{serverError}</p>}
      <div>
        <button type="submit" className={shared.button} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Create form'}
        </button>
      </div>
    </form>
  );
}
