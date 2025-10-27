# Voting App

## Hand-In 2: Initial Version

We had a rough idea of what our logic should look like in mind:
<img width="2802" height="1258" alt="grafik" src="https://github.com/user-attachments/assets/6852db13-c60b-4e4a-a8df-77f0ea5e067b" />

And drew up a few wireframes:

<img width="653" height="817" alt="grafik" src="https://github.com/user-attachments/assets/12f136cc-12d4-4a27-a67c-693fafdb310e" />
<img width="653" height="403" alt="grafik" src="https://github.com/user-attachments/assets/ddfd9c3d-cf03-4e5e-9110-a75dfd918e9e" />




We found a template on Remix, which contained a 'Ballot' smart contract.

After verifying that the original one works, we went ahead and adjusted it to our needs. Removing and adding some features.
Notably we did not need a vote delegation feature but added the possibility to configure a whitelist of particpants, the vote topic and available options.

We then did some light testing, ensuring the contract still works as expected.




## Hand-In 1: Initial Plan
We intend to create a voting application that allows an admin user to create polls with yes/no questions, and regular users to vote on these polls.
The application will be built using only frontend technologies and will not require a backend server, since all data will be stored on the Ethereum blockchain.
The communication to the Blockchain will be handled by a smart contract deployed on the Sepolia testnet and will be interacted with using a library such as ethers.js or viem.

### Initial Tech-Stack plan:
- React/TypeScript
- Material UI as component library
- Viem for blockchain interaction
