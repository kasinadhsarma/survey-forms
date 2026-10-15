'use client';

import {
  useFieldArray,
  type Control,
  type UseFormRegister,
} from 'react-hook-form';
import type { BuilderForm } from '@/lib/schemas/builder';
import { builder as p, shared } from '@/lib/responsive/pattrens/forms';

type Props = {
  index: number;
  control: Control<BuilderForm>;
  register: UseFormRegister<BuilderForm>;
};

/** Choices of one question: one input per option, add, remove, Yes / No. */
export function OptionsEditor({ index, control, register }: Props) {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: `questions.${index}.options`,
  });

  return (
    <div className="space-y-2">
      {fields.map((field, optionIndex) => (
        <div key={field.id} className={p.row}>
          <input
            className={shared.input}
            placeholder={`Option ${optionIndex + 1}`}
            {...register(`questions.${index}.options.${optionIndex}.value`)}
          />
          <button
            type="button"
            className={shared.buttonGhost}
            onClick={() => remove(optionIndex)}
          >
            Remove
          </button>
        </div>
      ))}
      <div className={p.row}>
        <button
          type="button"
          className={shared.buttonGhost}
          onClick={() => append({ value: '' })}
        >
          Add option
        </button>
        <button
          type="button"
          className={shared.buttonGhost}
          onClick={() => replace([{ value: 'Yes' }, { value: 'No' }])}
        >
          Yes / No
        </button>
      </div>
    </div>
  );
}
