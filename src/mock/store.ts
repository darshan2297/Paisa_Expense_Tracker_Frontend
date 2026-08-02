import type { Bill, BillCreatePayload, BillUpdatePayload } from '@/features/bills/types';
import type {
  BudgetSettings,
  BudgetSettingsUpdatePayload,
  BudgetSummary,
  FixedCommitment,
  FixedCommitmentCreatePayload,
  FixedCommitmentUpdatePayload,
} from '@/features/budget/types';
import type { Category } from '@/features/categories/types';
import type {
  CardAmountPayload,
  CardsSummary,
  CreditCard,
  CreditCardCreatePayload,
} from '@/features/cards/types';
import type { Profile, ProfileUpdatePayload } from '@/features/profile/types';
import type {
  Transaction,
  TransactionCreatePayload,
  TransactionFilters,
  TransactionListResponse,
  TransactionsSummary,
} from '@/features/transactions/types';

import { MOCK_BILLS, MOCK_BUDGET_SETTINGS, MOCK_FIXED_COMMITMENTS } from './seed/budget';
import { MOCK_CATEGORIES, categoryById } from './seed/categories';
import { MOCK_CARDS, cardsSummaryFrom } from './seed/cards';
import { MOCK_PROFILE } from './seed/profile';
import { MOCK_TRANSACTIONS } from './seed/transactions';

/** Tiny in-memory store — mutations work in mock mode for interactive UI demos. */
class MockStore {
  categories = [...MOCK_CATEGORIES];
  transactions = [...MOCK_TRANSACTIONS];
  budgetSettings = { ...MOCK_BUDGET_SETTINGS };
  fixedCommitments = [...MOCK_FIXED_COMMITMENTS];
  bills = [...MOCK_BILLS];
  cards = [...MOCK_CARDS];
  profile = { ...MOCK_PROFILE };

  private delay<T>(value: T): Promise<T> {
    return Promise.resolve(value);
  }

  getCategories(): Promise<Category[]> {
    return this.delay([...this.categories]);
  }

  getTransactions(filters: TransactionFilters): Promise<TransactionListResponse> {
    let rows = this.transactions.filter((t) => t.date.startsWith(filters.month));
    if (filters.type) rows = rows.filter((t) => t.type === filters.type);
    if (filters.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter(
        (t) => t.note?.toLowerCase().includes(q) || t.category.name.toLowerCase().includes(q),
      );
    }
    rows.sort((a, b) => b.date.localeCompare(a.date));
    const page = filters.page ?? 1;
    const size = filters.size ?? 100;
    const start = (page - 1) * size;
    const slice = rows.slice(start, start + size);
    return this.delay({
      data: slice,
      total: rows.length,
      page,
      size,
      pages: Math.max(1, Math.ceil(rows.length / size)),
    });
  }

  getTransactionsSummary(month: string): Promise<TransactionsSummary> {
    const monthTx = this.transactions.filter((t) => t.date.startsWith(month));
    const income = monthTx.filter((t) => t.type === 'income');
    const expense = monthTx.filter((t) => t.type === 'expense');
    const incomeTotal = income.reduce((s, t) => s + Number(t.amount), 0);
    const expenseTotal = expense.reduce((s, t) => s + Number(t.amount), 0);

    const catMap = new Map<string, { amount: number; category: Category }>();
    for (const t of expense) {
      const prev = catMap.get(t.category.id);
      if (prev) prev.amount += Number(t.amount);
      else catMap.set(t.category.id, { amount: Number(t.amount), category: t.category });
    }
    const breakdown = [...catMap.values()]
      .sort((a, b) => b.amount - a.amount)
      .map(({ amount, category }) => ({
        category_id: category.id,
        name: category.name,
        color: category.color,
        amount: String(amount),
        pct: expenseTotal ? (amount / expenseTotal) * 100 : 0,
      }));

    const recent = [...monthTx].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

    return this.delay({
      income_total: String(incomeTotal),
      expense_total: String(expenseTotal),
      net_balance: String(incomeTotal - expenseTotal),
      category_breakdown: breakdown,
      recent,
    });
  }

