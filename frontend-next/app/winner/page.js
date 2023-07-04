"use client"
import { Flex, Heading, Container, Text } from '@chakra-ui/react';
import { useThemeContext } from '@/context/theme';
import {createPublicClient, http, parseAbiItem } from 'viem';
import { goerli } from 'viem/chains';
import Contract from '../../public/Voting.json';
import { useState, useEffect } from 'react';

const Winner = () => {

  const { workflowStatus } = useThemeContext();
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const [winningProposalId, setWinningProposalId] = useState();

  // Create client for Viem
  const transport = http(`https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`)
  const client = createPublicClient({
    chain: goerli,
    transport: http(),
  })

  const getWinningProposalID = async () => {
      const data = await client.readContract({
          address: contractAddress,
          abi: Contract.abi,
          functionName: 'winningProposalID',
      })

      return data;
  }

    // Events
    const [proposalsEvents, setProposalsEvents] = useState([])
    
    // Get all the events
    const getEventsProposals = async() => {
        // get all the deposit events 
      const proposalRegisteredLogs = await client.getLogs({
        event: parseAbiItem('event ProposalRegistered(uint proposalId, string description, address proposer)'),
        fromBlock: 0n,
        toBlock: 'latest' // Pas besoin valeur par défaut
      })
      setProposalsEvents(proposalRegisteredLogs.map(
        log => (
         {proposalId: log.args.proposalId,
          description: log.args.description,
          proposer: log.args.proposer})
    ))
      
    }


  useEffect( () => {
    if(workflowStatus == 6) {
      const fetchData = async() => {
        const _winningProposalID = await getWinningProposalID()
        setWinningProposalId(_winningProposalID);
        await getEventsProposals();
      }
      fetchData()
    }
   
  }, [workflowStatus]);

  const displayData = (proposal) => {
    if(proposal.proposalId == winningProposalId) {
      return (
        <Heading key="idProposal"> The winning proposal is : &nbsp;
          {proposal.description}
          </Heading>
    )
    } 
    
  }

  return (
    <Flex p="2rem" width="100%" height="10vh" justifyContent="center" alignItems="center"  mt="-7rem" h='calc(100vh)'>
        
        { (workflowStatus == 6) ? (
          <Container>
            
            { proposalsEvents.length != 0 && (
              proposalsEvents.map( (proposal) =>  displayData(proposal) )
            )}
          </Container>
        ) : (
          <Heading>The winning proposal will appear here when voting is completed</Heading>
        )}
               
    </Flex>
)
}

export default Winner