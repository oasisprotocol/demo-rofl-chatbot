/// <reference types="vite-plugin-svgr/client" />

import { FC } from 'react'
import DeleteSvg from '@material-design-icons/svg/filled/delete.svg?react'
import { Icon } from '../Icon'
import { IconProps } from '../../types'

export const DeleteIcon: FC<IconProps> = props => (
  <Icon {...props}>
    <DeleteSvg />
  </Icon>
)
