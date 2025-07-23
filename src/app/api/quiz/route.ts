import { NextRequest, NextResponse } from 'next/server'
import { generateGKQuestions } from '@/lib/geminiClient'
import { 
  getGKQuestions, 
  saveGKQuestions, 
  getTodaysGKQuestions, 
  generateId,
  type GKQuestion 
} from '@/lib/storage'

export async function GET() {
  try {
    // Check if we already have today's GK questions
    const todaysQuestions = getTodaysGKQuestions()
    
    if (todaysQuestions.length > 0) {
      return NextResponse.json({ 
        success: true, 
        data: todaysQuestions,
        message: 'Today\'s GK questions already generated' 
      })
    }

    // Generate new GK questions for today
    const generatedQuestions = await generateGKQuestions(5)
    const today = new Date().toISOString().split('T')[0]
    
    const gkQuestions: GKQuestion[] = generatedQuestions.map(question => ({
      id: generateId(),
      question: question.question || '',
      options: question.options || [],
      correct: question.correct || 'A',
      explanation: question.explanation || '',
      topic: question.topic || 'General Knowledge',
      dateAdded: today
    }))

    // Save to existing questions
    const allQuestions = getGKQuestions()
    const updatedQuestions = [...allQuestions, ...gkQuestions]
    saveGKQuestions(updatedQuestions)

    return NextResponse.json({ 
      success: true, 
      data: gkQuestions,
      message: 'GK questions generated successfully' 
    })

  } catch (error) {
    console.error('Error in GK questions API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate GK questions',
        message: 'Please try again later' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { questionId, userAnswer } = body

    if (!questionId || !userAnswer) {
      return NextResponse.json(
        { success: false, error: 'Missing questionId or userAnswer' },
        { status: 400 }
      )
    }

    const allQuestions = getGKQuestions()
    const questionIndex = allQuestions.findIndex(q => q.id === questionId)

    if (questionIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Question not found' },
        { status: 404 }
      )
    }

    // Update the question with user's answer
    const isCorrect = allQuestions[questionIndex].correct === userAnswer
    allQuestions[questionIndex] = { 
      ...allQuestions[questionIndex], 
      userAnswer,
      answeredCorrectly: isCorrect
    }
    saveGKQuestions(allQuestions)

    return NextResponse.json({ 
      success: true, 
      data: {
        correct: isCorrect,
        correctAnswer: allQuestions[questionIndex].correct,
        explanation: allQuestions[questionIndex].explanation
      },
      message: isCorrect ? 'Correct answer!' : 'Incorrect answer' 
    })

  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}
