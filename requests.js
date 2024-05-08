import { google } from "googleapis";

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export async function searchVideos(auth, q) {
  const service = google.youtube("v3");

  try {
    const response = service.search.list({
      auth: auth,
      part: "snippet",
      q: q,
      maxResults: 25,
    });

    const vids = response;
    if (vids.length === 0) {
      console.log("No videos found.");
    } else {
      return vids;
    }
  } catch (err) {
    console.error("The API returned an error:", err);
    throw err; // Re-throw the error to be caught by the caller
  }
}

export async function getPlaylists(auth) {
  const service = google.youtube("v3");
  try {
    const response = service.playlists.list({
      auth: auth,
      mine: true,
      part: ["snippet,contentDetails"],
      maxResults: 50,
    });
    const playlists = response;
    if (playlists.length === 0) {
      console.log("No playlists found.");
    } else {
      return playlists;
    }
  } catch (err) {
    console.error("The API returned an error:", err);
    throw err; // Re-throw the error to be caught by the caller
  }
}

export async function getPlaylistItems(auth, playlistId) {
  const service = google.youtube("v3");
  try {
    const response = service.playlistItems.list({
      auth: auth,
      part: ["snippet,contentDetails"],
      playlistId: playlistId,
      maxResults: 50,
    });
    const playlistItems = response;
    if (playlistItems.length === 0) {
      console.log("No playlist items found.");
    } else {
      return playlistItems;
    }
  } catch (err) {
    console.error("The API returned an error:", err);
    throw err; // Re-throw the error to be caught by the caller
  }
}
