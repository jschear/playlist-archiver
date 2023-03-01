
import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"
import SpotifyProvider from "next-auth/providers/spotify"

const SCOPES = "user-read-email playlist-read-private playlist-read-collaborative"

export default NextAuth({
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_ID,
      clientSecret: process.env.SPOTIFY_SECRET,
      authorization: {
        params: {
          scope: SCOPES
        }
      }
    }),
  ],
  // See https://next-auth.js.org/tutorials/refresh-token-rotation
  callbacks: {
    // Add oauth access token to JWT. We later use it server-side to hit the Spotify API.
    // (The JWT is sent to the client and persisted in a cookie.)
    async jwt({ token, user, account }) {
      if (account && user) {
        // Initial sign-in.
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: account.expires_at,
          refreshToken: account.refresh_token,
        }
      }

      // Account will be null on subsequent calls (only data in the JWT is provided). Check if the token has expired.
      if ((Date.now() / 1000) < token.accessTokenExpires) {
        return token
      }
      return refreshAccessToken(token)
    }
  }
})

async function refreshAccessToken(jwt: JWT) {
  try {
    const url =
      "https://accounts.spotify.com/api/token?" +
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: jwt.refreshToken as string,
      })

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + (Buffer.from(process.env.SPOTIFY_ID + ':' + process.env.SPOTIFY_SECRET).toString('base64'))
      },
      method: "POST",
    })

    const refreshedTokens = await response.json()

    if (!response.ok) {
      throw refreshedTokens
    }

    return {
      ...jwt,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      refreshToken: refreshedTokens.refresh_token ?? jwt.refreshToken, // Fall back to old refresh token
    }
  } catch (error) {
    console.log("Error refreshing auth token", error)

    return {
      ...jwt,
      error: "RefreshAccessTokenError",
    }
  }
}