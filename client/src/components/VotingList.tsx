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

const VotingList = ({ user, refreshKey }: VotingListProps) => {
  const [votings, setVotings] = useState<Voting[]>([]);

  useEffect(() => {
    setTimeout(() => loadData(), 25000);
  }, [refreshKey]);
  const loadData = async () => {
    try {
      const votings = await loadVotings(user);
      console.log("votings", votings);
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
    } catch (err) {
      alert("Voting failed: " + (err as Error).message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <section className="votings">
      <h2>Votings</h2>
      <button onClick={loadData}>&#128472; refresh votings</button>
      <div className="votings--active">
        <h3>Open Votings</h3>
        <div className="voting-list">
          {votings
            .filter((v) => !v.hasEnded)
            .map((voting) => (
              <div className="voting-card" key={voting.id}>
                <p>{voting.topic}</p>
                {voting.ownVotedOptionIndex === -1 ? (
                  voting.options.map((option, idO) => (
                    <button
                      key={idO}
                      onClick={() => handleVote(voting.id, idO)}
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
                Options:
                <br />
                <ol>
                  {voting.options.map((option, idO) => {
                    const hasWon = idO === voting.winnerOptionIndex;
                    return (
                      <li key={idO} className={`${hasWon ? "li--bold" : ""}`}>
                        {hasWon ? <>WINNER: {option}</> : <>{option}</>}
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
