import {
  camelizeKeys,
  camelToSentence,
  camelToSnake,
  capitalizeFirstLetter,
  escapeHtml,
  snakeToCamel,
  snakeToSentence
} from '@/lib/strings'

describe('#camelToSentence', () => {
  it('converts camelCase to sentence case', () => {
    expect(camelToSentence('helloWorld')).toBe('Hello World')
  })
})

describe('#snakeToCamel', () => {
  it('converts snake_case to camelCase', () => {
    expect(snakeToCamel('hello_world')).toBe('helloWorld')
  })
})

describe('#camelToSnake', () => {
  it('converts camelCase to snake_case', () => {
    expect(camelToSnake('helloWorld')).toBe('hello_world')
  })
})

describe('#snakeToSentence', () => {
  it('converts snake_case to a sentence, capitalizing only the first letter', () => {
    expect(snakeToSentence('buy_link')).toBe('Buy link')
  })

  it('leaves single-word values capitalized', () => {
    expect(snakeToSentence('documentation')).toBe('Documentation')
  })
})

describe('#capitalizeFirstLetter', () => {
  it('capitalizes the first letter of a string', () => {
    expect(capitalizeFirstLetter('hello')).toBe('Hello')
  })
})

describe('#camelizeKeys', () => {
  it('converts an object with snake_case keys to camelCase keys', () => {
    expect(camelizeKeys({ hello_world: 'value' })).toEqual({
      helloWorld: 'value'
    })
  })
})

describe('#escapeHtml', () => {
  it('escapes HTML special characters', () => {
    expect(escapeHtml('<a href="x">"AT&T"</a>')).toBe(
      '&lt;a href=&quot;x&quot;&gt;&quot;AT&amp;T&quot;&lt;/a&gt;'
    )
  })
})
