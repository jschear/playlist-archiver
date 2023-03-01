
import { getPlaylist } from '@/lib/playlists'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getToken } from "next-auth/jwt"
import { Page, Text, View, Document, StyleSheet, renderToStream } from '@react-pdf/renderer'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const jwt = await getToken({ req })
  if (!jwt) {
    res.status(401)
    res.end()
    return
  }
  if (!req.body.playlistId) {
    res.status(400)
    res.end()
    return
  }

  // Fetch the playlist from the Spotify API
  const playlist = await getPlaylist(jwt.accessToken as string, req.body.playlistId as string)

  // Create styles
  const styles = StyleSheet.create({
    page: {
      paddingVertical: 40,
      paddingHorizontal: 40,
    },
    header: {
      paddingBottom: 20,
    },
    title: {
      fontSize: 20,
      fontFamily: 'Helvetica',
    },
    subtitle: {
      fontSize: 16,
      fontFamily: 'Helvetica',
    },
    track: {
      paddingBottom: 4,
      fontSize: 14,
      fontFamily: 'Helvetica',
      textAlign: 'justify',
    },
  })
  const MyDocument = () => (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{playlist.name}</Text>
          {playlist.owner.display_name && <Text style={styles.subtitle}>{playlist.owner.display_name}</Text>}
        </View>
        <View>
          {playlist.tracks.items.map((item) =>
            <Text style={styles.track}>
              {item.track.name} - {item.track.artists.map(artist => artist.name).join(", ")}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  )

  const stream = await renderToStream(<MyDocument />);
  res.status(200)
  res.setHeader('Content-Type', 'application/pdf');
  stream.pipe(res)
}
