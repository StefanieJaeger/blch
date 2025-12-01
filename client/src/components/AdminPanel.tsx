import { useState } from "react";
import { User } from "../types/User";
import { createNewVoting } from "../utils/voting-client";
import VotingList from "./VotingList";
import { executeSmartAccountTransaction } from "../utils/voting-smart-client";

declare global {
  interface Window {
    ethereum?: any;
  }
}

type AdminPanelProps = {
  user: User;
};

const AdminPanel = ({ user }: AdminPanelProps) => {
  const [votingRefreshKey, setVotingRefreshKey] = useState<number>(0);

  const handleCreateVoting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const topic = formData.get("topic") as string;
    const options = (formData.get("options") as string)
      .split(",")
      .map((opt) => opt.trim());
    const participants = (formData.get("participants") as string)
      .split(",")
      .map((part) => part.trim());
    console.log("Creating voting:", { topic, options, participants });
    try {
      if (window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      }
      await createNewVoting(topic, options, participants);
      alert(
        "Deployment transaction sent! Processing can take a while. Please click reload button in a couple of seconds or go get a coffee and do it then :)"
      );
      (document.getElementById("topic") as HTMLInputElement).value = "";
      (document.getElementById("options") as HTMLInputElement).value = "";
      (document.getElementById("participants") as HTMLInputElement).value = "";
      setVotingRefreshKey((prev) => prev + 1);
    } catch (err) {
      alert("Deployment failed: " + (err as Error).message);
    }
  };

  const handleCreateTrans = async () => {
    // TODO mp not sure if the args are given in the right format
    await executeSmartAccountTransaction("vote", [0, 0]);
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <p>You are logged in as admin.</p>
      <p>Your wallet address: {user.address}</p>
      <button onClick={handleCreateTrans}>Create abstracted trans</button>
      <form onSubmit={handleCreateVoting}>
        <h3>Create New Voting</h3>
        <label htmlFor="topic">Topic:</label>
        <input type="text" id="topic" name="topic" required />
        <label htmlFor="options">Options (comma separated):</label>
        <input type="text" id="options" name="options" required />
        <label htmlFor="participants">Participants (comma separated):</label>
        <input type="text" id="participants" name="participants" required />
        <button type="submit">Create Voting</button>
      </form>
      <VotingList user={user} refreshKey={votingRefreshKey} />
    </div>
  );
};

export default AdminPanel;
