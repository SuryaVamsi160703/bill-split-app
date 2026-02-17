'use client'

import { useState } from 'react'

type Props = {
  groupMembers: string[]
  dark?: boolean
  onAdd: (expense: {
    description: string
    amount: number
    paidBy: string
    splitBetween: string[]
  }) => void
}

export default function AddExpense({ groupMembers, onAdd, dark }: Props) {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState('')
  const [splitBetween, setSplitBetween] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const toggleMember = (member: string) => {
    if (splitBetween.includes(member)) {
      setSplitBetween(splitBetween.filter(m => m !== member))
    } else {
      setSplitBetween([...splitBetween, member])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!description || !amount || !paidBy || splitBetween.length === 0) {
      alert('Please fill all fields')
      return
    }

    onAdd({
      description,
      amount: parseFloat(amount),
      paidBy,
      splitBetween
    })

    // Reset
    setDescription('')
    setAmount('')
    setPaidBy('')
    setSplitBetween([])
    setIsOpen(false)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition rounded-xl"
        >
          <span className="text-emerald-600 font-semibold">+ Add expense</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Add expense</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {/* Description & Amount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Groceries"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Amount (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Paid by */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Paid by
              </label>
              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select who paid</option>
                {groupMembers.map(member => (
                  <option key={member} value={member}>{member}</option>
                ))}
              </select>
            </div>

            {/* Split between */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split between
              </label>
              <div className="space-y-2">
                {groupMembers.map(member => (
                  <label
                    key={member}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition ${
                      splitBetween.includes(member)
                        ? 'bg-emerald-50 border-emerald-400'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={splitBetween.includes(member)}
                        onChange={() => toggleMember(member)}
                        className="mr-3 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="font-medium text-gray-900">{member}</span>
                    </div>
                    {splitBetween.includes(member) && amount && (
                      <span className="text-sm font-semibold text-emerald-600">
                        £{(parseFloat(amount) / splitBetween.length).toFixed(2)}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600 transition"
              >
                Add expense
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}