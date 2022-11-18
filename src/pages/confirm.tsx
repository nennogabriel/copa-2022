import { signIn, signOut } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Gravatar from "react-gravatar";
// import { GamesList } from "../components/GamesList";

export default function Home() {
  return (
    <div className="min-h-screen min-w-screen bg-yellow-300">
      <Head>
        <title>Lemonade: Bolão da copa</title>
        <meta name="description" content="appzinho simples" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="container">
        <div className="flex items-center justify-between gap-4 ">
          <Image
            className="rounded-xl"
            src="/img/lemonadde.jpg"
            alt="lomenadde branding"
            layout="fixed"
            width="150"
            height="150"
          />
        </div>
      </header>
      <main className="container py-10">
        <div className="flex flex-col">
          <h1 className="text-3xl">Falta pouco!</h1>
          <p>Envie o pix para a conta abaixo: </p>

          <Image src="/img/pix.jpeg" alt="pix" width="300" height="300" />
          <p>ou</p>
          <p>para a chave 70ddcae6-3337-4367-9df4-92173b1f8aa3</p>

          <p>
            e o comprovante para o whatsapp:{" "}
            <a className="text-blue-800 underline" href="https://wa.me/4840420001">
              48 4042-0001
            </a>
          </p>
        </div>
      </main>
      <footer className="container">
        <Link className="btn" href="/">
          Voltar a página inicial
        </Link>
      </footer>
    </div>
  );
}
