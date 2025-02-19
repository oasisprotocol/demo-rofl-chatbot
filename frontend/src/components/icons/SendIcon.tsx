/// <reference types="vite-plugin-svgr/client" />

import { FC } from 'react'
import SendSvg from '@material-design-icons/svg/filled/send.svg?react'
import { Icon } from '../Icon'
import { IconProps } from '../../types'

export const SendIcon: FC<IconProps> = props => (
  <Icon {...props}>
    <SendSvg />
  </Icon>
)
