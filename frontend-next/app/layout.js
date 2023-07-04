'use client';
import './globals.css'
import { Inter } from 'next/font/google'
import { ThemeContextProvider } from '@/context/theme';
import Footer from '@/components/Footer/Footer';
import Header from '@/components/header/Header';

import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { goerli } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { ChakraProvider } from '@chakra-ui/react';
import { infuraProvider } from 'wagmi/providers/infura'

// Configure chains & providers with publicProvider 
// we can add Infura, Alchemy ...
const { chains, publicClient } = configureChains(
  [goerli],
  [
    // infuraProvider({ apiKey: 'c37e4705ebff4465bcd87cb0368be40c' }),
    publicProvider()
  ]
);

// RainbowKit connector
const { connectors } = getDefaultWallets({
  appName: 'Next Wagmi App',
  projectId: '2102601ab7d2fc9e01b6b4e9b3ce7b3b',
  chains
});


// Set up wagmi config
const wagmiConfig = createConfig({
  autoConnect: false,
  connectors,
  publicClient
})

const inter = Inter({ subsets: ['latin'] })
export default function RootLayout({ children }) {

  return (
    <html lang="en">
      <head>
      <meta name="description" content="Web3 Voting System" />
      <meta name="author" content="Cyril Pareja & Sam Grandvincent" />
      <title>Voting Decentralized</title>
      
    </head>
      <body className={inter.className}>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <ChakraProvider>
              <ThemeContextProvider>
                  <Header/>
                    {children}
                  <Footer/>
              </ThemeContextProvider>
            </ChakraProvider>
          </RainbowKitProvider>
        </WagmiConfig>
      </body>
    </html>
  )
}
