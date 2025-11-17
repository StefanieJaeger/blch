import { useEffect, useState } from "react";
import { getBlockNumber } from "viem/actions";
import { Voting } from "../types/Voting";
import { loadVotings } from "../utils/voting-client";
import "./voting-list.css";


// TODO: voting type according to votingcontract

const VotingList = () =>
  {
    const [votings, setVotings] = useState<Voting[]>([]);

    const loadData = async () => {
        try {
          const votings = await loadVotings();
          console.log('votings', votings);
          setVotings(votings);
        } catch (err) {
          console.error(err)
        }
    }

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
            {votings.filter(v => !v.hasEnded).map((voting, idV) => (
              <div className="voting-card" key={idV}>
                <p>{voting.topic}</p>
                {voting.ownVotedOptionsIndex === -1 ?
                  (voting.options.map((option, idO) => (
                    <button key={idO}>{option}</button>
                  ))) :
                  (<div>
                    <p>You already voted. Your vote:</p>
                    <p>{voting.options[0]}</p>
                  </div>)}
              </div>
            ))}
          </div>
        </div>
        <div className="votings--ended">
          <h3>Closed Votings</h3>
          {/* TODO: Add number of votes for each answer */}
          <div className="voting-list">
            {votings.filter(v => v.hasEnded).map((voting, idV) => (
              <div className="voting-card" key={idV}>
                <p>Enquiry: {voting.topic}</p>
                Options:
                <br />
                <ol>
                  {voting.options.map((option, idO) => {
                    console.log(idO);
                    const hasWon = idO === voting.winnerOptionIndex;
                    return (
                      <li key={idO} className={`${hasWon ? 'li--bold' : ''}`}>
                        {hasWon ? (
                            <>
                            WINNER: {option}</>
                        ): (<>{option}</>)}
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
