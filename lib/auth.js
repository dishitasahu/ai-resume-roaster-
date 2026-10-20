import GoogleProvider from 'next-auth/providers/google';

// Helps debugging on Vercel: shows up in the function logs if something is missing.
const required = ['NEXTAUTH_SECRET', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'];
const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error('AUTH CONFIG ERROR: missing environment variables:', missing.join(', '));
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: '/' },
};
