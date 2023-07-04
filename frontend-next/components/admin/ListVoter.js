import {List, ListIcon, ListItem, Container, useToast, Text } from '@chakra-ui/react';
import {CheckCircleIcon, RepeatIcon, SpinnerIcon} from '@chakra-ui/icons';

import { createPublicClient, http, parseAbiItem } from 'viem'
import { hardhat } from 'viem/chains'
import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';


const ListVoter = ({newAddressVoterAdd, setNewAddressVoterAdd}) => {

    // Create client for Viem
    const client = createPublicClient({
        chain: hardhat,
        transport: http(),
    })
    const toast = useToast();

    // Events
    const [voterRegisteredEvents, setVoterRegisteredEvents] = useState([])
    
    // Get all the events
    const getEvents = async() => {
        // get all the deposit events 
        const voterRegisteredLogs = await client.getLogs({
            event: parseAbiItem('event VoterRegistered(address voterAddress)'),
            fromBlock: 0n,
            toBlock: 'latest' // Pas besoin valeur par défaut
        })
        setVoterRegisteredEvents(voterRegisteredLogs.map(
            log => ({
                address: log.args.voterAddress
            })
        ))
    }

    useEffect( () => {
        getEvents();
    }, [])

    // Execute when the parent send new address
    useEffect( () => {
        if (newAddressVoterAdd.length != 0) {
            const newArrayEvents = [...voterRegisteredEvents, {address : newAddressVoterAdd}];
            setVoterRegisteredEvents(newArrayEvents)
            //reset
            setNewAddressVoterAdd('');
            
          }
    }, [newAddressVoterAdd])
    

    const listItem = (event) => {
        return (
                <ListItem key={uuidv4()}>
                    <ListIcon as={CheckCircleIcon} color='green.500'/>
                    {event.address}
                </ListItem>
        )
    }

    return ( 
        <Container mt='5rem'>
            <Text pb='1rem' fontWeight='bold' >Register voter list :</Text>
            <List spacing={3}>
                { voterRegisteredEvents.length != 0 && (
                    voterRegisteredEvents.map( (event) =>  listItem(event) )
                )}
            </List>
        </Container>
     );
}
 
export default ListVoter;