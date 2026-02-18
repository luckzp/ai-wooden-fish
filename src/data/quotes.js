/**
 * 从短句池中随机取一句（可避免连续重复）
 * @param {string[]} quotes - 当前语言的短句数组（来自 i18n tm('quotes')）
 * @param {string} [current] - 当前句，若传则尽量不返回同一句
 * @returns {string}
 */
export function pickRandomQuote(quotes, current = '') {
  if (!Array.isArray(quotes) || quotes.length === 0) return ''
  const list = quotes.filter((q) => q !== current)
  const pool = list.length > 0 ? list : quotes
  return pool[Math.floor(Math.random() * pool.length)]
}
