import { useSession, signOut, signIn } from "next-auth/react"
import { getToken } from "next-auth/jwt"
import Head from "next/head"
import styles from '@/styles/Home.module.css'

export default function Component({ playlistNames }) {
  const { data: session } = useSession()

  var loginStatus;
  if (session) {
    loginStatus = <>
      Signed in as {session.user.email} <br />
      <button onClick={() => signOut()}>Sign out</button>
    </>
  } else {
    loginStatus = <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  }

  const listItems = playlistNames.map((name) =>
    <li key={name}>
      {name}
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
        <div className={styles.description}>
          Export your Spotify playlists!
        </div>
        <ul>{listItems}</ul>
        {loginStatus}
      </main>
    </>
  )
}

export async function getServerSideProps({ req }) {
  const jwt = await getToken({ req })

  // TODO: handle errors, pagination, etc.
  const playlistResponse = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: new Headers({
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + jwt.accessToken
    })
  })

  const playlists = await playlistResponse.json()
  const playlistNames = playlists["items"].map((playlist) => playlist["name"])
  return {
    props: {
      playlistNames: playlistNames
    }
  }
}
