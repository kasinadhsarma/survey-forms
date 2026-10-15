'use client';

import { Controller, type Control, type FieldValues } from 'react-hook-form';
import { page, shared, survey as p } from '@/lib/responsive/pattrens/forms';
import type { Question } from '@/lib/schemas/question';
import { FileUploadField } from './FileUploadField';

type Props = {
  question: Question;
  control: Control<FieldValues>;
  error?: string;
};

const inputTypes: Record<string, string> = {
  short_text: 'text',
  number: 'number',
  email: 'email',
  date: 'date',
};

/** One input per question type. */
export function QuestionField({ question, control, error }: Props) {
  return (
    <div className={p.field}>
      <label className={shared.label}>
        {question.label}
        {question.required && ' *'}
      </label>
      <Controller
        control={control}
        name={question.id}
        render={({ field }) => {
          switch (question.type) {
            case 'long_text':
              return (
                <textarea
                  className={shared.input}
                  {...field}
                  value={field.value ?? ''}
                />
              );
            case 'single_choice':
              return (
                <div className={p.options}>
                  {question.options.map((option) => (
                    <label key={option} className={p.option}>
                      <input
                        type="radio"
                        checked={field.value === option}
                        onChange={() => field.onChange(option)}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              );
            case 'multi_choice': {
              const selected: string[] = field.value ?? [];
              return (
                <div className={p.options}>
                  {question.options.map((option) => (
                    <label key={option} className={p.option}>
                      <input
                        type="checkbox"
                        checked={selected.includes(option)}
                        onChange={(e) =>
                          field.onChange(
                            e.target.checked
                              ? [...selected, option]
                              : selected.filter((o) => o !== option),
                          )
                        }
                      />
                      {option}
                    </label>
                  ))}
                </div>
              );
            }
            case 'file':
              return (
                <FileUploadField
                  value={field.value ?? ''}
                  onChange={field.onChange}
                />
              );
            default:
              return (
                <input
                  className={shared.input}
                  type={inputTypes[question.type] ?? 'text'}
                  {...field}
                  value={field.value ?? ''}
                />
              );
          }
        }}
      />
      {error && <p className={page.error}>{error}</p>}
    </div>
  );
}
