import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '../../lib/supabase'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { keyword, subject, level } = req.body
  if (!keyword || !subject || !level) {
    return res.status(400).json({ error: 'Missing fields' })
  }

  const { data: existing } = await supabase
    .from('questions')
    .select('*')
    .eq('subject', subject)
    .eq('level', level)
    .ilike('topic', `%${keyword}%`)
    .limit(10)

  if (existing && existing.length >= 5) {
    return res.status(200).json({ questions: existing, source: 'database' })
  }

  const prompt = `Generate exactly 5 exam-style practice questions for:
Subject: ${subject}
Level: ${level}
Topic: ${keyword}

Return ONLY a valid JSON array, no markdown, no explanation, no backticks:
[
  {"question": "question text", "answer": "detailed worked answer", "difficulty": "easy"},
  {"question": "question text", "answer": "detailed worked answer", "difficulty": "easy"},
  {"question": "question text", "answer": "detailed worked answer", "difficulty": "medium"},
  {"question": "question text", "answer": "detailed worked answer", "difficulty": "medium"},
  {"question": "question text", "answer": "detailed worked answer", "difficulty": "hard"}
]

difficulty must be exactly: easy, medium, or hard
Be specific to ${level} curriculum standards.`

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const cleaned = text.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim()
    const generated = JSON.parse(cleaned)

    const rows = generated.map(q => ({
      subject,
      level,
      topic: keyword,
      question: q.question,
      answer: q.answer,
      difficulty: q.difficulty || 'medium',
      source: 'ai'
    }))

    const { data: saved, error } = await supabase
      .from('questions')
      .insert(rows)
      .select()

    if (error) {
      return res.status(200).json({ questions: rows, source: 'ai' })
    }

    return res.status(200).json({ questions: saved, source: 'ai' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to generate questions' })
  }
}
