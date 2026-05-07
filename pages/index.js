import { useState, useCallback } from 'react'
import Head from 'next/head'
import QuestionCard from '../components/QuestionCard'
import styles from '../styles/Home.module.css'

const SUBJECTS = ['All', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Economics']
const LEVELS = ['All', 'Form 1-3', 'SPM', 'A-Level', 'University']
const DIFFICULTIES = ['All', 'easy', 'medium', 'hard']

export default function Home() {
  const [keyword, setKeyword] = useState('')
  const [subject, setSubject] = useState('All')
  const [level, setLevel] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState('')
  const [searched, setSearched] = useState(false)

  const search = useCallback(async () => {
    setLoading(true)
    setSearched(true)
    setStatus('Searching...')

    const params = new URLSearchParams()
    if (keyword) params.set('keyword', keyword)
    if (subject !== 'All') params.set('subject', subject)
    if (level !== 'All') params.set('level', level)
    if (difficulty !== 'All') params.set('difficulty', difficulty)

    const res = await fetch(`/api/search?${params}`)
    const data = await res.json()
    setQuestions(data.questions || [])
    setStatus(`${data.questions?.length || 0} questions found`)
    setLoading(false)
  }, [keyword, subject, level, difficulty])

  const generate = useCallback(async () => {
    if (!keyword) return
    setGenerating(true)
    setStatus('Generating new questions with AI...')

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keyword,
        subject: subject === 'All' ? 'Mathematics' : subject,
        level: level === 'All' ? 'SPM' : level
      })
    })
    const data = await res.json()

    if (data.questions) {
      setQuestions(prev => [...data.questions, ...prev])
      setStatus(`Generated ${data.questions.length} new questions`)
    } else {
      setStatus('Failed to generate. Please try again.')
    }
    setGenerating(false)
  }, [keyword, subject, level])

  const handleKey = (e) => { if (e.key === 'Enter') search() }

  return (
    <>
      <Head>
        <title>QuestionBank — Practice questions for Malaysian students</title>
        <meta name="description" content="Find and generate practice questions for SPM, A-Level, and university. Search by topic, subject, and level." />
      </Head>

      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.logo}>QuestionBank</div>
          <p className={styles.tagline}>Practice questions for every topic — Form 1 to University</p>
        </header>

        <main className={styles.main}>
          {/* Search bar */}
          <div className={styles.searchRow}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search topic, e.g. Newton's laws, quadratic equations, photosynthesis..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={handleKey}
            />
            <button className={styles.searchBtn} onClick={search} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Filters */}
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Subject</span>
              {SUBJECTS.map(s => (
                <button
                  key={s}
                  className={`${styles.filterBtn} ${subject === s ? styles.active : ''}`}
                  onClick={() => setSubject(s)}
                >{s}</button>
              ))}
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Level</span>
              {LEVELS.map(l => (
                <button
                  key={l}
                  className={`${styles.filterBtn} ${level === l ? styles.active : ''}`}
                  onClick={() => setLevel(l)}
                >{l}</button>
              ))}
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Difficulty</span>
              {DIFFICULTIES.map(d => (
                <button
                  key={d}
                  className={`${styles.filterBtn} ${difficulty === d ? styles.active : ''}`}
                  onClick={() => setDifficulty(d)}
                >{d === 'All' ? 'All' : d.charAt(0).toUpperCase() + d.slice(1)}</button>
              ))}
            </div>
          </div>

          {/* Status + Generate button */}
          {searched && (
            <div className={styles.statusRow}>
              <span className={styles.status}>{status}</span>
              <button
                className={styles.generateBtn}
                onClick={generate}
                disabled={generating || !keyword}
              >
                {generating ? 'Generating...' : '+ Generate with AI'}
              </button>
            </div>
          )}

          {/* Results */}
          {questions.length > 0 ? (
            <div className={styles.grid}>
              {questions.map((q, i) => (
                <QuestionCard key={q.id || i} {...q} />
              ))}
            </div>
          ) : searched && !loading ? (
            <div className={styles.empty}>
              <p>No questions found for this topic.</p>
              <button className={styles.generateBtn} onClick={generate} disabled={generating || !keyword}>
                {generating ? 'Generating...' : 'Generate questions with AI'}
              </button>
            </div>
          ) : !searched ? (
            <div className={styles.hero}>
              <div className={styles.heroGrid}>
                {[
                  { label: 'Newton\'s laws', subj: 'Physics', lvl: 'SPM' },
                  { label: 'Quadratic equations', subj: 'Mathematics', lvl: 'SPM' },
                  { label: 'Redox reactions', subj: 'Chemistry', lvl: 'A-Level' },
                  { label: 'Supply and demand', subj: 'Economics', lvl: 'University' },
                  { label: 'Photosynthesis', subj: 'Biology', lvl: 'Form 1-3' },
                  { label: 'Differentiation', subj: 'Mathematics', lvl: 'A-Level' },
                ].map(t => (
                  <button
                    key={t.label}
                    className={styles.topicChip}
                    onClick={() => {
                      setKeyword(t.label)
                      setSubject(t.subj)
                      setLevel(t.lvl)
                    }}
                  >
                    <span className={styles.chipLabel}>{t.label}</span>
                    <span className={styles.chipMeta}>{t.subj} · {t.lvl}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </>
  )
}
