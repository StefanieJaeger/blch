import { User } from "../types/User";
import VotingList from "./VotingList";

type AdminPanelProps = {
    user: User;
}

const AdminPanel = ({ user }: AdminPanelProps) => {
    const handleCreateVoting = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const topic = formData.get("topic");
        const options = formData.get("options");
        console.log("Creating voting:", { topic, options });
    }

    return (
        <div>
            <h2>Admin Panel</h2>
            {/* TODO: Voting Management */}
            <p>You are logged in as admin.</p>
            <p>Your wallet address: {user.address}</p>
            {/* TODO: Voting Creation */}
            <form onSubmit={handleCreateVoting}>
                <h3>Create New Voting</h3>
                <label htmlFor="topic">Topic:</label>
                <input type="text" id="topic" name="topic" required />
                <label htmlFor="options">Options (comma separated):</label>
                <input type="text" id="options" name="options" required />
                <button type="submit">Create Voting</button>
            </form>
            <VotingList />
        </div>
    );
};

export default AdminPanel;