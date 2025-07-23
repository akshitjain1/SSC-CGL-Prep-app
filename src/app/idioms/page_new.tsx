'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Brain, 
  Send, 
  Check, 
  X, 
  Plus, 
  Star,
  RefreshCw,
  Clock,
  Target,
  Zap,
  Award,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  LightbulbIcon,
  BookOpenCheck,
  Sparkles
} from 'lucide-react'
import ProgressManager from '@/lib/progressManager'

interface Idiom {
  id: string
  idiom: string
  meaning: string
  example: string
  context: string
  userSentence?: string
  practiced: boolean
  dateAdded: string
  difficulty?: 'easy' | 'medium' | 'hard'
  mastered?: boolean
}

interface EvaluationResult {
  isCorrect: boolean
  feedback: string
  suggestions?: string[]
  score: number
}

export default function IdiomsPage() {
  const [idioms, setIdioms] = useState<Idiom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeIdiomId, setActiveIdiomId] = useState<string | null>(null)
  const [userSentence, setUserSentence] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null)
  const [sessionCompleted, setSessionCompleted] = useState(false)

  const progressManager = ProgressManager.getInstance()

  useEffect(() => {
    fetchIdioms()
  }, [])

  useEffect(() => {
    if (idioms.length > 0) {
      updateDailyProgress()
    }
  }, [idioms])

  const fetchIdioms = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/idioms')
      const result = await response.json()
      
      if (result.success) {
        setIdioms(result.data)
      } else {
        setError(result.message || 'Failed to load idioms')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const updateIdiom = async (idiomId: string, updates: Partial<Idiom>) => {
    try {
      const response = await fetch('/api/idioms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idiomId, updates }),
      })
      
      const result = await response.json()
      if (result.success) {
        setIdioms(idioms.map(idiom => 
          idiom.id === idiomId ? { ...idiom, ...updates } : idiom
        ))
        
        if (updates.mastered === true || updates.practiced === true) {
          showCelebration()
        }
      }
    } catch (err) {
      console.error('Error updating idiom:', err)
    }
  }

  const handleSubmitSentence = async () => {
    if (!userSentence.trim() || !activeIdiomId) return
    
    setEvaluating(true)
    try {
      const response = await fetch('/api/evaluate-idiom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idiomId: activeIdiomId,
          userSentence: userSentence.trim(),
        }),
      })
      
      const result = await response.json()
      if (result.success) {
        setEvaluation(result.evaluation)
        
        // Update idiom with user sentence and practice status
        await updateIdiom(activeIdiomId, { 
          userSentence: userSentence.trim(), 
          practiced: true,
          mastered: result.evaluation.score >= 80
        })
      } else {
        setEvaluation({
          isCorrect: false,
          feedback: 'Unable to evaluate your sentence. Please try again.',
          score: 0
        })
      }
    } catch (err) {
      setEvaluation({
        isCorrect: false,
        feedback: 'Network error. Your sentence has been saved for practice.',
        score: 50
      })
      
      // Still save the sentence even if evaluation fails
      await updateIdiom(activeIdiomId, { 
        userSentence: userSentence.trim(), 
        practiced: true 
      })
    } finally {
      setEvaluating(false)
    }
  }

  const updateDailyProgress = () => {
    const practicedCount = idioms.filter(i => i.practiced).length
    const masteredCount = idioms.filter(i => i.mastered).length
    const isCompleted = practicedCount >= Math.ceil(idioms.length * 0.8)
    
    if (isCompleted && !sessionCompleted) {
      progressManager.updateTaskCompletion('idioms', true, { 
        score: Math.round((masteredCount / idioms.length) * 100)
      })
      setSessionCompleted(true)
    }
  }

  const handleClearEvaluation = () => {
    setEvaluation(null)
    setUserSentence('')
    setActiveIdiomId(null)
  }

  const showCelebration = () => {
    const celebration = document.createElement('div')
    celebration.innerHTML = '🌟'
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner text-white mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="h-8 w-8 text-white/50" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading Idioms & Phrases</h3>
          <p className="text-white/80 mb-4">Preparing powerful expressions for you...</p>
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
          <div className="text-6xl mb-6">🤔</div>
          <h3 className="text-2xl font-bold text-white mb-4">Something went wrong</h3>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={fetchIdioms}
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

  const practicedCount = idioms.filter(i => i.practiced).length
  const masteredCount = idioms.filter(i => i.mastered).length
  const sentenceCount = idioms.filter(i => i.userSentence).length
  const progressPercentage = Math.round((practicedCount / idioms.length) * 100)
  const targetReached = practicedCount >= Math.ceil(idioms.length * 0.8)

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
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
                Idioms & Phrases
              </h1>
              <p className="text-xl text-white/90">Master expressive language patterns</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center space-x-3">
              <Brain className="text-purple-600" size={28} />
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {practicedCount}/{idioms.length}
                </div>
                <div className="text-sm text-gray-500">Practiced</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">{progressPercentage}%</div>
            <p className="text-gray-600 text-sm">Progress</p>
            <div className="progress-bar mt-2">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{practicedCount}</div>
            <p className="text-gray-600 text-sm">Practiced</p>
            {targetReached && (
              <div className="badge-success mt-2">
                <Award className="h-3 w-3" />
                Target Reached!
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Star className="h-6 w-6 text-emerald-600" />
              </div>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-3xl font-bold text-emerald-600 mb-1">{masteredCount}</div>
            <p className="text-gray-600 text-sm">Mastered</p>
            <div className="badge-success mt-2">
              <Sparkles className="h-3 w-3" />
              Expert Level
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl">✍️</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">{sentenceCount}</div>
            <p className="text-gray-600 text-sm">Sentences</p>
            <div className="badge-info mt-2">
              <Plus className="h-3 w-3" />
              Keep Writing
            </div>
          </div>
        </div>

        {/* Idioms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 bounce-in">
          {idioms.map((idiom, index) => (
            <div 
              key={idiom.id} 
              className={`task-card relative ${
                idiom.mastered 
                  ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-300 ring-2 ring-emerald-200' 
                  : idiom.practiced
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 ring-2 ring-blue-200'
                  : 'bg-white'
              }`}
            >
              {/* Status Badges */}
              <div className="absolute -top-2 -right-2 z-10 flex space-x-1">
                {idiom.mastered && (
                  <div className="bg-emerald-500 text-white rounded-full p-2 shadow-lg">
                    <Star size={16} />
                  </div>
                )}
                {idiom.practiced && !idiom.mastered && (
                  <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg">
                    <Check size={16} />
                  </div>
                )}
              </div>

              {/* Idiom Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-900 flex-1">{idiom.idiom}</h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full ml-3">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                    {idiom.context}
                  </span>
                  {idiom.difficulty && (
                    <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                      idiom.difficulty === 'easy' ? 'text-green-600 bg-green-100' :
                      idiom.difficulty === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                      'text-red-600 bg-red-100'
                    }`}>
                      {idiom.difficulty.charAt(0).toUpperCase() + idiom.difficulty.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Idiom Details */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-700 mb-2 flex items-center">
                    <LightbulbIcon className="h-4 w-4 mr-2" />
                    Meaning
                  </p>
                  <p className="text-gray-800 leading-relaxed">{idiom.meaning}</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-700 mb-2 flex items-center">
                    <BookOpenCheck className="h-4 w-4 mr-2" />
                    Example Usage
                  </p>
                  <p className="text-purple-800 italic leading-relaxed">"{idiom.example}"</p>
                </div>

                {/* Practice Section */}
                <div className="border-t-2 border-gray-100 pt-4">
                  <p className="font-semibold text-gray-700 mb-3 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Practice Sentence
                  </p>
                  
                  {idiom.userSentence ? (
                    <div className="space-y-3">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                        <p className="text-gray-800 italic leading-relaxed mb-3">"{idiom.userSentence}"</p>
                        <div className="flex items-center space-x-2">
                          {idiom.mastered && (
                            <div className="badge-success">
                              <Star className="h-3 w-3" />
                              Mastered
                            </div>
                          )}
                          {idiom.practiced && (
                            <div className="badge-info">
                              <Check className="h-3 w-3" />
                              Practiced
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setActiveIdiomId(idiom.id)
                          setUserSentence(idiom.userSentence || '')
                          setEvaluation(null)
                        }}
                        className="btn-secondary text-sm"
                      >
                        ✏️ Edit Sentence
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveIdiomId(idiom.id)
                        setUserSentence('')
                        setEvaluation(null)
                      }}
                      className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-400 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
                    >
                      <Plus size={20} className="mr-2" />
                      Write a sentence using this idiom
                    </button>
                  )}

                  {/* Practice Input */}
                  {activeIdiomId === idiom.id && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-inner">
                      <textarea
                        value={userSentence}
                        onChange={(e) => setUserSentence(e.target.value)}
                        placeholder={`Write a creative sentence using "${idiom.idiom}"...`}
                        className="textarea-field"
                        rows={3}
                      />
                      
                      {/* Evaluation Result */}
                      {evaluation && (
                        <div className={`mt-4 p-4 rounded-xl border ${
                          evaluation.isCorrect 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-amber-50 border-amber-200'
                        }`}>
                          <div className="flex items-center space-x-2 mb-2">
                            {evaluation.isCorrect ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-amber-600" />
                            )}
                            <span className={`font-semibold ${
                              evaluation.isCorrect ? 'text-green-800' : 'text-amber-800'
                            }`}>
                              Score: {evaluation.score}/100
                            </span>
                          </div>
                          <p className={`text-sm leading-relaxed ${
                            evaluation.isCorrect ? 'text-green-700' : 'text-amber-700'
                          }`}>
                            {evaluation.feedback}
                          </p>
                          {evaluation.suggestions && evaluation.suggestions.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Suggestions:</p>
                              <ul className="text-sm text-gray-600 space-y-1">
                                {evaluation.suggestions.map((suggestion, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className="mr-2">•</span>
                                    <span>{suggestion}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex space-x-3 mt-3">
                        <button
                          onClick={handleSubmitSentence}
                          className="btn-success text-sm"
                          disabled={!userSentence.trim() || evaluating}
                        >
                          {evaluating ? (
                            <>
                              <div className="loading-spinner h-4 w-4"></div>
                              Evaluating...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              Submit & Evaluate
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleClearEvaluation}
                          className="btn-secondary text-sm"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Completion Actions */}
        <div className="text-center slide-up">
          <div className={`hero-card max-w-3xl mx-auto ${
            targetReached ? 
            'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300' : 
            'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
          }`}>
            {targetReached ? (
              <>
                <div className="text-6xl mb-4">🎊</div>
                <h3 className="text-3xl font-bold text-emerald-800 mb-4">
                  Idiom Expert!
                </h3>
                <p className="text-emerald-700 mb-6 text-lg">
                  Outstanding! You've practiced {practicedCount} out of {idioms.length} idioms and mastered {masteredCount}. 
                  You've reached the 80% target and completed today's idioms session! 🌟
                </p>
                <div className="bg-emerald-100 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-emerald-800">{practicedCount}</div>
                      <div className="text-sm text-emerald-700">Practiced</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-800">{masteredCount}</div>
                      <div className="text-sm text-emerald-700">Mastered</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-emerald-800">{sentenceCount}</div>
                      <div className="text-sm text-emerald-700">Sentences</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4">🧠</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Keep Practicing!
                </h3>
                <p className="text-gray-700 mb-6 text-lg">
                  You've practiced {practicedCount} out of {idioms.length} idioms. 
                  Practice {Math.ceil(idioms.length * 0.8) - practicedCount} more to complete today's session!
                </p>
                <div className="bg-purple-100 rounded-xl p-4 mb-6">
                  <p className="text-purple-800 font-medium">🎯 Target: {Math.ceil(idioms.length * 0.8)} idioms (80% completion)</p>
                  <div className="progress-bar mt-3">
                    <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/news" className="btn-primary">
                <MessageSquare className="h-4 w-4" />
                Continue to Current Affairs
              </Link>
              <Link href="/" className="btn-secondary">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              {targetReached && (
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
