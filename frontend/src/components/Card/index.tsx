import { FC, PropsWithChildren, ReactNode } from 'react'
import classes from './index.module.css'
import { StringUtils } from '../../utils/string.utils'
import { useAppState } from '../../hooks/useAppState'

declare module 'react' {
  interface CSSProperties {
    '--notification-height'?: string
  }
}

interface Props extends PropsWithChildren {
  header?: ReactNode
  className?: string
}

export const Card: FC<Props> = ({ children, header, className }) => {
  const {
    state: { isDesktopScreen, showFaucetNotification },
  } = useAppState()

  return (
    <div
      style={showFaucetNotification ? {} : { '--notification-height': isDesktopScreen ? '50px' : '80px' }}
      className={StringUtils.clsx(classes.card, className)}
    >
      {header ? <div className={classes.cardHeader}>{header}</div> : null}
      {children}
    </div>
  )
}
