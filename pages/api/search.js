import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { keyword, subject, level, difficulty } = req.query

  let query = supabase.from('questions').select('*').order('created_at', { ascending: false })

  if (keyword) query = query.ilike('topic', `%${keyword}%`)
  if (subject && subject !== 'all') query = query.eq('subject', subject)
  if (level && level !== 'all') query = query.eq('level', level)
  if (difficulty && difficulty !== 'all') query = query.eq('difficulty', difficulty)

  const { data, error } = await query.limit(50)

  if (error) return res.status(500).json({ error: error.message })
  return res.status(200).json({ questions: data || [] })
}
