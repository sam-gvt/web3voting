"use client";

import { Flex, Heading } from '@chakra-ui/react';
import { useAccount } from 'wagmi';
import Contract from '../../public/Voting.json';
import WhiteListForm from '@/components/admin/WhisteListForm';
import { createPublicClient, http } from 'viem';
import { goerli } from 'viem/chains';

import { useState, useEffect } from 'react';


const Admin = () => {
    
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const { isConnected, address : addressAccount } = useAccount();

    
    // add a useState and useEffect otherwise
    // hydration problem
    const [isAdmin, setIsAdmin] = useState(false);
    const [addressOwner, setAddressOwner] = useState(false);

    
    // Create client for Viem
    const transport = http(`https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`)
    const client = createPublicClient({
        chain: goerli,
        transport,
    })

    const getAddressOwner = async () => {
        const data = await client.readContract({
            address: contractAddress,
            abi: Contract.abi,
            functionName: 'owner',
        })

        return data;
    }

    //  MOUNT
    useEffect( () => {
        const fetchData = async() => {
            const addr = await getAddressOwner()
            setAddressOwner(addr);
        }
        fetchData()
    }, []);

    // UPDATE
    useEffect( () => {
        setIsAdmin(addressOwner === addressAccount); 
    }, [addressAccount, addressOwner])

    return (
        <Flex p="2rem" width="100%" height="10vh" justifyContent="center" alignItems="center"  mt="-7rem" h='calc(100vh)'>
            {isConnected ? (
               <Flex direction="column" width="100%">
                    {isAdmin ? (
                        <WhiteListForm contractAddress={contractAddress}/>
                    ) : (
                        <Heading>You are not authorized to view this page.</Heading>
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

export default Admin;