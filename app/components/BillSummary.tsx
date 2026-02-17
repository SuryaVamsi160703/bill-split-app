'use client'

type Item = {
  id: string
  name: string
  price: number
  splitType: 'individual' | 'shared'
  assignedTo?: string
  splitAmong?: number
  sharedWith?: string[]
}

type Props = {
  items: Item[]
  onRemove: (id: string) => void
}

export default function BillSummary({ items, onRemove }: Props) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-4 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Items</h2>
      
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <div className="flex-1">
              <p className="font-medium text-gray-900">{item.name}</p>
              <p className="text-xs text-gray-500">
                {item.splitType === 'shared' && item.sharedWith
                  ? item.sharedWith.join(', ')
                  : item.assignedTo}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-gray-900">£{item.price.toFixed(2)}</span>
              <button
                onClick={() => onRemove(item.id)}
                className="text-gray-400 hover:text-red-500 text-lg"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}