  createTransaction(payload: TransactionCreatePayload): Promise<Transaction> {
    const tx: Transaction = {
      id: `t${Date.now()}`,
      account_id: 'mock-account-1',
      type: payload.type,
      amount: payload.amount,
      currency: 'INR',
      date: payload.date,
      note: payload.note ?? null,
      category: categoryById(payload.category_id),
      created_at: new Date().toISOString(),
    };
    this.transactions.unshift(tx);
    return this.delay(tx);
  }

  deleteTransaction(id: string): Promise<void> {
    this.transactions = this.transactions.filter((t) => t.id !== id);
    return this.delay(undefined);
  }

  getBudgetSettings(): Promise<BudgetSettings> {
    return this.delay({ ...this.budgetSettings });
  }

  updateBudgetSettings(payload: BudgetSettingsUpdatePayload): Promise<BudgetSettings> {
    this.budgetSettings = { ...this.budgetSettings, ...payload };
    return this.delay({ ...this.budgetSettings });
  }

  getBudgetSummary(month: string): Promise<BudgetSummary> {
    const spent = this.transactions
      .filter((t) => t.date.startsWith(month) && t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0);
    const monthly = Number(this.budgetSettings.monthly_amount);
    const remaining = monthly - spent;
    const [y, m] = month.split('-').map(Number);
    const daysInMonth = new Date(y, m, 0).getDate();
    const today = new Date();
    const daysRemaining =
      today.getFullYear() === y && today.getMonth() + 1 === m
        ? Math.max(1, daysInMonth - today.getDate() + 1)
        : daysInMonth;

    return this.delay({
      monthly_amount: String(monthly),
      spent: String(spent),
      remaining: String(remaining),
      pct_remaining: monthly ? Math.max(0, (remaining / monthly) * 100) : 0,
      per_day_left: String(Math.max(0, remaining / daysRemaining)),
      days_remaining_in_month: daysRemaining,
    });
  }

  getFixedCommitments(_month: string): Promise<FixedCommitment[]> {
    return this.delay(this.fixedCommitments.map((f) => ({ ...f, category: { ...f.category } })));
  }

  createFixedCommitment(payload: FixedCommitmentCreatePayload): Promise<FixedCommitment> {
    const row: FixedCommitment = {
      id: `f${Date.now()}`,
      name: payload.name,
      category: categoryById(payload.category_id),
      amount: payload.amount,
      due_day: payload.due_day,
      kind: payload.kind,
      paid_this_month: false,
      linked_transaction_id: null,
    };
    this.fixedCommitments.push(row);
    return this.delay(row);
  }

  deleteFixedCommitment(id: string): Promise<void> {
    this.fixedCommitments = this.fixedCommitments.filter((f) => f.id !== id);
    return this.delay(undefined);
  }

  toggleFixedCommitmentPaid(id: string, month: string): Promise<FixedCommitment> {
    const row = this.fixedCommitments.find((f) => f.id === id);
    if (!row) throw new Error('Not found');
    row.paid_this_month = !row.paid_this_month;
    if (row.paid_this_month) {
      const tx = {
        id: `t${Date.now()}`,
        account_id: 'mock-account-1',
        type: 'expense' as const,
        amount: row.amount,
        currency: 'INR',
        date: `${month}-${String(row.due_day).padStart(2, '0')}`,
        note: row.name,
        category: row.category,
        created_at: new Date().toISOString(),
      };
      this.transactions.unshift(tx);
      row.linked_transaction_id = tx.id;
    } else if (row.linked_transaction_id) {
      this.transactions = this.transactions.filter((t) => t.id !== row.linked_transaction_id);
      row.linked_transaction_id = null;
    }
    return this.delay({ ...row, category: { ...row.category } });
  }

  updateFixedCommitment(
    id: string,
    _month: string,
    payload: FixedCommitmentUpdatePayload,
  ): Promise<FixedCommitment> {
    const row = this.fixedCommitments.find((f) => f.id === id);
    if (!row) throw new Error('Not found');
    if (payload.name) row.name = payload.name;
    if (payload.amount) row.amount = payload.amount;
    if (payload.due_day) row.due_day = payload.due_day;
    if (payload.kind) row.kind = payload.kind;
    if (payload.category_id) row.category = categoryById(payload.category_id);
    return this.delay({ ...row, category: { ...row.category } });
  }

