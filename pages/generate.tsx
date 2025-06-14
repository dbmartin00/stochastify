import { useState } from 'react';
import axios from 'axios';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import cookie from 'cookie';

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
  const [tracks, setTracks] = useState([]);
  const [playlistName, setPlaylistName] = useState('Stochastify Playlist #1');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

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

      setSaveMessage('✅ Playlist saved!');
    } catch (err) {
      setSaveMessage('❌ Failed to save playlist.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      {/* Your playlist generator UI here */}
      {/* Example button that populates dummy tracks */}
      <button
        style={{ fontSize: '1.2rem', padding: '1rem', marginBottom: '2rem' }}
        onClick={() => {
          // Dummy track data for testing
          setTracks([
            { uri: 'spotify:track:1', name: 'Song A' },
            { uri: 'spotify:track:2', name: 'Song B' },
          ]);
        }}
      >
        Generate
      </button>

      {tracks.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <label htmlFor="playlistName">Playlist Name:</label><br />
          <input
            id="playlistName"
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            maxLength={30}
            style={{ fontSize: '1rem', padding: '0.5rem', width: '300px', marginRight: '1rem' }}
          />
          <button
            onClick={handleSave}
            style={{
              fontSize: '1.2rem',
              padding: '1rem 2rem',
              backgroundColor: '#1DB954',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
            }}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save to Spotify'}
          </button>
          {saveMessage && <p style={{ marginTop: '1rem' }}>{saveMessage}</p>}
        </div>
      )}
    </div>
  );
}
////