function rejectDelay(reason: string, timeoutMs = 5000) {
  return new Promise((_resolve, reject) => {
    setTimeout(() => reject(reason), timeoutMs)
  })
}
export async function retry<T extends Promise<unknown>>(
  attempt: () => T,
  tryCb: (value: Awaited<T>) => void = () => {},
  maxAttempts = 6,
  timeoutMs?: number
): Promise<T> {
  let p: Promise<T> = Promise.reject()
  for (let i = 0; i < maxAttempts; i++) {
    p = p
      .catch(attempt)
      .then(value => {
        return tryCb(value as Awaited<T>)
      })
      .catch(reason => rejectDelay(reason, timeoutMs)) as Promise<T>
  }
  return p
}
