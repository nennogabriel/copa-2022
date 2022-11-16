import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Gravatar from "react-gravatar";
import { useRouter } from "next/router";
import { GameProps } from "../../types/GameProps";

export default function NewDeal() {
  const id = useRouter().query.id;
  const { data: session, status } = useSession();
  const [game, setGame] = useState<GameProps>();

  useEffect(() => {
    fetch(`/api/game/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setGame(data);
      });
  }, [id]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // console.log(game);
  }

  if (status === "loading" || !game) {
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
          <h1 className="text-3xl">Partida</h1>
        </div>
        <section className="flex flex-col gap-4">
          <div className="py-4">
            <p className="text-2xl">
              {game.data.team1} {game.data.scoreTeam1 || 0} x {game.data.scoreTeam2 || 0} {game.data.team2}
            </p>
            <p>
              {new Date(game.data.time).toLocaleString("pt-BR", {
                dateStyle: "full",
              })}
            </p>
            <p>
              {new Date(game.data.time).toLocaleString("pt-BR", {
                hour12: false,
                timeStyle: "short",
              })}
            </p>
          </div>
        </section>
        <section className="flex"></section>
      </main>
      <footer className="container"></footer>
    </div>
  );
}
