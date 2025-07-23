'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, User, Send, BookOpen, Brain } from 'lucide-react'

interface VocabularyWord {
  id: string
  word: string
  meaning: string
  synonym: string
}

interface Idiom {
  id: string
  idiom: string
  meaning: string
}

interface PracticeEvaluation {
  grammar: string
  clarity: string
  usage: string
  suggestions: string
  score: number
}

export default function PracticePage() {
  const [practiceWords, setPracticeWords] = useState<VocabularyWord[]>([])
  const [practiceIdioms, setPracticeIdioms] = useState<Idiom[]>([])
  const [loading, setLoading] = useState(true)
  const [currentType, setCurrentType] = useState<'vocabulary' | 'idiom'>('vocabulary')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userSentence, setUserSentence] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<PracticeEvaluation | null>(null)
  const [completedCount, setCompletedCount] = useState(0)

  useEffect(() => {
    fetchPracticeData()
  }, [])

  const fetchPracticeData = async () => {
    try {
      setLoading(true)
      
      // Fetch vocabulary
      const vocabResponse = await fetch('/api/vocabulary')
      const vocabResult = await vocabResponse.json()
      
      // Fetch idioms
      const idiomResponse = await fetch('/api/idioms')
      const idiomResult = await idiomResponse.json()
      
      if (vocabResult.success && idiomResult.success) {
        // Take first 5 words and idioms for practice
        setPracticeWords(vocabResult.data.slice(0, 5))
        setPracticeIdioms(idiomResult.data.slice(0, 3))
      }
    } catch (err) {
      console.error('Error fetching practice data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitPractice = async () => {
    if (!userSentence.trim()) return

    setEvaluating(true)
    try {
      const currentItem = currentType === 'vocabulary' 
        ? practiceWords[currentIndex]
        : practiceIdioms[currentIndex]
      
      const targetWord = currentType === 'vocabulary' 
        ? (currentItem as VocabularyWord).word 
        : (currentItem as Idiom).idiom

      const response = await fetch('/api/practice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userSentence: userSentence.trim(),
          targetWord,
          type: currentType
        }),
      })
      
      const result = await response.json()
      if (result.success) {
        setEvaluation(result.data.evaluation)
        setCompletedCount(completedCount + 1)
      }
    } catch (err) {
      console.error('Error evaluating practice:', err)
    } finally {
      setEvaluating(false)
    }
  }

  const handleNext = () => {
    const maxIndex = currentType === 'vocabulary' 
      ? practiceWords.length - 1 
      : practiceIdioms.length - 1

    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1)
    } else if (currentType === 'vocabulary' && practiceIdioms.length > 0) {
      setCurrentType('idiom')
      setCurrentIndex(0)
    }
    
    setUserSentence('')
    setEvaluation(null)
  }

  const markCompleted = () => {
    const today = new Date().toISOString().split('T')[0]
    const progress = JSON.parse(localStorage.getItem(`progress-${today}`) || '{}')
    progress.practice = true
    localStorage.setItem(`progress-${today}`, JSON.stringify(progress))
  }

  const isLastItem = () => {
    if (currentType === 'vocabulary') {
      return currentIndex === practiceWords.length - 1 && practiceIdioms.length === 0
    }
    return currentIndex === practiceIdioms.length - 1
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreMessage = (score: number) => {
    if (score >= 8) return 'Excellent sentence!'
    if (score >= 6) return 'Good effort!'
    return 'Keep practicing!'
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading practice session...</p>
        </div>
      </div>
    )
  }

  if (practiceWords.length === 0 && practiceIdioms.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No practice content available.</p>
          <Link href="/" className="btn-primary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const totalItems = practiceWords.length + practiceIdioms.length
  const progressPercentage = (completedCount / totalItems) * 100
  const currentItem = currentType === 'vocabulary' 
    ? practiceWords[currentIndex]
    : practiceIdioms[currentIndex]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <ArrowLeft className="text-gray-600 hover:text-gray-800" size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Practice Writing</h1>
            <p className="text-gray-600">AI-evaluated sentence practice</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <User className="text-yellow-600" size={24} />
          <span className="text-lg font-semibold text-yellow-600">
            {completedCount}/{totalItems}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
        <div 
          className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      {/* Practice Card */}
      <div className="card mb-8">
        {/* Type Indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            {currentType === 'vocabulary' ? (
              <>
                <BookOpen className="text-blue-600" size={20} />
                <span className="text-blue-600 font-medium">Vocabulary Practice</span>
              </>
            ) : (
              <>
                <Brain className="text-purple-600" size={20} />
                <span className="text-purple-600 font-medium">Idiom Practice</span>
              </>
            )}
          </div>
          <span className="text-sm text-gray-700">
            {currentType === 'vocabulary' ? currentIndex + 1 : practiceWords.length + currentIndex + 1} of {totalItems}
          </span>
        </div>

        {/* Current Item Display */}
        <div className="mb-6">
          {currentType === 'vocabulary' ? (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {(currentItem as VocabularyWord).word}
              </h3>
              <p className="text-gray-600 mb-2">
                <span className="font-medium">Meaning:</span> {(currentItem as VocabularyWord).meaning}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Synonym:</span> {(currentItem as VocabularyWord).synonym}
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                "{(currentItem as Idiom).idiom}"
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">Meaning:</span> {(currentItem as Idiom).meaning}
              </p>
            </div>
          )}
        </div>

        {/* Writing Area */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Write a sentence using {currentType === 'vocabulary' ? 'this word' : 'this idiom'}:
          </label>
          <textarea
            value={userSentence}
            onChange={(e) => setUserSentence(e.target.value)}
            placeholder={`Write a meaningful sentence using "${
              currentType === 'vocabulary' 
                ? (currentItem as VocabularyWord).word 
                : (currentItem as Idiom).idiom
            }"...`}
            className="input-field resize-none"
            rows={4}
            disabled={evaluating}
          />
        </div>

        {/* Evaluation Display */}
        {evaluation && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
              AI Evaluation 
              <span className={`ml-2 text-2xl font-bold ${getScoreColor(evaluation.score)}`}>
                {evaluation.score}/10
              </span>
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Grammar</p>
                <p className="text-sm text-gray-800">{evaluation.grammar}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Clarity</p>
                <p className="text-sm text-gray-800">{evaluation.clarity}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Usage</p>
                <p className="text-sm text-gray-800">{evaluation.usage}</p>
              </div>
            </div>
            
            {evaluation.suggestions && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Suggestions</p>
                <p className="text-sm text-gray-800">{evaluation.suggestions}</p>
              </div>
            )}
            
            <p className={`text-center mt-4 font-medium ${getScoreColor(evaluation.score)}`}>
              {getScoreMessage(evaluation.score)}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-700">
            {completedCount} of {totalItems} completed
          </div>
          
          <div className="space-x-3">
            {!evaluation ? (
              <button
                onClick={handleSubmitPractice}
                disabled={!userSentence.trim() || evaluating}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {evaluating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Submit for Review
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn-primary"
              >
                {isLastItem() ? 'Complete Practice' : 'Next Item'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Completion Message */}
      {completedCount === totalItems && (
        <div className="card bg-yellow-50 border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            🎉 Practice Session Complete!
          </h3>
          <p className="text-yellow-700 mb-4">
            Great job! You've completed all practice exercises for today.
          </p>
          <div className="space-x-4">
            <Link href="/progress" className="btn-primary">
              View Progress
            </Link>
            <button
              onClick={markCompleted}
              className="btn-secondary"
            >
              Mark as Complete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
