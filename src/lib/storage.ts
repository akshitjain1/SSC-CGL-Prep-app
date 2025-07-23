import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export interface VocabularyWord {
  id: string
  word: string
  meaning: string
  synonym: string
  example: string
  field: string
  userExample?: string
  learned: boolean
  difficult: boolean
  dateAdded: string
}

export interface Idiom {
  id: string
  idiom: string
  meaning: string
  example: string
  context: string
  userSentence?: string
  practiced: boolean
  dateAdded: string
}

export interface GKQuestion {
  id: string
  question: string
  options: string[]
  correct: string
  explanation: string
  topic: string
  userAnswer?: string
  answeredCorrectly?: boolean
  dateAdded: string
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  url?: string
  dateAdded: string
}

export interface UserProgress {
  date: string
  vocabularyCompleted: boolean
  idiomsCompleted: boolean
  newsCompleted: boolean
  practiceCompleted: boolean
  wordsLearned: number
  practiceScore: number
}

export interface PracticeSession {
  id: string
  type: 'vocabulary' | 'idiom'
  targetWord: string
  userSentence: string
  evaluation: any
  score: number
  date: string
}

// Generic file operations
export function readJSONFile<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename)
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
    return []
  } catch (error) {
    console.error(`Error reading ${filename}:`, error)
    return []
  }
}

export function writeJSONFile<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename)
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
  } catch (error) {
    console.error(`Error writing ${filename}:`, error)
    throw error
  }
}

// Vocabulary operations
export function getVocabulary(): VocabularyWord[] {
  return readJSONFile<VocabularyWord>('vocabulary.json')
}

export function saveVocabulary(words: VocabularyWord[]): void {
  writeJSONFile('vocabulary.json', words)
}

export function getTodaysVocabulary(): VocabularyWord[] {
  const today = new Date().toISOString().split('T')[0]
  const allWords = getVocabulary()
  return allWords.filter(word => word.dateAdded === today)
}

// Idioms operations
export function getIdioms(): Idiom[] {
  return readJSONFile<Idiom>('idioms.json')
}

export function saveIdioms(idioms: Idiom[]): void {
  writeJSONFile('idioms.json', idioms)
}

export function getTodaysIdioms(): Idiom[] {
  const today = new Date().toISOString().split('T')[0]
  const allIdioms = getIdioms()
  return allIdioms.filter(idiom => idiom.dateAdded === today)
}

// GK Questions operations
export function getGKQuestions(): GKQuestion[] {
  return readJSONFile<GKQuestion>('gk-questions.json')
}

export function saveGKQuestions(questions: GKQuestion[]): void {
  writeJSONFile('gk-questions.json', questions)
}

export function getTodaysGKQuestions(): GKQuestion[] {
  const today = new Date().toISOString().split('T')[0]
  const allQuestions = getGKQuestions()
  return allQuestions.filter(question => question.dateAdded === today)
}

// News operations
export function getNews(): NewsItem[] {
  return readJSONFile<NewsItem>('news.json')
}

export function saveNews(news: NewsItem[]): void {
  writeJSONFile('news.json', news)
}

export function getTodaysNews(): NewsItem[] {
  const today = new Date().toISOString().split('T')[0]
  const allNews = getNews()
  return allNews.filter(item => item.dateAdded === today)
}

// Progress operations
export function getUserProgress(): UserProgress[] {
  return readJSONFile<UserProgress>('user-progress.json')
}

export function saveUserProgress(progress: UserProgress[]): void {
  writeJSONFile('user-progress.json', progress)
}

export function getTodaysProgress(): UserProgress | null {
  const today = new Date().toISOString().split('T')[0]
  const allProgress = getUserProgress()
  return allProgress.find(p => p.date === today) || null
}

export function updateTodaysProgress(updates: Partial<UserProgress>): void {
  const today = new Date().toISOString().split('T')[0]
  const allProgress = getUserProgress()
  const todayIndex = allProgress.findIndex(p => p.date === today)
  
  if (todayIndex >= 0) {
    allProgress[todayIndex] = { ...allProgress[todayIndex], ...updates }
  } else {
    allProgress.push({
      date: today,
      vocabularyCompleted: false,
      idiomsCompleted: false,
      newsCompleted: false,
      practiceCompleted: false,
      wordsLearned: 0,
      practiceScore: 0,
      ...updates
    })
  }
  
  saveUserProgress(allProgress)
}

// Practice sessions
export function getPracticeSessions(): PracticeSession[] {
  return readJSONFile<PracticeSession>('practice-sessions.json')
}

export function savePracticeSessions(sessions: PracticeSession[]): void {
  writeJSONFile('practice-sessions.json', sessions)
}

// Utility functions
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isToday(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateString === today
}
