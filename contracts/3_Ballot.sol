// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

/** 
 * @title Ballot
 * @dev Implements voting process
 */
contract Voting {
    struct Participant {
        bool voted;
        uint vote;
    }

    struct Option {
        bytes32 name;
        uint votesCount;
    }

    address public admin;

    mapping(address => Participant) public participants;

    Option[] public options;
    bytes32 public question;

    /** 
     * @dev Create a new ballot to choose one of 'optionNames'.
     * @param questionName question to ask in voting
     * @param optionNames names of options
     */
    constructor(bytes32 questionName, bytes32[] memory optionNames) {
        admin = msg.sender;
        question = questionName;

        for (uint i = 0; i < optionNames.length; i++) {
            options.push(Option({
                name: optionNames[i],
                votesCount: 0
            }));
        }
    }

     /** 
     * @dev Add a participant, allowing them to vote. May only be called by 'admin'.
     * @param participantAddress address of participant
     */
    function addParticipant(address participantAddress) external {
        // todo: should we only allow this to be called before voting has started (e.g. first participant has voted)?
        require(
            msg.sender == admin,
            "Only admin can add a participant!"
        );
        require(
            !participants[participantAddress],
            "This address is already a participant!"
        );
        // todo: is this correct way to add? What about the vote, is -1 ok?
        participants[participantAddress] = Participant({
            voted: false,
            vote: -1
        });
    }

    /**
     * @dev Give your vote to option 'options[option].name'.
     * @param option index of option in the options array
     */
    function vote(uint option) external {
        Participant storage sender = participants[msg.sender];
        // todo: is this check correct?
        require(sender, "Sender is not a participant!");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = option;

        options[option].voteCount += 1;
    }

    /** 
     * @dev Computes the winning option taking all previous votes into account.
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
}