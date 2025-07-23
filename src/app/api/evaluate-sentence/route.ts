import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { word, sentence, wordMeaning } = await request.json()

    if (!word || !sentence) {
      return NextResponse.json(
        { error: 'Word and sentence are required' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

    const prompt = `
Evaluate this sentence for the word "${word}" (meaning: ${wordMeaning}):

Sentence: "${sentence}"

Please evaluate based on:
1. Correct usage of the word in context
2. Grammar and sentence structure
3. Creativity and clarity
4. Appropriateness for SSC CGL preparation

Return a JSON response with:
{
  "score": number (1-5),
  "feedback": "detailed feedback on the sentence",
  "suggestions": ["suggestion1", "suggestion2"] (if score < 4)
}

Be encouraging but honest. For scores 4-5, focus on what they did well. For scores 1-3, provide constructive suggestions.
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    try {
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const evaluation = JSON.parse(jsonMatch[0])
        return NextResponse.json(evaluation)
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      // Fallback if AI doesn't return proper JSON
      return NextResponse.json({
        score: 3,
        feedback: "Good effort! Keep practicing to improve your sentence construction.",
        suggestions: ["Try to make the sentence more specific", "Consider using more descriptive words"]
      })
    }

  } catch (error) {
    console.error('Error evaluating sentence:', error)
    return NextResponse.json(
      { 
        score: 3,
        feedback: "Unable to evaluate at the moment, but great job on creating your own example!",
        suggestions: []
      },
      { status: 200 } // Return 200 so the frontend doesn't error
    )
  }
}
