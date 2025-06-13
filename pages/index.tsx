const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = 'https://w2etbv3keneun5x7omcm5adfwa0ivgss.lambda-url.us-west-2.on.aws/';

const loginUrl = `https://accounts.spotify.com/authorize?` + new URLSearchParams({
  client_id: SPOTIFY_CLIENT_ID,
  response_type: 'code',
  redirect_uri: REDIRECT_URI,
  scope: 'playlist-read-private playlist-modify-private playlist-modify-public',
}).toString();

export default function HomePage() {
  return (
    <main style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Random Spotify Playlist Generator</h1>
      <a href={loginUrl}>
        <button style={{ fontSize: '1.2rem', padding: '10px 20px' }}>
          Connect to Spotify
        </button>
      </a>
    </main>
  );
}
