'use client'

import { Expense } from '../page'

type Props = {
  expenses: Expense[]
  groupMembers: string[]
}

type Transaction = {
  from: string
  to: string
  amount: number
}

export default function Settlement({ expenses, groupMembers }: Props) {
  const calculateBalances = (): Record<string, number> => {
    const balances: Record<string, number> = {}
    
    groupMembers.forEach(member => {
      balances[member] = 0
    })

    expenses.forEach(expense => {
      balances[expense.paidBy] += expense.amount
      
      const perPersonShare = expense.amount / expense.splitBetween.length
      expense.splitBetween.forEach(member => {
        balances[member] -= perPersonShare
      })
    })

    return balances
  }

  const simplifySettlements = (): Transaction[] => {
    const balances = calculateBalances()
    const transactions: Transaction[] = []

    const debtors = Object.entries(balances)
      .filter(([_, amount]) => amount < -0.01)
      .map(([person, amount]) => ({ person, amount: Math.abs(amount) }))
      .sort((a, b) => b.amount - a.amount)

    const creditors = Object.entries(balances)
      .filter(([_, amount]) => amount > 0.01)
      .map(([person, amount]) => ({ person, amount }))
      .sort((a, b) => b.amount - a.amount)

    let i = 0, j = 0

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i]
      const creditor = creditors[j]

      const settleAmount = Math.min(debtor.amount, creditor.amount)

      if (settleAmount > 0.01) {
        transactions.push({
          from: debtor.person,
          to: creditor.person,
          amount: settleAmount
        })
      }

      debtor.amount -= settleAmount
      creditor.amount -= settleAmount

      if (debtor.amount < 0.01) i++
      if (creditor.amount < 0.01) j++
    }

    return transactions
  }

  const settlements = simplifySettlements()

  if (settlements.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-6xl mb-3">✅</div>
        <p className="text-xl font-semibold text-gray-900 mb-1">All Settled!</p>
        <p className="text-gray-500">No payments needed</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">💸 Suggested Payments</h2>
        <p className="text-sm text-gray-500 mt-1">
          {settlements.length} payment{settlements.length !== 1 ? 's' : ''} to settle all expenses
        </p>
      </div>

      <div className="space-y-3">
        {settlements.map((transaction, index) => (
          <div key={index} className="group relative">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-300 hover:border-orange-400 hover:shadow-md transition-all">
              {/* Payment Number */}
              <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                {index + 1}
              </div>

              {/* Transaction Details */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900 text-lg">{transaction.from}</span>
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="font-bold text-gray-900 text-lg">{transaction.to}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {transaction.from} pays {transaction.to}
                </p>
              </div>

              {/* Amount */}
              <div className="text-right">
                <div className="text-3xl font-black text-orange-600">
                  £{transaction.amount.toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">to settle</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total to be transferred */}
      <div className="mt-6 pt-6 border-t-2 border-gray-200">
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
          <span className="font-semibold text-gray-700">Total amount to transfer:</span>
          <span className="text-2xl font-black text-gray-900">
            £{settlements.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}