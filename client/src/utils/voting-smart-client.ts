import {
  createPublicClient,
  createWalletClient,
  custom,
  encodeFunctionData,
  WalletClient,
} from "viem";
import { getUserOperationHash } from "viem/account-abstraction";
import { sepolia } from "viem/chains";
import abi from "./voting-smart-abi.json";

const PIMLICO_ENTRYPOINT_ADDRESS = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
const BUNDLER_URL = `https://public.pimlico.io/v2/${sepolia.id}/rpc`;

const CONTRACT_ADDRESS = "0x832A0a86A14c96b5b283c3396320C49562F09DCf";

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
  functionName: string,
  args: any[]
) {
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });
  const walletClient = await getWalletClient();

  // Check balance
  // const balance = await wallet.getBalance(smartAccountAddress);
  // const balanceInWei = BigInt(balance);
  // if (balanceInWei === 0n) {
  //     throw new Error(`Smart account ${smartAccountAddress} has no funds`);
  // }

  // Get nonce
  const nonceData = encodeFunctionData({
    abi: abi,
    functionName: "nonce",
  });
  const nonceResult = await publicClient.readContract({
    address: CONTRACT_ADDRESS,
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
    args: [CONTRACT_ADDRESS, 0, targetCallData],
  });

  // Get gas prices
  // const feeHistory = await wallet.getFeeHistory("0x1", [50]);
  // const baseFee = BigInt(feeHistory.baseFeePerGas[0]);
  // const priorityFee = BigInt(feeHistory.reward[0][0]);

  // const minPriorityFee = 100000000n;
  // const minMaxFee = 100000025n;

  // const actualPriorityFee =
  //   priorityFee > minPriorityFee ? priorityFee : minPriorityFee;
  // const actualMaxFee =
  //   baseFee + actualPriorityFee > minMaxFee
  //     ? baseFee + actualPriorityFee
  //     : minMaxFee;

  console.log(`account: ${walletClient.account.address}`);

  const gasPrices = await getPimlicoGasPrices();

  // Calculate UserOperation hash
  const userOpHash = getUserOperationHash({
    chainId: sepolia.id,
    entryPointAddress: PIMLICO_ENTRYPOINT_ADDRESS,
    entryPointVersion: "0.7",
    userOperation: {
      // TODO mp unsure if the address is the correct one
      sender: CONTRACT_ADDRESS,
      // TODO mp this is incorrect!!!!!!
      signature: "0x",
      nonce: BigInt(nonce),
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
  console.log(signature);

  // Build UserOperation
  const userOp = {
    sender: CONTRACT_ADDRESS,
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
