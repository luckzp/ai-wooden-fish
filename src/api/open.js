/**
 * 求大师开示：OpenRouter Gemini 3.0 Pro 流式接口
 * 需要环境变量 VITE_OPENROUTER_API_KEY（在 .env 或 .env.local 中配置）
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_MODEL = 'google/gemini-3-flash-preview'

/** 大师开示系统提示词：禅意、简短、可带佛系/职场梗 */
export const OPEN_SYSTEM_PROMPT = `你是开示大师。请用简洁、温和、略带禅意的口吻回答施主的困惑。

要求：
- 回答以中文为主。
- 语气像一位接地气的佛系智者：可引用一点佛家/道家俗语，也可用「功德」「随缘」「放下」等词，但避免过于玄虚。
- 可以带一点幽默或职场/摸鱼梗，让施主会心一笑、放松心情。
- 若施主未写具体问题，可给一句随缘的开示或祝福。
- 不要以「作为 AI」自居，直接以「大师」口吻作答，无需开场白。`

/**
 * 流式请求大师开示，每收到一段内容就调用 onChunk(delta)
 * @param {string} question - 用户输入的困惑
 * @param {(chunk: string) => void} onChunk - 每收到一段增量文案就调用
 * @returns {Promise<string>} 完整开示文案（流结束后）
 */
export async function getOpenReplyStream(question, onChunk) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey || !apiKey.trim()) {
    throw new Error('未配置 OpenRouter API Key，请在 .env 或 .env.local 中设置 VITE_OPENROUTER_API_KEY')
  }

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: OPEN_SYSTEM_PROMPT },
        { role: 'user', content: question?.trim() || '施主今日有何困惑？若无，便随缘给一句开示罢。' },
      ],
      stream: true,
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    let msg = `开示请求失败（${res.status}）`
    try {
      const j = JSON.parse(errText)
      if (j.error?.message) msg = j.error.message
    } catch (_) {}
    throw new Error(msg)
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('无法读取流式响应')

  const decoder = new TextDecoder()
  let full = ''
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split(/\n/)
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const obj = JSON.parse(data)
            const delta = obj.choices?.[0]?.delta?.content
            if (typeof delta === 'string' && delta) {
              full += delta
              onChunk(delta)
            }
          } catch (_) {}
        }
      }
    }
  } finally {
    reader.releaseLock()
  }

  return full
}
