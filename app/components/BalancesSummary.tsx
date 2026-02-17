'use client'

import { Expense } from '../page'

type Props = {
  expenses: Expense[]
  groupMembers: string[]
}

export default function BalancesSummary({ expenses, groupMembers }: Props) {
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)

  const calculateBalances = () => {
    const balances: Record<string, { paid: number; owes: number; balance: number }> = {}
    
    groupMembers.forEach(member => {
      balances[member] = { paid: 0, owes: 0, balance: 0 }
    })

    expenses.forEach(expense => {
      balances[expense.paidBy].paid += expense.amount
      
      const perPersonShare = expense.amount / expense.splitBetween.length
      expense.splitBetween.forEach(member => {
        balances[member].owes += perPersonShare
      })
    })

    // Calculate net balance
    Object.keys(balances).forEach(member => {
      balances[member].balance = balances[member].paid - balances[member].owes
    })

    return balances
  }

  const balances = calculateBalances()

  // Separate into people who get money back vs owe money
  const getsBack = Object.entries(balances)
    .filter(([_, data]) => data.balance > 0.01)
    .sort((a, b) => b[1].balance - a[1].balance)

  const owes = Object.entries(balances)
    .filter(([_, data]) => data.balance < -0.01)
    .sort((a, b) => a[1].balance - b[1].balance)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
      {/* Total Summary */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 rounded-t-xl text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-emerald-100 text-sm font-medium">Total expenses</p>
            <p className="text-4xl font-bold">£{totalExpense.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-emerald-100 text-sm">{expenses.length} expense{expenses.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Detailed Balances */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Everyone's Balance</h3>
        
        <div className="space-y-3">
          {groupMembers.map(member => {
            const data = balances[member]
            const isPositive = data.balance > 0.01
            const isNegative = data.balance < -0.01
            
            return (
              <div key={member} className={`p-4 rounded-lg border-2 ${
                isPositive ? 'bg-green-50 border-green-300' : 
                isNegative ? 'bg-red-50 border-red-300' : 
                'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900 text-lg">{member}</h4>
                  <div className={`text-2xl font-black ${
                    isPositive ? 'text-green-600' : 
                    isNegative ? 'text-red-600' : 
                    'text-gray-500'
                  }`}>
                    {isPositive && '+'}{data.balance >= 0 ? '£' : '-£'}{Math.abs(data.balance).toFixed(2)}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-600">
                      Paid: <span className="font-semibold text-gray-900">£{data.paid.toFixed(2)}</span>
                    </span>
                    <span className="text-gray-600">
                      Share: <span className="font-semibold text-gray-900">£{data.owes.toFixed(2)}</span>
                    </span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isPositive ? 'bg-green-200 text-green-800' : 
                    isNegative ? 'bg-red-200 text-red-800' : 
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {isPositive ? 'Gets back' : isNegative ? 'Owes' : 'Settled'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
          {getsBack.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h4 className="text-sm font-semibold text-green-800 mb-2">💰 Getting Money Back</h4>
              {getsBack.map(([member, data]) => (
                <div key={member} className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{member}</span>
                  <span className="font-bold text-green-700">+£{data.balance.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {owes.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h4 className="text-sm font-semibold text-red-800 mb-2">💸 Needs to Pay</h4>
              {owes.map(([member, data]) => (
                <div key={member} className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{member}</span>
                  <span className="font-bold text-red-700">£{Math.abs(data.balance).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}