import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  const { question, candidateResponse, correctResponse, prompt, model } = await request.json();

  try {
    // Validar se o modelo escolhido é suportado
    const validModels = ['gpt-3.5-turbo', 'gpt-4o', 'gpt-4-turbo' ];
    if (!validModels.includes(model)) {
      return NextResponse.json({ error: 'Invalid model selected' }, { status: 400 });
    }

    let response;
    if (model.startsWith('gpt-')) {
      response = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: 'system',
            content: `Prompt: ${prompt}`,
          },
          {
            role: 'user',
            content: `Questão: ${question}, 
            Resposta: ${candidateResponse},
            gabarito: ${correctResponse}`,
          },
        ],
        max_tokens: 150,
        temperature: 1,
      });
    } else {
      
      return NextResponse.json({ error: 'Model type not supported' }, { status: 400 });
    }

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error('Error communicating with OpenAI:', error);
    return NextResponse.json({ error: 'Error communicating with OpenAI' }, { status: 500 });
  }
}