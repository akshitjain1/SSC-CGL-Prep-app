import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { 
  getGKFacts, 
  saveGKFacts, 
  getTodaysGKFacts, 
  addGKFacts,
  generateId,
  getTodayString,
  type GKFact 
} from '@/lib/serverless-storage'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export async function GET(request: NextRequest) {
  try {
    // Check if we already have today's GK facts
    const todaysFacts = getTodaysGKFacts()
    
    if (todaysFacts.length > 0) {
      return NextResponse.json({ 
        success: true, 
        data: todaysFacts,
        message: 'Today\'s GK facts already generated' 
      })
    }

    // Generate new GK facts for today
    const newFacts = await generateDailyGKFacts()
    
    // Add to storage
    addGKFacts(newFacts)

    return NextResponse.json({ 
      success: true, 
      data: newFacts,
      message: 'Daily GK facts generated successfully' 
    })

  } catch (error) {
    console.error('Error generating daily GK facts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate daily GK facts',
        message: 'Please try again later' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { factId, updates } = body

    if (!factId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Missing factId or updates' },
        { status: 400 }
      )
    }

    const allFacts = getGKFacts()
    const factIndex = allFacts.findIndex(fact => fact.id === factId)

    if (factIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Fact not found' },
        { status: 404 }
      )
    }

    // Update the fact
    allFacts[factIndex] = { ...allFacts[factIndex], ...updates }
    saveGKFacts(allFacts)

    return NextResponse.json({ 
      success: true, 
      data: allFacts[factIndex],
      message: 'Fact updated successfully' 
    })

  } catch (error) {
    console.error('Error updating GK fact:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update fact' },
      { status: 500 }
    )
  }
}

async function generateDailyGKFacts(): Promise<GKFact[]> {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
  
  const prompt = `Generate 8 important and current General Knowledge facts for SSC CGL preparation. 
  Focus on recent developments, current affairs, and important static GK.
  
  Categories to cover:
  - Current Affairs (recent events, awards, appointments)
  - Indian History & Culture
  - Geography (India & World)
  - Science & Technology
  - Economy & Finance
  - Polity & Governance
  - Environment & Ecology
  - Sports & Entertainment

  For each fact, provide:
  - A clear, concise title
  - Detailed description (2-3 sentences)
  - Category
  - Importance level (high/medium/low)
  - Difficulty level (easy/medium/hard)
  - 2-3 relevant tags
  - Related topics (optional)

  Return only a JSON array with this exact structure:
  [
    {
      "title": "Title of the fact",
      "description": "Detailed explanation of the fact",
      "category": "Category name",
      "importance": "high/medium/low",
      "difficulty": "easy/medium/hard",
      "tags": ["tag1", "tag2", "tag3"],
      "relatedTopics": ["topic1", "topic2"]
    }
  ]`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Clean the response to extract JSON
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Invalid response format')
    }
    
    const generatedFacts = JSON.parse(jsonMatch[0])
    const today = getTodayString()
    
    return generatedFacts.map((fact: any) => ({
      id: generateId(),
      title: fact.title || 'General Knowledge Fact',
      description: fact.description || 'Important information for competitive exams.',
      category: fact.category || 'General',
      importance: fact.importance || 'medium',
      difficulty: fact.difficulty || 'medium',
      tags: fact.tags || ['general'],
      relatedTopics: fact.relatedTopics || [],
      source: 'AI Generated',
      learned: false,
      dateAdded: today
    }))
  } catch (error) {
    console.error('Error generating GK facts:', error)
    
    // Fallback data if AI fails
    const today = getTodayString()
    return [
      {
        id: generateId(),
        title: "Supreme Court of India",
        description: "The Supreme Court of India is the highest judicial authority in the country, established on January 26, 1950. It has 34 judges including the Chief Justice of India.",
        category: "Polity & Governance",
        importance: "high" as const,
        difficulty: "medium" as const,
        tags: ["judiciary", "constitution", "governance"],
        relatedTopics: ["Constitutional Law", "Indian Judiciary"],
        source: "Static GK",
        learned: false,
        dateAdded: today
      },
      {
        id: generateId(),
        title: "Green Revolution in India",
        description: "The Green Revolution was a period of agricultural transformation in India during the 1960s-70s, led by scientist M.S. Swaminathan, which significantly increased food grain production.",
        category: "Economy & Agriculture",
        importance: "high" as const,
        difficulty: "medium" as const,
        tags: ["agriculture", "economy", "history"],
        relatedTopics: ["Agricultural Development", "Food Security"],
        source: "Static GK",
        learned: false,
        dateAdded: today
      }
    ]
  }
}
