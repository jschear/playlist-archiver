import Head from "next/head"
import styles from '@/styles/Home.module.css'
import { getToken } from "next-auth/jwt"
import { getPlaylist } from "@/lib/playlists"

export default function Playlist({ playlist }: { playlist: SpotifyApi.SinglePlaylistResponse }) {
  return (
    <>
      <Head>
        <title>Playlist Exporter</title>
        <meta name="description" content="Export spotify playlists" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <h1>Playlist: {playlist.name}</h1>
        <ol>
          {playlist.tracks.items.map((item) =>
            <li key={item.track.id}>{item.track.name}</li>
          )}
        </ol>
        <form action={`/api/generate-pdf/${encodeURIComponent(playlist.name)}`} method="post">
          <input type="hidden" id="playlistId" name="playlistId" value={playlist.id} />
          <input type="submit" value="Create PDF" />
        </form>
      </main>
    </>
  )
}

export async function getServerSideProps({ req, query }) {
  const jwt = await getToken({ req })
  const playlist = await getPlaylist(jwt.accessToken as string, query.id)

  return {
    props: {
      playlist: playlist
    }
  }
}
