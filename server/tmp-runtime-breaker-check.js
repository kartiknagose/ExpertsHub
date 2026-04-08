const { callGroqChatWithSingleRetry } = require('./src/modules/ai/llmClient');

async function main() {
  process.env.GROQ_API_KEY = 'invalid-key-for-breaker-test';
  process.env.GROQ_TIMEOUT_MS = '3000';

  for (let i = 1; i <= 7; i += 1) {
    const started = Date.now();
    const result = await callGroqChatWithSingleRetry({
      systemPrompt: 'Return JSON only',
      userPrompt: '{"task":"ping"}',
    });
    const ms = Date.now() - started;

    const message = result.ok
      ? 'ok'
      : (result.error && result.error.message) ? result.error.message : 'unknown error';

    console.log(`ATTEMPT_${i}: ok=${result.ok} ms=${ms} message=${message}`);
  }
}

main().catch((err) => {
  console.error('BREAKER_TEST_FATAL', err.message);
  process.exit(1);
});
