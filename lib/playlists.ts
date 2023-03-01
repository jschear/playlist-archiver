
// TODO: handle errors, pagination, etc.

export type PlaylistData = {
  playlists: {
    name: string,
    id: string
  }[]
}

export async function getPlaylistData(accessToken: string): Promise<PlaylistData> {
  const response = await fetch("https://api.spotify.com/v1/me/playlists", {
    headers: headers(accessToken)
  })
  const playlistResponse = await response.json() as SpotifyApi.ListOfCurrentUsersPlaylistsResponse
  return {
    playlists: playlistResponse.items.map((item) => {
      return {
        name: item.name,
        id: item.id
      }
    })
  }
}

export async function getPlaylist(accessToken: string, playlistId: string) {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}?` +
    new URLSearchParams({
      fields: "id,owner,name,tracks(items(track(id,artists(name),name)))",
    })
  const response = await fetch(url, {
    headers: headers(accessToken),
  })
  return await response.json() as SpotifyApi.SinglePlaylistResponse
}

function headers(accessToken: string) {
  return new Headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken
  })
}