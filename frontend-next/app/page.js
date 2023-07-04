'use client';
import styles from './page.module.css';
import { Flex, Text, Heading, useToast } from '@chakra-ui/react';
import { useAccount, useContractRead } from 'wagmi';
import { useRouter } from 'next/navigation';
import Contract from '../public/Voting.json'
import { useState, useEffect } from 'react';


export default function Home() {

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const { isConnected, address : addressAccount } = useAccount();
  const router = useRouter();
  const toast = useToast();

  // add a useState and useEffect otherwise
  // hydration problem
  const [isAdmin, setIsAdmin] = useState(false);

  const { data : addressOwner } = useContractRead({
      address: contractAddress,
      abi: Contract.abi,
      functionName: 'owner',
  })

  const verifyConnectionAndRedirect = (path) => {
    if (isConnected) {
      router.push(`${path}`);
    } else {
        toast({
          title: 'Please connect your wallet',
          status: 'error',
          duration: 3000,
          position: 'top',
          isClosable: true,
      })
    }
  }
  

  useEffect( () => {
    setIsAdmin(addressOwner === addressAccount)
  },[addressAccount])

  return (

    <Flex
      direction="column"
      justifyContent="space-between"
      alignItems="center"
      p="6rem"
      mt="-7rem"
      h='calc(100vh)'
    >

      <div className={styles.center}>
        <Heading mt='5rem'>Web3 Voting System</Heading>
      </div>

      <div className={styles.grid} >
        <button onClick={() => verifyConnectionAndRedirect('/proposals-voting')} className={styles.card}>
          <h2>
            Proposals Voting <span>-&gt;</span>
          </h2>
          <p>I register my voting proposals.</p>
        </button>

        <button onClick={() => verifyConnectionAndRedirect('/voting')} className={styles.card}>

          <h2>
            Voting <span>-&gt;</span>
          </h2>
          <p>I vote for a proposal from the list.</p>
        </button>

        <button onClick={() => router.push('/winner')} className={styles.card}>
          <h2>
            Winner <span>-&gt;</span>
          </h2>
          <p>I consult the winning proposal(s).</p>
        </button>

        { isAdmin && (
          
          <button onClick={() => router.push('/admin')} className={styles.card}>
            <h2>
              Admin <span>-&gt;</span>
            </h2>
            <p>
            Space reserved
            </p>
          </button>
        
        )}
     
      </div>
      </Flex>
  )
}
