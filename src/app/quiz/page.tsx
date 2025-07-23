'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Target, 
  Check, 
  X, 
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Award,
  Brain,
  Clock,
  Star,
  RefreshCw,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Zap,
  Trophy,
  BookOpen,
  Users,
  Play,
  Pause
} from 'lucide-react'
import ProgressManager from '@/lib/progressManager'

interface GKQuestion {
  id: string
  question: string
  options: string[]
  correct: string
  explanation: string
  topic: string
  userAnswer?: string
  answeredCorrectly?: boolean
  dateAdded: string
  difficulty?: 'easy' | 'medium' | 'hard'
  timeSpent?: number
}

interface QuizResult {
  correct: boolean
  correctAnswer: string
  explanation: string
  score: number
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<GKQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [score, setScore] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [sessionCompleted, setSessionCompleted] = useState(false)

  const progressManager = ProgressManager.getInstance()

  useEffect(() => {
    fetchQuestions()
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning && !quizCompleted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning, quizCompleted])

  useEffect(() => {
    if (questions.length > 0 && !isTimerRunning) {
      setIsTimerRunning(true)
    }
  }, [questions])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/quiz')
      const result = await response.json()
      
      if (result.success) {
        setQuestions(result.data)
      } else {
        setError(result.message || 'Failed to load quiz questions')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer) return

    setSubmitted(true)
    setIsTimerRunning(false)

    const currentQuestion = questions[currentQuestionIndex]
    if (!currentQuestion) return
    
    const isCorrect = selectedAnswer === currentQuestion.correct

    if (isCorrect) {
      setScore(prev => prev + 1)
      showCorrectAnimation()
    } else {
      showIncorrectAnimation()
    }

    setResult({
      correct: isCorrect,
      correctAnswer: currentQuestion.correct,
      explanation: currentQuestion.explanation,
      score: Math.round(((score + (isCorrect ? 1 : 0)) / questions.length) * 100)
    })

