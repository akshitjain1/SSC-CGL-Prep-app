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
  Brain,
  Globe,
  Calendar,
  Users,
  MapPin,
  Trophy,
  TrendingUp
} from 'lucide-react'
import ProgressManager from '@/lib/progressManager'

interface GKFact {
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

export default function DailyGKPage() {
  const [facts, setFacts] = useState<GKFact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sessionCompleted, setSessionCompleted] = useState(false)
  const [learnedCount, setLearnedCount] = useState(0)

  const progressManager = ProgressManager.getInstance()

  const categories = [
    { id: 'all', name: 'All Facts', icon: Globe },
    { id: 'history', name: 'History', icon: Calendar },
    { id: 'geography', name: 'Geography', icon: MapPin },
    { id: 'science', name: 'Science', icon: Brain },
    { id: 'polity', name: 'Polity', icon: Users },
    { id: 'economy', name: 'Economy', icon: TrendingUp },
    { id: 'sports', name: 'Sports', icon: Trophy }
  ]

  useEffect(() => {
    loadDailyGK()
  }, [])

  const loadDailyGK = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/daily-gk')
      
      if (!response.ok) {
        throw new Error('Failed to load daily GK facts')
      }
      
      const data = await response.json()
      setFacts(data.data || [])
      setLearnedCount(data.data?.filter((fact: GKFact) => fact.learned).length || 0)
    } catch (error) {
      console.error('Error loading daily GK:', error)
      setError('Failed to load today\'s GK facts. Please try again.')
      // Fallback data
      setFacts(getFallbackGKFacts())
    } finally {
      setLoading(false)
    }
  }

  const getFallbackGKFacts = (): GKFact[] => {
    return [
      {
        id: '1',
        title: 'Mount Everest Height',
        description: 'Mount Everest, the world\'s highest peak, stands at 8,848.86 meters (29,031.7 feet) above sea level.',
        category: 'geography',
        importance: 'high',
        dateAdded: new Date().toISOString(),
        tags: ['mountains', 'geography', 'records'],
        learned: false,
        difficulty: 'easy',
        relatedTopics: ['Himalayas', 'Nepal', 'Tibet']
      },
      {
        id: '2',
        title: 'Constitution Day',
        description: 'November 26 is celebrated as Constitution Day in India, commemorating the adoption of the Indian Constitution in 1949.',
        category: 'polity',
        importance: 'high',
        dateAdded: new Date().toISOString(),
        tags: ['constitution', 'important dates', 'polity'],
        learned: false,
        difficulty: 'medium',
        relatedTopics: ['Dr. B.R. Ambedkar', 'Constituent Assembly']
      },
      {
        id: '3',
        title: 'Photosynthesis Process',
        description: 'Photosynthesis converts carbon dioxide and water into glucose using sunlight, releasing oxygen as a byproduct.',
        category: 'science',
        importance: 'medium',
        dateAdded: new Date().toISOString(),
        tags: ['biology', 'plants', 'oxygen'],
        learned: false,
        difficulty: 'medium',
        relatedTopics: ['Chlorophyll', 'Solar energy', 'Plant biology']
      },
      {
        id: '4',
        title: 'Reserve Bank of India',
        description: 'RBI was established on April 1, 1935, and is headquartered in Mumbai. It is India\'s central banking institution.',
        category: 'economy',
        importance: 'high',
        dateAdded: new Date().toISOString(),
        tags: ['banking', 'RBI', 'economy'],
        learned: false,
        difficulty: 'easy',
        relatedTopics: ['Monetary Policy', 'Banking Regulation']
      },
      {
        id: '5',
        title: 'Quit India Movement',
        description: 'The Quit India Movement was launched by Mahatma Gandhi on August 8, 1942, demanding immediate independence from British rule.',
        category: 'history',
        importance: 'high',
        dateAdded: new Date().toISOString(),
        tags: ['freedom struggle', 'Gandhi', 'independence'],
        learned: false,
        difficulty: 'medium',
        relatedTopics: ['Non-cooperation', 'Civil Disobedience']
      },
      {
        id: '6',
        title: 'Cricket World Cup 2023',
        description: 'India hosted the ICC Cricket World Cup 2023, with the final held at Narendra Modi Stadium in Ahmedabad.',
        category: 'sports',
        importance: 'medium',
        dateAdded: new Date().toISOString(),
        tags: ['cricket', 'world cup', 'sports'],
        learned: false,
        difficulty: 'easy',
        relatedTopics: ['ICC', 'Stadium', 'Tournament']
      },
      {
        id: '7',
        title: 'Chandrayaan-3 Mission',
        description: 'ISRO\'s Chandrayaan-3 successfully landed near the Moon\'s south pole on August 23, 2023, making India the 4th country to achieve this.',
        category: 'science',
        importance: 'high',
        dateAdded: new Date().toISOString(),
        tags: ['space', 'ISRO', 'moon mission'],
        learned: false,
        difficulty: 'medium',
        relatedTopics: ['ISRO', 'Space Technology', 'Lunar Exploration']
      },
      {
        id: '8',
        title: 'Longest River in India',
        description: 'The Ganges is the longest river in India, flowing for about 2,525 km from the Himalayas to the Bay of Bengal.',
        category: 'geography',
        importance: 'high',
        dateAdded: new Date().toISOString(),
        tags: ['rivers', 'geography', 'Ganges'],
        learned: false,
        difficulty: 'easy',
        relatedTopics: ['River Systems', 'Himalayan Rivers']
      },
      {
        id: '9',
        title: 'Fundamental Rights',
        description: 'The Indian Constitution guarantees six fundamental rights to citizens, including Right to Equality and Right to Freedom.',
        category: 'polity',
        importance: 'high',
        dateAdded: new Date().toISOString(),
        tags: ['rights', 'constitution', 'fundamental'],
        learned: false,
        difficulty: 'medium',
        relatedTopics: ['Article 12-35', 'Constitutional Law']
      },
      {
        id: '10',
        title: 'GDP of India',
        description: 'India is the world\'s 5th largest economy by nominal GDP and 3rd largest by purchasing power parity (PPP).',
        category: 'economy',
        importance: 'high',
        dateAdded: new Date().toISOString(),
        tags: ['GDP', 'economy', 'ranking'],
        learned: false,
        difficulty: 'medium',
        relatedTopics: ['Economic Growth', 'Global Economy']
      }
    ]
  }

  const markAsLearned = async (factId: string) => {
    try {
      const response = await fetch('/api/daily-gk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factId, action: 'mark_learned' })
      })

      if (response.ok) {
        setFacts(prevFacts => 
          prevFacts.map(fact => 
            fact.id === factId ? { ...fact, learned: true } : fact
          )
        )
        
        const newLearnedCount = learnedCount + 1
        setLearnedCount(newLearnedCount)
        
        if (newLearnedCount >= 10) {
          progressManager.updateTaskCompletion('news', true, { score: newLearnedCount * 10 })
          setSessionCompleted(true)
        }
      }
    } catch (error) {
      console.error('Error marking fact as learned:', error)
    }
  }

  const filteredFacts = selectedCategory === 'all' 
    ? facts 
    : facts.filter(fact => fact.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'high': return '🔥'
      case 'medium': return '⭐'
      case 'low': return '💡'
      default: return '📝'
    }
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
          <h2 className="text-2xl font-bold text-white mb-2">Loading Daily GK Facts</h2>
          <p className="text-gray-200">Preparing today's knowledge boosters...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="btn-ghost p-2">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Daily GK Facts</h1>
              <p className="text-gray-200">10 important facts to boost your general knowledge</p>
            </div>
          </div>
          <button
            onClick={loadDailyGK}
            className="btn-secondary"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Progress Card */}
        <div className="hero-card mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Today's Progress</h2>
              <p className="text-gray-200">Master all 10 facts to complete your daily goal</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white mb-1">{learnedCount}/10</div>
              <div className="text-white/90 text-sm">Facts Learned</div>
            </div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(learnedCount / 10) * 100}%` }}
            ></div>
          </div>
          {sessionCompleted && (
            <div className="mt-4 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
              <div className="flex items-center text-green-100">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-semibold">Congratulations! Daily GK goal completed! 🎉</span>
              </div>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Filter by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-3 rounded-xl border text-center transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-blue-500/30 border-blue-400/50 text-white'
                      : 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/20'
                  }`}
                >
                  <Icon className="h-5 w-5 mx-auto mb-2" />
                  <div className="text-xs font-medium">{category.name}</div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Facts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFacts.map((fact, index) => (
            <div key={fact.id} className="word-card group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-lg">{getImportanceIcon(fact.importance)}</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getDifficultyColor(fact.difficulty)}`}>
                      {fact.difficulty.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  {fact.learned ? (
                    <div className="status-complete">
                      <Check className="h-4 w-4" />
                    </div>
                  ) : (
                    <button
                      onClick={() => markAsLearned(fact.id)}
                      className="status-pending hover:bg-green-500 hover:border-green-400 transition-all duration-200"
                    >
                    </button>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-200 transition-colors">
                {fact.title}
              </h3>

              <p className="text-white/90 leading-relaxed mb-4">
                {fact.description}
              </p>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {fact.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="px-2 py-1 bg-white/10 text-gray-200 text-xs rounded-full border border-white/20"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {fact.relatedTopics && fact.relatedTopics.length > 0 && (
                  <div>
                    <p className="text-white/90 text-sm mb-2">Related Topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {fact.relatedTopics.map((topic) => (
                        <span 
                          key={topic}
                          className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-lg border border-blue-400/30"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {!fact.learned && (
                <button
                  onClick={() => markAsLearned(fact.id)}
                  className="btn-success w-full mt-4"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark as Learned
                </button>
              )}
            </div>
          ))}
        </div>

        {filteredFacts.length === 0 && (
          <div className="glass-card p-8 text-center">
            <AlertCircle className="h-12 w-12 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No facts found</h3>
            <p className="text-gray-200">Try selecting a different category or refresh the page.</p>
          </div>
        )}

        {error && (
          <div className="glass-card p-6 border-red-400/30 bg-red-500/10">
            <div className="flex items-center text-red-200">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
