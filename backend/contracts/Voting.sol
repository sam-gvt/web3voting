// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Voting system - Voters can add proposals and vote for the winner
/// @notice only one vote by voter and 10 proposals per voter is enough
/// @author Pareja Cyril and Sam GrandVincent
contract Voting is Ownable {

    uint private winningProposalIDForTheMoment;
    uint public winningProposalID;

    
    /// @notice Voter struct
    /// @dev add uint8 nbProposals to prevent DDOS Attack
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint8 nbProposals;
        uint232 votedProposalId;  
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum  WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    WorkflowStatus public workflowStatus;
    Proposal[] proposalsArray;
    mapping (address => Voter) public voters;

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId, string description, address proposer);
    event Voted (address voter, uint proposalId);
    
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }
    
    ///@notice Prevent DDOS ATTACK Add Proposal
    ///@dev nbProposal limit voter to 10 per voter
    modifier limitProposal(){
        require( uint8(voters[msg.sender].nbProposals) < 10, "Limit reach for adding proposal");
        _;
    }

    // ::::::::::::: GETTERS ::::::::::::: //

    /// @notice Get object voter, only recorded voter can
    /// @dev Modifier onlyVoters
    /// @param _addr address voter in mapping structure
    /// @return isRegistered and hasvoted and votedProposalId
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }
    
    /// @notice Display one proposals set by voters
    /// @dev modifier onlyVoters
    /// @param _id key for proposal in array
    /// @return Key and description of name proposal
    function getOneProposal(uint _id) external onlyVoters view returns (Proposal memory) {
        return proposalsArray[_id];
    }

 
    // ::::::::::::: REGISTRATION ::::::::::::: // 

    /// @notice add a voter, ang tag him registered with this address in voters mapping,
    /// @dev modifier onlyOwner and two require : Workflowstatus and bool registered
    /// @param _addr new voter address
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 

    // ::::::::::::: PROPOSAL ::::::::::::: // 

    /// @notice Add a new proposal and check if already exists
    /// @param _desc Name of proposal
    /// @dev Add nbProposals to prevent DDOS Attack, limited TO 10 proposals maximum per voter
    function addProposal(string calldata _desc) external onlyVoters limitProposal{
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), 'Vous ne pouvez pas ne rien proposer'); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        
        voters[msg.sender].nbProposals++;

        emit ProposalRegistered(proposalsArray.length-1, _desc, msg.sender);
    }

    // ::::::::::::: VOTE ::::::::::::: //

    /// @notice Set a vote by a voter and calcul if selected proposal has more vote than other with voteCount
    /// @dev modifier onlyOwner and two require : Workflowstatus and bool registered
    /// @param _id Id proposal in array
    function setVote( uint232 _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[msg.sender].hasVoted != true, 'You have already voted');
        require(_id < proposalsArray.length, 'Proposal not found'); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        // if this vote has more votes than the winner vote
        if(proposalsArray[_id].voteCount > proposalsArray[winningProposalIDForTheMoment].voteCount) {
            winningProposalIDForTheMoment = _id;
        }

        emit Voted(msg.sender, _id);
    }
    // ::::::::::::: WINNER ::::::::::::: //

    /// @notice Get Winner
    /// @dev modifier onlyOwner
    function getWinner() external onlyOwner() {
        require(workflowStatus == WorkflowStatus.VotesTallied, "Voting not yet closed !");
        winningProposalID = winningProposalIDForTheMoment;
    }

    // ::::::::::::: STATE ::::::::::::: //

    /// @notice Workflowstatus, second  step add proposal in Array
    /// @dev add first entry in proposalArray named Genesis
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        
        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);
        
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /// @notice Workflowstatus, Ended proposal registration
    /// @dev Workflowstatus need to set ProposalsRegistrationStarted
    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    /// @notice Workflowstatus, Start voting session
    /// @dev Workflowstatus need to set ProposalsRegistrationEnded
    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /// @notice Workflowstatus, End voting session
    /// @dev Workflowstatus need to set VotingSessionStarted
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }


    /// @notice Display Winner of vote session
    /// @dev Workflowstatus need to set VotingSessionEnded, Winner is set in setVote function directly
   function tallyVotes() external onlyOwner {
       require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");       
       workflowStatus = WorkflowStatus.VotesTallied;
       emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}