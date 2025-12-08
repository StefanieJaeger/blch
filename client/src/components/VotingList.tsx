import { useEffect, useState } from "react";
import { User } from "../types/User";
import { Voting } from "../types/Voting";
import { loadVotings, vote } from "../utils/voting-client";
import "./voting-list.css";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type VotingListProps = {
  user: User;
  refreshKey: number;
};

const VotingList = ({ user }: VotingListProps) => {
  const [votings, setVotings] = useState<Voting[]>([]);

  useEffect(() => {
    loadData();
    const id = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const loadData = async () => {
    try {
      const votings = await loadVotings(user);
      setVotings(votings);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVote = async (votingIdx: number, optionIdx: number) => {
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      }
      await vote(votingIdx, optionIdx);
      loadData();
      alert("Your vote has been cast! Processing can take a while. Please click reload button in a couple of seconds or go get a snack and do it then :)")
    } catch (err) {
      alert("Voting failed: " + (err as Error).message);
    }
  };

  return (
    <section className="votings">
      <h2>Votings</h2>
      <button onClick={loadData}>🔄 Refresh Votings</button>
      <div className="votings--active">
        <h3>Open Votings</h3>
        <div className="voting-list">
          {votings
            .filter((v) => !v.hasEnded)
            .map((voting) => (
              <div className="voting-card" key={voting.id}>
                <p>{voting.topic}</p>
                {!voting.isParticipant && (
                  <p className="info">
                    You are not a participant and therefore can't vote.
                  </p>
                )}
                {voting.ownVotedOptionIndex === -1 ? (
                  voting.options.map((option, idO) => (
                    <button
                      key={idO}
                      onClick={() => handleVote(voting.id, idO)}
                      disabled={!voting.isParticipant}
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <div>
                    <p>You already voted. Your vote:</p>
                    <p>
                      {voting.options[voting.ownVotedOptionIndex as number]}
                    </p>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
      <div className="votings--closed">
        <h3>Closed Votings</h3>
        <div className="voting-list">
          {votings
            .filter((v) => v.hasEnded)
            .map((voting) => (
              <div className="voting-card" key={voting.id}>
                <p>Enquiry: {voting.topic}</p>
                {!voting.isParticipant && (
                  <p className="info">You were not a participant.</p>
                )}
                Options:
                <br />
                <ol>
                  {voting.options.map((option, idO) => {
                    const hasWon = idO === voting.winnerOptionIndex;
                    return (
                      <li key={idO} className={`${hasWon ? "li--bold" : ""}`}>
                        {hasWon ? <>WINNER: {option}</> : <>{option}</>}
                        {voting.ownVotedOptionIndex === idO && (
                          <span> (your vote)</span>
                        )}
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default VotingList;
