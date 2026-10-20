import { SessionProvider } from 'next-auth/react';
import Header from '../components/Header';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Component {...pageProps} />
      </main>
    </SessionProvider>
  );
}
