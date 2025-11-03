import { Voting } from "../types/Voting";

const VotingList = () =>{
    const votings: Voting[] = [{topic: 'Laura ist cool', options: ['Ja', 'Nein']}];

  return (
    <ul>
        {votings.map(voting => 
            <li>{voting.topic}</li>
        )}
    </ul>
  );
}

export default VotingList;
