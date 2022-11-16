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

  if (req.method === "GET") {
    // get a game instance
    try {
      const response: GameProps = await faunaClient.query(q.Get(q.Ref(q.Collection("games"), id)));
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
