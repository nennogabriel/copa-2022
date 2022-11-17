import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Gravatar from "react-gravatar";
import { useRouter } from "next/router";
import { GameProps } from "../../types/GameProps";
import shortUUID from "short-uuid";

interface BetProps {
  id: string;
  scoreTeam1: number;
  scoreTeam2: number;
  amount: number;
}

export default function NewDeal() {
  const router = useRouter();
  const id = router.query.id;
  const { data: session, status } = useSession();
  const [game, setGame] = useState<GameProps>({
    ref: {
      id: "",
    },
    data: {
      team1: "",
      team2: "",
      done: false,
      guesses: [],
      scoreTeam1: 0,
      scoreTeam2: 0,
      time: 0,
    },
  });
  const [bet, setBet] = useState<BetProps>({
    id: shortUUID.generate(),
    scoreTeam1: 0,
    scoreTeam2: 0,
    amount: 0,
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/game/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setGame({
          ...data,
          data: {
            ...data.data,
            guesses: data.data.guesses || [],
          },
        });
      });
  }, [id]);

  if (status === "loading" || !game) {
    return <div>Loading...</div>;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) {
      alert("Faça o login para apostar");
      return;
    }

    if (bet.amount <= 0) {
      alert("Aposta inválida (valor menor ou igual a zero)");
      return;
    }

    fetch(`/api/game/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...bet,
        email: session.user?.email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        router.push(`/confirm`);
      });
  }

  function rejectRequest(betId: string) {
    const findRequest = game.data.guesses.find((request) => request.id === betId);
    if (!findRequest) return;
    if (findRequest.confirmed) return;

    const guessesUpdated = game.data.guesses.filter((request) => request.id !== betId);

    const gameUpdated = {
      ...game,
      data: {
        ...game.data,
        guesses: guessesUpdated || "",
      },
    };

    fetch(`/api/game/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameUpdated.data),
    })
      .then((res) => res.json())
      .then((data) => {
        setGame(gameUpdated);
      });
  }

  function acceptRequest(betId: string) {
    const findRequest = game.data.guesses.find((request) => request.id === betId);
    if (!findRequest) return;
    if (findRequest.confirmed) return;

    const guessesUpdated = game.data.guesses.map((request) => {
      if (request.id === betId) {
        return {
          ...request,
          confirmed: true,
        };
      }
      return request;
    });

    const gameUpdated = {
      ...game,
      data: {
        ...game.data,
        guesses: guessesUpdated,
      },
    };

    fetch(`/api/game/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(gameUpdated.data),
    })
      .then((res) => res.json())
      .then((data) => {
        setGame(gameUpdated);
      });
  }

  console.log(game);
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
        {!game.data.done && (
          <section className="flex flex-col">
            <h2>Fazer Aposta</h2>
            <form onSubmit={handleSubmit}>
              <div className="flex gap-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="scoreTeam1">{game.data.team1}</label>
                  <input
                    type="number"
                    name="scoreTeam1"
                    id="scoreTeam1"
                    value={bet.scoreTeam1}
                    onChange={(e) => setBet({ ...bet, scoreTeam1: Math.abs(Number(e.target.value)) })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="scoreTeam2">{game.data.team2}</label>
                  <input
                    type="number"
                    name="scoreTeam2"
                    id="scoreTeam2"
                    value={bet.scoreTeam2}
                    onChange={(e) => setBet({ ...bet, scoreTeam2: Math.abs(Number(e.target.value)) })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="amount">Valor</label>
                  <input
                    type="number"
                    name="amount"
                    id="amount"
                    value={bet.amount}
                    onChange={(e) => setBet({ ...bet, amount: Math.abs(Number(e.target.value)) })}
                  />
                </div>
                <button className="btn" type="submit">
                  Enviar Aposta
                </button>
              </div>
            </form>
          </section>
        )}
        <section className="flex flex-col gap-4">
          <h2>Apostas</h2>
          <div className="flex flex-col gap-4">
            {game.data.guesses
              .filter((g) => g.confirmed)
              .map((guess) => (
                <div key={guess.email} className="flex gap-4">
                  <Gravatar className="rounded-xl" size={100} email={guess.email} />
                  <div className="flex flex-col gap-2">
                    <p>{guess.email}</p>
                    <p>
                      {guess.scoreTeam1} x {guess.scoreTeam2}
                    </p>
                    <p>{guess.amount}</p>
                  </div>
                </div>
              ))}
          </div>
        </section>
        <section className="flex flex-col gap-4 bg-gray-300">
          <h2>Requisições de Apostas</h2>
          <div className="flex flex-col gap-4">
            {game.data.guesses
              .filter((g) => !g.confirmed)
              .map((request) => (
                <div key={request.id} className="flex gap-4">
                  <Gravatar className="rounded-xl" size={100} email={request.email} />
                  <div className="flex flex-col gap-2">
                    <p>{request.email}</p>
                    <p>
                      {game.data.team1} {request.scoreTeam1} x {request.scoreTeam2} {game.data.team2}
                    </p>
                    <p>R$ {request.amount.toFixed(2)}</p>
                  </div>
                  <button
                    className="btn bg-gray-700"
                    onClick={() => {
                      rejectRequest(request.id);
                    }}
                  >
                    Rejeitar
                  </button>
                  <button
                    className="btn"
                    onClick={() => {
                      acceptRequest(request.id);
                    }}
                  >
                    Aceitar
                  </button>
                </div>
              ))}
          </div>
        </section>
      </main>
      <footer className="container"></footer>
    </div>
  );
}
