import { createPublicClient, http } from 'viem'
import { sepolia } from 'viem/chains'
 
export const votingClient = createPublicClient({ 
  chain: sepolia, 
  transport: http(), 
}) 