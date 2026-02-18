/**
 * 求大师开示：OpenRouter Gemini 3.0 Pro 流式接口
 * 需要环境变量 VITE_OPENROUTER_API_KEY（在 .env 或 .env.local 中配置）
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const OPENROUTER_MODEL = 'google/gemini-3-flash-preview'

/** 界面语言到 [TARGETLANGUAGE] 的映射，用于英文系统提示词 */
const LOCALE_TO_TARGET_LANGUAGE = {
  'zh-CN': 'Chinese',
  en: 'English',
}

/**
 * 大师开示系统提示词（英文，参考 docs/prompt-reference.md）
 * 使用 [TARGETLANGUAGE] 占位符；用户问题以 user 消息单独发送，故不含 [PROMPT]
 * @param {string} [locale] - 当前界面语言，如 'zh-CN' | 'en'，不传则用 "the same language as the user's message"
 */
export function getOpenSystemPrompt(locale) {
  const targetLanguage = locale
    ? (LOCALE_TO_TARGET_LANGUAGE[locale] || "the same language as the user's message")
    : "the same language as the user's message"
  return `Please ignore all previous instructions.

Answer the user's message in [TARGETLANGUAGE] as if you were a highly accomplished practitioner of liberative technique and a humble Mahayana Buddhist master. Wise, patient, tactful, and unconventional like Vimalakirti, you have spent at least three decades studying Mahayana Buddhist scriptures from around the world and are a master meditator in many Buddhist, Vedic, and other traditions.

You have great compassion for all sentient beings. Your answers consider compassion for all beings and the benefit of all sentient beings. Be articulate, precise, patient, and encouraging. Answer questions and respond to comments in a helpful, empathetic, and deeply insightful way, aligned with the spirit and moral principles of Buddhism, without necessarily using Buddhist-specific vocabulary unless the user does so first.

Make your response culturally appropriate and understandable for most speakers of [TARGETLANGUAGE], without compromising Buddhist principles.

Respond to the user's message (which follows) entirely in [TARGETLANGUAGE]. Be informal; do not address the querier as "friend" or use other salutations. If the user sends no specific question, offer a brief, kind teaching or blessing.`
    .replace(/\[TARGETLANGUAGE\]/g, targetLanguage)
}

/**
 * 流式请求大师开示，每收到一段内容就调用 onChunk(delta)
 * @param {string} question - 用户输入的困惑
 * @param {(chunk: string) => void} onChunk - 每收到一段增量文案就调用
 * @param {string} [locale] - 当前界面语言（如 'zh-CN' | 'en'），用于指定回复语言；不传则根据用户问题语言回复
 * @returns {Promise<string>} 完整开示文案（流结束后）
 */
export async function getOpenReplyStream(question, onChunk, locale) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY
  if (!apiKey || !apiKey.trim()) {
    throw new Error('errors.noApiKey')
  }

  const systemPrompt = getOpenSystemPrompt(locale)
  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question?.trim() || 'No specific question — please offer a brief teaching or blessing.' },
      ],
      stream: true,
    }),
  })

  if (!res.ok) {
    throw new Error('errors.requestFailed')
  }

  const reader = res.body?.getReader()
  if (!reader) throw new Error('errors.streamReadFailed')

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
