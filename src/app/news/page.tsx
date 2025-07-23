'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Newspaper, 
  ExternalLink, 
  Clock, 
  Check, 
  Plus, 
  Star,
  RefreshCw,
  Target,
  Award,
  CheckCircle,
  BookOpen,
  Globe,
  Calendar,
  TrendingUp,
  Eye,
  FileText,
  Users
} from 'lucide-react'
import ProgressManager from '@/lib/progressManager'

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  url?: string
  dateAdded: string
  category: string
  priority: 'high' | 'medium' | 'low'
  readTime?: number
  isRead?: boolean
  isBookmarked?: boolean
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sessionCompleted, setSessionCompleted] = useState(false)

  const progressManager = ProgressManager.getInstance()

  useEffect(() => {
    fetchNews()
  }, [])

  useEffect(() => {
    if (news.length > 0) {
      updateDailyProgress()
    }
  }, [news])

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/news')
      const result = await response.json()
      
      if (result.success) {
        setNews(result.data)
      } else {
        setError(result.message || 'Failed to load current affairs')
      }
    } catch (err) {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  const updateNewsItem = async (newsId: string, updates: Partial<NewsItem>) => {
    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsId, updates }),
      })
      
      const result = await response.json()
      if (result.success) {
        setNews(news.map(item => 
          item.id === newsId ? { ...item, ...updates } : item
        ))
        
        if (updates.isRead === true) {
          showReadCelebration()
        }
      }
    } catch (err) {
      console.error('Error updating news item:', err)
    }
  }

  const handleMarkAsRead = (newsId: string, isRead: boolean) => {
    updateNewsItem(newsId, { isRead })
  }

  const handleBookmark = (newsId: string, isBookmarked: boolean) => {
    updateNewsItem(newsId, { isBookmarked })
  }

  const updateDailyProgress = () => {
    const readCount = news.filter(n => n.isRead).length
    const isCompleted = readCount >= Math.ceil(news.length * 0.7) // 70% completion threshold
    
    if (isCompleted && !sessionCompleted) {
      progressManager.updateTaskCompletion('news', true, { 
        score: Math.round((readCount / news.length) * 100)
      })
      setSessionCompleted(true)
    }
  }

  const showReadCelebration = () => {
    const celebration = document.createElement('div')
    celebration.innerHTML = '📰'
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

  const categories = ['all', ...Array.from(new Set(news.map(item => item.category).filter(Boolean)))]
  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(item => item.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner text-white mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Newspaper className="h-8 w-8 text-white/50" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading Current Affairs</h3>
          <p className="text-gray-200 mb-4">Fetching the latest important news...</p>
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
          <div className="text-6xl mb-6">📰</div>
          <h3 className="text-2xl font-bold text-white mb-4">News unavailable</h3>
          <p className="text-gray-200 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={fetchNews}
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

  const readCount = news.filter(n => n.isRead).length
  const bookmarkedCount = news.filter(n => n.isBookmarked).length
  const highPriorityCount = news.filter(n => n.priority === 'high').length
  const progressPercentage = Math.round((readCount / news.length) * 100)
  const targetReached = readCount >= Math.ceil(news.length * 0.7)

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
                Current Affairs
              </h1>
              <p className="text-xl text-white/90">Stay updated with important news</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center space-x-3">
              <Newspaper className="text-orange-600" size={28} />
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {readCount}/{news.length}
                </div>
                <div className="text-sm text-gray-700">Read</div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">{progressPercentage}%</div>
            <p className="text-gray-600 text-sm">Progress</p>
            <div className="progress-bar mt-2">
              <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl">👁️</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{readCount}</div>
            <p className="text-gray-600 text-sm">Articles Read</p>
            {targetReached && (
              <div className="badge-success mt-2">
                <Award className="h-3 w-3" />
                Target Reached!
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <span className="text-2xl">🔥</span>
            </div>
            <div className="text-3xl font-bold text-red-600 mb-1">{highPriorityCount}</div>
            <p className="text-gray-600 text-sm">High Priority</p>
            <div className="badge-danger mt-2">
              <Clock className="h-3 w-3" />
              Must Read
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-2xl">⭐</span>
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-1">{bookmarkedCount}</div>
            <p className="text-gray-600 text-sm">Bookmarked</p>
            <div className="badge-warning mt-2">
              <Plus className="h-3 w-3" />
              Saved
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8 slide-up">
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-white text-gray-900 shadow-md ring-2 ring-blue-300'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {category === 'all' ? 'All Categories' : (category || 'General').charAt(0).toUpperCase() + (category || 'General').slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 bounce-in">
          {filteredNews.map((item, index) => (
            <div 
              key={item.id} 
              className={`task-card relative ${
                item.isRead 
                  ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 ring-2 ring-blue-200' 
                  : item.priority === 'high'
                  ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300 ring-2 ring-red-200'
                  : 'bg-white'
              }`}
            >
              {/* Priority & Status Badges */}
              <div className="absolute -top-2 -right-2 z-10 flex space-x-1">
                {item.priority === 'high' && (
                  <div className="bg-red-500 text-white rounded-full p-2 shadow-lg">
                    <TrendingUp size={16} />
                  </div>
                )}
                {item.isRead && (
                  <div className="bg-blue-500 text-white rounded-full p-2 shadow-lg">
                    <Check size={16} />
                  </div>
                )}
                {item.isBookmarked && (
                  <div className="bg-yellow-500 text-white rounded-full p-2 shadow-lg">
                    <Star size={16} />
                  </div>
                )}
              </div>

              {/* News Header */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight flex-1">
                    {item.title}
                  </h3>
                </div>
                <div className="flex items-center space-x-2 mb-4">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${
                    item.priority === 'high' ? 'text-red-600 bg-red-100' :
                    item.priority === 'medium' ? 'text-yellow-600 bg-yellow-100' :
                    'text-green-600 bg-green-100'
                  }`}>
                    {(item.priority || 'medium').toUpperCase()} PRIORITY
                  </span>
                  <span className="text-xs font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                    {item.category || 'general'}
                  </span>
                  <span className="text-xs text-gray-600">#{index + 1}</span>
                </div>
              </div>

              {/* News Content */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-semibold text-gray-700 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Summary
                  </p>
                  <p className={`text-gray-800 leading-relaxed ${
                    expandedId === item.id ? '' : 'line-clamp-3'
                  }`}>
                    {item.summary}
                  </p>
                  {item.summary.length > 200 && (
                    <button
                      onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {expandedId === item.id ? 'Show Less' : 'Read More'}
                    </button>
                  )}
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-700 flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      Source
                    </p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(item.dateAdded).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-blue-800 font-medium">{item.source}</p>
                    {item.readTime && (
                      <div className="flex items-center text-sm text-blue-700">
                        <Clock className="h-4 w-4 mr-1" />
                        {item.readTime} min read
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t-2 border-gray-100">
                  <button
                    onClick={() => handleMarkAsRead(item.id, !item.isRead)}
                    className={`flex-1 p-3 rounded-xl font-medium transition-all duration-200 ${
                      item.isRead
                        ? 'bg-blue-500 text-white ring-2 ring-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Eye size={16} />
                      <span>{item.isRead ? 'Read' : 'Mark as Read'}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleBookmark(item.id, !item.isBookmarked)}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      item.isBookmarked
                        ? 'bg-yellow-500 text-white ring-2 ring-yellow-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700'
                    }`}
                  >
                    <Star size={16} />
                  </button>

                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200"
                    >
                      <ExternalLink size={16} />
                    </a>
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
            'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300' : 
            'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'
          }`}>
            {targetReached ? (
              <>
                <div className="text-6xl mb-4">📺</div>
                <h3 className="text-3xl font-bold text-blue-800 mb-4">
                  Well Informed!
                </h3>
                <p className="text-blue-700 mb-6 text-lg">
                  Excellent! You've read {readCount} out of {news.length} news articles. 
                  You've reached the 70% target and stayed updated with current affairs! 📰
                </p>
                <div className="bg-blue-100 rounded-xl p-6 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-800">{readCount}</div>
                      <div className="text-sm text-blue-700">Articles Read</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-800">{bookmarkedCount}</div>
                      <div className="text-sm text-blue-700">Bookmarked</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-800">{progressPercentage}%</div>
                      <div className="text-sm text-blue-700">Completion</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-4xl mb-4">📰</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Keep Reading!
                </h3>
                <p className="text-gray-700 mb-6 text-lg">
                  You've read {readCount} out of {news.length} articles. 
                  Read {Math.ceil(news.length * 0.7) - readCount} more to complete today's current affairs session!
                </p>
                <div className="bg-orange-100 rounded-xl p-4 mb-6">
                  <p className="text-orange-800 font-medium">🎯 Target: {Math.ceil(news.length * 0.7)} articles (70% completion)</p>
                  <div className="progress-bar mt-3">
                    <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
                  </div>
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/practice" className="btn-primary">
                <Users className="h-4 w-4" />
                Continue to Writing Practice
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
