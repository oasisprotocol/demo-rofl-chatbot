/// <reference types="vite/client" />

declare module '@metamask/jazzicon' {
  const jazzicon: (diameter: number, seed: number) => HTMLDivElement
  export default jazzicon
}

declare const APP_VERSION: string
declare const BUILD_COMMIT: string
declare const BUILD_DATETIME: number

interface ImportMetaEnv {
  VITE_NETWORK: string
  VITE_WEB3_GATEWAY: string
  VITE_CONTRACT_ADDR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
