'use client'

import { Expense } from '../page'
import { useState } from 'react'

type Props = {
  expenses: Expense[]
  groupMembers: string[]
}

export default function PersonalBreakdown({ expenses, groupMembers }: Props) {
  const [selectedPerson, setSelectedPerson] = useState<string>(groupMembers[0])

  const getPersonBreakdown = (person: string) => {
    let totalPaid = 0
    let totalOwes = 0
    const itemsConsumed: { expense: Expense; share: number }[] = []
    const itemsPaid: Expense[] = []

    expenses.forEach(expense => {
      // What they paid
      if (expense.paidBy === person) {
        totalPaid += expense.amount
        itemsPaid.push(expense)
      }

      // What they consumed
      if (expense.splitBetween.includes(person)) {
        const share = expense.amount / expense.splitBetween.length
        totalOwes += share
        itemsConsumed.push({ expense, share })
      }
    })

    const balance = totalPaid - totalOwes

    return { totalPaid, totalOwes, balance, itemsConsumed, itemsPaid }
  }

  const breakdown = getPersonBreakdown(selectedPerson)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">👤 Personal Breakdown</h2>
        
        {/* Person Selector */}
        <div className="flex gap-2 flex-wrap">
          {groupMembers.map(member => (
            <button
              key={member}
              onClick={() => setSelectedPerson(member)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedPerson === member
                  ? 'bg-emerald-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {member}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Paid</p>
            <p className="text-2xl font-black text-blue-700">£{breakdown.totalPaid.toFixed(2)}</p>
            <p className="text-xs text-blue-600 mt-1">{breakdown.itemsPaid.length} expense{breakdown.itemsPaid.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
            <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Your Share</p>
            <p className="text-2xl font-black text-orange-700">£{breakdown.totalOwes.toFixed(2)}</p>
            <p className="text-xs text-orange-600 mt-1">{breakdown.itemsConsumed.length} item{breakdown.itemsConsumed.length !== 1 ? 's' : ''}</p>
          </div>

          <div className={`rounded-lg p-4 border-2 ${
            breakdown.balance > 0.01
              ? 'bg-green-50 border-green-200'
              : breakdown.balance < -0.01
              ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
              breakdown.balance > 0.01
                ? 'text-green-700'
                : breakdown.balance < -0.01
                ? 'text-red-700'
                : 'text-gray-600'
            }`}>
              {breakdown.balance > 0.01 ? 'Gets Back' : breakdown.balance < -0.01 ? 'Owes' : 'Settled'}
            </p>
            <p className={`text-2xl font-black ${
              breakdown.balance > 0.01
                ? 'text-green-700'
                : breakdown.balance < -0.01
                ? 'text-red-700'
                : 'text-gray-600'
            }`}>
              {breakdown.balance > 0.01 ? '+' : ''}£{Math.abs(breakdown.balance).toFixed(2)}
            </p>
          </div>
        </div>

        {/* What They Paid */}
        {breakdown.itemsPaid.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
              💳 What {selectedPerson} Paid
            </h3>
            <div className="space-y-2">
              {breakdown.itemsPaid.map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{expense.description}</p>
                    <p className="text-xs text-gray-600">
                      Split between: {expense.splitBetween.join(', ')}
                    </p>
                  </div>
                  <span className="font-bold text-blue-700 text-lg">£{expense.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* What They Consumed */}
        <div>
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">
            🛒 What {selectedPerson} Consumed
          </h3>
          <div className="space-y-2">
            {breakdown.itemsConsumed.map(({ expense, share }, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{expense.description}</p>
                  <p className="text-xs text-gray-600">
                    Paid by <span className="font-medium">{expense.paidBy}</span>
                    {' · '}Split {expense.splitBetween.length} ways
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-700 text-lg">£{share.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">your share</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t-2 border-gray-200">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total consumed:</span>
              <span className="text-xl font-bold text-orange-700">£{breakdown.totalOwes.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Final Balance Explanation */}
        <div className={`mt-6 p-5 rounded-xl border-2 ${
          breakdown.balance > 0.01
            ? 'bg-green-50 border-green-300'
            : breakdown.balance < -0.01
            ? 'bg-red-50 border-red-300'
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`text-3xl ${
              breakdown.balance > 0.01
                ? 'text-green-600'
                : breakdown.balance < -0.01
                ? 'text-red-600'
                : 'text-gray-500'
            }`}>
              {breakdown.balance > 0.01 ? '💰' : breakdown.balance < -0.01 ? '💸' : '✅'}
            </div>
            <div className="flex-1">
              <p className={`font-bold text-lg ${
                breakdown.balance > 0.01
                  ? 'text-green-800'
                  : breakdown.balance < -0.01
                  ? 'text-red-800'
                  : 'text-gray-700'
              }`}>
                {breakdown.balance > 0.01
                  ? `${selectedPerson} should get back £${breakdown.balance.toFixed(2)}`
                  : breakdown.balance < -0.01
                  ? `${selectedPerson} owes £${Math.abs(breakdown.balance).toFixed(2)}`
                  : `${selectedPerson} is all settled up!`
                }
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Paid £{breakdown.totalPaid.toFixed(2)} · Consumed £{breakdown.totalOwes.toFixed(2)} · 
                Balance: {breakdown.balance > 0 ? '+' : ''}£{breakdown.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}