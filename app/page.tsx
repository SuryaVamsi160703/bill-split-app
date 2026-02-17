'use client'

import { useState, useEffect, useCallback } from 'react'
import AddExpense from './components/AddExpense'
import ExpenseList from './components/ExpenseList'
import ClearSettlement from './components/ClearSettlement'
import ExportButtons from './components/ExportButtons'
import { saveSession, loadSession } from './lib/db'

export type Expense = {
  id: string
  description: string
  amount: number
  paidBy: string
  splitBetween: string[]
  date: Date
}

const generateSessionId = () => Math.random().toString(36).substring(2, 8).toUpperCase()

export default function Home() {
  const [groupMembers, setGroupMembers] = useState<string[]>([])
  const [memberInput, setMemberInput] = useState('')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [darkMode, setDarkMode] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [loadCode, setLoadCode] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('unsaved')

  // Load dark mode preference
  useEffect(() => {
    const saved = localStorage.getItem('darkMode')
    if (saved === 'true') setDarkMode(true)
  }, [])

  // Auto-save whenever expenses change
  useEffect(() => {
    if (sessionId && groupMembers.length > 0) {
      setSaveStatus('saving')
      const timer = setTimeout(async () => {
        await saveSession(sessionId, groupMembers, expenses)
        setSaveStatus('saved')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [expenses, sessionId, groupMembers])

  const toggleDark = () => {
    setDarkMode(!darkMode)
    localStorage.setItem('darkMode', String(!darkMode))
  }

  const addMember = () => {
    const names = memberInput.split(',').map(n => n.trim()).filter(n => n !== '')
    const newSessionId = generateSessionId()
    setGroupMembers(names)
    setSessionId(newSessionId)
  }

  const handleLoadSession = async () => {
    if (!loadCode.trim()) return
    const data = await loadSession(loadCode.toUpperCase())
    if (data) {
      setGroupMembers(data.groupMembers)
      setExpenses(data.expenses)
      setSessionId(loadCode.toUpperCase())
      setSaveStatus('saved')
    } else {
      alert('Session not found! Check your code.')
    }
  }

  const addExpense = (expense: Omit<Expense, 'id' | 'date'>) => {
    setExpenses([...expenses, {
      ...expense,
      id: Date.now().toString(),
      date: new Date()
    }])
    setSaveStatus('unsaved')
  }

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
    setSaveStatus('unsaved')
  }

  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const dark = darkMode

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      dark ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50'
    }`}>
      {/* Header */}
      <div className={`shadow-sm border-b sticky top-0 z-50 ${
        dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
              💰 Bill Splitter
            </h1>
            {sessionId && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Code: <span className="font-bold text-emerald-500">{sessionId}</span>
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  saveStatus === 'saved' 
                    ? 'bg-green-100 text-green-700'
                    : saveStatus === 'saving'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'saving' ? '...' : 'Unsaved'}
                </span>
              </div>
            )}
          </div>
          <button onClick={toggleDark} className={`p-2.5 rounded-xl text-xl transition-all ${
            dark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
          }`}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {groupMembers.length === 0 ? (
          <div className={`rounded-xl shadow-sm p-6 border ${
            dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-lg font-semibold mb-6 ${dark ? 'text-white' : 'text-gray-900'}`}>
              Setup your group
            </h2>

            {/* New Group */}
            <div className="mb-6">
              <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                Enter names (comma separated)
              </label>
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                placeholder="e.g., John, Sarah, Mike"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 ${
                  dark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'
                }`}
                onKeyPress={(e) => e.key === 'Enter' && addMember()}
              />
              <button
                onClick={addMember}
                disabled={!memberInput.trim()}
                className="mt-3 w-full bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-400 transition"
              >
                Create New Group
              </button>
            </div>

            {/* Load Existing */}
            <div className={`pt-6 border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
              <label className={`block text-sm font-medium mb-2 ${dark ? 'text-gray-300' : 'text-gray-700'}`}>
                Load existing session
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={loadCode}
                  onChange={(e) => setLoadCode(e.target.value.toUpperCase())}
                  placeholder="Enter session code"
                  maxLength={6}
                  className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-lg tracking-widest ${
                    dark ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={handleLoadSession}
                  disabled={!loadCode.trim()}
                  className="px-5 py-3 bg-teal-500 text-white rounded-lg font-semibold hover:bg-teal-600 disabled:bg-gray-400 transition"
                >
                  Load
                </button>
              </div>
              <p className={`text-xs mt-2 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
                Share your session code with friends so they can view the split
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Group Header */}
            <div className={`rounded-xl shadow-sm p-4 mb-4 border ${
              dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${dark ? 'text-gray-400' : 'text-gray-600'}`}>Group:</span>
                  {groupMembers.map((member, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-500 text-white rounded-full text-sm font-medium">
                      {member}
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total: <span className="font-bold text-emerald-500">£{totalAmount.toFixed(2)}</span>
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Reset? All expenses will be deleted.')) {
                        setGroupMembers([])
                        setExpenses([])
                        setMemberInput('')
                        setSessionId('')
                        setSaveStatus('unsaved')
                      }
                    }}
                    className="text-sm text-red-500 hover:text-red-400 font-medium"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <AddExpense groupMembers={groupMembers} onAdd={addExpense} dark={dark} />
            <ExpenseList expenses={expenses} onDelete={deleteExpense} dark={dark} />

            {expenses.length > 0 && (
              <>
                <ClearSettlement expenses={expenses} groupMembers={groupMembers} dark={dark} />

                {/* Export Buttons */}
                <div className={`rounded-xl shadow-sm p-5 border mb-4 ${
                  dark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <h3 className={`text-lg font-semibold mb-4 ${dark ? 'text-white' : 'text-gray-900'}`}>
                    Export Summary
                  </h3>
                  <ExportButtons expenses={expenses} groupMembers={groupMembers} dark={dark} />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}