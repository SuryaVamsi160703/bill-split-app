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
  paidBy: string
  groupMembers: string[]
}

type Settlement = {
  from: string
  to: string
  amount: number
}

export default function SplitCalculator({ items, paidBy, groupMembers }: Props) {
  if (items.length === 0 || !paidBy) {
    return null
  }

  // Calculate what each person consumed
  const calculateOwedAmounts = (): Record<string, number> => {
    const owedAmounts: Record<string, number> = {}
    
    groupMembers.forEach(member => {
      owedAmounts[member] = 0
    })

    items.forEach(item => {
      if (item.splitType === 'shared' && item.sharedWith && item.sharedWith.length > 0) {
        const perPersonCost = item.price / item.sharedWith.length
        item.sharedWith.forEach(member => {
          if (owedAmounts.hasOwnProperty(member)) {
            owedAmounts[member] += perPersonCost
          }
        })
      } else if (item.splitType === 'individual' && item.assignedTo) {
        if (owedAmounts.hasOwnProperty(item.assignedTo)) {
          owedAmounts[item.assignedTo] += item.price
        }
      }
    })

    return owedAmounts
  }

  // Simplified settlement: Everyone pays the payer their share
  const calculateSettlements = (): Settlement[] => {
    const owedAmounts = calculateOwedAmounts()
    const settlements: Settlement[] = []

    groupMembers.forEach(member => {
      if (member !== paidBy && owedAmounts[member] > 0) {
        settlements.push({
          from: member,
          to: paidBy,
          amount: owedAmounts[member]
        })
      }
    })

    return settlements
  }

  const owedAmounts = calculateOwedAmounts()
  const settlements = calculateSettlements()

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Settlement</h2>
      
      {/* Each person's share */}
      <div className="mb-5">
        <div className="space-y-2">
          {groupMembers.map(member => (
            <div key={member} className={`flex justify-between items-center p-3 rounded-md ${
              member === paidBy ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50'
            }`}>
              <span className="text-sm font-medium text-gray-900">
                {member} {member === paidBy && <span className="text-xs text-teal-600">(paid)</span>}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                £{owedAmounts[member]?.toFixed(2) || '0.00'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Who owes whom */}
      {settlements.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Payments
          </p>
          <div className="space-y-2">
            {settlements.map((settlement, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-md border border-orange-200">
                <div className="text-sm">
                  <span className="font-semibold text-gray-900">{settlement.from}</span>
                  <span className="text-gray-500 mx-1">→</span>
                  <span className="font-semibold text-gray-900">{settlement.to}</span>
                </div>
                <span className="text-base font-bold text-orange-600">
                  £{settlement.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}