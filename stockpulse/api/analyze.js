import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const ticker = ((req.query && req.query.ticker) || '').toUpperCase().trim();

  if (!ticker || !/^[A-Z]{1,5}$/.test(ticker)) {
    return res.status(400).json({ error: 'Please enter a valid ticker symbol (e.g. AAPL, TSLA).' });
  }

  if (!process.env.FINNHUB_API_KEY || !process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'API keys are not configured. Add FINNHUB_API_KEY and ANTHROPIC_API_KEY to your .env file.',
    });
  }

  try {
    // --- 1. Fetch recent news from Finnhub ---
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const from = weekAgo.toISOString().split('T')[0];
    const to = now.toISOString().split('T')[0];

    const [newsRes, quoteRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${process.env.FINNHUB_API_KEY}`
      ),
      fetch(
        `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`
      ),
    ]);

    const news = await newsRes.json();
    const quote = await quoteRes.json();

    if (!Array.isArray(news) || news.length === 0) {
      return res.status(404).json({
        error: `No recent news found for "${ticker}". Double-check the ticker symbol and try again.`,
      });
    }

    // Use up to 7 most recent articles
    const topNews = news.slice(0, 7);
    const newsText = topNews
      .map((n, i) => `Article ${i + 1}:\nHeadline: ${n.headline}\nSummary: ${n.summary || 'No summary available.'}`)
      .join('\n\n---\n\n');

    // --- 2. Send to Claude for analysis ---
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a sharp financial analyst. Analyze these recent news articles about the stock ${ticker}:

${newsText}

Return ONLY a valid JSON object with NO markdown formatting or extra text. Use exactly this structure:
{
  "whatHappened": "2-3 sentence plain English summary of the key recent events for this stock",
  "bullCase": ["specific upside reason 1 (1-2 sentences)", "specific upside reason 2 (1-2 sentences)", "specific upside reason 3 (1-2 sentences)"],
  "bearCase": ["specific downside risk 1 (1-2 sentences)", "specific downside risk 2 (1-2 sentences)", "specific downside risk 3 (1-2 sentences)"]
}

Be specific and grounded in the news provided. Avoid generic statements.`,
        },
      ],
    });

    // --- 3. Parse Claude's response ---
    let analysis;
    try {
      const raw = message.content[0].text.trim();
      // Strip markdown code fences if Claude wrapped the JSON
      const cleaned = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      analysis = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({
        error: 'The AI returned an unexpected format. Please try again.',
      });
    }

    // --- 4. Return full response ---
    return res.status(200).json({
      ticker,
      analysis,
      quote: quote && quote.c
        ? {
            price: quote.c,
            change: quote.d,
            changePercent: quote.dp,
          }
        : null,
      newsCount: topNews.length,
      articles: topNews.map((n) => ({
        headline: n.headline,
        source: n.source,
        url: n.url,
        datetime: n.datetime,
      })),
    });
  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({ error: 'Analysis failed. Please try again in a moment.' });
  }
}
