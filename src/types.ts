export type Currency = "PLN" | "USD" | "EUR";

export type Money = {
  value: number;        // positive number
  currency: Currency;   // "PLN" | "USD" | "EUR"
};

export type FuturePayment = {
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
  futurePayments: FuturePayment[];
  earnings: Earning[];
  expenses: RecurringExpense[];
  savings: Saving[];
  plan: Plan;
};

export type Saving = {
  id: string;
  name: string;         // e.g., Cash, Bank, Investment
  amount: Money;
};

export type Plan = {
  futurePaymentPerMonth: Money;
  priority: "dueDate" | "amount" | "custom";
  customFuturePaymentOrder?: string[];
  seedSavingsIds: string[]; // which savings to use as seed
};
