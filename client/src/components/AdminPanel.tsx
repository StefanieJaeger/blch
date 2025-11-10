import { encodeBytes32String } from "ethers";
import { User } from "../types/User";
import { deployVotingContract } from "../utils/voting-client";
import VotingList from "./VotingList";

// Add this at the top of your file (e.g., AdminPanel.tsx or voting-client.ts)
// TODO: why is this necessary? i don't get it -.- 
declare global {
  interface Window {
    ethereum?: any;
  }
}

type AdminPanelProps = {
    user: User;
}

const AdminPanel = ({ user }: AdminPanelProps) => {

    // hardcoded deploy function for testing viem
    const handleDeploy = async () => {
        try {
            if (window.ethereum) {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
            }
            await deployVotingContract();
            alert("Deployment transaction sent! Check console for hash.");
        } catch (err) {
            alert("Deployment failed: " + (err as Error).message);
        }
    };
    
    // TODO: finish implementing voting creation
    const handleCreateVoting = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const topic = encodeBytes32String(formData.get("topic") as string);
        const options = encodeBytes32String(formData.get("options") as string).split(",").map(opt => opt.trim());
        console.log("Creating voting:", { topic, options });
    }

    return (
        <div>
            <h2>Admin Panel</h2>
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
            {/* hardcoded deploy button for testing viem */}
            <button onClick={handleDeploy}>Deploy hardcoded Contract</button>
            <VotingList />
        </div>
    );
};

export default AdminPanel;