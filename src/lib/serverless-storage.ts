// Serverless-compatible storage that doesn't use file system operations
// Data is stored in memory and regenerated fresh each time

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

export interface GKFact {
  id: string
  title: string
  description: string
  category: string
  importance: 'high' | 'medium' | 'low'
  dateAdded: string
  tags: string[]
  source?: string
  learned: boolean
  difficulty: 'easy' | 'medium' | 'hard'
  relatedTopics?: string[]
}

// In-memory storage (resets on each serverless function call)
const inMemoryStorage = {
  vocabulary: [] as VocabularyWord[],
  idioms: [] as Idiom[],
  gkQuestions: [] as GKQuestion[],
  news: [] as NewsItem[],
  userProgress: [] as UserProgress[],
  practiceSessions: [] as PracticeSession[],
  gkFacts: [] as GKFact[]
}

// Utility functions
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isToday(dateString: string): boolean {
  const today = new Date().toISOString().split('T')[0]
  return dateString === today
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// Vocabulary operations
export function getVocabulary(): VocabularyWord[] {
  return inMemoryStorage.vocabulary
}

export function saveVocabulary(words: VocabularyWord[]): void {
  inMemoryStorage.vocabulary = words
}

export function getTodaysVocabulary(): VocabularyWord[] {
  const today = getTodayString()
  return inMemoryStorage.vocabulary.filter(word => word.dateAdded === today)
}

export function addVocabularyWords(words: VocabularyWord[]): void {
  inMemoryStorage.vocabulary.push(...words)
}

// Idioms operations
export function getIdioms(): Idiom[] {
  return inMemoryStorage.idioms
}

export function saveIdioms(idioms: Idiom[]): void {
  inMemoryStorage.idioms = idioms
}

export function getTodaysIdioms(): Idiom[] {
  const today = getTodayString()
  return inMemoryStorage.idioms.filter(idiom => idiom.dateAdded === today)
}

export function addIdioms(idioms: Idiom[]): void {
  inMemoryStorage.idioms.push(...idioms)
}

// GK Questions operations
export function getGKQuestions(): GKQuestion[] {
  return inMemoryStorage.gkQuestions
}

export function saveGKQuestions(questions: GKQuestion[]): void {
  inMemoryStorage.gkQuestions = questions
}

export function getTodaysGKQuestions(): GKQuestion[] {
  const today = getTodayString()
  return inMemoryStorage.gkQuestions.filter(question => question.dateAdded === today)
}

// News operations
export function getNews(): NewsItem[] {
  return inMemoryStorage.news
}

export function saveNews(news: NewsItem[]): void {
  inMemoryStorage.news = news
}

export function getTodaysNews(): NewsItem[] {
  const today = getTodayString()
  return inMemoryStorage.news.filter(item => item.dateAdded === today)
}

export function addNews(news: NewsItem[]): void {
  inMemoryStorage.news.push(...news)
}

// GK Facts operations
export function getGKFacts(): GKFact[] {
  return inMemoryStorage.gkFacts
}

export function saveGKFacts(facts: GKFact[]): void {
  inMemoryStorage.gkFacts = facts
}

export function getTodaysGKFacts(): GKFact[] {
  const today = getTodayString()
  return inMemoryStorage.gkFacts.filter(fact => fact.dateAdded === today)
}

export function addGKFacts(facts: GKFact[]): void {
  inMemoryStorage.gkFacts.push(...facts)
}

// Progress operations (these can be simplified since data doesn't persist)
export function getUserProgress(): UserProgress[] {
  return inMemoryStorage.userProgress
}

export function saveUserProgress(progress: UserProgress[]): void {
  inMemoryStorage.userProgress = progress
}

export function getTodaysProgress(): UserProgress | null {
  const today = getTodayString()
  return inMemoryStorage.userProgress.find(p => p.date === today) || null
}

export function updateTodaysProgress(updates: Partial<UserProgress>): void {
  const today = getTodayString()
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
  return inMemoryStorage.practiceSessions
}

export function savePracticeSessions(sessions: PracticeSession[]): void {
  inMemoryStorage.practiceSessions = sessions
}

export function addPracticeSession(session: PracticeSession): void {
  inMemoryStorage.practiceSessions.push(session)
}

// For backwards compatibility, export all the same functions that the old storage.ts had
export {
  // Re-export interfaces
  type VocabularyWord as VocabularyWordType,
  type Idiom as IdiomType,
  type GKQuestion as GKQuestionType,
  type NewsItem as NewsItemType,
  type UserProgress as UserProgressType,
  type PracticeSession as PracticeSessionType,
  type GKFact as GKFactType
}
