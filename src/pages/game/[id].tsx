import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Gravatar from "react-gravatar";
import { useRouter } from "next/router";
import { GameProps } from "../../types/GameProps";
import shortUUID from "short-uuid";
import { admins } from "../../util/admins";

interface BetProps {
  id: string;
  scoreTeam1: number;
  scoreTeam2: number;
  amount: number;
}

interface ResultProps {
  scoreTeam1: number;
  scoreTeam2: number;
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

  const [result, setResult] = useState<ResultProps>({
    scoreTeam1: 0,
    scoreTeam2: 0,
  });

  const resultBets = useMemo(() => {
    if (!game.data.done) return {};
    if (game.data.scoreTeam1 === null) return {};
    if (game.data.scoreTeam2 === null) return {};

    const sumBets = game.data.guesses.reduce((acc, guess) => {
      if (guess.confirmed) {
        return acc + guess.amount;
      }
      return acc;
    }, 0);

    const confirmedBets = game.data.guesses.filter((guess) => guess.confirmed);
    const isTeam1Winner = game.data.scoreTeam1 > game.data.scoreTeam2;

    const preciseWinners = confirmedBets.filter((guess) => {
      const scoreTeam1 = Number(guess.scoreTeam1);
      const scoreTeam2 = Number(guess.scoreTeam2);
      return scoreTeam1 === game.data.scoreTeam1 && scoreTeam2 === game.data.scoreTeam2;
    });

    const sumPreciseWinners = preciseWinners.reduce((acc, guess) => {
      return acc + guess.amount;
    }, 0);

    const sideWinners = confirmedBets.filter((guess) => {
      const scoreTeam1 = Number(guess.scoreTeam1);
      const scoreTeam2 = Number(guess.scoreTeam2);
      const isBetTeam1Winner = scoreTeam1 > scoreTeam2;
      return isBetTeam1Winner === isTeam1Winner;
    });

    const sumSideWinners = sideWinners.reduce((acc, guess) => {
      return acc + guess.amount;
    }, 0);

    return { sumBets, preciseWinners, sideWinners, sumPreciseWinners, sumSideWinners };
  }, [game]);

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

    if (bet.scoreTeam1 === bet.scoreTeam2) {
      if (!confirm("Você tem certeza que quer apostar em empate?")) {
        return;
      }
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

  function handleSubmitResult(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!session) return;

    fetch(`/api/game/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...result,
        done: true,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Resultado atualizado");
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

  return (
    <div className="min-h-screen min-w-screen bg-yellow-300">
      <Head>
        <title>Lemonade: Bolão da copa</title>
        <meta name="description" content="appzinho simples" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container">
        <div className="flex items-center justify-between flex-wrap gap-4 ">
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
        {game.data.done && (
          <>
            {resultBets.preciseWinners?.length === 0 && resultBets.sideWinners?.length === 0 ? (
              <div className="flex flex-col gap-4">
                <h1 className="text-3xl">Ninguém acertou o resultado</h1>
              </div>
            ) : (
              <section className="flex flex-col gap-4">
                <div className="py-4">
                  <p className="text-2xl">Total do bolão: R$ {resultBets.sumBets?.toFixed(2)}</p>
                  {resultBets.preciseWinners!.length > 0 && (
                    <>
                      <p className="text-2xl">Acertaram na mosca</p>
                      <ul className="flex flex-col gap-4">
                        {resultBets.preciseWinners!.map((guess) => {
                          if (guess.confirmed) {
                            return (
                              <li key={guess.id}>
                                <p>{guess.email}</p>
                                <p>
                                  R$ {((guess.amount / resultBets.sumPreciseWinners!) * resultBets.sumBets!).toFixed(2)}
                                </p>
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </>
                  )}
                  {resultBets.preciseWinners!.length === 0 && resultBets.sideWinners!.length > 0 && (
                    <>
                      <p className="text-2xl">Acertaram o vencedor</p>
                      <ul className="flex flex-col gap-4">
                        {resultBets.sideWinners!.map((guess) => {
                          if (guess.confirmed) {
                            return (
                              <li key={guess.id}>
                                <p>{guess.email}</p>
                                <p>
                                  R$ {((guess.amount / resultBets.sumSideWinners!) * resultBets.sumBets!).toFixed(2)}
                                </p>
                              </li>
                            );
                          }
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        {!game.data.done && (
          <section className="flex flex-col mb-4">
            <h2>Fazer Aposta</h2>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-wrap gap-4">
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
        {admins.includes(session?.user?.email!) && (
          <section className="flex flex-col gap-4 bg-gray-300 p-4">
            <h2>Requisições de Apostas</h2>
            <div className="flex flex-col gap-4">
              {game.data.guesses
                .filter((g) => !g.confirmed)
                .map((request) => (
                  <div key={request.id} className="flex flex-wrap gap-4 py-2">
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
        )}

        <section className="flex flex-col gap-4">
          <h2>Apostas</h2>
          <div className="flex flex-col gap-4">
            {game.data.guesses
              .filter((g) => g.confirmed)
              .map((guess) => (
                <div key={guess.id} className="flex gap-4">
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

        {!game.data.done && game.data.time < new Date().getTime() && (
          <section className="py-4">
            <h2>Resultado (Placar)</h2>
            <div className="flex flex-col gap-4">
              <form className="py-8" onSubmit={handleSubmitResult}>
                <label htmlFor="scoreTeam1">{game.data.team1}</label>
                <input
                  className="w-20 px-2 mx-4"
                  type="number"
                  name="scoreTeam1"
                  id="scoreTeam1"
                  value={result.scoreTeam1}
                  onChange={(e) => setResult({ ...result, scoreTeam1: Math.abs(Number(e.target.value)) })}
                />
                <label htmlFor="scoreTeam2">{game.data.team2}</label>
                <input
                  className="w-20 px-2 mx-4"
                  type="number"
                  name="scoreTeam2"
                  id="scoreTeam2"
                  value={result.scoreTeam2}
                  onChange={(e) => setResult({ ...result, scoreTeam2: Math.abs(Number(e.target.value)) })}
                />
                <button className="btn mt-4" type="submit">
                  Enviar Resultado
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
      <footer className="container py-8"></footer>
    </div>
  );
}