    // Update question with user answer
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: selectedAnswer,
      answeredCorrectly: isCorrect,
      timeSpent: timeElapsed
    }
    setQuestions(updatedQuestions)

    // Save progress
    try {
      await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          userAnswer: selectedAnswer,
          isCorrect,
          timeSpent: timeElapsed
        })
      })
    } catch (err) {
      console.error('Error saving quiz progress:', err)
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 >= questions.length) {
      finishQuiz()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer('')
      setSubmitted(false)
      setResult(null)
      setTimeElapsed(0)
      setIsTimerRunning(true)
    }
  }

  const finishQuiz = () => {
    setQuizCompleted(true)
    setIsTimerRunning(false)
    
    const finalScore = Math.round((score / questions.length) * 100)
    const isCompleted = finalScore >= 70 // 70% completion threshold
    
    if (isCompleted && !sessionCompleted) {
      progressManager.updateTaskCompletion('quiz', true, { score: finalScore })
      setSessionCompleted(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestionIndex(0)
    setSelectedAnswer('')
    setSubmitted(false)
    setResult(null)
    setQuizCompleted(false)
    setScore(0)
    setTimeElapsed(0)
    setIsTimerRunning(false)
    setQuestions(questions.map(q => ({
      ...q,
      userAnswer: undefined,
      answeredCorrectly: undefined,
      timeSpent: undefined
    })))
  }

  const showCorrectAnimation = () => {
    const celebration = document.createElement('div')
    celebration.innerHTML = '✅'
    celebration.style.cssText = `
      position: fixed;
      top: 20%;
      right: 20px;
      font-size: 2rem;
      z-index: 9999;
      pointer-events: none;
      animation: celebrationBounce 1s ease-out forwards;
    `
    
    document.body.appendChild(celebration)
    setTimeout(() => {
      if (document.body.contains(celebration)) {
        document.body.removeChild(celebration)
      }
    }, 1000)
  }

  const showIncorrectAnimation = () => {
    const animation = document.createElement('div')
    animation.innerHTML = '❌'
    animation.style.cssText = `
      position: fixed;
      top: 20%;
      right: 20px;
      font-size: 2rem;
      z-index: 9999;
      pointer-events: none;
      animation: celebrationBounce 1s ease-out forwards;
    `
    
    document.body.appendChild(animation)
    setTimeout(() => {
      if (document.body.contains(animation)) {
        document.body.removeChild(animation)
      }
    }, 1000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner text-white mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Target className="h-8 w-8 text-white/50" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading Practice Quiz</h3>
          <p className="text-white/80 mb-4">Preparing challenging questions...</p>
          <div className="loading-dots justify-center">
            <div className="loading-dot bg-white/60"></div>
            <div className="loading-dot bg-white/60" style={{animationDelay: '0.1s'}}></div>
            <div className="loading-dot bg-white/60" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">🤯</div>
          <h3 className="text-2xl font-bold text-white mb-4">Quiz unavailable</h3>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={fetchQuestions}
              className="btn-primary w-full"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Try Again
            </button>
            <Link href="/" className="btn-secondary w-full">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (quizCompleted) {
    const finalScore = Math.round((score / questions.length) * 100)
    const isPassed = finalScore >= 70

    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center fade-in">
            <div className={`hero-card max-w-3xl mx-auto ${
              isPassed ? 
              'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' : 
              'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300'
            }`}>
              <div className="text-8xl mb-6">
                {isPassed ? '🎉' : '📚'}
              </div>
              <h1 className={`text-4xl font-bold mb-4 ${
                isPassed ? 'text-green-800' : 'text-amber-800'
              }`}>
                {isPassed ? 'Quiz Completed!' : 'Good Effort!'}
              </h1>
              <p className={`text-xl mb-8 ${
                isPassed ? 'text-green-700' : 'text-amber-700'
              }`}>
                {isPassed 
                  ? `Excellent! You scored ${finalScore}% and passed the quiz!`
                  : `You scored ${finalScore}%. Keep practicing to improve!`
                }
              </p>

              {/* Score Breakdown */}
              <div className={`rounded-xl p-6 mb-8 ${
                isPassed ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className={`text-3xl font-bold ${
                      isPassed ? 'text-green-800' : 'text-amber-800'
                    }`}>{score}</div>
                    <div className={`text-sm ${
                      isPassed ? 'text-green-700' : 'text-amber-700'
                    }`}>Correct</div>
                  </div>
                  <div>
                    <div className={`text-3xl font-bold ${
                      isPassed ? 'text-green-800' : 'text-amber-800'
                    }`}>{questions.length - score}</div>
                    <div className={`text-sm ${
                      isPassed ? 'text-green-700' : 'text-amber-700'
                    }`}>Incorrect</div>
                  </div>
                  <div>
                    <div className={`text-3xl font-bold ${
                      isPassed ? 'text-green-800' : 'text-amber-800'
                    }`}>{finalScore}%</div>
                    <div className={`text-sm ${
                      isPassed ? 'text-green-700' : 'text-amber-700'
                    }`}>Score</div>
                  </div>
                  <div>
                    <div className={`text-3xl font-bold ${
                      isPassed ? 'text-green-800' : 'text-amber-800'
                    }`}>{formatTime(timeElapsed)}</div>
                    <div className={`text-sm ${
                      isPassed ? 'text-green-700' : 'text-amber-700'
                    }`}>Total Time</div>
                  </div>
                </div>
              </div>

              {/* Performance Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-center space-x-2 mb-3">
                  {isPassed ? (
                    <Trophy className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingUp className="h-6 w-6 text-amber-600" />
                  )}
                  <span className={`font-semibold ${
                    isPassed ? 'text-green-800' : 'text-amber-800'
                  }`}>
                    {isPassed ? 'PASSED' : 'NEEDS IMPROVEMENT'}
                  </span>
                </div>
                <div className="progress-bar max-w-md mx-auto">
                  <div 
                    className={`h-4 rounded-full transition-all duration-1000 ${
                      isPassed ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${finalScore}%` }} 
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetQuiz}
                  className={isPassed ? 'btn-success' : 'btn-primary'}
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </button>
                <Link href="/practice" className="btn-primary">
                  <BookOpen className="h-4 w-4" />
                  More Practice
                </Link>
                <Link href="/" className="btn-secondary">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
                {isPassed && (
                  <Link href="/progress" className="btn-success">
                    <Award className="h-4 w-4" />
                    View Progress
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  if (!currentQuestion || !currentQuestion.options || !Array.isArray(currentQuestion.options)) return null

  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 fade-in">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="mr-6 p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 text-white"
            >
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Practice Quiz
              </h1>
              <p className="text-xl text-white/90">Test your knowledge</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center space-x-3">
              <Target className="text-indigo-600" size={28} />
              <div>
                <div className="text-3xl font-bold text-indigo-600">
                  {currentQuestionIndex + 1}/{questions.length}
                </div>
                <div className="text-sm text-gray-500">Questions</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Timer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 slide-up">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-3xl font-bold text-indigo-600 mb-1">
              {Math.round(progressPercentage)}%
            </div>
            <p className="text-gray-600 text-sm">Progress</p>
            <div className="progress-bar mt-2">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {formatTime(timeElapsed)}
            </div>
            <p className="text-gray-600 text-sm">Time Elapsed</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {score}
            </div>
            <p className="text-gray-600 text-sm">Correct Answers</p>
          </div>
        </div>

        {/* Question Card */}
        <div className="task-card mb-8 bounce-in">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Brain className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Question {currentQuestionIndex + 1}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                      {currentQuestion.topic}
                    </span>
                    {currentQuestion.difficulty && (
                      <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                        currentQuestion.difficulty === 'easy' ? 'text-green-600 bg-green-100' :
                        currentQuestion.difficulty === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                        'text-red-600 bg-red-100'
                      }`}>
                        {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {(currentQuestion.options || []).map((option, index) => {
                const optionLetter = String.fromCharCode(65 + index)
                const isSelected = selectedAnswer === option
                const isCorrect = option === currentQuestion.correct
                const isIncorrect = submitted && isSelected && !isCorrect
                
                return (
                  <button
                    key={index}
                    onClick={() => !submitted && setSelectedAnswer(option)}
                    disabled={submitted}
                    className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                      submitted && isCorrect
                        ? 'bg-green-50 border-green-300 ring-2 ring-green-200'
                        : isIncorrect
                        ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                        : isSelected
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
                        : 'bg-white border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    } ${submitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                        submitted && isCorrect
                          ? 'bg-green-500 border-green-500 text-white'
                          : isIncorrect
                          ? 'bg-red-500 border-red-500 text-white'
                          : isSelected
                          ? 'bg-indigo-500 border-indigo-500 text-white'
                          : 'border-gray-300 text-gray-600'
                      }`}>
                        {submitted && isCorrect ? <Check size={16} /> :
                         isIncorrect ? <X size={16} /> :
                         optionLetter}
                      </div>
                      <span className={`text-gray-900 ${
                        submitted && isCorrect ? 'font-semibold' : ''
                      }`}>
                        {option}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Result Display */}
          {result && (
            <div className={`mt-6 p-6 rounded-xl border ${
              result.correct 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-3 mb-4">
                {result.correct ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
                <h4 className={`text-lg font-bold ${
                  result.correct ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.correct ? 'Correct!' : 'Incorrect'}
                </h4>
              </div>
              
              {!result.correct && (
                <div className="mb-4">
                  <p className="text-red-700 font-medium">
                    Correct answer: {result.correctAnswer}
                  </p>
                </div>
              )}
              
              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold text-gray-700 mb-2 flex items-center">
                  <Zap className="h-4 w-4 mr-2" />
                  Explanation
                </p>
                <p className="text-gray-800 leading-relaxed">
                  {result.explanation}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t-2 border-gray-100">
            <button
              onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
              disabled={currentQuestionIndex === 0}
              className="btn-secondary disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            {!submitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="btn-primary disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="btn-success"
              >
                {currentQuestionIndex + 1 >= questions.length ? (
                  <>
                    <Trophy className="h-4 w-4" />
                    Finish Quiz
                  </>
                ) : (
                  <>
                    <ChevronRight className="h-4 w-4" />
                    Next Question
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
