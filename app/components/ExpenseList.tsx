'use client'

import { Expense } from '../page'

type Props = {
  expenses: Expense[]
  onDelete: (id: string) => void
}

export default function ExpenseList({ expenses, onDelete }: Props) {
  if (expenses.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h2>
      <div className="space-y-3">
        {expenses.map(expense => (
          <div key={expense.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{expense.description}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Paid by <span className="font-medium text-gray-700">{expense.paidBy}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">£{expense.amount.toFixed(2)}</p>
                <button
                  onClick={() => onDelete(expense.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium mt-1"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {expense.splitBetween.map(member => (
                <div key={member} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md">
                  <span className="text-sm text-gray-700">{member}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    £{(expense.amount / expense.splitBetween.length).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}