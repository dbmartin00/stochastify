import { GetServerSideProps } from 'next';
import * as cookie from 'cookie';

export const getServerSideProps = async (context) => {
  const { access_token, refresh_token, expires_in } = context.query;

  if (!access_token || !refresh_token) {
    return { redirect: { destination: '/?error=missing_tokens', permanent: false } };
  }

  context.res.setHeader('Set-Cookie', [
    cookie.serialize('spotify_access_token', String(access_token), {
      path: '/',
      maxAge: parseInt(String(expires_in)),
      httpOnly: false,
    }),
    cookie.serialize('spotify_refresh_token', String(refresh_token), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: false,
    }),
  ]);

  return {
    redirect: { destination: '/generate', permanent: false },
  };
};

export default function CallbackNext() {
  return <p>Redirecting to your playlist...</p>;
}
