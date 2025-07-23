import { NextRequest, NextResponse } from 'next/server'
import { generateIdioms } from '@/lib/geminiClient'
import { 
  getIdioms, 
  saveIdioms, 
  getTodaysIdioms, 
  generateId,
  type Idiom 
} from '@/lib/storage'

export async function GET() {
  try {
    // Check if we already have today's idioms
    const todaysIdioms = getTodaysIdioms()
    
    if (todaysIdioms.length > 0) {
      return NextResponse.json({ 
        success: true, 
        data: todaysIdioms,
        message: 'Today\'s idioms already generated' 
      })
    }

    // Generate new idioms for today
    const generatedIdioms = await generateIdioms(5)
    const today = new Date().toISOString().split('T')[0]
    
    const idioms: Idiom[] = generatedIdioms.map(idiom => ({
      id: generateId(),
      idiom: idiom.idiom || '',
      meaning: idiom.meaning || '',
      example: idiom.example || '',
      context: idiom.context || 'general',
      practiced: false,
      dateAdded: today
    }))

    // Save to existing idioms
    const allIdioms = getIdioms()
    const updatedIdioms = [...allIdioms, ...idioms]
    saveIdioms(updatedIdioms)

    return NextResponse.json({ 
      success: true, 
      data: idioms,
      message: 'Idioms generated successfully' 
    })

  } catch (error) {
    console.error('Error in idioms API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate idioms',
        message: 'Please try again later' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idiomId, updates } = body

    if (!idiomId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing idiomId or updates' },
        { status: 400 }
      )
    }

    const allIdioms = getIdioms()
    const idiomIndex = allIdioms.findIndex(idiom => idiom.id === idiomId)

    if (idiomIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Idiom not found' },
        { status: 404 }
      )
    }

    // Update the idiom
    allIdioms[idiomIndex] = { ...allIdioms[idiomIndex], ...updates }
    saveIdioms(allIdioms)

    return NextResponse.json({ 
      success: true, 
      data: allIdioms[idiomIndex],
      message: 'Idiom updated successfully' 
    })

  } catch (error) {
    console.error('Error updating idiom:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update idiom' },
      { status: 500 }
    )
  }
}
