// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/** 
 * @title VotingContract
 * @dev Contains multiple votings
 */
contract VotingContract {
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
        bytes32[] options;
        uint winnerOptionIndex;
        bytes32 topic;
        bool hasEnded;
        int ownVotedOptionsIndex;
    }

    uint votingsCount;
    mapping(uint => Voting) votings;

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
        voting.admin = msg.sender;
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

        for (uint i = 0; i < voting.participants.length; i++) {
            if (voting.participants[i].adr == msg.sender) {
                Participant storage sender = voting.participants[i];

                require(!sender.voted, "Already voted.");
                sender.voted = true;
                sender.votedOptionIdx = int(optionIdx);

                voting.options[optionIdx].voteCount += 1;
                voting.votedCount += 1;

                if (voting.participants.length == voting.votedCount) {
                    endVoting(votingIdx);
                }
            }
        }
    }

    /**
    * @dev Close the voting prematurely. Only the admin can do this.
    * @param votingIdx index of voting in the votings array
    */
    function endVotingAsAdmin(uint votingIdx) external {
        require(msg.sender == getVoting(votingIdx).admin, "Only admin can close the vote");

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
            returns (uint winningOption_)
    {
        uint winningVoteCount = 0;
        Voting storage voting = getVoting(votingIdx);
        for (uint p = 0; p < voting.options.length; p++) {
            if (voting.options[p].voteCount > winningVoteCount) {
                winningVoteCount = voting.options[p].voteCount;
                winningOption_ = p;
            }
        }
    }

    function endVoting(uint votingIdx) internal {
        Voting storage voting = getVoting(votingIdx);
        // todo: can we do something else to signal that this smart contract is "inactive"?
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
            info.options = options;
            info.winnerOptionIndex = getWinningOption(i);

            info.topic = voting.topic;
            info.hasEnded = voting.votingHasEnded;

            for (uint j = 0; j < voting.participants.length; j++) {
                if (voting.participants[j].adr == msg.sender) {
                    Participant storage self = voting.participants[j];
                    info.ownVotedOptionsIndex = self.votedOptionIdx;
                }
            }

            infos[i] = info;
        }
    }

    function getVoting(uint votingIdx) internal view returns (Voting storage voting) {
        // todo: if not in array, throw?
        return votings[votingIdx];
    }
}
