import { withReveal } from '../../hoc/withReveal'
import { FC, PropsWithChildren } from 'react'

const Content: FC<PropsWithChildren> = ({ children }) => children

export const RevealContent = withReveal(Content)
