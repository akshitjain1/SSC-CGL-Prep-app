import { NextRequest, NextResponse } from 'next/server'
import { evaluatePractice } from '@/lib/geminiClient'
import { 
  getPracticeSessions, 
  savePracticeSessions, 
  generateId,
  type PracticeSession 
} from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userSentence, targetWord, type } = body

    if (!userSentence || !targetWord || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: userSentence, targetWord, type' },
        { status: 400 }
      )
    }

    // Evaluate the practice using Gemini AI
    const evaluation = await evaluatePractice(userSentence, targetWord)
    
    // Create practice session record
    const practiceSession: PracticeSession = {
      id: generateId(),
      type: type as 'vocabulary' | 'idiom',
      targetWord,
      userSentence,
      evaluation,
      score: evaluation.score || 5,
      date: new Date().toISOString()
    }

    // Save the practice session
    const allSessions = getPracticeSessions()
    const updatedSessions = [...allSessions, practiceSession]
    savePracticeSessions(updatedSessions)

    return NextResponse.json({ 
      success: true, 
      data: {
        evaluation,
        sessionId: practiceSession.id
      },
      message: 'Practice evaluated successfully' 
    })

  } catch (error) {
    console.error('Error in practice evaluation API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to evaluate practice',
        message: 'Please try again later' 
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const allSessions = getPracticeSessions()
    
    // Get today's sessions
    const today = new Date().toISOString().split('T')[0]
    const todaySessions = allSessions.filter(session => 
      session.date.startsWith(today)
    )

    return NextResponse.json({ 
      success: true, 
      data: {
        todaySessions,
        totalSessions: allSessions.length,
        averageScore: allSessions.length > 0 
          ? allSessions.reduce((sum, session) => sum + session.score, 0) / allSessions.length 
          : 0
      },
      message: 'Practice sessions retrieved successfully' 
    })

  } catch (error) {
    console.error('Error retrieving practice sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve practice sessions' },
      { status: 500 }
    )
  }
}
