type Voting = {
    topic: string;
    options: string[];
    winnerOption?: string;
}

function VotingList() {
    const votings: Voting[] = [];

  return (
    <div>
        {votings.map(voting => 
            <div>voting.topic</div>
        )}
    </div>
  );
}

export default App;
