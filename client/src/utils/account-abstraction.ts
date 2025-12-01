import {
  Address,
  createPublicClient,
  createWalletClient,
  custom,
  encodeFunctionData,
} from "viem";
import { getUserOperationHash } from "viem/account-abstraction";
import { sepolia } from "viem/chains";
import abi from "./voting-abi.json";

const PIMLICO_ENTRYPOINT_ADDRESS = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
const BUNDLER_URL = `https://public.pimlico.io/v2/${sepolia.id}/rpc`;

async function getWalletClient() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
    account: accounts[0] as `0x${string}`,
  });
}

export async function executeSmartAccountTransaction(
  contractAddress: Address,
  functionName: string,
  args: any[]
) {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });
  const walletClient = await getWalletClient();

  // Get nonce
  const nonceResult = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: "nonce",
  });
  const nonce = BigInt(nonceResult as number);
  console.log(nonce);

  // Build call data
  const targetCallData = encodeFunctionData({
    abi: abi,
    functionName,
    args,
  });
  const callData = encodeFunctionData({
    abi: abi,
    functionName: "execute",
    args: [contractAddress, 0, targetCallData],
  });

  const gasPrices = await getPimlicoGasPrices();

  // Calculate UserOperation hash
  const userOpHash = getUserOperationHash({
    chainId: sepolia.id,
    entryPointAddress: PIMLICO_ENTRYPOINT_ADDRESS,
    entryPointVersion: "0.7",
    userOperation: {
      sender: contractAddress,
      signature: "0x", // Dummy signature to make viem types happy.
      nonce: nonce,
      callData: callData,
      callGasLimit: BigInt("0x70000"),
      verificationGasLimit: BigInt("0x20000"),
      preVerificationGas: BigInt("0x10000"),
      maxFeePerGas: gasPrices.maxFeePerGas,
      maxPriorityFeePerGas: gasPrices.maxPriorityFeePerGas,
    },
  });

  // Sign with EOA
  const signature = await window.ethereum.request({
    method: "personal_sign",
    params: [userOpHash, walletClient.account.address],
  });

  // Build UserOperation
  const userOp = {
    sender: contractAddress,
    signature: signature,
    nonce: "0x" + nonce.toString(16),
    callData: callData,
    callGasLimit: "0x70000",
    verificationGasLimit: "0x20000",
    preVerificationGas: "0x10000",
    maxFeePerGas: gasPrices.maxFeePerGas,
    maxPriorityFeePerGas: gasPrices.maxPriorityFeePerGas,
  };

  // Send to bundler
  const response = await fetch(BUNDLER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_sendUserOperation",
      params: [userOp, PIMLICO_ENTRYPOINT_ADDRESS],
    }),
  });

  const result = await response.json();
  console.log(result);
  if (result.error) {
    throw new Error(`Bundler error: ${result.error.message}`);
  }

  return result.result;
}

async function getPimlicoGasPrices() {
  const response = await fetch(BUNDLER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "pimlico_getUserOperationGasPrice",
      params: [],
      id: 1,
    }),
  });
  const result = await response.json();
  const standardGasPrices = result.result.standard;
  return {
    maxFeePerGas: standardGasPrices.maxFeePerGas,
    maxPriorityFeePerGas: standardGasPrices.maxPriorityFeePerGas,
  };
}
