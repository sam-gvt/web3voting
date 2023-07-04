"use client"
import { Flex, Text } from '@chakra-ui/react'

const Footer = () => {
  return (
    <Flex
        position="absolute"  left="0"  bottom="0" right="0"
        pb="1rem"
    >
        <Text width="100%" textAlign="center">All rights reserved &copy; Buterin Promotion {new Date().getFullYear()}</Text>
    </Flex>
  )
}

export default Footer