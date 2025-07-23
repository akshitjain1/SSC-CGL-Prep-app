import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { promises as fs } from 'fs'
import path from 'path'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

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

export async function GET(request: NextRequest) {
  try {
    const factsPath = path.join(process.cwd(), 'data', 'daily-gk.json')
    
    // Try to read existing facts
    let existingFacts: GKFact[] = []
    try {
      const factsData = await fs.readFile(factsPath, 'utf-8')
      existingFacts = JSON.parse(factsData)
    } catch (error) {
      // File doesn't exist or is empty, will generate new facts
    }

    // Check if we need to generate new facts (daily refresh)
    const today = new Date().toDateString()
    const shouldGenerate = existingFacts.length === 0 || 
      !existingFacts.some(fact => new Date(fact.dateAdded).toDateString() === today)

    if (shouldGenerate) {
      const newFacts = await generateDailyGKFacts()
      
      // Save the new facts
      try {
        await fs.mkdir(path.dirname(factsPath), { recursive: true })
        await fs.writeFile(factsPath, JSON.stringify(newFacts, null, 2))
        existingFacts = newFacts
      } catch (error) {
        console.error('Error saving facts:', error)
        // Return generated facts even if saving fails
        existingFacts = newFacts
      }
    }

    return NextResponse.json({ facts: existingFacts })

  } catch (error) {
    console.error('Error in daily-gk API:', error)
    return NextResponse.json(
      { error: 'Failed to load daily GK facts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { factId, action } = await request.json()

    if (action === 'mark_learned') {
      const factsPath = path.join(process.cwd(), 'data', 'daily-gk.json')
      
      try {
        const factsData = await fs.readFile(factsPath, 'utf-8')
        const facts: GKFact[] = JSON.parse(factsData)
        
        const updatedFacts = facts.map(fact => 
          fact.id === factId ? { ...fact, learned: true } : fact
        )
        
        await fs.writeFile(factsPath, JSON.stringify(updatedFacts, null, 2))
        
        return NextResponse.json({ success: true })
      } catch (error) {
        console.error('Error updating fact:', error)
        return NextResponse.json({ success: true }) // Return success even if file update fails
      }
    }

    return NextResponse.json({ success: false, error: 'Invalid action' })

  } catch (error) {
    console.error('Error in daily-gk POST:', error)
    return NextResponse.json(
      { error: 'Failed to update fact' },
      { status: 500 }
    )
  }
}

async function generateDailyGKFacts(): Promise<GKFact[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Generate 10 important General Knowledge facts for SSC CGL preparation. 
Cover these categories: History, Geography, Science, Polity, Economy, Sports, Current Affairs.

For each fact, provide:
1. A clear, concise title
2. A detailed description (2-3 sentences)
3. Category (history/geography/science/polity/economy/sports/current)
4. Importance level (high/medium/low)
5. Difficulty (easy/medium/hard)
6. 3-5 relevant tags
7. 2-3 related topics

Focus on facts that are:
- Frequently asked in SSC CGL exams
- Recent developments (for current affairs)
- Fundamental concepts
- Important dates, numbers, and figures

Return ONLY a valid JSON array with this structure:
[
  {
    "title": "Fact title",
    "description": "Detailed description",
    "category": "category name",
    "importance": "high/medium/low",
    "difficulty": "easy/medium/hard",
    "tags": ["tag1", "tag2", "tag3"],
    "relatedTopics": ["topic1", "topic2"]
  }
]
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const generatedFacts = JSON.parse(jsonMatch[0])
        
        // Transform to our GKFact interface
        const facts: GKFact[] = generatedFacts.map((fact: any, index: number) => ({
          id: `gk_${Date.now()}_${index}`,
          title: fact.title || `GK Fact ${index + 1}`,
          description: fact.description || 'Important general knowledge fact',
          category: fact.category || 'general',
          importance: fact.importance || 'medium',
          dateAdded: new Date().toISOString(),
          tags: fact.tags || [],
          learned: false,
          difficulty: fact.difficulty || 'medium',
          relatedTopics: fact.relatedTopics || []
        }))

        return facts.slice(0, 10) // Ensure exactly 10 facts
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
    }

    // Fallback to default facts if AI generation fails
    return getFallbackGKFacts()

  } catch (error) {
    console.error('Error generating daily GK facts:', error)
    return getFallbackGKFacts()
  }
}

