import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables')
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const geminiModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

export async function generateContent(prompt: string): Promise<string> {
  try {
    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating content with Gemini:', error)
    throw new Error('Failed to generate content')
  }
}

export async function generateVocabulary(count: number = 10): Promise<any[]> {
  const prompt = `Generate exactly ${count} advanced English vocabulary words suitable for SSC CGL preparation. 
  For each word, provide:
  1. Word
  2. Meaning (concise definition)
  3. Synonym
  4. Example sentence using the word
  5. Field of usage (formal, academic, literary, etc.)
  
  Return the response as a valid JSON array with objects containing: word, meaning, synonym, example, field.
  Ensure words are challenging but relevant for competitive exams.
  
  Example format:
  [
    {
      "word": "Example",
      "meaning": "A representative form or pattern",
      "synonym": "Sample",
      "example": "This is an example sentence.",
      "field": "academic"
    }
  ]`

  try {
    console.log(`Generating ${count} vocabulary words...`)
    const response = await generateContent(prompt)
    console.log('Raw Gemini response:', response.substring(0, 500) + '...')
    
    // Clean the response to extract JSON
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const parsedWords = JSON.parse(jsonMatch[0])
      console.log(`Successfully parsed ${parsedWords.length} words from Gemini`)
      
      if (parsedWords.length >= count) {
        return parsedWords.slice(0, count) // Ensure we get exactly the requested count
      } else {
        console.warn(`Gemini only returned ${parsedWords.length} words, expected ${count}`)
        return parsedWords
      }
    }
    throw new Error('Invalid response format - no JSON array found')
  } catch (error) {
    console.error('Error generating vocabulary:', error)
    console.log('Using fallback vocabulary data')
    // Return fallback data with 10 words
    return [
      {
        word: "Perspicacious",
        meaning: "Having keen insight or discernment",
        synonym: "Perceptive",
        example: "The perspicacious detective quickly solved the complex case.",
        field: "formal"
      },
      {
        word: "Ubiquitous",
        meaning: "Present, appearing, or found everywhere",
        synonym: "Omnipresent",
        example: "Smartphones have become ubiquitous in modern society.",
        field: "academic"
      },
      {
        word: "Fastidious",
        meaning: "Very attentive to accuracy and detail; hard to please",
        synonym: "Meticulous",
        example: "She was fastidious about keeping her workspace organized.",
        field: "formal"
      },
      {
        word: "Ephemeral",
        meaning: "Lasting for a very short time",
        synonym: "Transient",
        example: "The beauty of cherry blossoms is ephemeral but memorable.",
        field: "literary"
      },
      {
        word: "Sagacious",
        meaning: "Having or showing keen mental discernment and good judgment",
        synonym: "Wise",
        example: "The sagacious leader made decisions that benefited everyone.",
        field: "formal"
      },
      {
        word: "Mellifluous",
        meaning: "Sweet or musical; pleasant to hear",
        synonym: "Melodious",
        example: "Her mellifluous voice captivated the entire audience.",
        field: "literary"
      },
      {
        word: "Pragmatic",
        meaning: "Dealing with things sensibly and realistically",
        synonym: "Practical",
        example: "A pragmatic approach to problem-solving often yields the best results.",
        field: "academic"
      },
      {
        word: "Tenacious",
        meaning: "Tending to keep a firm hold of something; persistent",
        synonym: "Persistent",
        example: "Her tenacious spirit helped her overcome many obstacles.",
        field: "formal"
      },
      {
        word: "Sanguine",
        meaning: "Optimistic or positive, especially in a difficult situation",
        synonym: "Hopeful",
        example: "Despite the setbacks, he remained sanguine about the project's success.",
        field: "formal"
      },
      {
        word: "Equanimity",
        meaning: "Mental calmness and composure, especially in difficult situations",
        synonym: "Composure",
        example: "She faced the crisis with remarkable equanimity.",
        field: "formal"
      }
    ]
  }
}

export async function generateIdioms(count: number = 5): Promise<any[]> {
  const prompt = `Generate ${count} useful English idioms and phrases for SSC CGL preparation.
  For each idiom, provide:
  1. Idiom/Phrase
  2. Meaning
  3. Example sentence
  4. Context where it's commonly used
  
  Return as valid JSON array with objects containing: idiom, meaning, example, context.`

  try {
    const response = await generateContent(prompt)
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Error generating idioms:', error)
    return [
      {
        idiom: "Break the ice",
        meaning: "To initiate conversation in a social setting",
        example: "He told a joke to break the ice at the meeting.",
        context: "social situations"
      }
    ]
  }
}

export async function generateGKQuestions(count: number = 5): Promise<any[]> {
  const prompt = `Generate ${count} multiple choice questions for SSC CGL General Knowledge preparation.
  Cover topics like: History, Geography, Politics, Science, Current Affairs, Sports, Literature.
  
  For each question, provide:
  1. Question text
  2. Four options (A, B, C, D)
  3. Correct answer (letter)
  4. Explanation
  5. Topic/Category
  
  Return as valid JSON array with objects containing: question, options, correct, explanation, topic.`

  try {
    const response = await generateContent(prompt)
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Error generating GK questions:', error)
    return [
      {
        question: "Who was the first President of India?",
        options: ["Dr. Rajendra Prasad", "Dr. A.P.J. Abdul Kalam", "Dr. Sarvepalli Radhakrishnan", "Zakir Hussain"],
        correct: "A",
        explanation: "Dr. Rajendra Prasad was the first President of India, serving from 1950 to 1962.",
        topic: "History"
      }
    ]
  }
}

export async function evaluatePractice(userSentence: string, targetWord: string): Promise<any> {
  const prompt = `Evaluate this sentence for grammar, clarity, and correct usage of the word "${targetWord}":
  
  Sentence: "${userSentence}"
  
  Provide feedback on:
  1. Grammar correctness
  2. Clarity and flow
  3. Appropriate usage of the target word
  4. Suggestions for improvement
  5. Overall score (1-10)
  
  Return as valid JSON with: grammar, clarity, usage, suggestions, score.`

  try {
    const response = await generateContent(prompt)
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Error evaluating practice:', error)
    return {
      grammar: "Unable to evaluate",
      clarity: "Unable to evaluate", 
      usage: "Unable to evaluate",
      suggestions: "Please try again",
      score: 5
    }
  }
}
