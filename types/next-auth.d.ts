import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role?: 'admin' | 'employee';
  }
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role: 'admin' | 'employee';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: 'admin' | 'employee';
    email?: string | null;
    name?: string | null;
  }
}
