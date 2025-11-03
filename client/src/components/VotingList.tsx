import { useEffect, useState } from "react";
import { Voting } from "../types/Voting";
import { votingClient } from "../utils/voting-client";
import "./voting-list.css";
import { getBlockNumber } from "viem/actions";

const VotingList = () => {
    // start testing viem
    const [blockNumber, setBlockNumber] = useState<bigint | null>(null);
    
    useEffect(() => {
        const fetchBlockNumber = async () => {
            const bn = await getBlockNumber(votingClient);
            setBlockNumber(bn);
        };
        fetchBlockNumber();
    }, []);
    // end testing viem
    
    const votings: Voting[] = [
        {topic: 'Laura ist cool', options: ['Ja', 'Nein']},
        {topic: 'Ist der Wal eine Küchenmaschine?', options: ['Ja', 'Nein', 'Vielleicht']},
    ];
    // TODO: 
    // read votingHasEnded from contract
    // read participants[user.address].voted from contract
    // send vote transaction to contract
    // do this here or in App?
  return (
    <div className="votings">
        <h3>Active Votings</h3>
        <p>Current block number: {blockNumber}</p>
        <div className="voting-list">
            {votings.map((voting, idV) =>
                <div className="voting-card" key={idV}>
                    <p>{voting.topic}</p>
                    {voting.options.map((option, idO) =>
                        <button key={idO}>{option}</button>
                    )}
                </div>
            )}
        </div>
    </div>
  );
}

export default VotingList;
