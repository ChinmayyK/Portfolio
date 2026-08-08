const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN;

const basic = Buffer.from(`${client_id}:${client_secret}`).toString("base64");
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refresh_token || "",
    }),
  });

  return response.json();
};

export const getNowPlaying = async () => {
  // If no API keys are provided in .env, we return a mock response so the UI still looks great!
  if (!client_id || !client_secret || !refresh_token) {
    return {
      status: 200,
      json: async () => ({
        is_playing: true,
        item: {
          name: "Starboy",
          artists: [{ name: "The Weeknd" }, { name: "Daft Punk" }],
          album: {
            name: "Starboy",
            images: [{ url: "https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452" }],
          },
          external_urls: { spotify: "https://open.spotify.com/track/7MXVkk9YMqq6vqLSZcg62x" },
        },
      }),
    };
  }

  const { access_token } = await getAccessToken();

  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
    // We want the freshest data, no cache!
    cache: "no-store",
  });
};
