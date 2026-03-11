import { useMemo } from 'react';
import { Expense } from '../types';

export function useExpenseAnalytics(expenses: Expense[]) {
  const expensesByMonth = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = date.toLocaleString('default', { month: 'short' });
      monthlyData[key] = 0;
    }

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      const monthKey = expenseDate.toLocaleString('default', { month: 'short' });
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey] += expense.amount;
      }
    });

    return {
      labels: Object.keys(monthlyData),
      datasets: [{
        data: Object.values(monthlyData),
      }],
    };
  }, [expenses]);

  const expensesByCategory = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};

    expenses.forEach(expense => {
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      labels: sortedCategories.map(([cat]) => cat),
      datasets: [{
        data: sortedCategories.length > 0 ? sortedCategories.map(([, amount]) => amount) : [0],
      }],
    };
  }, [expenses]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [expenses]);

  const avgMonthlyExpense = useMemo(() => {
    const data = expensesByMonth.datasets[0].data;
    if (data.length === 0) return 0;
    const total = data.reduce((sum, val) => sum + val, 0);
    return total / data.length;
  }, [expensesByMonth]);

  return {
    totalExpenses,
    avgMonthlyExpense,
    expensesByMonth,
    expensesByCategory,
  };
}
