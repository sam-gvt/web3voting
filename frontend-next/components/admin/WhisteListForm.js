"use client";
import {FormControl, FormLabel, Input, Button, Container, Text, Heading, useToast } from '@chakra-ui/react';
import Contract from '../../public/Voting.json'
import ListVoter from './ListVoter';
import WorkflowButton from './WorkflowButton';
import { prepareWriteContract, writeContract } from '@wagmi/core';
import { useState } from 'react';
import { useThemeContext } from '@/context/theme';




const WhiteListForm = ({contractAddress}) => {

    const toast = useToast();
    const [newAddressVoterAdd, setNewAddressVoterAdd] = useState('');
    const { workflowStatus } = useThemeContext();


    const registerVoter = async (address) => {

        try {
            
            const { request } = await prepareWriteContract({
                address: contractAddress,        
                abi: Contract.abi,
                functionName: 'addVoter',
                args: [address],
            });
            await writeContract(request)

            toast({
                title: 'Voter adds with success',
                status: 'success',
                duration: 3000,
                position: 'top',
                isClosable: true,
            })
            setNewAddressVoterAdd(address);

        } catch {
            toast({
                title: 'Oops, an error has occurred !',
                description: 'Check in the list that the address does not already exist',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
            
        }
        
    }
      

    const handleSubmit = (e) => {
        e.preventDefault();
        registerVoter(e.target.address.value);
    }

    return ( 
        <Container>
            <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center',paddingTop: '20px' }}>
                <WorkflowButton/>
            </Container>

            { (workflowStatus == 1) ? (
                <Container mt='4rem'>
                <form onSubmit={handleSubmit}>
                    <FormControl >
                        <Heading mb='4rem' textAlign='center'>Register Voter</Heading>
                        <FormLabel>Voter address</FormLabel>
                        <Input
                            id="address"
                            name="address"
                            placeholder="Enter address of voter"
                        />
                        <Button type="submit" colorScheme="blue">
                            Register
                        </Button> 
            
                    </FormControl>
                </form>
                </Container> 
            ) : (<Heading mb='4rem' textAlign='center'>Register Voter is End</Heading>)}


            <ListVoter newAddressVoterAdd={newAddressVoterAdd} setNewAddressVoterAdd={setNewAddressVoterAdd} />

  
        </Container>


     );
}
 
export default WhiteListForm;