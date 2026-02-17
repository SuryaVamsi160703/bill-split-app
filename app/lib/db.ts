import { supabase } from './supabase'
import { Expense } from '../page'

export const saveSession = async (
  sessionId: string,
  groupMembers: string[],
  expenses: Expense[]
) => {
  // Upsert session
  await supabase.from('sessions').upsert({
    id: sessionId,
    group_members: groupMembers,
    updated_at: new Date().toISOString()
  })

  // Delete old expenses
  await supabase.from('expenses').delete().eq('session_id', sessionId)

  // Insert new expenses
  if (expenses.length > 0) {
    await supabase.from('expenses').insert(
      expenses.map(exp => ({
        id: exp.id,
        session_id: sessionId,
        description: exp.description,
        amount: exp.amount,
        paid_by: exp.paidBy,
        split_between: exp.splitBetween,
        date: exp.date.toISOString()
      }))
    )
  }
}

export const loadSession = async (sessionId: string) => {
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) return null

  const { data: expenses } = await supabase
    .from('expenses')
    .select('*')
    .eq('session_id', sessionId)
    .order('date', { ascending: true })

  return {
    groupMembers: session.group_members,
    expenses: (expenses || []).map((exp: any) => ({
      id: exp.id,
      description: exp.description,
      amount: parseFloat(exp.amount),
      paidBy: exp.paid_by,
      splitBetween: exp.split_between,
      date: new Date(exp.date)
    }))
  }
}