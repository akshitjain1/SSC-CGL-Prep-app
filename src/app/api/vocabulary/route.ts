import { NextRequest, NextResponse } from 'next/server'
import { generateVocabulary } from '@/lib/geminiClient'
import { 
  getVocabulary, 
  saveVocabulary, 
  getTodaysVocabulary, 
  generateId,
  type VocabularyWord 
} from '@/lib/storage'

export async function GET() {
  try {
    // Check if we already have today's vocabulary
    const todaysWords = getTodaysVocabulary()
    
    if (todaysWords.length > 0) {
      return NextResponse.json({ 
        success: true, 
        data: todaysWords,
        message: 'Today\'s vocabulary already generated' 
      })
    }

    // Generate new vocabulary for today
    const generatedWords = await generateVocabulary(10)
    const today = new Date().toISOString().split('T')[0]
    
    const vocabularyWords: VocabularyWord[] = generatedWords.map(word => ({
      id: generateId(),
      word: word.word || '',
      meaning: word.meaning || '',
      synonym: word.synonym || '',
      example: word.example || '',
      field: word.field || 'general',
      learned: false,
      difficult: false,
      dateAdded: today
    }))

    // Save to existing vocabulary
    const allVocabulary = getVocabulary()
    const updatedVocabulary = [...allVocabulary, ...vocabularyWords]
    saveVocabulary(updatedVocabulary)

    return NextResponse.json({ 
      success: true, 
      data: vocabularyWords,
      message: 'Vocabulary generated successfully' 
    })

  } catch (error) {
    console.error('Error in vocabulary API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate vocabulary',
        message: 'Please try again later' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wordId, updates } = body

    if (!wordId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing wordId or updates' },
        { status: 400 }
      )
    }

    const allVocabulary = getVocabulary()
    const wordIndex = allVocabulary.findIndex(word => word.id === wordId)

    if (wordIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Word not found' },
        { status: 404 }
      )
    }

    // Update the word
    allVocabulary[wordIndex] = { ...allVocabulary[wordIndex], ...updates }
    saveVocabulary(allVocabulary)

    return NextResponse.json({ 
      success: true, 
      data: allVocabulary[wordIndex],
      message: 'Word updated successfully' 
    })

  } catch (error) {
    console.error('Error updating vocabulary:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update word' },
      { status: 500 }
    )
  }
}
