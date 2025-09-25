// api/ask.js
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Only POST allowed' });

  const OPENAI_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_KEY) return res.status(500).json({ error: 'OPENAI_API_KEY not set' });

  const { prompt } = req.body ?? {};
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Missing prompt' });

  try {
    const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 600,
        temperature: 0.2
      })
    });

    if (!openaiResp.ok) {
      const text = await openaiResp.text();
      return res.status(502).json({ error: 'OpenAI API error', details: text });
    }

    const data = await openaiResp.json();
    const reply = data.choices?.[0]?.message?.content ?? JSON.stringify(data);
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
};
