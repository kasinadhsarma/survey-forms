/** Every Tailwind class string, one object per component. */

export const page = {
  main: 'mx-auto w-full max-w-3xl px-4 py-8',
  heading: 'mb-6 text-2xl font-semibold',
  muted: 'text-sm text-zinc-500',
  error: 'text-sm text-red-600',
};

export const shared = {
  input:
    'w-full rounded border border-zinc-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none',
  label: 'mb-1 block text-sm font-medium',
  button:
    'rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50',
  buttonGhost:
    'rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100',
  link: 'text-blue-600 hover:underline',
};

export const builder = {
  form: 'space-y-6',
  card: 'space-y-3 rounded border border-zinc-200 p-4',
  row: 'flex items-center gap-2',
  checkbox: 'h-4 w-4',
};

export const survey = {
  form: 'space-y-5',
  field: 'space-y-1',
  options: 'space-y-1',
  option: 'flex items-center gap-2 text-sm',
};

export const list = {
  header: 'mb-6 flex items-center justify-between',
  item: 'flex items-center justify-between border-b border-zinc-200 py-3',
  actions: 'flex gap-4 text-sm',
};

export const table = {
  wrap: 'overflow-x-auto',
  table: 'w-full border-collapse text-left text-sm',
  th: 'border-b border-zinc-300 px-3 py-2 font-medium',
  td: 'border-b border-zinc-200 px-3 py-2 align-top',
  pager: 'mt-4 flex items-center gap-3 text-sm',
};
