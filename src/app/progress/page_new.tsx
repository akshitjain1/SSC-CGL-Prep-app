'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar, 
  Target, 
  BookOpen, 
  Brain, 
  Newspaper, 
  User,
  Award,
  Clock,
  Star,
  Zap,
  Trophy,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart,
  RefreshCw,
  Download,
  Share2,
  Settings
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts'
import ProgressManager from '@/lib/progressManager'

interface DailyProgress {
  date: string
  vocabulary: boolean
  idioms: boolean
  news: boolean
  quiz: boolean
  practice: boolean
  score?: number
  completedTasks?: number
  timeSpent?: number
}

interface WeeklyStats {
  week: string
  totalTasks: number
  avgScore: number
  streak: number
}

export default function ProgressPage() {
  const [progressData, setProgressData] = useState<DailyProgress[]>([])
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'all'>('week')
  
  const progressManager = ProgressManager.getInstance()

  useEffect(() => {
    loadProgressData()
  }, [selectedTimeRange])

  const loadProgressData = () => {
    try {
      setLoading(true)
      
      const userStats = progressManager.getUserStats()
      
      // Generate simplified progress data for demo
      const days = selectedTimeRange === 'week' ? 7 : selectedTimeRange === 'month' ? 30 : 90
      const data = []
      const today = new Date()
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateString = date.toISOString().split('T')[0]
        
        // Get saved progress from localStorage (fallback to demo data)
        const savedProgress = localStorage.getItem(`progress-${dateString}`)
        const progress = savedProgress ? JSON.parse(savedProgress) : {}
        
        const completedTasks = [
          progress.vocabulary,
          progress.idioms, 
          progress.news,
          progress.quiz,
          progress.practice
        ].filter(Boolean).length
        
        const avgScore = Math.floor(Math.random() * 30) + 70 // Demo score
        
        data.push({
          date: dateString,
          vocabulary: progress.vocabulary || false,
          idioms: progress.idioms || false,
          news: progress.news || false,
          quiz: progress.quiz || false,
          practice: progress.practice || false,
          score: avgScore,
          completedTasks,
          timeSpent: Math.floor(Math.random() * 60) + 30 // Demo time
        })
      }
      
      setProgressData(data)
      
      // Generate weekly stats
      if (selectedTimeRange !== 'week') {
        const weeklyData = []
        for (let i = 0; i < Math.floor(days / 7); i++) {
          const weekStart = days - (i + 1) * 7
          const weekEnd = days - i * 7
          const weekData = data.slice(weekStart, weekEnd)
          
          weeklyData.unshift({
            week: `Week ${i + 1}`,
            totalTasks: weekData.reduce((sum, day) => sum + (day.completedTasks || 0), 0),
            avgScore: Math.round(weekData.reduce((sum, day) => sum + (day.score || 0), 0) / weekData.length),
            streak: Math.floor(Math.random() * 7) + 1 // Demo streak
          })
        }
        setWeeklyStats(weeklyData)
      }
      
    } catch (error) {
      console.error('Error loading progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportProgress = () => {
    const dataStr = JSON.stringify(progressData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ssc-progress-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="loading-spinner text-white mx-auto mb-4"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-white/50" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Loading Progress Analytics</h3>
          <p className="text-white/80 mb-4">Analyzing your learning journey...</p>
          <div className="loading-dots justify-center">
            <div className="loading-dot bg-white/60"></div>
            <div className="loading-dot bg-white/60" style={{animationDelay: '0.1s'}}></div>
            <div className="loading-dot bg-white/60" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      </div>
    )
  }

  const userStats = progressManager.getUserStats()
  const totalTasks = progressData.reduce((sum, day) => sum + (day.completedTasks || 0), 0)
  const avgScore = Math.round(progressData.reduce((sum, day) => sum + (day.score || 0), 0) / progressData.length)
  const totalTimeSpent = progressData.reduce((sum, day) => sum + (day.timeSpent || 0), 0)
  const currentStreak = 5 // Demo streak value
  
  // Task completion rates
  const taskStats = [
    { name: 'Vocabulary', completed: progressData.filter(d => d.vocabulary).length, color: '#3B82F6' },
    { name: 'Idioms', completed: progressData.filter(d => d.idioms).length, color: '#8B5CF6' },
    { name: 'Current Affairs', completed: progressData.filter(d => d.news).length, color: '#F59E0B' },
    { name: 'Quiz', completed: progressData.filter(d => d.quiz).length, color: '#10B981' },
    { name: 'Practice', completed: progressData.filter(d => d.practice).length, color: '#EF4444' }
  ]

  const COLORS = ['#3B82F6', '#8B5CF6', '#F59E0B', '#10B981', '#EF4444']

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
                Progress Analytics
              </h1>
              <p className="text-xl text-white/90">Track your learning journey</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={exportProgress}
              className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 text-white"
              title="Export Progress"
            >
              <Download className="h-6 w-6" />
            </button>
            <button 
              onClick={loadProgressData}
              className="p-3 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-200 text-white"
              title="Refresh Data"
            >
              <RefreshCw className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex space-x-3 mb-8 slide-up">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setSelectedTimeRange(range)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                selectedTimeRange === range
                  ? 'bg-white text-gray-900 shadow-md ring-2 ring-blue-300'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {range === 'week' ? 'Last 7 Days' : range === 'month' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 slide-up">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">{currentStreak}</div>
            <p className="text-gray-600 text-sm">Day Streak</p>
            <div className="badge-success mt-2">
              <Zap className="h-3 w-3" />
              {currentStreak > 3 ? 'On Fire!' : 'Keep Going!'}
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-2xl">✅</span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">{totalTasks}</div>
            <p className="text-gray-600 text-sm">Tasks Completed</p>
            <div className="badge-info mt-2">
              <Activity className="h-3 w-3" />
              {selectedTimeRange === 'week' ? 'This Week' : selectedTimeRange === 'month' ? 'This Month' : 'Last 90 Days'}
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">{avgScore}%</div>
            <p className="text-gray-600 text-sm">Average Score</p>
            <div className={`mt-2 ${avgScore >= 80 ? 'badge-success' : avgScore >= 60 ? 'badge-warning' : 'badge-danger'}`}>
              <Star className="h-3 w-3" />
              {avgScore >= 80 ? 'Excellent' : avgScore >= 60 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <span className="text-2xl">⏰</span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {Math.round(totalTimeSpent / 60)}h
            </div>
            <p className="text-gray-600 text-sm">Time Spent</p>
            <div className="badge-info mt-2">
              <Clock className="h-3 w-3" />
              {Math.round(totalTimeSpent / progressData.length)}m per day
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 bounce-in">
          {/* Daily Progress Chart */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Daily Progress
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Completed Tasks</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [value, 'Tasks Completed']}
                />
                <Bar dataKey="completedTasks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Trend Chart */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2" />
                Score Trends
              </h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Average Score</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [`${value}%`, 'Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Completion Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 bounce-in">
          {/* Task Completion Pie Chart */}
          <div className="glass-card lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Task Completion Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPieChart>
                  <Tooltip formatter={(value, name) => [`${value} days`, name]} />
                  <Pie
                    data={taskStats}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="completed"
                    nameKey="name"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {taskStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </RechartsPieChart>
              </ResponsiveContainer>
              
              <div className="space-y-4">
                {taskStats.map((task, index) => (
                  <div key={task.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: task.color }}
                      ></div>
                      <span className="font-medium text-gray-700">{task.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{task.completed}</div>
                      <div className="text-sm text-gray-500">
                        {Math.round((task.completed / progressData.length) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Achievements Panel */}
          <div className="glass-card">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Award className="h-5 w-5 mr-2" />
              Achievements
            </h3>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Trophy className="h-6 w-6 text-yellow-600" />
                  <span className="font-bold text-yellow-800">Streak Master</span>
                </div>
                <p className="text-sm text-yellow-700">
                  {currentStreak} day learning streak
                </p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Star className="h-6 w-6 text-blue-600" />
                  <span className="font-bold text-blue-800">High Performer</span>
                </div>
                <p className="text-sm text-blue-700">
                  {avgScore}% average score
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center space-x-3 mb-2">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <span className="font-bold text-green-800">Task Completer</span>
                </div>
                <p className="text-sm text-green-700">
                  {totalTasks} tasks completed
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="h-6 w-6 text-purple-600" />
                  <span className="font-bold text-purple-800">Time Investor</span>
                </div>
                <p className="text-sm text-purple-700">
                  {Math.round(totalTimeSpent / 60)} hours invested
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Performance (for month/all view) */}
        {selectedTimeRange !== 'week' && weeklyStats.length > 0 && (
          <div className="glass-card mb-8 bounce-in">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Weekly Performance Overview
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalTasks" fill="#3B82F6" name="Total Tasks" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgScore" fill="#8B5CF6" name="Avg Score %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Action Buttons */}
        <div className="text-center slide-up">
          <div className="hero-card max-w-2xl mx-auto">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Keep Up the Great Work!
            </h3>
            <p className="text-gray-700 mb-6 text-lg">
              Your consistent effort is paying off. Continue your learning journey to achieve even greater heights!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/" className="btn-primary">
                <BookOpen className="h-4 w-4" />
                Continue Learning
              </Link>
              <Link href="/practice" className="btn-secondary">
                <Target className="h-4 w-4" />
                More Practice
              </Link>
              <button 
                onClick={exportProgress}
                className="btn-secondary"
              >
                <Download className="h-4 w-4" />
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
