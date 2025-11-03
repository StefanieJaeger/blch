import { Voting } from "../types/Voting";
import "./voting-list.css";

const VotingList = () =>{
    const votings: Voting[] = [
        {topic: 'Laura ist cool', options: ['Ja', 'Nein']},
        {topic: 'Ist der Wal eine Küchenmaschine?', options: ['Ja', 'Nein', 'Vielleicht']},
    ];

  return (
    <div className="votings">
        <h3>Active Votings</h3>
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
