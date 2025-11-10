import { useEffect, useState } from "react";
import { getBlockNumber } from "viem/actions";
import { Voting } from "../types/Voting";
import { votingClient } from "../utils/voting-client";
import "./voting-list.css";


// TODO: voting type according to votingcontract

const VotingList = () =>
  // { votings }: VotingListProps
  {
    // end testing viem

    // TODO: add voting type that corresponds w/ what contract returns
    const votings: Voting[] = [
      { topic: "Laura ist cool", options: ["Ja", "Nein"], winnerOption: "Ja" },
      {
        topic: "Ist der Wal eine Küchenmaschine?",
        options: ["Ja", "Nein", "Vielleicht"],
      },
    ];

    return (
    // TODO: add sick stylings
      <section className="votings">
        <div className="votings--active">
          <h3>Open Votings</h3>
          <div className="voting-list">
            {votings.map((voting, idV) => (
              <div className="voting-card" key={idV}>
                <p>{voting.topic}</p>
                {/* TODO: show btn active only if user has not yet voted */}
                {voting.options.map((option, idO) => (
                  <button key={idO}>{option}</button>
                ))}
                {/* TODO: else, show own vote if voted */}
                <p>You already voted. Your vote:</p>
                <p>{voting.options[0]}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="votings--ended">
          <h3>Closed Votings</h3>
          {/* TODO: Add number of votes for each answer */}
          <div className="voting-list">
            {votings.map((voting, idV) => (
              <div className="voting-card" key={idV}>
                <p>Enquiry: {voting.topic}</p>
                Options:
                <br />
                <ol>
                  {voting.options.map((option, idO) => {
                    console.log(idO);
                    return (
                      <li key={idO} className={`${idO === 0 && 'li--bold'}`}>
                        {idO === 0 ? (
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
