import { decodeBytes32String, encodeBytes32String } from "ethers";
import { createPublicClient, createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";
import { Voting } from "../types/Voting";
import abi from "./voting-abi.json";

if (!window.ethereum) throw new Error("MetaMask not found");
export const votingClient = createPublicClient({
  chain: sepolia,
  transport: custom(window.ethereum),
});

export async function getWalletClient() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
    account: accounts[0] as `0x${string}`,
  });
}

const contractAddress = "0x59fF063A406167115A2Fd57946975ff3B1eA8FB9";

export async function createNewVoting(
  topicName: string,
  optionNames: string[],
  participantAddresses: string[]
) {
  const walletClient = await getWalletClient();
  const encodedOptions = optionNames.map((opt) =>
    encodeBytes32String(opt.trim())
  );
  await walletClient.writeContract({
    address: contractAddress,
    chain: sepolia,
    abi,
    functionName: "createVoting",
    args: [
      encodeBytes32String(topicName),
      encodedOptions,
      participantAddresses,
    ],
  });
}

export async function loadVotings(): Promise<Voting[]> {
  const data = await votingClient.readContract({
    address: contractAddress,
    abi,
    functionName: "getVotingInfos",
  });

  console.log("data", data);

  const votings = (data as any[]).map(
    (d) =>
      ({
        topic: decodeBytes32String(d.topic),
        options: d.options.map((o: string) => decodeBytes32String(o)),
        winnerOptionIndex: Number(d.winnerOptionIndex),
        hasEnded: d.hasEnded,
        ownVotedOptionsIndex: Number(d.ownVotedOptionsIndex),
        id: Number(d.id),
      } as Voting)
  );

  return votings;
}

export async function vote(votingId: number, optionId: number) {
  try {
    const walletClient = await getWalletClient();
    const txHash = await walletClient.writeContract({
      address: contractAddress,
      chain: sepolia,
      abi,
      functionName: "vote",
      args: [votingId, optionId],
    });
    console.log("TxHash: ", txHash);
    return txHash;
  } catch (error) {
    console.error("Voting failed: ", error);
    throw error;
  }
}
