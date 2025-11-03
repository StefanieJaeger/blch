// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/** 
 * @title Voting
 * @dev Implements voting process
 */
contract Voting {
    struct Participant {
        bool voted;
        int vote;
        bool exists;
    }

    struct Option {
        bytes32 name;
        uint voteCount;
    }

    event VotingHasStarted(address indexed recipient);
    event VotingHasEnded(address indexed recipient);

    address public admin;

    mapping(address => Participant) public participants;
    uint256 public participantsCount;
    uint256 public votedCount;
    bool votingHasEnded;

    Option[] public options;
    bytes32 public topic;

    /** 
     * @dev Create a new voting, with topic 'topicName', allowing 'participantAddresses' to choose one of 'optionNames'.
     * @param topicName topic to vote on
     * @param optionNames names of options
     * @param participantAddresses addresses of participants
     */
    constructor(bytes32 topicName, bytes32[] memory optionNames, address[] memory participantAddresses) {
        configureVoting(topicName, optionNames, participantAddresses);
    }
    
    /**
     * @dev Give your vote to option 'options[option].name'.
     * @param option index of option in the options array
     */
    function vote(uint option) external {
        Participant storage sender = participants[msg.sender];
        require(!votingHasEnded, "Voting has already ended");
        require(sender.exists, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = int(option);

        options[option].voteCount += 1;
        votedCount += 1;

        if (participantsCount == votedCount) {
            endVoting();
        }
    }

    /**
    * @dev Close the voting prematurely. Only the admin can do this.
    */
    function endVotingAsAdmin() external {
        require(msg.sender == admin, "Only admin can close the vote");

        endVoting();
    }

    /** 
     * @dev Computes the winning option taking all previous votes into account.
     * If multiple have the same amount of votes, then the first among them is chosen as the winner.
     * If none have any votes, then the first in the list is chosen.
     * @return winningOption_ index of winning option in the options array
     */
    function winningOption() public view
            returns (uint winningOption_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < options.length; p++) {
            if (options[p].voteCount > winningVoteCount) {
                winningVoteCount = options[p].voteCount;
                winningOption_ = p;
            }
        }
    }

    /** 
     * @dev Calls winningOption() function to get the index of the winner contained in the options array and then
     * @return winnerName_ the name of the winner
     */
    function winnerName() external view
            returns (bytes32 winnerName_)
    {
        winnerName_ = options[winningOption()].name;
    }

    function configureVoting(bytes32 topicName, bytes32[] memory optionNames, address[] memory participantAddresses) internal {
        admin = msg.sender;
        topic = topicName;
        votedCount = 0;
        votingHasEnded = false;

        for (uint i = 0; i < optionNames.length; i++) {
            options.push(Option({
                name: optionNames[i],
                voteCount: 0
            }));
        }

        participantsCount = participantAddresses.length;
        for (uint i = 0; i < participantAddresses.length; i++) {
            participants[participantAddresses[i]] = Participant({
                exists: true,
                voted: false,
                vote: -1
            });
            emit VotingHasStarted(participantAddresses[i]);
        }
    }

    function endVoting() internal {
        // todo: can we do something else to signal that this smart contract is "inactive"?
        votingHasEnded = true;

        // We only inform the admin for now, participants should see change in the UI
        emit VotingHasEnded(admin);
    }
}