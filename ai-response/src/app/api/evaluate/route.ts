
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const configuration = ({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI(configuration);

export async function POST(request: NextRequest) {
  const { question, candidateResponse, correctResponse, prompt, model } = await request.json();

  try {
    const response = await openai.chat.completions.create({
      model: '${model}',
      messages: [
        {
          role: 'system',
          content: `Prompt ${prompt}`,
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