import { Analytics } from '@vercel/analytics/react';

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
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #1db954 10%, #191414 100%)',
      fontFamily: 'Helvetica Neue, sans-serif',
      color: 'white',
      animation: 'fadeIn 1s ease-in'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .spotify-button:hover {
          background-color: #1ed760 !important;
        }
      `}</style>

      <h1 style={{
        fontSize: '4rem',
        fontWeight: '900',
        letterSpacing: '2px',
        marginBottom: '10px'
      }}>
        STOCHASTIFY
      </h1>

      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: '400',
        color: '#d1d1d1',
        marginBottom: '40px'
      }}>
        Random Spotify Playlist Generator
      </h2>

      <a href={loginUrl}>
        <button className="spotify-button" style={{
          fontSize: '1.2rem',
          padding: '12px 30px',
          backgroundColor: '#1DB954',
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          transition: 'background-color 0.3s ease'
        }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg"
            alt="Spotify logo"
            style={{ width: '24px', height: '24px' }}
          />
          Connect to Spotify
        </button>
      </a>

      <p style={{
        marginTop: '60px',
        fontSize: '0.9rem',
        color: '#bbb'
      }}>
        By <strong>Ad Hoc Technology</strong>
      </p>

      {process.env.NODE_ENV === 'production' && <Analytics />}
    </main>
  );
}
