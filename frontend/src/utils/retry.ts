function rejectDelay(reason: string, timeoutMs = 5000, signal?: AbortSignal) {
  return new Promise((_resolve, reject) => {
    const timeout = setTimeout(() => reject(reason), timeoutMs)

    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          clearTimeout(timeout)
          reject(new Error('Operation was aborted'))
        },
        { once: true }
      )
    }
  })
}

export async function retry<T extends Promise<unknown>>(
  attempt: () => T,
  tryCb: (value: Awaited<T>) => void = () => {},
  maxAttempts = 6,
  timeoutMs?: number,
  signal?: AbortSignal
): Promise<T> {
  let p: Promise<T> = Promise.reject()

  for (let i = 0; i < maxAttempts; i++) {
    if (signal?.aborted) {
      throw new Error('Operation was aborted')
    }

    p = p
      .catch(attempt)
      .then(value => {
        if (signal?.aborted) {
          throw new Error('Operation was aborted')
        }
        return tryCb(value as Awaited<T>)
      })
      .catch(reason => rejectDelay(reason, timeoutMs, signal)) as Promise<T>
  }

  return p
}
