import { SessionProvider } from "next-auth/react"
import { Roboto } from '@next/font/google'
import "@/styles/globals.css"

import type { AppProps } from "next/app"
import type { Session } from "next-auth"

const roboto = Roboto({ weight: "300", subsets: ['latin'] })

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session} refetchInterval={5 * 60}>
      <main className={roboto.className}>
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  )
}