  getBills(_month?: string): Promise<Bill[]> {
    return this.delay(this.bills.map((b) => ({ ...b })));
  }

  createBill(payload: BillCreatePayload): Promise<Bill> {
    const bill: Bill = {
      id: `b${Date.now()}`,
      name: payload.name,
      kind: payload.kind,
      amount: payload.amount,
      due_date: payload.due_date,
      frequency: payload.frequency ?? 'monthly',
      auto_pay: payload.auto_pay ?? false,
      lead_days: payload.lead_days ?? 3,
      note: payload.note ?? null,
      paid_on: null,
      days_until_due: 7,
      status_label: 'Upcoming',
      linked_transaction_id: null,
    };
    this.bills.push(bill);
    return this.delay(bill);
  }

  updateBill(billId: string, payload: BillUpdatePayload): Promise<Bill> {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error('Not found');
    Object.assign(bill, payload);
    return this.delay({ ...bill });
  }

  deleteBill(billId: string): Promise<void> {
    this.bills = this.bills.filter((b) => b.id !== billId);
    return this.delay(undefined);
  }

  payBill(billId: string): Promise<Bill> {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error('Not found');
    bill.paid_on = new Date().toISOString().slice(0, 10);
    bill.status_label = 'Paid';
    return this.delay({ ...bill });
  }

  unpayBill(billId: string): Promise<Bill> {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error('Not found');
    bill.paid_on = null;
    bill.status_label = 'Upcoming';
    return this.delay({ ...bill });
  }

  toggleBillAuto(billId: string): Promise<Bill> {
    const bill = this.bills.find((b) => b.id === billId);
    if (!bill) throw new Error('Not found');
    bill.auto_pay = !bill.auto_pay;
    return this.delay({ ...bill });
  }

  getCards(): Promise<CreditCard[]> {
    return this.delay(this.cards.map((c) => ({ ...c })));
  }

  getCardsSummary(): Promise<CardsSummary> {
    return this.delay(cardsSummaryFrom(this.cards));
  }

  createCard(payload: CreditCardCreatePayload): Promise<CreditCard> {
    const limit = Number(payload.credit_limit);
    const outstanding = Number(payload.outstanding ?? 0);
    const card: CreditCard = {
      id: `c${Date.now()}`,
      name: payload.name,
      bank: payload.bank,
      network: payload.network ?? 'Visa',
      last4: payload.last4,
      credit_limit: payload.credit_limit,
      outstanding: payload.outstanding ?? '0',
      statement_day: payload.statement_day,
      due_day: payload.due_day,
      opened_on: payload.opened_on ?? null,
      minimum_due: String(Math.round(outstanding * 0.1)),
      utilization_pct: limit ? (outstanding / limit) * 100 : 0,
    };
    this.cards.push(card);
    return this.delay(card);
  }

  deleteCard(cardId: string): Promise<void> {
    this.cards = this.cards.filter((c) => c.id !== cardId);
    return this.delay(undefined);
  }

  payCard(cardId: string, payload: CardAmountPayload): Promise<CreditCard> {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Not found');
    const paid = Number(payload.amount);
    const next = Math.max(0, Number(card.outstanding) - paid);
    card.outstanding = String(next);
    card.minimum_due = String(Math.round(next * 0.1));
    card.utilization_pct = (next / Number(card.credit_limit)) * 100;
    return this.delay({ ...card });
  }

  spendOnCard(cardId: string, payload: CardAmountPayload): Promise<CreditCard> {
    const card = this.cards.find((c) => c.id === cardId);
    if (!card) throw new Error('Not found');
    const next = Number(card.outstanding) + Number(payload.amount);
    card.outstanding = String(next);
    card.minimum_due = String(Math.round(next * 0.1));
    card.utilization_pct = (next / Number(card.credit_limit)) * 100;
    return this.delay({ ...card });
  }

  getProfile(): Promise<Profile> {
    return this.delay({ ...this.profile });
  }

  updateProfile(payload: ProfileUpdatePayload): Promise<Profile> {
    this.profile = { ...this.profile, ...payload };
    return this.delay({ ...this.profile });
  }
}

export const mockStore = new MockStore();
