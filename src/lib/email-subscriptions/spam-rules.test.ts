import { suspiciousReason } from '@/lib/email-subscriptions/spam-rules'

describe('suspiciousReason', () => {
  it.each([
    'e.v.en.ud.ak.e.n29@gmail.com',
    'qutotit.o.w39.0@gmail.com',
    'ux.iz.edo.j.i.s.1.4.8@gmail.com',
    'a.b.c.d@googlemail.com'
  ])('flags dotted Gmail %p', (email) => {
    expect(suspiciousReason(email)).toBe('gmail-dots')
  })

  it.each([
    'Libbie493_Koelpin1998@mailchuwee.com',
    'Murray986.Schuster1995@sigismail.com',
    'Raymundo527_Bernhard.1980@sigismail.com'
  ])('flags generated names %p', (email) => {
    expect(suspiciousReason(email)).toBe('generated-name')
  })

  it.each(['someone@mailinator.com', 'x@sub.mailinator.com'])(
    'flags throwaway domains %p',
    (email) => {
      expect(suspiciousReason(email)).toBe('disposable-domain')
    }
  )

  it.each([
    'real.person@gmail.com',
    'john.a.smith@gmail.com',
    'first.last+news@gmail.com',
    'h.melotto@melottogroup.com',
    'sophie@sendproud.com',
    'a.b.c.d.e@example.com',
    'jane1990@example.com',
    'not-an-email'
  ])('leaves %p alone', (email) => {
    expect(suspiciousReason(email)).toBeNull()
  })
})
