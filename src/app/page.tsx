'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpen, 
  Brain, 
  Newspaper, 
  Target, 
  TrendingUp, 
  PenTool,
  Calendar,
  Award,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react'

interface DailyProgress {
  vocabulary: boolean
  idioms: boolean
  news: boolean
  practice: boolean
  date: string
  completedAt?: string
}

interface UserStats {
  totalWords: number
  streakDays: number
  lastActive: string
}

export default function Dashboard() {
  const [progress, setProgress] = useState<DailyProgress>({
    vocabulary: false,
    idioms: false,
    news: false,
    practice: false,
    date: new Date().toISOString().split('T')[0]
  })

  const [stats, setStats] = useState<UserStats>({
    totalWords: 0,
    streakDays: 0,
    lastActive: ''
  })

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUserData()
    
    // Listen for progress updates from other pages
    const handleStorageChange = () => {
      loadUserData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('progress-updated', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('progress-updated', handleStorageChange)
    }
  }, [])

  const loadUserData = () => {
    try {
      // Load today's progress
      const today = new Date().toISOString().split('T')[0]
      const savedProgress = localStorage.getItem(`progress-${today}`)
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress))
      }

      // Load user stats
      const savedStats = localStorage.getItem('user-stats')
      if (savedStats) {
        setStats(JSON.parse(savedStats))
      }

      // Calculate streak
      calculateStreak()
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStreak = () => {
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const dayProgress = localStorage.getItem(`progress-${dateStr}`)
      if (dayProgress) {
        const progress = JSON.parse(dayProgress)
        const completed = Object.values(progress).filter(Boolean).length - 1 // -1 for date field
        if (completed >= 4) { // At least 4 out of 5 tasks
          streak++
        } else if (i > 0) { // Don't break on today if incomplete
          break
        }
      } else if (i > 0) {
        break
      }
    }
    
    setStats(prev => ({ ...prev, streakDays: streak }))
  }

  const completedTasks = Object.values(progress).filter(val => val === true).length
  const totalTasks = 4
  const completionPercentage = Math.round((completedTasks / totalTasks) * 100)

  const studyPlanItems = [
    {
      id: 'vocabulary',
      title: 'Daily Vocabulary',
      description: '10 advanced words with examples & practice',
      icon: BookOpen,
      href: '/vocabulary',
      completed: progress.vocabulary,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      estimatedTime: '15 min'
    },
    {
      id: 'idioms',
      title: 'Idioms & Phrases',
      description: '5 common idioms with usage examples',
      icon: Brain,
      href: '/idioms',
      completed: progress.idioms,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      estimatedTime: '10 min'
    },
    {
      id: 'news',
      title: 'Current Affairs',
      description: 'Latest news summarized for GK preparation',
      icon: Newspaper,
      href: '/news',
      completed: progress.news,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      estimatedTime: '12 min'
    },
    {
      id: 'practice',
      title: 'Daily GK Facts',
      description: '10 important GK facts to boost your knowledge',
      icon: Brain,
      href: '/daily-gk',
      completed: progress.practice,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      estimatedTime: '10 min'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner text-white mb-4"></div>
          <p className="text-gray-200">Loading your learning dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
            SSC CGL Preparation Hub
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Master your SSC CGL preparation with AI-powered daily study sessions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 slide-up">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl">�</span>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{completedTasks}/{totalTasks}</div>
            <p className="text-gray-600 text-sm">Today's Progress</p>
            <div className="progress-bar mt-3">
              <div 
                className="progress-fill" 
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl">🔥</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">{stats.streakDays}</div>
            <p className="text-gray-600 text-sm">Day Streak</p>
            {stats.streakDays > 0 && (
              <div className="badge-warning mt-2">
                <Zap className="h-3 w-3" />
                {stats.streakDays >= 7 ? 'On Fire!' : 'Building up!'}
              </div>
            )}
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl">�</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{stats.totalWords}</div>
            <p className="text-gray-600 text-sm">Words Learned</p>
            <div className="badge-success mt-2">
              <CheckCircle className="h-3 w-3" />
              Vocabulary Growing
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl">🧠</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">{stats.totalWords}</div>
            <p className="text-gray-600 text-sm">Total Learning</p>
            <Link href="/progress" className="badge-info mt-2">
              <TrendingUp className="h-3 w-3" />
              View Analytics
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Today's Study Plan */}
          <div className="lg:col-span-2">
            <div className="hero-card bounce-in">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Today's Study Plan</h2>
                  <p className="text-gray-600">Complete all 4 sections to maintain your streak</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-700 mb-1">Estimated Time</div>
                  <div className="font-semibold text-gray-800">~47 minutes</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {studyPlanItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="task-card"
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {item.title}
                            </h3>
                            {item.completed ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className={`text-xs px-2 py-1 rounded-full ${item.bgColor} ${item.textColor} font-medium`}>
                              {item.estimatedTime}
                            </div>
                            {item.completed ? (
                              <div className="badge-success">
                                <CheckCircle className="h-3 w-3" />
                                Complete
                              </div>
                            ) : (
                              <div className="badge-info">
                                <AlertCircle className="h-3 w-3" />
                                Ready
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Motivation Card */}
            <div className="hero-card text-center">
              <div className="text-4xl mb-4">
                {completedTasks === totalTasks ? '🎉' : 
                 completedTasks >= 3 ? '💪' : 
                 completedTasks >= 1 ? '🌟' : '🚀'}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {completedTasks === totalTasks ? 'Perfect Day!' : 
                 completedTasks >= 3 ? 'Almost There!' : 
                 completedTasks >= 1 ? 'Great Start!' : 'Ready to Begin?'}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {completedTasks === totalTasks ? 
                  'You\'ve completed all tasks today! Amazing consistency.' :
                  `${totalTasks - completedTasks} more sections to complete your daily goal.`
                }
              </p>
              {completedTasks === totalTasks ? (
                <Link href="/progress" className="btn-success">
                  <Award className="h-4 w-4" />
                  View Progress
                </Link>
              ) : (
                <Link 
                  href={studyPlanItems.find(item => !item.completed)?.href || '/vocabulary'} 
                  className="btn-primary"
                >
                  <Zap className="h-4 w-4" />
                  Continue Learning
                </Link>
              )}
            </div>

            {/* Quick Actions */}
            <div className="hero-card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/vocabulary" className="btn-secondary w-full justify-start">
                  <BookOpen className="h-4 w-4" />
                  Daily Vocabulary
                </Link>
                <Link href="/daily-gk" className="btn-secondary w-full justify-start">
                  <Brain className="h-4 w-4" />
                  Daily GK Facts
                </Link>
                <Link href="/progress" className="btn-secondary w-full justify-start">
                  <TrendingUp className="h-4 w-4" />
                  View Analytics
                </Link>
              </div>
            </div>

            {/* Achievement Badge */}
            {stats.streakDays >= 7 && (
              <div className="hero-card text-center bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="text-lg font-bold text-orange-800 mb-1">Week Warrior!</h3>
                <p className="text-orange-700 text-sm">
                  {stats.streakDays} days of consistent learning!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Progress Summary */}
        {completedTasks > 0 && (
          <div className="hero-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 slide-up">
            <div className="text-center">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Today's Achievements</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {studyPlanItems.map((item) => (
                  <div key={item.id} className="text-center">
                    <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-medium text-gray-700">{item.title}</p>
                    {item.completed && <CheckCircle className="h-4 w-4 text-green-500 mx-auto mt-1" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
