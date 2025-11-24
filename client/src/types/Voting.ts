export type Voting = {
    id: number;
    topic: string;
    options: string[];
    winnerOptionIndex?: number;
    hasEnded: boolean;
    ownVotedOptionsIndex?: number;
}