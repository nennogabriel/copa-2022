// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import faunadb, { query as q } from "faunadb";
import { GameProps } from "../../../types/GameProps";

type ErrorProps = {
  error: string;
};

interface ResponseProps {
  data: Array<{
    ref: { id: string };
  }>;
}

const admins = ["pedro@seal.works"];

export default async function handler(req: NextApiRequest, res: NextApiResponse<GameProps | ErrorProps>) {
  const session = await getSession({ req });

  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const faunaClient = new faunadb.Client({ secret: process.env.FAUNADB_KEY! });

  const { id } = req.query;
  let game: GameProps | null = null;

  try {
    game = await faunaClient.query(q.Get(q.Ref(q.Collection("games"), id)));
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }

  if (!game) return res.status(404).json({ error: "Game not found" });

  if (req.method === "GET") {
    // get a game instance
    return res.status(200).json(game);
  }

  if (req.method === "PUT") {
    // registering a bet request
    // update a game instance
    const { scoreTeam1, scoreTeam2, email, amount } = req.body;
    if ([scoreTeam1, scoreTeam2, email, amount].includes(undefined))
      return res.status(400).json({ error: "Missing data" });
    // refuse requests after the game starts
    if (game.data.time < Date.now()) {
      return res.status(400).json({ error: "Game already started" });
    }

    try {
      const response: GameProps = await faunaClient.query(
        q.Update(q.Ref(q.Collection("games"), id), {
          data: {
            ...game.data,
            guesses: [
              ...game.data.guesses,
              {
                id: req.body.id,
                scoreTeam1,
                scoreTeam2,
                email,
                amount,
                confirmed: false,
              },
            ],
          },
        })
      );
      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (req.method === "PATCH") {
    // update a game instance
    const data = req.body;
    try {
      const response: GameProps = await faunaClient.query(
        q.Update(q.Ref(q.Collection("games"), id), {
          data,
        })
      );
      console.log(response);
      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  if (req.method === "DELETE") {
    // delete a game instance
    try {
      const response: GameProps = await faunaClient.query(q.Delete(q.Ref(q.Collection("games"), id)));
      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(401).json({ error: "Unauthorized" });
}
