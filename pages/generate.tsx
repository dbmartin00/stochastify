import { useState } from 'react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
const cookie = require('cookie');
import axios from 'axios';
import { Analytics } from '@vercel/analytics/react';

type Props = {
  accessToken: string | null;
};

type Track = {
  uri: string;
  name: string;
  artists: string[];
};

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

export default function GeneratePage({
  accessToken,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlistName, setPlaylistName] = useState('Stochastify Playlist #1');
  const [playlistSize, setPlaylistSize] = useState<number>(10);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!accessToken) return;

    // event('Generate Clicked');

    setIsLoading(true);
    setTracks([]);
    setSaveMessage('');

    try {
      const response = await axios.post(
        'https://6f33u7nr6tj5oky6r6qznmuuxm0bskch.lambda-url.us-west-2.on.aws/',
        {
          access_token: accessToken,
          count: playlistSize,
        }
      );

      setTracks(response.data.tracks || []);
    } catch (err) {
      console.error('Error generating playlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!accessToken || tracks.length === 0) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      await axios.post('https://25kycybs6np2p3xupkixayycee0oqbom.lambda-url.us-west-2.on.aws/', {
        access_token: accessToken,
        name: playlistName,
        tracks: tracks,
      });

      // event('Playlist Saved');

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

      <div style={{ marginBottom: '2rem' }}>
        <label htmlFor="playlistSize" style={{ fontWeight: 'bold', marginRight: '1rem' }}>
          Playlist Size:
        </label>
        <select
          id="playlistSize"
          value={playlistSize}
          onChange={(e) => setPlaylistSize(parseInt(e.target.value))}
          style={{ fontSize: '1rem', padding: '0.5rem' }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
      </div>

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
          marginBottom: '2rem',
        }}
      >
        Generate Playlist
      </button>

      {isLoading && <p style={{ fontSize: '1.1rem', color: '#999' }}>⏳ Generating your playlist...</p>}

      {tracks.length > 0 && !isLoading && (
        <>
          <div
            style={{
              marginTop: '2rem',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
            }}
          >
            <label htmlFor="playlistName" style={{ fontWeight: 'bold' }}>Playlist Name:</label>
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
              }}
            />
          </div>

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
              marginBottom: '2rem',
            }}
          >
            {isSaving ? 'Saving...' : 'Save to Spotify'}
          </button>

          {saveMessage && <p style={{ marginTop: '1rem' }}>{saveMessage}</p>}

          <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px', marginInline: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🎵 Playlist</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {tracks.map((track, index) => (
                <li key={track.uri} style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                  {index + 1}. {(Array.isArray(track.artists) && track.artists.length > 0
                    ? track.artists.filter(name => name?.trim()).join(', ')
                    : 'Unknown Artist')} – {track.name}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
      {process.env.NODE_ENV === 'production' && <Analytics />}
    </div>
  );
}


