
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const configuration = ({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI(configuration);

export async function POST(request: NextRequest) {
  const { question, candidateResponse, correctResponse } = await request.json();

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `Here is a question, an answer, and a key. 
          Evaluate whether the answer aligns with the key and provide a brief justification. 
          Scores can be 0 for incorrect answers, 0.5 for partially correct answers, and 1.0 for fully correct answers.`,
        },
        {
          role: 'user',
          content: `Question: ${question}, 
          Answer: ${candidateResponse},
          Key: ${correctResponse}`,
        },
      ],
      max_tokens: 150,
      temperature: 1,
    });

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    return NextResponse.json({ error: 'Error communicating with OpenAI' }, { status: 500 });
  }
}