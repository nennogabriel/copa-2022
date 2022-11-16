import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Gravatar from "react-gravatar";

interface GameProps {
  team1: string;
  team2: string;
  date: string;
  hour: string;
}

export default function NewDeal() {
  const { data: session, status } = useSession();
  const [game, setGame] = useState<GameProps>({
    team1: "",
    team2: "",
    date: "",
    hour: "",
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // console.log(game);
    console.log(`${game.date}T${game.hour}:00.000`);
    const date = new Date(`${game.date}T${game.hour}:00.000-03:00`).toISOString();
    // register game in database
    fetch("/api/game", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team1: game.team1,
        team2: game.team2,
        date,
      }),
    }).then((res) => {
      if (res.ok) {
        alert("Jogo cadastrado com sucesso!");
      }
    });
  }

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

      <main className="container">
        <div className="flex items-center justify-between gap-4 ">
          <Link href="/">
            <Image
              className="rounded-xl"
              src="/img/lemonadde.jpg"
              alt="lomenadde branding"
              layout="fixed"
              width="150"
              height="150"
            />
          </Link>
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
          <h1 className="text-3xl">Cadastrar Partida</h1>
        </div>
        <section className="flex">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <label htmlFor="team1">Time 1</label>
            <input
              type="text"
              name="team1"
              id="team1"
              value={game.team1}
              onChange={(e) => setGame({ ...game, team1: e.target.value.toUpperCase().slice(0, 3) })}
            />
            <label htmlFor="team2">Time 2</label>
            <input
              type="text"
              name="team2"
              id="team2"
              value={game.team2}
              onChange={(e) => setGame({ ...game, team2: e.target.value.toUpperCase().slice(0, 3) })}
            />
            <label htmlFor="date">Data</label>
            <input
              type="date"
              name="date"
              id="date"
              value={game.date}
              onChange={(e) => setGame({ ...game, date: e.target.value })}
            />
            <label htmlFor="hour">Hora</label>
            <input
              type="time"
              name="hour"
              id="hour"
              value={game.hour}
              onChange={(e) => setGame({ ...game, hour: e.target.value })}
            />

            <button className="btn" type="submit">
              Cadastrar
            </button>
          </form>
        </section>
      </main>
      <footer className="container">
        {/* <Image
          className="flex-1"
          src="/img/lemonadde.jpg"
          alt="lomenadde branding"
          layout="responsive"
          width="100"
          height="100"
        /> */}
      </footer>
    </div>
  );
}
