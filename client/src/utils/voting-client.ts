import { decodeBytes32String, encodeBytes32String } from "ethers";
import { Address, createPublicClient, createWalletClient, custom } from "viem";
import { sepolia } from "viem/chains";
import { Voting } from "../types/Voting";
import abi from "./voting-abi.json";
import { User } from "../types/User";

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

const CONTRACT_ADDRESS = "0x832A0a86A14c96b5b283c3396320C49562F09DCf";

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
    address: CONTRACT_ADDRESS,
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
    const walletClient = await getWalletClient();
    const txHash = await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      chain: sepolia,
      abi,
      functionName: "vote",
      args: [votingId, optionId],
    });
    return txHash;
  } catch (error) {
    console.error("Voting failed: ", error);
    throw error;
  }
}
