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

export default async function handler(req: NextApiRequest, res: NextApiResponse<GameProps[] | ErrorProps>) {
  const session = await getSession({ req });

  if (!session) return res.status(401).json({ error: "Unauthorized" });
  const faunaClient = new faunadb.Client({ secret: process.env.FAUNADB_KEY! });

  if (req.method === "GET") {
    // get all group instances
    try {
      const response: ResponseProps = await faunaClient.query(
        q.Map(
          q.Paginate(q.Documents(q.Collection("games"))),
          q.Lambda((x) => q.Get(x))
        )
      );
      const games: GameProps[] = response.data.map((product: any) => {
        return {
          id: product.ref.id,
          ...product.data,
        };
      });
      return res.status(200).json(games);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  return res.status(401).json({ error: "Unauthorized" });
}
