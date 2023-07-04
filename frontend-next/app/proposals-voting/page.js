"use client"
import { useThemeContext } from "@/context/theme"
import { Flex, useToast,FormControl, FormLabel, Input, Button, VStack,Text, Grid, 
         GridItem, Heading, OrderedList, ListItem, Card, CardBody } from '@chakra-ui/react'
import { useAccount } from 'wagmi'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { goerli } from 'viem/chains'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';
import Contract from '../../public/Voting.json'
import { readContract,prepareWriteContract, writeContract } from '@wagmi/core'
import 'dotenv/config'

const addproposal = () => {
    const { isConnected, address : addressAccount } = useAccount()
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    const { workflowStatus, setWorkflowStatus } = useThemeContext();
    // Create client for Viem
    const transport = http(`https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`)
    const client = createPublicClient({
        chain: goerli,
        transport
    })
    const toast = useToast()
    // Events
    const [voterRegisteredEvents, setVoterRegisteredEvents] = useState([])
    const [isVoterExist, setIsVoterExist] = useState(false);
    const [proposalRegisteredEvents, setProposalRegisteredEvents] = useState([])
    const [proposal, setProposal] = useState("");
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
    
    const addNewProposal = async() => {
        if (proposalRegisteredEvents.length < 10) {
            if( proposal != ''){
                try {
                    const { request } = await prepareWriteContract({
                        address: contractAddress,
                        abi: Contract.abi,
                        functionName: "addProposal",
                        args: [proposal]
                    });
                    await writeContract(request)
                    
                    toast({
                        title: 'Proposition acceptée.',
                        description: `Le candidat ${proposal} a bien été ajouté à la liste`,
                        status: 'success',
                        duration: 3000,
                        position: 'top',
                        isClosable: true,
                    })
                    setProposal("");
                    await getEvents()
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
                    description: `Ce champs ne doit pas être vide`,
                    status: 'error',
                    duration: 4000,
                    position: 'top',
                    isClosable: true,
                })
            }
        } else {
            // 10 Proposals already record for voter - STOP
            toast({
                title: 'Limite atteinte',
                description: `Vous ne pouvez pas ajouter plus de 10 propositions`,
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
            setIsVoterExist(true)
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
        console.log('Value you are a voter' + valueExists);
    }
    isVoter()
    }, [addressAccount])

    return (
       
        <Flex p="2rem" width="100%" height="10vh" justifyContent="center" alignItems="center"  mt="-7rem" h='calc(100vh)'>
            {isConnected ? (
               <Flex direction="column" width="100%">
                    <Grid templateColumns='repeat(2, 1fr)' gap={4}>
                        <GridItem w='100%' px='5%'>  
                            <VStack spacing={400}>
                                <form>
                                    <Grid templateColumns="1fr 1fr auto" gap={2} alignItems="center">
                                        <FormLabel>Ajouter une proposition de vote</FormLabel>
                                        <FormControl isRequired>
                                            <Input
                                            placeholder="Entrez le nom"
                                            value={proposal}
                                            onChange={(e) => setProposal(e.target.value)}
                                            />
                                        </FormControl>
                                        {workflowStatus === 2 && isVoterExist ? (
                                            <Button onClick={() => addNewProposal()} colorScheme="blue">
                                                Enregistrer
                                            </Button>
                                        ) : (
                                            <Button disabled>Session not ready or Not a voter</Button>
                                        )}
                                    </Grid>
                                </form>
                            </VStack>
    
                        </GridItem>
                        <GridItem w='100%' px='10%'>
                            <Card>
                                <CardBody>
                                    <Text fontSize='2xl' mb='1rem'>Vos propositions pour le Vote (10 Maximum)</Text>
                                    <OrderedList>
                                        {proposalRegisteredEvents.length > 0 ? 
                                        proposalRegisteredEvents.map((event) => {
                                                if(event.proposer === addressAccount)
                                                return <ListItem key={uuidv4()}>
                                                            {event.key} - {event.name}
                                                        </ListItem>
                                                }) : (
                                                <ListItem> ... </ListItem>
                                                )}
                                    </OrderedList>
                                </CardBody>
                            </Card>
                        </GridItem>
                    </Grid>
                </Flex>
            ) : (
                <Flex p="2rem" justifyContent="center" alignItems="center">
                    <Heading>Please connect your Wallet.</Heading>
                </Flex>
            )}
        </Flex>
        
    )
}
export default addproposal