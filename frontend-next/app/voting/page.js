"use client"
import { useThemeContext } from "@/context/theme"
import { Flex, useToast, Button,Text,  
         Heading,Select, Card, CardBody } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { goerli } from 'viem/chains'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';
import Contract from '../../public/Voting.json'
import { readContract,prepareWriteContract, writeContract } from '@wagmi/core'

const votingpage = () => {
    const { isConnected, address : addressAccount } = useAccount()
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    const { workflowStatus } = useThemeContext();
    // Create client for Viem
    const transport = http(`https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`)
    const client = createPublicClient({
        chain: goerli,
        transport: http(),
    })
    const toast = useToast()
    // Events
    const [voterRegisteredEvents, setVoterRegisteredEvents] = useState([])
    const [isVoterExist, setIsVoterExist] = useState(false);
    const [proposalRegisteredEvents, setProposalRegisteredEvents] = useState([])
    const [proposalId, setProposalId] = useState("");
    const [hasVoted, setHasVoted] = useState(false);
    // Get all the events
    const getEvents = async() => {
        // get all the deposit events 
        const voterRegisteredLogs = await client.getLogs({
            event: parseAbiItem('event VoterRegistered(address voterAddress)'),
            fromBlock: 0n,
            toBlock: 'latest' // Pas besoin valeur par défaut
        })
        console.log(voterRegisteredLogs)
        setVoterRegisteredEvents(voterRegisteredLogs.map(
            log => ({
                address: log.args.voterAddress
            })
        ))

        const proposalRegisteredLogs = await client.getLogs({
            event: parseAbiItem('event ProposalRegistered(uint proposalId, string description, address proposer)'),
            fromBlock: 0n,
            toBlock: 'latest' // Pas besoin valeur par défaut
        })
        setProposalRegisteredEvents(proposalRegisteredLogs.map(
            log => ({
                key: log.args.proposalId,
                name: log.args.description,
                proposer: log.args.proposer
            })
        ))
    }
    
    const setaVote = async() => {
        if( proposalId != ''){
          console.log(proposalId);
            try {
              const { request } = await prepareWriteContract({
                  address: contractAddress,
                  abi: Contract.abi,
                  functionName: "setVote",
                  args: [proposalId]
              });
              await writeContract(request)
              
              toast({
                  title: 'Vote completed',
                  description: `Votre vote a bien été validé`,
                  status: 'success',
                  duration: 3000,
                  position: 'top',
                  isClosable: true,
              })
              setHasVoted(true);
            }
            catch(err) {
                toast({
                    title: 'Error!',
                    description: 'Error system, contact Administrator',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                })
            }
        } else {
          toast({
            title: 'Valeur incorrecte',
            description: `Vous devez choisir une personne`,
            status: 'error',
            duration: 4000,
            position: 'top',
            isClosable: true,
          })
        }
    }

    const ReadContractToDoIfIsVoterLoadPage = async() => {
        try {
            const data = await readContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "getVoter",
                account: addressAccount,
                args: [addressAccount]
            });
            console.log('Donnee de la fonction getVoter : ' + data.hasVoted)
            setIsVoterExist(true)
            setHasVoted(data.hasVoted)
        } catch (err) {
            setIsVoterExist(false)
            console.log('catch revert ' + isVoterExist);
        }
    }

    useEffect(() => {
        const LoadDataInPage = async() => {
            await getEvents()
        }
        ReadContractToDoIfIsVoterLoadPage()
        LoadDataInPage()
    }, [])
    
    useEffect(() => {
    const isVoter = async()=> {   
        const valueExists = voterRegisteredEvents.some(value => value.address === addressAccount);
        setIsVoterExist(valueExists);
        ReadContractToDoIfIsVoterLoadPage();
        console.log('Value you are a voter' + valueExists);
    }
    isVoter()
    }, [addressAccount])

    useEffect(() => {
        console.log('passe dans l event setaVote')
    }, [hasVoted])

    return (
        <Flex p="2rem" width="100%" height="10vh" justifyContent="center" alignItems="center"  mt="-7rem" h='calc(100vh)'>
            {isConnected ? (
               <Flex direction="column" width="50%">
                    
                    {!hasVoted ? (  
                        <Card>
                          <Text>Please choose a proposal</Text>
                          <CardBody>
                                <Select placeholder='LIST OF PROPOSALS'  value={proposalId} onChange={(e) => setProposalId(e.target.value)}>
                                {proposalRegisteredEvents.length > 0 ? 
                                  proposalRegisteredEvents.map((event) => {
                                      return <option key={uuidv4()} value={event.key}>{event.name}</option>  
                                  }) : (
                                        <option value=''>-</option>
                                  )}
                                </Select>
                                {workflowStatus === 4 && isVoterExist && !hasVoted ? (
                                <Button size='md' height='48px' width='200px' 
                                        colorScheme='pink' mt='2rem' onClick={() => setaVote()}>VOTE</Button>
                                ) : (
                                    <Button size='md' mt='2rem' disabled>You can't vote</Button>
                                )}
                            </CardBody>
                        </Card>
                    ):(
                      <Card>
                        <CardBody>
                          <Text fontSize='50px' color='tomato' justifyContent="center">
                            A VOTE
                          </Text>          
                        </CardBody>
                      </Card>
                    )}
                </Flex>
            ) : (
                <Flex p="2rem" justifyContent="center" alignItems="center">
                    <Heading>Please connect your Wallet.</Heading>
                </Flex>
            )}
        </Flex>
    )
}
export default votingpage