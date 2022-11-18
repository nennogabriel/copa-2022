import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Gravatar from "react-gravatar";
import { admins } from "../util/admins";
// import { GamesList } from "../components/GamesList";

interface GameProps {
  id: string;
  team1: string;
  team2: string;
  date: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [games, setGames] = useState<GameProps[]>([]);

  useEffect(() => {
    fetch("/api/game/all", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setGames(data);
      });
  }, []);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen min-w-screen bg-yellow-300">
      <Head>
        <title>Lemonade: Bolão da copa</title>
        <meta name="description" content="appzinho simples" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="container">
        <div className="flex items-center justify-between flex-wrap gap-4 ">
          <Image
            className="rounded-xl"
            src="/img/lemonadde.jpg"
            alt="lomenadde branding"
            layout="fixed"
            width="150"
            height="150"
          />
          {status === "authenticated" && (
            <div className="flex justify-end items-center gap-4">
              <div className="flex flex-col text-xl">
                Signed in as {session.user?.email}
                <button className="btn" onClick={() => signOut()}>
                  Sign out
                </button>
              </div>
              <Gravatar className="rounded-xl" size={100} email={session.user?.email || ""} />
            </div>
          )}
          {status === "unauthenticated" && (
            <div className="flex justify-end items-center gap-4">
              <div className="flex flex-col text-xl">
                Not signed in
                <button className="btn" onClick={() => signIn("google")}>
                  Sign in
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl">Bolão da copa!</h1>
          <p>Participe do nosso bolão e acompanhe a copa!!!</p>
        </div>
        <section className="flex"></section>
      </header>
      <main className="container py-10">
        {/* render games  */}

        {!!games && games.length > 0 && (
          <>
            {games.map((game) => (
              <div key={game.id} className="flex justify-between py-2">
                <p>
                  {game.team1} x {game.team2}
                </p>
                <p>
                  {new Date(game.date).toLocaleString("pt-BR", {
                    dateStyle: "full",
                  })}
                  {" às "}
                  {new Date(game.date).toLocaleString("pt-BR", {
                    hour12: false,
                    timeStyle: "short",
                  })}
                </p>

                <Link className="btn" href={`/game/${game.id}`}>
                  detalhes
                </Link>
              </div>
            ))}
          </>
        )}
      </main>
      <footer className="container py-8">
        {admins.includes(session?.user?.email!) && (
          <ul className="flex items-center gap-4">
            <li>
              <Link className="btn" href="/new-deal">
                Registrar Partida
              </Link>
            </li>
          </ul>
        )}
      </footer>
    </div>
  );
}
