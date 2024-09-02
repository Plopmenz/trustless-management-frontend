"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config"
import { cookieStorage, createStorage, http, WagmiProvider } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"

import { siteConfig } from "@/config/site"

export const chains = [mainnet] as const
export const defaultChain = mainnet

const appName = siteConfig.name
const appDescription = siteConfig.description
const appIcon = "https://trustless.management/icon.png" as const
const appUrl = "https://trustless.management" as const
const metadata = {
  name: appName,
  description: appDescription,
  url: appUrl,
  icons: [appIcon],
}

const projectId = "564a495a255b13c2ec825cfc3995c2b4" as const // WalletConnect
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  transports: {
    [mainnet.id]: http("https://cloudflare-eth.com"),
    [sepolia.id]: http("https://rpc2.sepolia.org"),
  },
  auth: {
    email: false,
  },
})

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
})

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
