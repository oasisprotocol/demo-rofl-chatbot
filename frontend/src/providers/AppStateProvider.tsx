import { FC, PropsWithChildren, useEffect, useState } from 'react'
import { AppStateContext, AppStateProviderContext, AppStateProviderState } from './AppStateContext'
import { useMediaQuery } from 'react-responsive'
import { toErrorString } from '../utils/errors'

const appStateProviderInitialState: AppStateProviderState = {
  appError: '',
  isMobileScreen: false,
  isDesktopScreen: false,
  showFaucetNotification: true,
}

export const AppStateContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const isMobileScreen = useMediaQuery({ query: '(max-width: 1000px)' })

  const [state, setState] = useState<AppStateProviderState>({
    ...appStateProviderInitialState,
  })
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      isDesktopScreen: !isMobileScreen,
      isMobileScreen,
    }))
  }, [isMobileScreen])

  const setAppError = (error: Error | object | string) => {
    if (error === undefined || error === null) return

    setState(prevState => ({
      ...prevState,
      appError: toErrorString(error as Error),
    }))
  }

  const clearAppError = () => {
    setState(prevState => ({
      ...prevState,
      appError: '',
    }))
  }

  const setShowFaucetNotification = (showFaucetNotification: boolean) => {
    setState(prevState => ({
      ...prevState,
      showFaucetNotification,
    }))
  }

  const providerState: AppStateProviderContext = {
    state,
    setAppError,
    clearAppError,
    setShowFaucetNotification,
  }

  return <AppStateContext.Provider value={providerState}>{children}</AppStateContext.Provider>
}
