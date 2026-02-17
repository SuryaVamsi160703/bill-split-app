'use client'

import { useState } from 'react'

type Props = {
  onAdd: (item: {
    name: string
    price: number
    splitType: 'individual' | 'shared'
    assignedTo?: string
    splitAmong?: number
    sharedWith?: string[]
  }) => void
  groupSize: number
  membersList: string[]
}

export default function AddItem({ onAdd, groupSize, membersList }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [splitType, setSplitType] = useState<'individual' | 'shared'>('shared')
  const [assignedTo, setAssignedTo] = useState('')
  const [sharedWith, setSharedWith] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !price) {
      alert('Please enter item name and price')
      return
    }

    if (splitType === 'individual' && !assignedTo) {
      alert('Please select who bought this')
      return
    }

    if (splitType === 'shared' && sharedWith.length === 0) {
      alert('Please select who will split this')
      return
    }

    onAdd({
      name,
      price: parseFloat(price),
      splitType,
      assignedTo: splitType === 'individual' ? assignedTo : undefined,
      splitAmong: splitType === 'shared' ? sharedWith.length : undefined,
      sharedWith: splitType === 'shared' ? sharedWith : undefined
    })

    setName('')
    setPrice('')
    setAssignedTo('')
    setSharedWith([])
  }

  const toggleMember = (member: string) => {
    if (sharedWith.includes(member)) {
      setSharedWith(sharedWith.filter(m => m !== member))
    } else {
      setSharedWith([...sharedWith, member])
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-4 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Add item</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Item
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Milk"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-gray-400"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <label className={`flex-1 flex items-center p-3 rounded-md border-2 cursor-pointer transition ${
            splitType === 'shared' 
              ? 'bg-teal-50 border-teal-500' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              value="shared"
              checked={splitType === 'shared'}
              onChange={() => setSplitType('shared')}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-900">Split</span>
          </label>
          
          <label className={`flex-1 flex items-center p-3 rounded-md border-2 cursor-pointer transition ${
            splitType === 'individual' 
              ? 'bg-orange-50 border-orange-500' 
              : 'bg-white border-gray-200 hover:border-gray-300'
          }`}>
            <input
              type="radio"
              value="individual"
              checked={splitType === 'individual'}
              onChange={() => setSplitType('individual')}
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-900">Individual</span>
          </label>
        </div>

        {splitType === 'shared' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Split between
            </label>
            <div className="space-y-2">
              {membersList.map(member => (
                <label
                  key={member}
                  className={`flex items-center p-2.5 rounded-md border cursor-pointer transition ${
                    sharedWith.includes(member)
                      ? 'bg-teal-50 border-teal-300'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={sharedWith.includes(member)}
                    onChange={() => toggleMember(member)}
                    className="mr-3"
                  />
                  <span className="text-sm font-medium text-gray-900">{member}</span>
                  {sharedWith.includes(member) && price && (
                    <span className="ml-auto text-sm text-teal-600 font-semibold">
                      £{(parseFloat(price) / sharedWith.length).toFixed(2)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {splitType === 'individual' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Who bought this?
            </label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select...</option>
              {membersList.map(member => (
                <option key={member} value={member}>{member}</option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-teal-500 text-white py-2.5 rounded-md font-semibold hover:bg-teal-600 transition"
        >
          Add item
        </button>
      </form>
    </div>
  )
}