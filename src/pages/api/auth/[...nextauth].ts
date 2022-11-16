import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import { Client as FaunaClient } from "faunadb";
// import { FaunaAdapter } from "@next-auth/fauna-adapter";

// const client = new FaunaClient({
//   secret: process.env.FAUNADB_KEY!,
//   scheme: "http",
//   domain: "localhost",
//   port: 8443,
// });

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  // adapter: FaunaAdapter(client),
});
