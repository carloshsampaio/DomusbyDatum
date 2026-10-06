import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'A URL é obrigatória' },
        { status: 400 }
      );
    }

    // Acessa o link fingindo ser um navegador comum
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    const html = await response.text();

    // Pesquisa nativa (Regex) para encontrar o Título e a Imagem sem precisar do Cheerio
    const titleMatch =
      html.match(
        /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i
      ) || html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const imageMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
    );

    const title = titleMatch
      ? titleMatch[1]
      : 'Equipamento sem título definido';
    const image = imageMatch ? imageMatch[1] : '';

    return NextResponse.json({ title, image, price: 0 });
  } catch (error) {
    console.error('Erro ao ler o link:', error);
    return NextResponse.json(
      { error: 'Falha ao acessar a URL' },
      { status: 500 }
    );
  }
}
