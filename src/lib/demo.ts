import type { StoreState } from "@/types";

export function getDemoStore(): StoreState {
  return {
    earnings: [
      { id: "e1", source: "Salary", amount: { value: 9000, currency: "PLN" } },
      { id: "e2", source: "Freelance", amount: { value: 1500, currency: "PLN" } },
    ],
    expenses: [
      { id: "x1", name: "Rent", amount: { value: 2700, currency: "PLN" } },
      { id: "x2", name: "Utilities", amount: { value: 450, currency: "PLN" } },
      { id: "x3", name: "Groceries", amount: { value: 1200, currency: "PLN" } },
      { id: "x4", name: "Internet", amount: { value: 80, currency: "PLN" } },
      { id: "x5", name: "Transport", amount: { value: 200, currency: "PLN" } },
      { id: "x6", name: "Subscriptions", amount: { value: 120, currency: "PLN" } },
    ],
    savings: [
      { id: "s1", name: "Checking", amount: { value: 3500, currency: "PLN" } },
      { id: "s2", name: "Emergency Fund", amount: { value: 10000, currency: "PLN" } },
      { id: "s3", name: "Investments", amount: { value: 15000, currency: "PLN" } },
    ],
    futurePayments: [
      {
        id: "f1",
        name: "Car Insurance",
        amount: { value: 1200, currency: "PLN" },
        dueDate: new Date(new Date().getFullYear(), 10, 15).toISOString().slice(0, 10), // Nov 15 this year
        recurrence: "yearly",
      },
      {
        id: "f2",
        name: "Vacation",
        amount: { value: 4000, currency: "PLN" },
        dueDate: new Date(new Date().getFullYear(), 6, 1).toISOString().slice(0, 10), // Jul 1 this year
        recurrence: "once",
      },
      {
        id: "f3",
        name: "New Laptop",
        amount: { value: 6000, currency: "PLN" },
        dueDate: new Date(new Date().getFullYear() + 1, 2, 10).toISOString().slice(0, 10), // Mar 10 next year
        recurrence: "once",
      },
    ],
    plan: {
      futurePaymentPerMonth: { value: 1500, currency: "PLN" },
      priority: "dueDate",
      customFuturePaymentOrder: [],
      seedSavingsIds: ["s1"],
    },
  };
}

