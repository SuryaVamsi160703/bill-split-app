'use client'

import { Expense } from '../page'
import * as XLSX from 'xlsx'

type Props = {
  expenses: Expense[]
  groupMembers: string[]
  dark: boolean
}

type DebtGroup = {
  to: string
  totalAmount: number
  breakdown: { for: string; amount: number }[]
}

type PersonOwes = {
  person: string
  debtGroups: DebtGroup[]
  totalOwes: number
}

export default function ExportButtons({ expenses, groupMembers, dark }: Props) {

  const calculateDebts = (): PersonOwes[] => {
    const personDebts: Record<string, Record<string, DebtGroup>> = {}
    groupMembers.forEach(member => { personDebts[member] = {} })

    expenses.forEach(expense => {
      const perPersonShare = expense.amount / expense.splitBetween.length
      expense.splitBetween.forEach(person => {
        if (person !== expense.paidBy) {
          if (personDebts[person][expense.paidBy]) {
            personDebts[person][expense.paidBy].totalAmount += perPersonShare
            personDebts[person][expense.paidBy].breakdown.push({ for: expense.description, amount: perPersonShare })
          } else {
            personDebts[person][expense.paidBy] = {
              to: expense.paidBy,
              totalAmount: perPersonShare,
              breakdown: [{ for: expense.description, amount: perPersonShare }]
            }
          }
        }
      })
    })

    return Object.entries(personDebts)
      .map(([person, debts]) => {
        const debtGroups = Object.values(debts)
        const totalOwes = debtGroups.reduce((sum, d) => sum + d.totalAmount, 0)
        return { person, debtGroups, totalOwes }
      })
      .filter(p => p.debtGroups.length > 0)
  }

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new()

    // Sheet 1: All Expenses
    const expenseRows = [
      ['GROCERY BILL SPLITTER - EXPENSE SUMMARY'],
      ['Generated:', new Date().toLocaleDateString()],
      [''],
      ['#', 'Description', 'Amount (£)', 'Paid By', 'Split Between', 'Per Person (£)']
    ]

    expenses.forEach((exp, i) => {
      expenseRows.push([
        String(i + 1),
        exp.description,
        exp.amount.toFixed(2),
        exp.paidBy,
        exp.splitBetween.join(', '),
        (exp.amount / exp.splitBetween.length).toFixed(2)
      ])
    })

    expenseRows.push([''])
    expenseRows.push(['TOTAL', '', expenses.reduce((s, e) => s + e.amount, 0).toFixed(2)])

    const ws1 = XLSX.utils.aoa_to_sheet(expenseRows)
    ws1['!cols'] = [{ wch: 5 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 30 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, ws1, 'Expenses')

    // Sheet 2: Settlement
    const debts = calculateDebts()
    const settlementRows = [
      ['SETTLEMENT SUMMARY'],
      [''],
      ['Person', 'Pay To', 'For', 'Amount (£)', 'Total Owed (£)']
    ]

    debts.forEach(({ person, debtGroups, totalOwes }) => {
      debtGroups.forEach((debt, i) => {
        debt.breakdown.forEach((item, j) => {
          settlementRows.push([
            j === 0 && i === 0 ? person : '',
            j === 0 ? debt.to : '',
            item.for,
            item.amount.toFixed(2),
            j === 0 && i === 0 ? totalOwes.toFixed(2) : ''
          ])
        })
      })
      settlementRows.push([''])
    })

    const ws2 = XLSX.utils.aoa_to_sheet(settlementRows)
    ws2['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 12 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, ws2, 'Settlement')

    // Sheet 3: Per Person Summary
    const balances: Record<string, { paid: number; owes: number }> = {}
    groupMembers.forEach(m => { balances[m] = { paid: 0, owes: 0 } })

    expenses.forEach(exp => {
      balances[exp.paidBy].paid += exp.amount
      const share = exp.amount / exp.splitBetween.length
      exp.splitBetween.forEach(m => { balances[m].owes += share })
    })

    const summaryRows = [
      ['PER PERSON SUMMARY'],
      [''],
      ['Person', 'Total Paid (£)', 'Total Share (£)', 'Balance (£)', 'Status']
    ]

    groupMembers.forEach(member => {
      const bal = balances[member]
      const net = bal.paid - bal.owes
      summaryRows.push([
        member,
        bal.paid.toFixed(2),
        bal.owes.toFixed(2),
        net.toFixed(2),
        net > 0.01 ? 'Gets Back' : net < -0.01 ? 'Owes' : 'Settled'
      ])
    })

    const ws3 = XLSX.utils.aoa_to_sheet(summaryRows)
    ws3['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }]
    XLSX.utils.book_append_sheet(wb, ws3, 'Summary')

    XLSX.writeFile(wb, `bill-split-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const exportToPDF = () => {
    const debts = calculateDebts()
    const total = expenses.reduce((s, e) => s + e.amount, 0)

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill Split Summary</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
          h1 { color: #059669; border-bottom: 3px solid #059669; padding-bottom: 10px; }
          h2 { color: #047857; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { background: #059669; color: white; padding: 10px; text-align: left; }
          td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) { background: #f0fdf4; }
          .total { font-size: 24px; font-weight: bold; color: #059669; }
          .settlement-card { border: 2px solid #d1fae5; border-radius: 10px; margin: 15px 0; overflow: hidden; }
          .settlement-header { background: #059669; color: white; padding: 12px 15px; display: flex; justify-content: space-between; }
          .settlement-body { padding: 10px 15px; }
          .debt-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
          .date { color: #6b7280; font-size: 14px; }
          .positive { color: #059669; font-weight: bold; }
          .negative { color: #dc2626; font-weight: bold; }
        </style>
      </head>
      <body>
        <h1>💰 Bill Splitter Summary</h1>
        <p class="date">Generated: ${new Date().toLocaleString()}</p>
        <p class="date">Group: ${groupMembers.join(', ')}</p>
        <p class="total">Total Expenses: £${total.toFixed(2)}</p>

        <h2>📋 All Expenses</h2>
        <table>
          <tr>
            <th>#</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Paid By</th>
            <th>Split Between</th>
            <th>Per Person</th>
          </tr>
          ${expenses.map((exp, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>${exp.description}</td>
              <td>£${exp.amount.toFixed(2)}</td>
              <td>${exp.paidBy}</td>
              <td>${exp.splitBetween.join(', ')}</td>
              <td>£${(exp.amount / exp.splitBetween.length).toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>

        <h2>💸 Settlement - Who Owes What</h2>
        ${debts.map(({ person, debtGroups, totalOwes }) => `
          <div class="settlement-card">
            <div class="settlement-header">
              <strong style="font-size:18px">${person}</strong>
              <strong style="font-size:18px">Total: £${totalOwes.toFixed(2)}</strong>
            </div>
            <div class="settlement-body">
              ${debtGroups.map(debt => `
                <p><strong>→ Pay ${debt.to}: £${debt.totalAmount.toFixed(2)}</strong></p>
                ${debt.breakdown.map(b => `
                  <div class="debt-row">
                    <span style="color:#6b7280">• for ${b.for}</span>
                    <span>£${b.amount.toFixed(2)}</span>
                  </div>
                `).join('')}
                <br/>
              `).join('')}
            </div>
          </div>
        `).join('')}

        <h2>📊 Balance Summary</h2>
        <table>
          <tr>
            <th>Person</th>
            <th>Total Paid</th>
            <th>Total Share</th>
            <th>Balance</th>
            <th>Status</th>
          </tr>
          ${(() => {
            const balances: Record<string, { paid: number; owes: number }> = {}
            groupMembers.forEach(m => { balances[m] = { paid: 0, owes: 0 } })
            expenses.forEach(exp => {
              balances[exp.paidBy].paid += exp.amount
              const share = exp.amount / exp.splitBetween.length
              exp.splitBetween.forEach(m => { balances[m].owes += share })
            })
            return groupMembers.map(member => {
              const bal = balances[member]
              const net = bal.paid - bal.owes
              return `
                <tr>
                  <td><strong>${member}</strong></td>
                  <td>£${bal.paid.toFixed(2)}</td>
                  <td>£${bal.owes.toFixed(2)}</td>
                  <td class="${net > 0.01 ? 'positive' : net < -0.01 ? 'negative' : ''}">
                    ${net > 0.01 ? '+' : ''}£${net.toFixed(2)}
                  </td>
                  <td>${net > 0.01 ? '✅ Gets Back' : net < -0.01 ? '❌ Owes' : '✓ Settled'}</td>
                </tr>
              `
            }).join('')
          })()}
        </table>
      </body>
      </html>
    `

    const win = window.open('', '_blank')
    if (win) {
      win.document.write(html)
      win.document.close()
      win.print()
    }
  }

  return (
    <div className={`flex gap-3 flex-wrap`}>
      <button
        onClick={exportToExcel}
        className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition shadow-md hover:shadow-lg"
      >
        📊 Export Excel
      </button>
      <button
        onClick={exportToPDF}
        className="flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition shadow-md hover:shadow-lg"
      >
        📄 Export PDF
      </button>
    </div>
  )
}