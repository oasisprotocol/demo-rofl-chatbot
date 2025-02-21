import { FC, useEffect, useRef } from 'react'

export const ScrollToBottom: FC = () => {
  const elementRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => elementRef.current!.scrollIntoView())
  return <div ref={elementRef} />
}
