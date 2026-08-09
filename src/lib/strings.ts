export function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function capitalizeFirstLetter(string: string) {
  if (typeof string !== 'string' || string.length === 0) {
    return string
  }
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function camelToSentence(str: string) {
  const result = str.replace(/([A-Z])/g, ' $1')
  // Replace "And" with "&"
  const resultWithAmp = result.replace(/\bAnd\b/g, '&')
  return capitalizeFirstLetter(resultWithAmp)
}

export function snakeToCamel(str: string) {
  return str.replace(/_([a-z])/g, (_match, letter) =>
    letter.toUpperCase()
  )
}

/**
 * Converts snake_case to a sentence, e.g. `buy_link` -> `Buy link`.
 * Unlike `camelToSentence`, only the first letter is capitalized.
 */
export function snakeToSentence(str: string) {
  return capitalizeFirstLetter(str.replace(/_/g, ' '))
}

export function camelToSnake(str: string) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function camelizeKeys(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }

  const camelizedObject: Record<string, unknown> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key.toString())) {
      const camelKey = snakeToCamel(key)
      camelizedObject[camelKey] = obj[key]
    }
  }
  return camelizedObject
}
