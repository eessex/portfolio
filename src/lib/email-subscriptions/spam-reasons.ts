/** Why the rules flagged a subscriber; dependency-free for the UI */
export const spamReasons = [
  'gmail-dots',
  'disposable-domain',
  'generated-name'
] as const

export type SpamReason = (typeof spamReasons)[number]

export const spamReasonLabels: Record<SpamReason, string> = {
  'gmail-dots': 'Dotted Gmail',
  'disposable-domain': 'Throwaway domain',
  'generated-name': 'Generated name'
}

export function spamReasonLabel(reason?: string) {
  return reason && reason in spamReasonLabels
    ? spamReasonLabels[reason as SpamReason]
    : undefined
}
