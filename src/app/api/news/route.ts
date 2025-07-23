import { NextResponse } from 'next/server'
import { generateContent } from '@/lib/geminiClient'
import { 
  getNews, 
  saveNews, 
  getTodaysNews, 
  addNews,
  generateId,
  getTodayString,
  type NewsItem 
} from '@/lib/serverless-storage'

export async function GET() {
  try {
    // Check if we already have today's news
    const todaysNews = getTodaysNews()
    
    if (todaysNews.length > 0) {
      return NextResponse.json({ 
        success: true, 
        data: todaysNews,
        message: 'Today\'s news already generated' 
      })
    }

    // Generate current affairs using Gemini
    const prompt = `Generate 5 important current affairs topics for SSC CGL preparation. 
    Include recent developments in:
    1. Government policies and schemes
    2. International relations
    3. Science and technology
    4. Sports achievements
    5. Awards and recognitions
    
    For each topic, provide:
    - Title (concise and informative)
    - Summary (2-3 sentences explaining the key points)
    - Source (realistic news source name)
    
    Return as valid JSON array with objects containing: title, summary, source.
    Make sure the information is current and relevant for competitive exam preparation.`

    const response = await generateContent(prompt)
    
    // Try to extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    let generatedNews = []
    
    if (jsonMatch) {
      try {
        generatedNews = JSON.parse(jsonMatch[0])
      } catch (parseError) {
        console.error('JSON parse error:', parseError)
        generatedNews = []
      }
    }

    // Fallback news if generation fails
    if (generatedNews.length === 0) {
      generatedNews = [
        {
          title: "New Education Policy Implementation",
          summary: "The government announces new initiatives under NEP 2020 to enhance digital learning infrastructure in rural areas.",
          source: "Ministry of Education"
        },
        {
          title: "India's Space Mission Achievement",
          summary: "ISRO successfully launches communication satellite, strengthening India's position in space technology sector.",
          source: "ISRO Official"
        },
        {
          title: "Economic Growth Indicators",
          summary: "Latest GDP figures show positive growth trajectory with focus on manufacturing and service sectors.",
          source: "Economic Times"
        },
        {
          title: "Environmental Conservation Initiative",
          summary: "Government launches nationwide tree plantation drive targeting 1 billion trees in the next two years.",
          source: "Ministry of Environment"
        },
        {
          title: "Sports Achievement Recognition",
          summary: "Indian athletes receive national awards for outstanding performance in international competitions this year.",
          source: "Sports Ministry"
        }
      ]
    }

    const today = getTodayString()
    
    const newsItems: NewsItem[] = generatedNews.map((item: any) => ({
      id: generateId(),
      title: item.title || 'Current Affairs Update',
      summary: item.summary || 'Important development in current affairs.',
      source: item.source || 'News Source',
      dateAdded: today
    }))

    // Add to news storage
    addNews(newsItems)

    return NextResponse.json({ 
      success: true, 
      data: newsItems,
      message: 'Current affairs generated successfully' 
    })

  } catch (error) {
    console.error('Error in news API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate current affairs',
        message: 'Please try again later' 
      },
      { status: 500 }
    )
  }
}
