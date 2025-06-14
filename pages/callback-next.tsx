import { GetServerSideProps } from 'next';
const cookie = require('cookie'); // ← fallback to CommonJS to avoid ESM issues

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { access_token, refresh_token, expires_in } = context.query;

  if (!access_token || !refresh_token) {
    return {
      redirect: {
        destination: '/?error=missing_tokens',
        permanent: false,
      },
    };
  }

  const token = String(access_token);
  const refresh = String(refresh_token);
  const maxAge = parseInt(String(expires_in)) || 3600;

  context.res.setHeader('Set-Cookie', [
    cookie.serialize('spotify_access_token', token, {
      path: '/',
      maxAge,
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    }),
    cookie.serialize('spotify_refresh_token', refresh, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    }),
  ]);

  return {
    redirect: {
      destination: '/generate',
      permanent: false,
    },
  };
};

export default function CallbackNext() {
  return <p>Redirecting to your playlist...</p>;
}
