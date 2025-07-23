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
  weeklyGoal: number
  monthlyProgress: number
}

interface CompletionEvent {
  type: 'vocabulary' | 'idioms' | 'news' | 'practice'
  date: string
  score?: number
  wordsLearned?: number
  factsLearned?: number
  timeSpent?: number
}

class ProgressManager {
  private static instance: ProgressManager
  
  static getInstance(): ProgressManager {
    if (!ProgressManager.instance) {
      ProgressManager.instance = new ProgressManager()
    }
    return ProgressManager.instance
  }

  // Get today's progress
  getTodayProgress(): DailyProgress {
    const today = new Date().toISOString().split('T')[0]
    const saved = localStorage.getItem(`progress-${today}`)
    
    if (saved) {
      return JSON.parse(saved)
    }
    
    return {
      vocabulary: false,
      idioms: false,
      news: false,
      practice: false,
      date: today
    }
  }

  // Update specific task completion
  updateTaskCompletion(
    task: keyof Omit<DailyProgress, 'date' | 'completedAt'>, 
    completed: boolean = true,
    additionalData?: { score?: number; wordsLearned?: number }
  ): void {
    const today = new Date().toISOString().split('T')[0]
    const progress = this.getTodayProgress()
    
    progress[task] = completed
    progress.completedAt = new Date().toISOString()
    
    // Save progress
    localStorage.setItem(`progress-${today}`, JSON.stringify(progress))
    
    // Update user stats
    this.updateUserStats(task, additionalData)
    
    // Trigger progress update event
    window.dispatchEvent(new CustomEvent('progress-updated', { 
      detail: { task, completed, progress } 
    }))
    
    // Check if all tasks completed for streak calculation
    this.checkDailyCompletion(progress)
  }

  // Get user statistics
  getUserStats(): UserStats {
    const saved = localStorage.getItem('user-stats')
    if (saved) {
      return JSON.parse(saved)
    }
    
    return {
      totalWords: 0,
      streakDays: 0,
      lastActive: new Date().toISOString(),
      weeklyGoal: 28, // 4 tasks × 7 days
      monthlyProgress: 0
    }
  }

  // Update user statistics
  private updateUserStats(
    task: keyof Omit<DailyProgress, 'date' | 'completedAt'>,
    additionalData?: { score?: number; wordsLearned?: number }
  ): void {
    const stats = this.getUserStats()
    
    // Update last active
    stats.lastActive = new Date().toISOString()
    
    // Update specific stats based on task
    if (task === 'vocabulary' && additionalData?.wordsLearned) {
      stats.totalWords += additionalData.wordsLearned
    }
    
    // Recalculate streak
    stats.streakDays = this.calculateStreak()
    stats.monthlyProgress = this.calculateMonthlyProgress()
    
    localStorage.setItem('user-stats', JSON.stringify(stats))
  }

  // Calculate current streak
  calculateStreak(): number {
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const dayProgress = localStorage.getItem(`progress-${dateStr}`)
      if (dayProgress) {
        const progress = JSON.parse(dayProgress)
        const completedCount = Object.values(progress).filter(val => val === true).length
        
        if (completedCount >= 4) { // At least 4 out of 5 tasks
          streak++
        } else if (i > 0) { // Don't break on today if incomplete
          break
        }
      } else if (i > 0) {
        break
      }
    }
    
    return streak
  }

  // Calculate monthly progress percentage
  calculateMonthlyProgress(): number {
    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const today = new Date()
    
    let totalDays = 0
    let completedDays = 0
    
    for (let d = new Date(firstDay); d <= today; d.setDate(d.getDate() + 1)) {
      totalDays++
      const dateStr = d.toISOString().split('T')[0]
      const dayProgress = localStorage.getItem(`progress-${dateStr}`)
      
      if (dayProgress) {
        const progress = JSON.parse(dayProgress)
        const completedCount = Object.values(progress).filter(val => val === true).length
        if (completedCount >= 4) {
          completedDays++
        }
      }
    }
    
    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
  }

  // Check if daily completion achieved
  private checkDailyCompletion(progress: DailyProgress): void {
    const completedCount = Object.values(progress).filter(val => val === true).length
    
    if (completedCount === 5) {
      // All tasks completed - trigger celebration
      setTimeout(() => {
        this.showCelebration()
      }, 500)
    }
  }

  // Show celebration animation
  private showCelebration(): void {
    const celebration = document.createElement('div')
    celebration.innerHTML = '🎉✨🎊'
    celebration.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 4rem;
      z-index: 9999;
      pointer-events: none;
      animation: celebrationBounce 2s ease-out forwards;
    `
    
    document.body.appendChild(celebration)
    setTimeout(() => {
      if (document.body.contains(celebration)) {
        document.body.removeChild(celebration)
      }
    }, 2000)
  }

  // Get progress history for analytics
  getProgressHistory(days: number = 30): Array<{date: string, completed: number, total: number}> {
    const history = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      const dayProgress = localStorage.getItem(`progress-${dateStr}`)
      let completed = 0
      
      if (dayProgress) {
        const progress = JSON.parse(dayProgress)
        completed = Object.values(progress).filter(val => val === true).length
      }
      
      history.push({
        date: dateStr,
        completed,
        total: 5
      })
    }
    
    return history
  }

  // Reset progress (for testing)
  resetProgress(): void {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith('progress-') || key === 'user-stats'
    )
    keys.forEach(key => localStorage.removeItem(key))
    
    window.dispatchEvent(new CustomEvent('progress-updated'))
  }

  // Export progress data
  exportProgress(): string {
    const data = {
      userStats: this.getUserStats(),
      todayProgress: this.getTodayProgress(),
      progressHistory: this.getProgressHistory(90)
    }
    
    return JSON.stringify(data, null, 2)
  }
}

export default ProgressManager
export type { DailyProgress, UserStats, CompletionEvent }
