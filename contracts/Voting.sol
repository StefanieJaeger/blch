// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/** 
 * @title VotingContract
 * @dev Contains multiple votings
 */
contract VotingContract is IAccount, Ownable {
    constructor() Ownable(msg.sender) {}

    struct Participant {
        address adr;
        bool voted;
        int votedOptionIdx;
    }

    struct Option {
        bytes32 name;
        uint voteCount;
    }

    struct Voting {
        address admin;
        Participant[] participants;
        uint256 votedCount;
        bool votingHasEnded;
        Option[] options;
        bytes32 topic;
    }

    struct VotingInfo {
        uint256 id;
        bytes32[] options;
        int256 winnerOptionIndex;
        bytes32 topic;
        bool hasEnded;
        int256 ownVotedOptionIndex;
        bool isParticipant;
    }

    uint votingsCount;
    mapping(uint => Voting) votings;

    address lastWriteCaller;

    event VotingHasStarted(uint votingIdx, address indexed recipient);
    event VotingHasEnded(uint votingIdx, address indexed recipient);

    /** 
     * @dev Create a new voting, with topic 'topicName', allowing 'participantAddresses' to choose one of 'optionNames'.
     * @param topicName topic to vote on
     * @param optionNames names of options
     * @param participantAddresses addresses of participants
     */
    function createVoting(bytes32 topicName, bytes32[] memory optionNames, address[] memory participantAddresses) external {
        Voting storage voting = votings[votingsCount++];
        voting.admin = lastWriteCaller;
        voting.topic = topicName;
        voting.votedCount = 0;
        voting.votingHasEnded = false;

        for (uint i = 0; i < optionNames.length; i++) {
            voting.options.push(Option({
                name: optionNames[i],
                voteCount: 0
            }));
        }
        for (uint i = 0; i < participantAddresses.length; i++) {
            voting.participants.push(Participant({
                adr: participantAddresses[i],
                voted: false,
                votedOptionIdx: -1
            }));
            emit VotingHasStarted(votingsCount-1, participantAddresses[i]);
        }
    }

    /**
     * @dev Give your vote to option 'options[option].name'.
     * @param votingIdx index of voting in the votings array
     * @param optionIdx index of option in the options array
     */
    function vote(uint votingIdx, uint optionIdx) external {
        Voting storage voting = getVoting(votingIdx);
        require(!voting.votingHasEnded, "Voting has already ended");

        bool found = false;

        for (uint i = 0; i < voting.participants.length; i++) {
            if (voting.participants[i].adr == lastWriteCaller) {
                Participant storage sender = voting.participants[i];
                found = true;

                require(!sender.voted, "Already voted.");
                sender.voted = true;
                sender.votedOptionIdx = int(optionIdx);

                voting.options[optionIdx].voteCount += 1;
                voting.votedCount += 1;

                if (voting.participants.length == voting.votedCount) {
                    endVoting(votingIdx);
                }

                break;
            }
        }

        require(found, "Sender is not a participant");
    }

    /**
    * @dev Close the voting prematurely. Only the admin can do this.
    * @param votingIdx index of voting in the votings array
    */
    function endVotingAsAdmin(uint votingIdx) external {
        require(lastWriteCaller == getVoting(votingIdx).admin, "Only admin can close the vote");

        endVoting(votingIdx);
    }

     /** 
     * @dev Computes the winning option taking all previous votes into account.
     * If multiple have the same amount of votes, then the first among them is chosen as the winner.
     * If none have any votes, then the first in the list is chosen.
     * @param votingIdx index of voting in the votings array
     * @return winningOption_ index of winning option in the options array
     */
    function getWinningOption(uint votingIdx) public view
            returns (int256 winningOption_)
    {
        uint winningVoteCount = 0;
        winningOption_ = -1;
        Voting storage voting = getVoting(votingIdx);
        if (!voting.votingHasEnded) {
            return winningOption_;
        }
        for (uint p = 0; p < voting.options.length; p++) {
            if (voting.options[p].voteCount > winningVoteCount) {
                winningVoteCount = voting.options[p].voteCount;
                winningOption_ = int256(p);
            }
        }
    }

    function endVoting(uint votingIdx) internal {
        Voting storage voting = getVoting(votingIdx);
        voting.votingHasEnded = true;

        // We only inform the admin for now, participants should see change in the UI
        emit VotingHasEnded(votingIdx, voting.admin);
    }

    function getVotingInfos() external view returns (VotingInfo[] memory infos) {
        infos = new VotingInfo[](votingsCount);

        for (uint256 i = 0; i < votingsCount; i++) {
            Voting storage voting = getVoting(i);

            uint256 oLen = voting.options.length;
            bytes32[] memory options = new bytes32[](oLen);
            for (uint256 k = 0; k < oLen; k++) {
                options[k] = voting.options[k].name;
            }

            VotingInfo memory info;
            info.id = i;
            info.options = options;
            info.winnerOptionIndex = getWinningOption(i);

            info.topic = voting.topic;
            info.hasEnded = voting.votingHasEnded;
            info.ownVotedOptionIndex = -1;
            info.isParticipant = false;

            for (uint j = 0; j < voting.participants.length; j++) {
                if (voting.participants[j].adr == msg.sender) {
                    info.isParticipant = true;
                    Participant storage self = voting.participants[j];
                    info.ownVotedOptionIndex = self.votedOptionIdx;
                }
            }

            infos[i] = info;
        }
    }

    function getVoting(uint votingIdx) private view returns (Voting storage voting) {
        // todo: if not in array, throw?
        return votings[votingIdx];
    }

    // ---
    // Functions for Account abstraction:
    // ---
    // TODO we maybe need to make the other functions to make the vote internal or similar?
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // Pimlico EntryPoint V7 https://docs.pimlico.io/guides/supported-chains#ethereum
    IEntryPoint public immutable entryPoint = IEntryPoint(0x0000000071727De22E5E9d8BAf0edAc6f37da032);
    uint256 public nonce;

    function validateUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external override returns (uint256 validationData) {
        require(msg.sender == address(entryPoint), "Only EntryPoint");
        // Verify signature
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        address signer = hash.recover(userOp.signature);

        require(signer == owner(), "unauthorized");

        // Validate and increment nonce
        require(nonce++ == userOp.nonce, "Invalid nonce");

        // Pay EntryPoint for gas if needed
        if (missingAccountFunds > 0) {
            (bool success,) = payable(msg.sender).call{value: missingAccountFunds}("");
            require(success, "Failed to pay EntryPoint");
        }

        lastWriteCaller = signer;
        return 0; // Signature valid
    }

    function execute(address dest, uint256 value, bytes calldata func) external {
        require(msg.sender == address(entryPoint), "Only EntryPoint");
        (bool success,) = dest.call{value: value}(func);
        require(success, "Execution failed");
    }

    function executeBatch(address[] calldata dest, bytes[] calldata func) external {
        require(msg.sender == address(entryPoint), "Only EntryPoint");
        require(dest.length == func.length, "Length mismatch");
        for (uint256 i = 0; i < dest.length; i++) {
            (bool success,) = dest[i].call(func[i]);
            require(success, "Batch execution failed");
        }
    }

    // Receive ETH
    receive() external payable {}

    // Withdraw ETH - only owner
    function withdraw(address payable to, uint256 amount) external onlyOwner {
        (bool success,) = to.call{value: amount}("");
        require(success, "Withdraw failed");
    }
}