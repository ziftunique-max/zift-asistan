const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 6000];

export async function callAnthropic({ apiKey, system, userMessage }) {
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system,
          messages: [{ role: 'user', content: userMessage }]
        })
      });

      if (response.status === 529 || response.status === 503) {
        lastError = new Error(`API meşgul (${response.status}). Tekrar deneniyor...`);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAYS[attempt]);
          continue;
        }
        throw new Error('API şu an çok yoğun (overloaded). Lütfen birkaç dakika bekleyip tekrar deneyin.');
      }

      if (response.status === 429) {
        lastError = new Error('Rate limit aşıldı');
        if (attempt < MAX_RETRIES) {
          const retryAfter = response.headers.get('retry-after');
          await sleep(retryAfter ? parseInt(retryAfter) * 1000 : RETRY_DELAYS[attempt]);
          continue;
        }
        throw new Error('Çok fazla istek gönderildi. Lütfen biraz bekleyin.');
      }

      if (!response.ok) {
        const errorBody = await response.text();
        let message;
        try {
          const parsed = JSON.parse(errorBody);
          message = parsed.error?.message || `HTTP ${response.status}`;
        } catch {
          message = `HTTP ${response.status}: ${errorBody.slice(0, 200)}`;
        }
        throw new Error(message);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.content?.[0]?.text || 'Cevap oluşturulamadı.';

    } catch (error) {
      lastError = error;
      if (attempt < MAX_RETRIES && (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('Tekrar deneniyor'))) {
        await sleep(RETRY_DELAYS[attempt]);
        continue;
      }
      if (attempt === MAX_RETRIES || !error.message.includes('Tekrar deneniyor')) {
        throw error;
      }
    }
  }

  throw lastError || new Error('Bilinmeyen hata');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
