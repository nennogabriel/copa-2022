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

  // if (!session) return res.status(401).json({ error: "Unauthorized" });
  const faunaClient = new faunadb.Client({ secret: process.env.FAUNADB_KEY! });

  if (req.method === "POST") {
    // create a new group instance
    const data = req.body;
    const time = new Date(req.body.date).getTime();
    try {
      const response: GameProps = await faunaClient.query(
        q.Create(q.Collection("games"), {
          data: {
            ...data,
            team1: data.team1.trim().toUpperCase(),
            team2: data.team2.trim().toUpperCase(),
            time,
            requests: [],
            deals: [],
          },
        })
      );
      return res.status(200).json(response);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(401).json({ error: "Unauthorized" });
}
