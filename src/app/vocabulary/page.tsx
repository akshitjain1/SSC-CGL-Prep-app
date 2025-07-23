'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  BookOpen, 
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
  Volume2,
  Copy,
  Brain
} from 'lucide-react'
import ProgressManager from '@/lib/progressManager'

interface VocabularyWord {
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
  pronunciation?: string
  partOfSpeech?: string
}

export default function VocabularyPage() {
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeWordId, setActiveWordId] = useState<string | null>(null)
  const [userExample, setUserExample] = useState('')
  const [processingWordId, setProcessingWordId] = useState<string | null>(null)
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [evaluatingExample, setEvaluatingExample] = useState<string | null>(null)
  const [exampleFeedback, setExampleFeedback] = useState<{[key: string]: {score: number, feedback: string, suggestions: string[]}}>({})

  const progressManager = ProgressManager.getInstance()

  useEffect(() => {
    fetchVocabulary()
  }, [])

  // Update progress whenever words change
  useEffect(() => {
    if (words.length > 0) {
      updateDailyProgress()
    }
  }, [words])

  const fetchVocabulary = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/vocabulary')
      const result = await response.json()
      
      if (result.success) {
        setWords(result.data)
      } else {
        setError(result.message || 'Failed to load vocabulary')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const updateWord = async (wordId: string, updates: Partial<VocabularyWord>) => {
    try {
      setProcessingWordId(wordId)
      
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ wordId, updates }),
      })
      
      const result = await response.json()
      if (result.success) {
        setWords(words.map(word => 
          word.id === wordId ? { ...word, ...updates } : word
        ))
        
        // Add celebration animation for learning
        if (updates.learned === true) {
          showWordCelebration()
        }
      }
    } catch (err) {
      console.error('Error updating word:', err)
    } finally {
      setProcessingWordId(null)
    }
  }

  const handleMarkLearned = (wordId: string, learned: boolean) => {
    updateWord(wordId, { learned })
  }

  const handleMarkDifficult = (wordId: string, difficult: boolean) => {
    updateWord(wordId, { difficult })
  }

  const updateDailyProgress = () => {
    const learnedCount = words.filter(w => w.learned).length
    const isCompleted = learnedCount >= Math.ceil(words.length * 0.8) // 80% completion threshold
    
    if (isCompleted && !sessionCompleted) {
      progressManager.updateTaskCompletion('vocabulary', true, { wordsLearned: learnedCount })
      setSessionCompleted(true)
    }
  }

  const handleSaveUserExample = async (wordId: string) => {
    if (userExample.trim()) {
      setEvaluatingExample(wordId)
      
      try {
        // First save the example
        await updateWord(wordId, { userExample: userExample.trim() })
        
        // Then get AI feedback
        const response = await fetch('/api/evaluate-sentence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word: words.find(w => w.id === wordId)?.word,
            sentence: userExample.trim(),
            wordMeaning: words.find(w => w.id === wordId)?.meaning
          })
        })
        
        if (response.ok) {
          const feedback = await response.json()
          setExampleFeedback(prev => ({
            ...prev,
            [wordId]: feedback
          }))
        }
      } catch (error) {
        console.error('Error evaluating example:', error)
      } finally {
        setEvaluatingExample(null)
        setUserExample('')
        setActiveWordId(null)
      }
    }
  }

  const showWordCelebration = () => {
    const celebration = document.createElement('div')
    celebration.innerHTML = '✨'
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

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner text-white mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white/50" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading Today's Vocabulary</h3>
          <p className="text-gray-200 mb-4">Preparing 10 amazing words for you...</p>
          <div className="loading-dots justify-center">
            <div className="loading-dot bg-white/80"></div>
            <div className="loading-dot bg-white/80" style={{animationDelay: '0.1s'}}></div>
            <div className="loading-dot bg-white/80" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">😔</div>
          <h3 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h3>
          <p className="text-gray-200 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={fetchVocabulary}
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

  const learnedCount = words.filter(w => w.learned).length
  const difficultCount = words.filter(w => w.difficult).length
  const exampleCount = words.filter(w => w.userExample).length
  const progressPercentage = Math.round((learnedCount / words.length) * 100)
  const targetReached = learnedCount >= Math.ceil(words.length * 0.8)

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
                Daily Vocabulary
              </h1>
              <p className="text-xl text-white/90">Master 10 powerful words today</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center space-x-3">
              <BookOpen className="text-blue-600" size={28} />
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {learnedCount}/{words.length}
                </div>
                <div className="text-sm text-gray-700">Mastered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{progressPercentage}%</div>
            <p className="text-gray-600 text-sm">Progress</p>
            <div className="progress-bar mt-2">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{learnedCount}</div>
            <p className="text-gray-600 text-sm">Learned</p>
            {targetReached && (
              <div className="badge-success mt-2">
                <Award className="h-3 w-3" />
                Target Reached!
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="text-3xl font-bold text-amber-600 mb-1">{difficultCount}</div>
            <p className="text-gray-600 text-sm">Difficult</p>
            {difficultCount > 0 && (
              <div className="badge-warning mt-2">
                <Clock className="h-3 w-3" />
                Review Later
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl">✍️</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">{exampleCount}</div>
            <p className="text-gray-600 text-sm">Examples</p>
            <div className="badge-info mt-2">
              <Plus className="h-3 w-3" />
              Keep Adding
            </div>
          </div>
        </div>

        {/* Words Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 bounce-in">
          {words.map((word, index) => (
            <div 
              key={word.id} 
              className={`task-card relative ${
                word.learned 
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 ring-2 ring-green-200' 
                  : 'bg-white'
              } ${word.difficult ? 'border-l-4 border-l-amber-400 shadow-lg' : ''}`}
            >
              {/* Status Badge */}
              {word.learned && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <Check size={16} />
                  </div>
                </div>
              )}
              {word.difficult && !word.learned && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="bg-amber-500 text-white rounded-full p-2 shadow-lg">
                    <AlertCircle size={16} />
                  </div>
                </div>
              )}

              {/* Word Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h3 className="text-2xl font-bold text-gray-900">{word.word}</h3>
                    <button
                      onClick={() => speakWord(word.word)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      title="Pronounce word"
                    >
                      <Volume2 className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(word.word)}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      title="Copy word"
                    >
                      <Copy className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                      {word.field}
                    </span>
                    <span className="text-xs text-gray-600">Word #{index + 1}</span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {/* Mark as Learned Button */}
                  <button
                    onClick={() => handleMarkLearned(word.id, !word.learned)}
                    disabled={processingWordId === word.id}
                    className={`group relative p-3 rounded-xl transition-all duration-200 transform hover:scale-110 disabled:opacity-50 ${
                      word.learned 
                        ? 'bg-green-500 text-white shadow-lg ring-2 ring-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                    }`}
                    title={word.learned ? 'Mark as not learned' : 'Mark as learned'}
                  >
                    {processingWordId === word.id ? (
                      <div className="loading-spinner h-5 w-5"></div>
                    ) : (
                      <Check size={20} />
                    )}
                  </button>
                  
                  {/* Mark as Difficult Button */}
                  <button
                    onClick={() => handleMarkDifficult(word.id, !word.difficult)}
                    disabled={processingWordId === word.id}
                    className={`group relative p-3 rounded-xl transition-all duration-200 transform hover:scale-110 disabled:opacity-50 ${
                      word.difficult 
                        ? 'bg-amber-500 text-white shadow-lg ring-2 ring-amber-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-amber-100 hover:text-amber-600'
                    }`}
                    title={word.difficult ? 'Remove from difficult list' : 'Mark as difficult'}
                  >
                    <AlertCircle size={20} />
                  </button>
                  
                  {/* Reset/Clear Button */}
                  {word.learned && (
                    <button
                      onClick={() => handleMarkLearned(word.id, false)}
                      disabled={processingWordId === word.id}
                      className="group relative p-3 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-all duration-200 transform hover:scale-110 disabled:opacity-50"
                      title="Clear progress for this word"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Word Details */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-700 mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Meaning
                  </p>
                  <p className="text-gray-800 leading-relaxed">{word.meaning}</p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-700 mb-2 flex items-center">
                    <Zap className="h-4 w-4 mr-2" />
                    Synonym
                  </p>
                  <p className="text-blue-800 font-medium">{word.synonym}</p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-700 mb-2 flex items-center">
                    <Star className="h-4 w-4 mr-2" />
                    Example
                  </p>
                  <p className="text-purple-800 italic leading-relaxed">"{word.example}"</p>
                </div>

                {/* User Example Section */}
                <div className="border-t-2 border-gray-100 pt-4">
                  <p className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Your Example
                  </p>
                  {word.userExample ? (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                      <p className="text-gray-800 italic leading-relaxed mb-3">"{word.userExample}"</p>
                      
                      {/* Show AI Feedback */}
                      {exampleFeedback[word.id] && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center mb-2">
                            <Brain className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="font-semibold text-blue-800">AI Feedback</span>
                            <div className="ml-auto flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`h-4 w-4 ${i < exampleFeedback[word.id].score ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                              <span className="ml-2 text-sm font-bold text-blue-600">
                                {exampleFeedback[word.id].score}/5
                              </span>
                            </div>
                          </div>
                          <p className="text-blue-700 text-sm mb-2">{exampleFeedback[word.id].feedback}</p>
                          {exampleFeedback[word.id].suggestions.length > 0 && (
                            <div className="text-xs text-blue-600">
                              <strong>Suggestions:</strong> {exampleFeedback[word.id].suggestions.join(', ')}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <button
                        onClick={() => setActiveWordId(word.id)}
                        className="btn-secondary text-sm"
                      >
                        ✏️ Edit Example
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveWordId(word.id)}
                      className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-400 rounded-xl text-gray-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                    >
                      <Plus size={20} className="mr-2" />
                      Add your own example sentence
                    </button>
                  )}

                  {/* User Example Input */}
                  {activeWordId === word.id && (
                    <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 shadow-inner">
                      <textarea
                        value={userExample}
                        onChange={(e) => setUserExample(e.target.value)}
                        placeholder={`Write a creative sentence using "${word.word}"...`}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none min-h-[120px] shadow-inner"
                        rows={3}
                      />
                      <div className="flex space-x-3 mt-3">
                        <button
                          onClick={() => handleSaveUserExample(word.id)}
                          className="btn-success text-sm"
                          disabled={!userExample.trim() || evaluatingExample === word.id}
                        >
                          {evaluatingExample === word.id ? (
                            <>
                              <div className="loading-spinner w-4 h-4 mr-2"></div>
                              Evaluating...
                            </>
                          ) : (
                            <>
                              💾 Save Example
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setActiveWordId(null)
                            setUserExample('')
                          }}
                          className="btn-secondary text-sm"
                        >
                          ❌ Cancel
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
            'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' : 
            'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200'
          }`}>
            {targetReached ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-3xl font-bold text-green-800 mb-4">
                  Vocabulary Master!
                </h3>
                <p className="text-green-700 mb-6 text-lg">
                  Congratulations! You've mastered {learnedCount} out of {words.length} words. 
                  You've reached the 80% target and completed today's vocabulary session! 🌟
                </p>
                <div className="bg-green-100 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-800">{learnedCount}</div>
                      <div className="text-sm text-green-700">Words Mastered</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-800">{exampleCount}</div>
                      <div className="text-sm text-green-700">Examples Added</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-800">{progressPercentage}%</div>
                      <div className="text-sm text-green-700">Completion</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Keep Learning!
                </h3>
                <p className="text-gray-700 mb-6 text-lg">
                  You've learned {learnedCount} out of {words.length} words. 
                  Learn {Math.ceil(words.length * 0.8) - learnedCount} more to complete today's session!
                </p>
                <div className="bg-blue-100 rounded-xl p-4 mb-6">
                  <p className="text-blue-800 font-medium">🎯 Target: {Math.ceil(words.length * 0.8)} words (80% completion)</p>
                  <div className="progress-bar mt-3">
                    <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/idioms" className="btn-primary">
                <Brain className="h-4 w-4" />
                Continue to Idioms & Phrases
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
