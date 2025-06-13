import { GetServerSideProps } from 'next';
import * as cookie from 'cookie';

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

  // Safely cast and parse the values
  const token = String(access_token);
  const refresh = String(refresh_token);
  const maxAge = parseInt(String(expires_in)) || 3600;

  context.res.setHeader('Set-Cookie', [
    cookie.serialize('spotify_access_token', token, {
      path: '/',
      maxAge,
      httpOnly: false, // set to true in prod if you handle tokens server-side
      sameSite: 'lax',
    }),
    cookie.serialize('spotify_refresh_token', refresh, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
      sameSite: 'lax',
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
