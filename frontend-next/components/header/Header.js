"use client"
import { useThemeContext } from "@/context/theme"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import {
  Flex, IconButton, Text, Box,Center,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  useSteps,
} from '@chakra-ui/react'
import { ArrowBackIcon } from "@chakra-ui/icons"
import { useRouter, usePathname } from 'next/navigation';
// CONTRACT
import Contract from '../../public/Voting.json'
// WAGMI
import { readContract } from '@wagmi/core'

const Header = () => {
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
  const router = useRouter();
  const actualPath = usePathname();

  const goBackToHome = () => {
    router.push('/');
  }
  
  const steps = [
    { title: 'Step 1', description: 'RegisteringVoters' },
    { title: 'Step 2', description: 'ProposalsRegistrationStarted' },
    { title: 'Step 3', description: 'ProposalsRegistrationEnded' },
    { title: 'Step 4', description: 'VotingSessionStarted' },
    { title: 'Step 5', description: 'VotingSessionEnded' },
    { title: 'Step 6', description: 'VotesTallied' },
  ]

  const { workflowStatus, setWorkflowStatus } = useThemeContext();
  const getworkflowStatus = async() => {
    try {
        const data = await readContract({
            address: contractAddress,
            abi: Contract.abi,
            functionName: "workflowStatus"
        });
        setWorkflowStatus(data+1);
        // return data;
    } catch (err) {
        console.log(err.message)
    }
  }
  getworkflowStatus()
  
  const { activeStep } = useSteps({
    initialStep: 0,
  });  
  return (
    <>
    <Flex p="2rem" justifyContent="space-between" alignItems="center" width="100%">
        { actualPath !== '/' ? (
          <IconButton onClick={goBackToHome} aria-label='Go back to home' size='lg' icon={<ArrowBackIcon/>} />
        ) : (
          <Text>By Cyril Pareja & Sam Grandvincent</Text>
        )
        }
     <ConnectButton/>

    </Flex>
    
    <Center mt='3rem'>
        <Stepper index={workflowStatus}>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus
                      complete={<StepIcon />}
                      incomplete={<StepNumber />}
                      active={<StepNumber />}
                    />
                  </StepIndicator>

                  <Box flexShrink='0'>
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                  </Box>

                  <StepSeparator />
                </Step>
              ))}
        </Stepper>
        </Center>
    </>   
  )
}

export default Header