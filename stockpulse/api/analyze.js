export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const ticker = ((req.query && req.query.ticker) || '').toUpperCase().trim();
  if (!ticker || !/^[A-Z]{1,5}$/.test(ticker)) {
    return res.status(400).json({ error: 'Please enter a valid ticker symbol (e.g. AAPL, TSLA).' });
  }
  if (!process.env.FINNHUB_API_KEY || !process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'API keys are not configured.' });
  }
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const from = weekAgo.toISOString().split('T')[0];
    const to = now.toISOString().split('T')[0];
    const [newsRes, quoteRes] = await Promise.all([
      fetch(`https://finnhub.io/api/v1/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${process.env.FINNHUB_API_KEY}`),
      fetch(`https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${process.env.FINNHUB_API_KEY}`),
    ]);
    const news = await newsRes.json();
    const quote = await quoteRes.json();
    if (!Array.isArray(news) || news.length === 0) {
      return res.status(404).json({ error: `No recent news found for "${ticker}".` });
    }
    const topNews = news.slice(0, 7);
    const newsText = topNews
      .map((n, i) => `Article ${i + 1}:\nHeadline: ${n.headline}\nSummary: ${n.summary || 'No summary available.'}`)
      .join('\n\n---\n\n');
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1024,
        messages: [{
          role: 'system',
          content: 'You are a financial analyst. Respond with ONLY raw JSON, no markdown, no code blocks.',
        }, {
          role: 'user',
          content: `Analyze news about ${ticker}. Return JSON: {"whatHappened":"string","bullCase":["a","b","c"],"bearCase":["a","b","c"]}\n\n${newsText}`,
        }],
      }),
    });
    const rawText = await groqRes.text();
    console.log('Groq status:', groqRes.status);
    console.log('Groq raw response:', rawText.substring(0, 500));
    let groqData;
    try {
      groqData = JSON.parse(rawText);
    } catch {
      return res.status(500).json({ error: 'Groq returned non-JSON: ' + rawText.substring(0, 200) });
    }
    let analysis;
    try {
      const raw = groqData.choices[0].message.content.trim();
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    } catch (e) {
      return res.status(500).json({ error: 'Parse failed: ' + groqData.choices[0].message.content.substring(0, 200) });
    }
    return res.status(200).json({
      ticker, analysis,
      quote: quote && quote.c ? { price: quote.c, change: quote.d, changePercent: quote.dp } : null,
      newsCount: topNews.length,
      articles: topNews.map((n) => ({ headline: n.headline, source: n.source, url: n.url, datetime: n.datetime })),
    });
  } catch (err) {
    console.error('Analyze error:', err);
    return res.status(500).json({ error: 'Analysis failed: ' + err.message });
  }
}