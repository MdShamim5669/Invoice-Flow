import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_AUTH_URL ||
    'https://ai-invoicing-and-billing-app-server.onrender.com',
});


export const { signIn, signUp, signOut, useSession } = authClient;
