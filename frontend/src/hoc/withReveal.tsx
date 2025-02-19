import { FC, useEffect, useState } from 'react'
import classes from './index.module.css'
import { StringUtils } from '../utils/string.utils'

type RevealProps<T> = {
  reveal?: boolean
  revealLabel?: string
  onRevealChange: (reveal: boolean) => Promise<void>
  className?: string
} & T

export const withReveal =
  <P1 extends object>(Component: FC<P1>) =>
  (props: RevealProps<P1>) => {
    const { reveal = false, revealLabel, onRevealChange, className, ...restProps } = props as RevealProps<P1>

    const [isRevealed, setIsRevealed] = useState(false)

    useEffect(() => {
      setIsRevealed(reveal)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reveal])

    return (
      <div
        data-label={revealLabel ?? 'Conversation history is inaccessible, sign a message to reveal it...'}
        className={StringUtils.clsx(isRevealed && !revealLabel ? undefined : classes.mask, className)}
        onClick={async () => {
          if (isRevealed) {
            return
          }
          try {
            await onRevealChange(true)
            setIsRevealed(true)
          } catch (e) {}
        }}
      >
        <Component {...(restProps as P1)} />
      </div>
    )
  }
