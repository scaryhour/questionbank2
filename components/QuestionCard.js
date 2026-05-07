import { useState } from 'react'
import styles from './QuestionCard.module.css'

const DIFFICULTY_LABEL = { easy: 'Easy', medium: 'Medium', hard: 'Hard' }
const LEVEL_SHORT = {
  'Form 1-3': 'Form 1–3',
  'SPM': 'SPM',
  'A-Level': 'A-Level',
  'University': 'University'
}

export default function QuestionCard({ question, answer, subject, level, difficulty, topic }) {
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className={styles.card}>
      <div className={styles.badges}>
        <span className={`${styles.badge} ${styles.subject}`}>{subject}</span>
        <span className={`${styles.badge} ${styles.level}`}>{LEVEL_SHORT[level] || level}</span>
        <span className={`${styles.badge} ${styles[difficulty]}`}>{DIFFICULTY_LABEL[difficulty] || difficulty}</span>
      </div>

      <p className={styles.question}>{question}</p>

      <div className={styles.footer}>
        <span className={styles.topic}>{topic}</span>
        <button
          className={styles.answerBtn}
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer ? 'Hide answer' : 'Show answer'}
        </button>
      </div>

      {showAnswer && (
        <div className={styles.answerBox}>
          <strong>Answer:</strong> {answer}
        </div>
      )}
    </div>
  )
}
