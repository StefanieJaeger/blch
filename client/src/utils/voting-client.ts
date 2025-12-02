import { decodeBytes32String, encodeBytes32String } from "ethers";
import { Address, createPublicClient, custom } from "viem";
import { sepolia } from "viem/chains";
import { Voting } from "../types/Voting";
import abi from "./voting-abi.json";
import { User } from "../types/User";
import { executeSmartAccountTransaction } from "./account-abstraction";

if (!window.ethereum) throw new Error("MetaMask not found");
export const votingClient = createPublicClient({
  chain: sepolia,
  transport: custom(window.ethereum),
});

const CONTRACT_ADDRESS = "0xc36ab91320CD82841eb58a18Ef8a4b390b0D2430";

export async function createNewVoting(
  topicName: string,
  optionNames: string[],
  participantAddresses: string[]
) {
  const encodedOptions = optionNames.map((opt) =>
    encodeBytes32String(opt.trim())
  );
  const args = [
    encodeBytes32String(topicName),
    encodedOptions,
    participantAddresses,
  ];
  await executeSmartAccountTransaction(CONTRACT_ADDRESS, "createVoting", args);
}

export async function loadVotings(user: User): Promise<Voting[]> {
  const data = await votingClient.readContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: "getVotingInfos",
    account: <Address>user.address,
  });

  console.log("data", data);

  const votings = (data as any[]).map(
    (d) =>
      ({
        topic: decodeBytes32String(d.topic),
        options: d.options.map((o: string) => decodeBytes32String(o)),
        winnerOptionIndex: Number(d.winnerOptionIndex),
        hasEnded: d.hasEnded,
        ownVotedOptionIndex: Number(d.ownVotedOptionIndex),
        id: Number(d.id),
      } as Voting)
  );

  return votings;
}

export async function vote(votingId: number, optionId: number) {
  try {
    const args = [votingId, optionId];
    await executeSmartAccountTransaction(CONTRACT_ADDRESS, "vote", args);
  } catch (error) {
    console.error("Voting failed: ", error);
    throw error;
  }
}
