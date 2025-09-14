export type Currency = "PLN" | "USD" | "EUR";

export type Money = {
  value: number;        // positive number
  currency: Currency;   // "PLN" | "USD" | "EUR"
};

export type Debt = {
  id: string;
  name: string;
  amount: Money;
  dueDate: string;      // ISO yyyy-mm-dd
};

export type Earning = {
  id: string;
  source: string;       // e.g., Salary, Bonus
  amount: Money;
};

export type RecurringExpense = {
  id: string;
  name: string;         // e.g., Rent, Utilities, Groceries
  amount: Money;
};

export type StoreState = {
  debts: Debt[];
  earnings: Earning[];
  expenses: RecurringExpense[];
};
