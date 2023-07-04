"use client"
import { useThemeContext } from '@/context/theme';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    useToast
  } from '@chakra-ui/react'
import Contract from '../../public/Voting.json';
import { prepareWriteContract, writeContract } from '@wagmi/core';

const WorkflowButton = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const { workflowStatus, setWorkflowStatus } = useThemeContext();
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;


    const workflowContract = [
        'RegisteringVoters',
        'startProposalsRegistering',
        'endProposalsRegistering',
        'startVotingSession',
        'endVotingSession',
        'tallyVotes'
    ];


    const toast = useToast()

    const nextStep = async () => {
        console.log(workflowStatus);
        console.log(workflowContract[workflowStatus]);

        if(workflowStatus < 6) {
            try {
                
                const { request } = await prepareWriteContract({
                    address: contractAddress,        
                    abi: Contract.abi,
                    functionName: workflowContract[workflowStatus],
                });
                await writeContract(request)

                toast({
                    title: 'Step changed with success',
                    status: 'success',
                    duration: 3000,
                    position: 'top',
                    isClosable: true,
                })
                setWorkflowStatus(workflowStatus + 1);

            } catch (err){
                console.log(err);
                toast({
                    title: 'Oops, an error has occurred !',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                })
                
            }
        } else {
            toast({
                title: 'Vote End !',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }
        onClose();
        
    }
    const getWinner = async () => {
        try {
                
            const { request } = await prepareWriteContract({
                address: contractAddress,        
                abi: Contract.abi,
                functionName: 'getWinner',
            });
            await writeContract(request)

            toast({
                title: 'The winner is now available !',
                status: 'success',
                duration: 3000,
                position: 'top',
                isClosable: true,
            })

        } catch (err){
            console.log(err);
            toast({
                title: 'Oops, an error has occurred !',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
            
        }
    }
    console.log(workflowStatus);
    return ( 
        <>
            {workflowStatus == 6 ? (
                <Button onClick={getWinner}>Get Winner</Button>
            ) :(
                <Button onClick={onOpen}>Next Step</Button>
            )}
            
                  
            <Modal isOpen={isOpen} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalHeader>Attention</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                  Are you sure to continue ? <br/>
                  (this action is irrevocable)
                </ModalBody>
      
                <ModalFooter>
                  <Button colorScheme='blue' mr={3} onClick={onClose}>
                    Close
                  </Button>
                  <Button variant='ghost'  onClick={nextStep} >Yes</Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </>
     );
}
 
export default WorkflowButton;