import { useEffect, useState } from "react";
import { Voting } from "../types/Voting";
import { loadVotings, vote } from "../utils/voting-client";
import "./voting-list.css";

// TODO: voting type according to votingcontract
declare global {
  interface Window {
    ethereum?: any;
  }
}
const VotingList = () => {
  const [votings, setVotings] = useState<Voting[]>([]);

  const loadData = async () => {
    try {
      const votings = await loadVotings();
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
    // TODO: add sick stylings
    <section className="votings">
      <div className="votings--active">
        <h3>Open Votings</h3>
        <button onClick={loadData}>Load</button>
        <div className="voting-list">
          {votings
            .filter((v) => !v.hasEnded)
            .map((voting) => (
              <div className="voting-card" key={voting.id}>
                <p>{voting.topic}</p>
                {voting.ownVotedOptionsIndex === -1 ? (
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
                    <p>{voting.options[0]}</p>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
      <div className="votings--ended">
        <h3>Closed Votings</h3>
        {/* TODO: Add number of votes for each answer */}
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
                    console.log(idO);
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