function getFallbackGKFacts(): GKFact[] {
  return [
    {
      id: 'gk_1',
      title: 'Mount Everest Height',
      description: 'Mount Everest, the world\'s highest peak, stands at 8,848.86 meters (29,031.7 feet) above sea level. It was recently re-measured jointly by China and Nepal.',
      category: 'geography',
      importance: 'high',
      dateAdded: new Date().toISOString(),
      tags: ['mountains', 'geography', 'records', 'himalayas'],
      learned: false,
      difficulty: 'easy',
      relatedTopics: ['Himalayas', 'Nepal', 'Tibet']
    },
    {
      id: 'gk_2',
      title: 'Constitution Day',
      description: 'November 26 is celebrated as Constitution Day in India, commemorating the adoption of the Indian Constitution in 1949. Dr. B.R. Ambedkar is known as the architect of the Indian Constitution.',
      category: 'polity',
      importance: 'high',
      dateAdded: new Date().toISOString(),
      tags: ['constitution', 'important dates', 'polity', 'ambedkar'],
      learned: false,
      difficulty: 'medium',
      relatedTopics: ['Dr. B.R. Ambedkar', 'Constituent Assembly', 'Constitutional Law']
    },
    {
      id: 'gk_3',
      title: 'Photosynthesis Process',
      description: 'Photosynthesis is the process by which plants convert carbon dioxide and water into glucose using sunlight, releasing oxygen as a byproduct. This process is crucial for life on Earth.',
      category: 'science',
      importance: 'medium',
      dateAdded: new Date().toISOString(),
      tags: ['biology', 'plants', 'oxygen', 'environment'],
      learned: false,
      difficulty: 'medium',
      relatedTopics: ['Chlorophyll', 'Solar energy', 'Plant biology']
    },
    {
      id: 'gk_4',
      title: 'Reserve Bank of India',
      description: 'RBI was established on April 1, 1935, and is headquartered in Mumbai. It serves as India\'s central banking institution and regulates the country\'s monetary policy.',
      category: 'economy',
      importance: 'high',
      dateAdded: new Date().toISOString(),
      tags: ['banking', 'RBI', 'economy', 'monetary policy'],
      learned: false,
      difficulty: 'easy',
      relatedTopics: ['Monetary Policy', 'Banking Regulation', 'Interest Rates']
    },
    {
      id: 'gk_5',
      title: 'Quit India Movement',
      description: 'The Quit India Movement was launched by Mahatma Gandhi on August 8, 1942, demanding immediate independence from British rule. The slogan "Do or Die" became synonymous with this movement.',
      category: 'history',
      importance: 'high',
      dateAdded: new Date().toISOString(),
      tags: ['freedom struggle', 'gandhi', 'independence', 'british rule'],
      learned: false,
      difficulty: 'medium',
      relatedTopics: ['Non-cooperation', 'Civil Disobedience', 'August Kranti']
    },
    {
      id: 'gk_6',
      title: 'ICC Cricket World Cup 2023',
      description: 'India hosted the ICC Cricket World Cup 2023, with the final held at Narendra Modi Stadium in Ahmedabad. Australia won the tournament, defeating India in the final.',
      category: 'sports',
      importance: 'medium',
      dateAdded: new Date().toISOString(),
      tags: ['cricket', 'world cup', 'sports', 'tournament'],
      learned: false,
      difficulty: 'easy',
      relatedTopics: ['ICC', 'Stadium', 'International Cricket']
    },
    {
      id: 'gk_7',
      title: 'Chandrayaan-3 Mission',
      description: 'ISRO\'s Chandrayaan-3 successfully landed near the Moon\'s south pole on August 23, 2023, making India the 4th country to achieve a soft landing on the Moon and the first to land near the south pole.',
      category: 'science',
      importance: 'high',
      dateAdded: new Date().toISOString(),
      tags: ['space', 'ISRO', 'moon mission', 'achievement'],
      learned: false,
      difficulty: 'medium',
      relatedTopics: ['ISRO', 'Space Technology', 'Lunar Exploration']
    },
    {
      id: 'gk_8',
      title: 'River Ganges',
      description: 'The Ganges is the longest river in India, flowing for about 2,525 km from the Himalayas to the Bay of Bengal. It is considered sacred in Hinduism and supports millions of people.',
      category: 'geography',
      importance: 'high',
      dateAdded: new Date().toISOString(),
      tags: ['rivers', 'geography', 'ganges', 'sacred'],
      learned: false,
      difficulty: 'easy',
      relatedTopics: ['River Systems', 'Himalayan Rivers', 'Bay of Bengal']
    },
    {
      id: 'gk_9',
      title: 'Fundamental Rights',
      description: 'The Indian Constitution guarantees six fundamental rights to citizens, including Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural and Educational Rights, and Right to Constitutional Remedies.',
      category: 'polity',
      importance: 'high',
      dateAdded: new Date().toISOString(),
      tags: ['rights', 'constitution', 'fundamental', 'citizenship'],
      learned: false,
      difficulty: 'medium',
      relatedTopics: ['Article 12-35', 'Constitutional Law', 'Supreme Court']
    },
    {
      id: 'gk_10',
      title: 'India\'s GDP Ranking',
      description: 'India is the world\'s 5th largest economy by nominal GDP and 3rd largest by purchasing power parity (PPP). The country aims to become a $5 trillion economy by 2026-27.',
      category: 'economy',
      importance: 'high',
      dateAdded: new Date().toISOString(),
      tags: ['GDP', 'economy', 'ranking', 'growth'],
      learned: false,
      difficulty: 'medium',
      relatedTopics: ['Economic Growth', 'Global Economy', 'Development']
    }
  ]
}
