import { useState } from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
const cookie = require('cookie'); // use require to avoid ESM/CJS conflict
import axios from 'axios';

// --- Types ---
type Props = {
  accessToken: string | null;
};

type Track = {
  uri: string;
  name: string;
};

// --- Server-side token grab ---
export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  let accessToken: string | null = null;

  try {
    const cookieHeader = context.req?.headers?.cookie || '';
    const cookies = cookieHeader ? cookie.parse(cookieHeader) : {};
    accessToken = cookies.spotify_access_token || null;
  } catch (err) {
    console.error('Error parsing cookies:', err);
    accessToken = null;
  }

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

// --- Main Component ---
export default function GeneratePage({
  accessToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState('Stochastify Playlist #1');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleGenerate = () => {
    // TODO: Replace with actual generation logic
    setTracks([
      { uri: 'spotify:track:123', name: 'Sample Track 1' },
      { uri: 'spotify:track:456', name: 'Sample Track 2' },
    ]);
  };

  const handleSave = async () => {
    if (!accessToken || tracks.length === 0) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await axios.post('https://25kycybs6np2p3xupkixayycee0oqbom.lambda-url.us-west-2.on.aws/', {
        access_token: accessToken,
        name: playlistName,
        tracks: tracks,
      });

      setSaveMessage('✅ Playlist saved to Spotify!');
    } catch (err) {
      console.error('Save failed:', err);
      setSaveMessage('❌ Failed to save playlist.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '3rem', fontFamily: 'Verdana, sans-serif', textAlign: 'center' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>STOCHASTIFY</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
        Generate a new random playlist from your own playlists
      </p>

      <button
        onClick={handleGenerate}
        style={{
          fontSize: '1.5rem',
          padding: '1rem 2.5rem',
          backgroundColor: '#1DB954',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
        }}
      >
        Generate Playlist
      </button>

      {tracks.length > 0 && (
        <div style={{ marginTop: '3rem' }}>
          <label htmlFor="playlistName" style={{ fontWeight: 'bold' }}>Playlist Name:</label><br />
          <input
            id="playlistName"
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            maxLength={30}
            style={{
              fontSize: '1rem',
              padding: '0.5rem',
              width: '300px',
              marginRight: '1rem',
              marginTop: '1rem',
            }}
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              fontSize: '1.2rem',
              padding: '1rem 2rem',
              backgroundColor: '#1DB954',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Saving...' : 'Save to Spotify'}
          </button>
          {saveMessage && <p style={{ marginTop: '1rem' }}>{saveMessage}</p>}
        </div>
      )}
    </div>
  );
}
