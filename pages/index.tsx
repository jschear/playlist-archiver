import { useSession, signOut, signIn } from "next-auth/react"
import { getToken } from "next-auth/jwt"
import Head from "next/head"
import styles from '@/styles/Home.module.css'
import Link from "next/link"
import { getPlaylistData, PlaylistData } from "@/lib/playlists"

export default function Component({ playlists }: PlaylistData) {
  const { data: session } = useSession()

  const listItems = playlists.map(playlist =>
    <li key={playlist.id}>
      <Link href={`/playlists/${playlist.id}`}>{playlist.name}</Link>
    </li>
  )

  return (
    <>
      <Head>
        <title>Playlist Exporter</title>
        <meta name="description" content="Export spotify playlists" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h2>Export your Spotify playlists!</h2>

        <ul>{listItems}</ul>

        {session && <>
          Signed in as {session.user.email} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </>}

        {!session && <>
          Not signed in <br />
          <button onClick={() => signIn()}>Sign in</button>
        </>}
      </main>
    </>
  )
}

export async function getServerSideProps({ req }) {
  const jwt = await getToken({ req })
  const playlistData = await getPlaylistData(jwt.accessToken as string)
  return {
    props: playlistData
  }
}
