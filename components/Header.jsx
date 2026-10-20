import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const user = session?.user;

  return (
    <header className="border-b-2 border-fuchsia-500/40 bg-black/40 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
        <Link href="/" className="font-pixel text-[11px] leading-relaxed text-cyan-300 neon-text sm:text-xs">
          🎮 RESUME<span className="text-fuchsia-400">ROASTER</span>
        </Link>

        <nav className="flex items-center gap-3">
          {status === 'loading' ? null : user ? (
            <>
              <Link href="/upload" className="btn-ghost hidden sm:inline-block">
                New Fight
              </Link>
              <div className="flex items-center gap-2">
                {user.image ? (
                  <img
                    src={user.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-9 w-9 border-2 border-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.6)]"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center border-2 border-lime-400 font-pixel text-xs text-lime-400">
                    P1
                  </div>
                )}
                <div className="hidden leading-tight sm:block">
                  <p className="font-pixel text-[8px] text-lime-400">PLAYER 1</p>
                  <p className="text-sm font-semibold">{user.name?.split(' ')[0]}</p>
                </div>
              </div>
              <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-ghost">
                Quit
              </button>
            </>
          ) : (
            <button onClick={() => signIn('google', { callbackUrl: '/upload' })} className="btn-arcade">
              Login
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
