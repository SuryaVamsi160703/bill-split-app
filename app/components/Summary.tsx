'use client'

import { Expense } from '../page'

type Props = {
  expenses: Expense[]
  groupMembers: string[]
}

export default function Summary({ expenses, groupMembers }: Props) {
  if (expenses.length === 0) {
    return null
  }

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  // Calculate what each person spent vs should spend
  const calculateBalances = () => {
    const balances: Record<string, { paid: number; owes: number }> = {}
    
    groupMembers.forEach(member => {
      balances[member] = { paid: 0, owes: 0 }
    })

    expenses.forEach(expense => {
      // Add to what they paid
      balances[expense.paidBy].paid += expense.amount

      // Add to what they owe
      const perPersonShare = expense.amount / expense.splitBetween.length
      expense.splitBetween.forEach(member => {
        balances[member].owes += perPersonShare
      })
    })

    return balances
  }

  const balances = calculateBalances()

  return (
    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg p-6 mb-4 text-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-emerald-100 text-sm font-medium">Total expenses</p>
          <p className="text-4xl font-bold">£{totalExpense.toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-emerald-100 text-sm font-medium">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        {groupMembers.map(member => {
          const balance = balances[member].paid - balances[member].owes
          return (
            <div key={member} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
              <p className="text-emerald-100 text-xs font-medium">{member}</p>
              <p className={`text-lg font-bold ${balance >= 0 ? 'text-white' : 'text-emerald-200'}`}>
                {balance >= 0 ? '+' : ''}£{balance.toFixed(2)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}