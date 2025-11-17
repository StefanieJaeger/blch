export type Voting = {
    topic: string;
    options: string[];
    winnerOptionIndex?: number;
    hasEnded: boolean;
    ownVotedOptionsIndex?: number;
}