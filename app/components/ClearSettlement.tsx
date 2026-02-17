'use client'

import { Expense } from '../page'
import { useState } from 'react'

type Props = {
  expenses: Expense[]
  groupMembers: string[]
  dark?: boolean
}

type DebtGroup = {
  to: string
  totalAmount: number
  breakdown: {
    for: string
    amount: number
  }[]
}

type PersonOwes = {
  person: string
  debtGroups: DebtGroup[]
  totalOwes: number
}

export default function ClearSettlement({ expenses, groupMembers, dark }: Props) {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)

  // Calculate who owes whom - COMBINED by recipient
  const calculateDebts = (): PersonOwes[] => {
    const personDebts: Record<string, Record<string, DebtGroup>> = {}

    // Initialize
    groupMembers.forEach(member => {
      personDebts[member] = {}
    })

    // Calculate debts per expense
    expenses.forEach(expense => {
      const perPersonShare = expense.amount / expense.splitBetween.length

      expense.splitBetween.forEach(person => {
        if (person !== expense.paidBy) {
          // If already owe this person, add to it
          if (personDebts[person][expense.paidBy]) {
            personDebts[person][expense.paidBy].totalAmount += perPersonShare
            personDebts[person][expense.paidBy].breakdown.push({
              for: expense.description,
              amount: perPersonShare
            })
          } else {
            // New debt to this person
            personDebts[person][expense.paidBy] = {
              to: expense.paidBy,
              totalAmount: perPersonShare,
              breakdown: [{
                for: expense.description,
                amount: perPersonShare
              }]
            }
          }
        }
      })
    })

    // Convert to array format, filter people who owe nothing
    return Object.entries(personDebts)
      .map(([person, debts]) => {
        const debtGroups = Object.values(debts)
        const totalOwes = debtGroups.reduce((sum, d) => sum + d.totalAmount, 0)
        return { person, debtGroups, totalOwes }
      })
      .filter(p => p.debtGroups.length > 0)
      .sort((a, b) => b.totalOwes - a.totalOwes)
  }

  const allDebts = calculateDebts()

  if (expenses.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-5 rounded-t-xl">
        <h2 className="text-xl font-bold text-white">💸 Who Owes What</h2>
        <p className="text-emerald-100 text-sm mt-1">
          Select a person to see their payments
        </p>
      </div>

      {/* Person Selector Tabs */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-2 flex-wrap">
          {allDebts.map(({ person, totalOwes }) => (
            <button
              key={person}
              onClick={() => setSelectedPerson(selectedPerson === person ? null : person)}
              className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
                selectedPerson === person
                  ? 'bg-emerald-500 text-white shadow-md scale-105'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-emerald-300'
              }`}
            >
              {person}
              <span className={`ml-2 font-bold ${
                selectedPerson === person ? 'text-emerald-100' : 'text-orange-500'
              }`}>
                £{totalOwes.toFixed(2)}
              </span>
            </button>
          ))}

          {/* People who don't owe anything */}
          {groupMembers
            .filter(m => !allDebts.find(d => d.person === m))
            .map(member => (
              <div key={member} className="px-4 py-2.5 rounded-lg font-semibold bg-green-50 border-2 border-green-200 text-green-700">
                {member}
                <span className="ml-2 text-green-500 text-sm">✓ settled</span>
              </div>
            ))}
        </div>
      </div>

      {/* Selected Person Detail View */}
      {selectedPerson && (() => {
        const personData = allDebts.find(p => p.person === selectedPerson)
        if (!personData) return null

        return (
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedPerson} needs to pay
              </h3>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-2xl font-black text-orange-600">
                  £{personData.totalOwes.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {personData.debtGroups.map((debt, index) => (
                <div key={index} className="border-2 border-orange-200 rounded-xl overflow-hidden">
                  {/* Who to pay - Header */}
                  <div className="flex items-center justify-between bg-orange-500 px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-orange-500 text-lg">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-bold text-xl">Pay {debt.to}</p>
                        <p className="text-orange-100 text-sm">
                          {debt.breakdown.length} item{debt.breakdown.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-3xl font-black text-white">
                      £{debt.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  {/* Breakdown per item */}
                  <div className="bg-orange-50 p-3 space-y-2">
                    {debt.breakdown.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between px-4 py-2.5 bg-white rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2">
                          <span className="text-orange-400 text-sm">•</span>
                          <span className="text-sm font-medium text-gray-700">for {item.for}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">£{item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="mt-5 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700 text-lg">{selectedPerson} total to pay:</span>
                <span className="text-2xl font-black text-orange-600">£{personData.totalOwes.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Overview - All Debts (when no person selected) */}
      {!selectedPerson && (
        <div className="p-5">
          <p className="text-sm text-gray-500 mb-4">Overview of all payments</p>
          <div className="space-y-3">
            {allDebts.map(({ person, debtGroups, totalOwes }) => (
              <div
                key={person}
                onClick={() => setSelectedPerson(person)}
                className="border-2 border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-300 hover:shadow-md transition-all"
              >
                {/* Person header */}
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <span className="font-bold text-gray-900 text-lg">{person}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-orange-600">£{totalOwes.toFixed(2)}</span>
                    <span className="text-gray-400 text-sm">→</span>
                  </div>
                </div>

                {/* Debt groups */}
                <div className="p-3 space-y-2">
                  {debtGroups.map((debt, idx) => (
                    <div key={idx} className="flex items-start justify-between px-3 py-2.5 bg-orange-50 rounded-lg border border-orange-200">
                      <div>
                        <p className="font-semibold text-gray-900">→ Pay {debt.to}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {debt.breakdown.map(b => b.for).join(', ')}
                        </p>
                      </div>
                      <span className="font-bold text-orange-600 text-lg">
                        £{debt.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}