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
        bool canVote;
    }

    struct Option {
        bytes32 name;
        uint voteCount;
    }

    // todo: we are not doing anything with admin...
    address public admin;

    // todo: should we allow to change participants later on?
    mapping(address => Participant) public participants;

    Option[] public options;
    bytes32 public topic;

    /** 
     * @dev Create a new voting, with topic 'topicName', allowing 'participantAddresses' to choose one of 'optionNames'.
     * @param topicName topic to vote on
     * @param optionNames names of options
     * @param participantAddresses addresses of participants
     */
    constructor(bytes32 topicName, bytes32[] memory optionNames, address[] memory participantAddresses) {
        admin = msg.sender;
        topic = topicName;

        for (uint i = 0; i < optionNames.length; i++) {
            options.push(Option({
                name: optionNames[i],
                voteCount: 0
            }));
        }

        for (uint i = 0; i < participantAddresses.length; i++) {
            participants[participantAddresses[i]] = Participant({
                canVote: true,
                voted: false,
                vote: -1
            });
        }
    }

    //  /** 
    //  * @dev Give 'voter' the right to vote on this ballot. May only be called by 'chairperson'.
    //  * @param voter address of voter
    //  */
    // function giveRightToVote(address voter) external {
    //     // If the first argument of `require` evaluates
    //     // to 'false', execution terminates and all
    //     // changes to the state and to Ether balances
    //     // are reverted.
    //     // This used to consume all gas in old EVM versions, but
    //     // not anymore.
    //     // It is often a good idea to use 'require' to check if
    //     // functions are called correctly.
    //     // As a second argument, you can also provide an
    //     // explanation about what went wrong.
    //     require(
    //         msg.sender == chairperson,
    //         "Only chairperson can give right to vote."
    //     );
    //     require(
    //         !voters[voter].voted,
    //         "The voter already voted."
    //     );
    //     require(voters[voter].weight == 0, "Voter already has the right to vote.");
    //     voters[voter].weight = 1;
    // }

    
    /**
     * @dev Give your vote to option 'options[option].name'.
     * @param option index of option in the options array
     */
    function vote(uint option) external {
        Participant storage sender = participants[msg.sender];
        require(sender.canVote, "Has no right to vote");
        require(!sender.voted, "Already voted.");
        sender.voted = true;
        sender.vote = int(option);

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