import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const filename = 'meu-primeiro-arquivo.txt';
  const content = 'Olá, mundo! Este arquivo foi criado pela minha API na Vercel!';

  try {
    const blob = await put(filename, content, {
      access: 'public',
    });

    // Retorna a resposta com sucesso
    return NextResponse.json(blob);

  } catch (error) {
    // Se der erro, retorna uma mensagem
    return NextResponse.json(
      { message: 'Ocorreu um erro no upload.' },
      { status: 500 }
    );
  }
}