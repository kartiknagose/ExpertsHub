function buildToolExecutionResponse({
  sessionId,
  toolName,
  toolResult,
  buildBypassDataResponse,
  toTextResponse,
  fallbackMessage,
}) {
  if (toolResult?.success) {
    return {
      ...buildBypassDataResponse({
        sessionId,
        toolName,
        data: toolResult.data,
      }),
      intent: { type: 'tool_call', tool: toolName },
      toolResult,
    };
  }

  const errorMessage = String(toolResult?.error || '').trim() || String(fallbackMessage || 'Something went wrong.');
  return {
    ...toTextResponse({
      sessionId,
      message: errorMessage,
      intent: { type: 'tool_call', tool: toolName },
    }),
    toolResult,
  };
}

module.exports = {
  buildToolExecutionResponse,
};
