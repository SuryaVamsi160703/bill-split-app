'use client'

import { Expense } from '../page'
import { useState } from 'react'

type Props = {
  expenses: Expense[]
  groupMembers: string[]
}

type ExpenseSettlement = {
  expenseId: string
  expenseName: string
  paidBy: string
  totalAmount: number
  payments: {
    from: string
    to: string
    amount: number
  }[]
}

export default function DetailedSettlement({ expenses, groupMembers }: Props) {
  const [viewMode, setViewMode] = useState<'detailed' | 'simplified'>('detailed')

  // Calculate settlements per expense
  const calculateDetailedSettlements = (): ExpenseSettlement[] => {
    return expenses.map(expense => {
      const payments: { from: string; to: string; amount: number }[] = []
      const perPersonShare = expense.amount / expense.splitBetween.length

      expense.splitBetween.forEach(person => {
        if (person !== expense.paidBy) {
          payments.push({
            from: person,
            to: expense.paidBy,
            amount: perPersonShare
          })
        }
      })

      return {
        expenseId: expense.id,
        expenseName: expense.description,
        paidBy: expense.paidBy,
        totalAmount: expense.amount,
        payments: payments.sort((a, b) => a.from.localeCompare(b.from))
      }
    })
  }

  // Calculate simplified settlements (optimized)
  const calculateSimplifiedSettlements = () => {
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

    const transactions: { from: string; to: string; amount: number }[] = []

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

  const detailedSettlements = calculateDetailedSettlements()
  const simplifiedSettlements = calculateSimplifiedSettlements()

  const totalPayments = viewMode === 'detailed'
    ? detailedSettlements.reduce((sum, exp) => sum + exp.payments.length, 0)
    : simplifiedSettlements.length

  if (expenses.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header with Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">💸 Settlements</h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalPayments} payment{totalPayments !== 1 ? 's' : ''} needed
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                viewMode === 'detailed'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Detailed
            </button>
            <button
              onClick={() => setViewMode('simplified')}
              className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                viewMode === 'simplified'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Simplified
            </button>
          </div>
        </div>

        {viewMode === 'detailed' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Detailed view:</strong> Shows who owes whom for each expense separately
            </p>
          </div>
        )}
        {viewMode === 'simplified' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              <strong>Simplified view:</strong> Minimized payments - combines multiple debts
            </p>
          </div>
        )}
      </div>

      {/* Detailed View - Per Expense */}
      {viewMode === 'detailed' && (
        <div className="space-y-6">
          {detailedSettlements.map((settlement, expIndex) => (
            <div key={settlement.expenseId} className="border-2 border-gray-200 rounded-xl overflow-hidden">
              {/* Expense Header */}
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{settlement.expenseName}</h3>
                    <p className="text-sm text-emerald-100">
                      Paid by {settlement.paidBy} · Split {expenses.find(e => e.id === settlement.expenseId)?.splitBetween.length} ways
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black">£{settlement.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-emerald-100">total</p>
                  </div>
                </div>
              </div>

              {/* Payments for this expense */}
              <div className="p-4 bg-gray-50">
                {settlement.payments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">
                    ✓ {settlement.paidBy} paid for themselves only
                  </p>
                ) : (
                  <div className="space-y-2">
                    {settlement.payments.map((payment, payIndex) => (
                      <div key={payIndex} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-orange-300 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {payIndex + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {payment.from}
                              <span className="text-gray-400 mx-2">→</span>
                              {payment.to}
                            </p>
                            <p className="text-xs text-gray-500">for {settlement.expenseName}</p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-orange-600">
                          £{payment.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simplified View - Optimized Payments */}
      {viewMode === 'simplified' && (
        <div>
          {simplifiedSettlements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-3">✅</div>
              <p className="text-xl font-semibold text-gray-900 mb-1">All Settled!</p>
              <p className="text-gray-500">No payments needed</p>
            </div>
          ) : (
            <div className="space-y-3">
              {simplifiedSettlements.map((payment, index) => (
                <div key={index} className="flex items-center gap-4 p-5 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border-2 border-orange-300 hover:border-orange-400 hover:shadow-md transition-all">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    {index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900 text-lg">{payment.from}</span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className="font-bold text-gray-900 text-lg">{payment.to}</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {payment.from} pays {payment.to}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-3xl font-black text-orange-600">
                      £{payment.amount.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">total</p>
                  </div>
                </div>
              ))}

              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                  <span className="font-semibold text-gray-700">Total to transfer:</span>
                  <span className="text-2xl font-black text-gray-900">
                    £{simplifiedSettlements.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}