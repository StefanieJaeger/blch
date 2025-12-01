import { createPublicClient, custom, encodeFunctionData, WalletClient } from "viem";
import { getUserOperationHash } from "viem/account-abstraction";
import { sepolia } from 'viem/chains'
import abi from './voting-smart-abi.json'


const PIMLICO_ENTRYPOINT_ADDRESS = "0x0000000071727De22E5E9d8BAf0edAc6f37da032";
const BUNDLER_URL = `https://public.pimlico.io/v2/${sepolia.id}/rpc`;

const CONTRACT_ADDRESS = '0xC40bE91d147c04062a38FCcEAC6f9fA4d6b5d083';


export async function executeSmartAccountTransaction(
    wallet,
    smartAccountAddress,
    eoaAddress,
    targetContract,
    targetAbi,
    functionName,
    args
) {
    // Check balance
    const balance = await wallet.getBalance(smartAccountAddress);
    const balanceInWei = BigInt(balance);
    if (balanceInWei === 0n) {
        throw new Error(`Smart account ${smartAccountAddress} has no funds`);
    }

    // Get nonce
    const nonceData = encodeFunctionData({
        abi: SMART_ACCOUNT_ABI,
        functionName: "nonce",
    });
    const nonceResult = await wallet.callContract(smartAccountAddress, nonceData);
    const nonce = BigInt(nonceResult);

    // Build call data
    const targetCallData = encodeFunctionData({
        abi: targetAbi,
        functionName,
        args,
    });
    const callData = encodeFunctionData({
        abi: SMART_ACCOUNT_ABI,
        functionName: "execute",
        args: [targetContract, 0n, targetCallData],
    });

    // Get gas prices
    const feeHistory = await wallet.getFeeHistory("0x1", [50]);
    const baseFee = BigInt(feeHistory.baseFeePerGas[0]);
    const priorityFee = BigInt(feeHistory.reward[0][0]);

    const minPriorityFee = 100000000n;
    const minMaxFee = 100000025n;

    const actualPriorityFee = priorityFee > minPriorityFee ? priorityFee : minPriorityFee;
    const actualMaxFee =
        baseFee + actualPriorityFee > minMaxFee
            ? baseFee + actualPriorityFee
            : minMaxFee;

    const chainId = await wallet.getChainId();

    // Calculate UserOperation hash
    const userOpHash = getUserOperationHash({
        chainId: Number(chainId),
        entryPointAddress: ENTRYPOINT_ADDRESS,
        entryPointVersion: "0.7",
        userOperation: {
            sender: smartAccountAddress,
            nonce: BigInt(nonce),
            callData: callData,
            callGasLimit: BigInt("0x70000"),
            verificationGasLimit: BigInt("0x20000"),
            preVerificationGas: BigInt("0x10000"),
            maxFeePerGas: BigInt(actualMaxFee),
            maxPriorityFeePerGas: BigInt(actualPriorityFee),
        },
    });

    // Sign with EOA
    const signature = await wallet.personalSign(userOpHash, eoaAddress);

    // Build UserOperation
    const userOp = {
        sender: smartAccountAddress,
        nonce: "0x" + nonce.toString(16),
        callData: callData,
        callGasLimit: "0x70000",
        verificationGasLimit: "0x20000",
        preVerificationGas: "0x10000",
        maxFeePerGas: "0x" + actualMaxFee.toString(16),
        maxPriorityFeePerGas: "0x" + actualPriorityFee.toString(16),
        signature: signature,
    };

    // Send to bundler
    const response = await fetch(BUNDLER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_sendUserOperation",
            params: [userOp, ENTRYPOINT_ADDRESS],
        }),
    });

    const result = await response.json();

    if (result.error) {
        throw new Error(`Bundler error: ${result.error.message}`);
    }

    return result.result;
}