import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const SYSTEM_PROMPT = `You are an intelligent literary assistant specialized in the book "Amity Profess". Your role is to:

1. Answer questions about the book with deep, comprehensive explanations
2. Provide context, analysis, and insights about themes, characters, plot, and literary devices
3. Help readers understand complex concepts and connections within the book
4. Offer multiple perspectives and interpretations when relevant
5. Break down difficult passages or ideas into understandable parts
6. Connect ideas across different chapters and sections

When answering:
- Be thorough and detailed in your explanations
- Use examples from the text when possible
- Explain the "why" and "how" behind concepts, not just the "what"
- If you're unsure about specific details, acknowledge it and provide general literary analysis instead
- Encourage critical thinking by exploring different interpretations
- Make connections to broader themes and ideas

Your goal is to enhance the reader's understanding and appreciation of the book through thoughtful, in-depth responses.`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured. Please set ANTHROPIC_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return NextResponse.json(
        { error: 'Failed to get response from AI service' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const assistantMessage = data.content[0].text

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
