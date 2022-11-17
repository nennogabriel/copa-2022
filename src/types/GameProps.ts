export type GameProps = {
  ref: { id: string };
  data: {
    team1: string;
    team2: string;
    scoreTeam1: number | null;
    scoreTeam2: number | null;
    done: boolean;
    time: number;
    guesses: Array<{
      id: string;
      scoreTeam1: string;
      scoreTeam2: string;
      email: string;
      amount: number;
      confirmed: boolean;
    }>;
  };
};
