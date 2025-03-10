import { createContext } from 'react'
import { BrowserProvider, JsonRpcProvider, TransactionResponse } from 'ethers'
import { PromptsAnswers } from '../types'

export interface Web3ProviderState {
  isConnected: boolean
  browserProvider: BrowserProvider | null
  account: string | null
  explorerBaseUrl: string | null
  chainName: string | null
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  } | null
  isInteractingWithChain: boolean
  isSapphire: boolean | null
  chainId: bigint | null
  provider: JsonRpcProvider
  authInfo: string | null
}

export interface Web3ProviderContext {
  readonly state: Web3ProviderState
  connectWallet: () => Promise<void>
  switchNetwork: (chainId?: bigint) => Promise<void>
  getTransaction: (txHash: string) => Promise<TransactionResponse | null>
  getGasPrice: () => Promise<bigint>
  isProviderAvailable: () => Promise<boolean>
  getPromptsAnswers: () => Promise<PromptsAnswers | null>
  ask: (prompt: string) => Promise<void>
  clear: () => Promise<void>
}

export const Web3Context = createContext<Web3ProviderContext>({} as Web3ProviderContext)
