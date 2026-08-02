import type { Category } from '@/features/categories/types';

/** Expense/income taxonomy — colors from the design HTML seed. */
export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-salary', kind: 'income', name: 'Salary', color: '#5B54D6', sort_order: 1 },
  { id: 'cat-freelance', kind: 'income', name: 'Freelance', color: '#3E6E9E', sort_order: 2 },
  { id: 'cat-interest', kind: 'income', name: 'Interest', color: '#2F7D5D', sort_order: 3 },
  { id: 'cat-rent', kind: 'expense', name: 'Rent', color: '#A2701F', sort_order: 10 },
  { id: 'cat-groceries', kind: 'expense', name: 'Groceries', color: '#2F7D6E', sort_order: 11 },
  { id: 'cat-utilities', kind: 'expense', name: 'Utilities', color: '#96702C', sort_order: 12 },
  { id: 'cat-transport', kind: 'expense', name: 'Transport', color: '#5B54D6', sort_order: 13 },
  { id: 'cat-food', kind: 'expense', name: 'Food & Dining', color: '#C2543D', sort_order: 14 },
  { id: 'cat-shopping', kind: 'expense', name: 'Shopping', color: '#A84A7C', sort_order: 15 },
  { id: 'cat-health', kind: 'expense', name: 'Health', color: '#2F7D5D', sort_order: 16 },
  {
    id: 'cat-entertainment',
    kind: 'expense',
    name: 'Entertainment',
    color: '#96702C',
    sort_order: 17,
  },
  { id: 'cat-insurance', kind: 'expense', name: 'Insurance', color: '#3E6E9E', sort_order: 18 },
  { id: 'cat-other', kind: 'expense', name: 'Other', color: '#8A7F6E', sort_order: 19 },
];

export function categoryById(id: string): Category {
  return MOCK_CATEGORIES.find((c) => c.id === id) ?? MOCK_CATEGORIES[MOCK_CATEGORIES.length - 1];
}

export function categoryByName(name: string): Category {
  return (
    MOCK_CATEGORIES.find((c) => c.name === name) ?? MOCK_CATEGORIES[MOCK_CATEGORIES.length - 1]
  );
}
