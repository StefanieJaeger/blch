import { User } from "../types/User";
import VotingList from "./VotingList";

type VoterPanelProps = {
    user: User;
};

const VoterPanel = ({ user }: VoterPanelProps) => {
    return (
        <div>
            <h2>Voter Panel</h2>
            <p>You are logged in as a voter.</p>
            <p>Your address: {user.address}</p>
            <VotingList />
        </div>
    );
};

export default VoterPanel;
