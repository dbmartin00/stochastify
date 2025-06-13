import { useState } from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import * as cookie from 'cookie';

type Props = {
  accessToken: string | null;
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const cookies = cookie.parse(context.req.headers.cookie || '');
  const accessToken = cookies.spotify_access_token || null;

  if (!accessToken) {
    return {
      redirect: {
        destination: '/?error=no_token',
        permanent: false,
      },
    };
  }

  return {
    props: { accessToken },
  };
};

export default function GeneratePage({
  accessToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [length, setLength] = useState(25);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateClick = async () => {
    setLoading(true);
    setError('');
    setTracks([]);

    try {
      const response = await fetch(
        'https://6f33u7nr6tj5oky6r6qznmuuxm0bskch.lambda-url.us-west-2.on.aws/',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            count: length,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      setTracks(data.tracks || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate playlist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        padding: '2rem',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
        🎵 Random Spotify Playlist
      </h1>

      {/* Form Section */}
      <div style={{ opacity: loading ? 0.3 : 1, transition: 'opacity 0.3s ease' }}>
        <label style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
          Choose playlist length:
        </label>
        <select
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          style={{
            fontSize: '1.2rem',
            padding: '0.5rem',
            marginBottom: '2rem',
          }}
        >
          {[10, 15, 20, 25, 30, 40, 50].map((val) => (
            <option key={val} value={val}>
              {val} tracks
            </option>
          ))}
        </select>

        <button
          onClick={handleGenerateClick}
          disabled={loading}
          style={{
            fontSize: '1.5rem',
            padding: '1rem 2.5rem',
            backgroundColor: '#1DB954',
            color: 'white',
            border: 'none',
            borderRadius: '50px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s ease',
          }}
          onMouseOver={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
        >
          🚀 Generate Random Playlist
        </button>
      </div>

      {/* Spinner and Loading Text */}
      {loading && (
        <div style={{ marginTop: '2rem' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #ccc',
              borderTop: '4px solid #1DB954',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: 'auto',
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ marginTop: '1rem', fontSize: '1rem', color: '#555', fontStyle: 'italic' }}>
            Building your playlist...
          </p>
        </div>
      )}

      {/* Error */}
      {error && <p style={{ color: 'red', marginTop: '1rem' }}>{error}</p>}

      {/* Track List */}
      {tracks.length > 0 && (
        <div style={{ marginTop: '2rem', width: '100%', maxWidth: '600px' }}>
          <h2>🎶 Your Random Playlist</h2>
          <ul>
            {tracks.map((track: any, i: number) => (
              <li key={i} style={{ marginBottom: '1rem' }}>
                <strong>{track.name}</strong>
                <br />
                <small>{track.artists.join(', ')}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
