import { GetServerSideProps } from 'next';
import cookie from 'cookie';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { access_token, refresh_token, expires_in } = context.query;

  if (!access_token || !refresh_token) {
    return { redirect: { destination: '/?error=missing_tokens', permanent: false } };
  }

  // Store tokens in cookies
  context.res.setHeader('Set-Cookie', [
    cookie.serialize('spotify_access_token', access_token as string, {
      path: '/',
      maxAge: parseInt(expires_in as string),
      httpOnly: false,
    }),
    cookie.serialize('spotify_refresh_token', refresh_token as string, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
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
