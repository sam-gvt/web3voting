# Voting system in solidity
Tools > HARDHAT

## Description 

Vote process : 

- The voting administrator registers a whitelist of voters identified by their Ethereum address.

- The voting administrator starts the recording session of the proposal.

- Registered voters are allowed to register their proposals while the registration session is active.

- The voting administrator terminates the proposal recording session.

- The voting administrator starts the voting session.

- Registered voters vote for their preferred proposal.

- The voting administrator ends the voting session.

- The voting administrator counts the votes.

- Everyone can check the final details of the winning proposal.


## Run tests

```sh
yarn hardhat test
```

## Test structure
We start project on Truffle for unit Test, we use hardhat-truffle5 plugin.

```bash
npm install --save-dev @nomiclabs/hardhat-truffle5 @nomiclabs/hardhat-web3 'web3@^1.0.0-beta.36'
npm install --save-dev @openzeppelin/test-helpers
```

All test are realized by state process to control function, expect, event, and revert

44 Tests

- Testing getter function and access right
- testing return event on different state
- Building of tests from scenarios :
1) voting system start => add voter
2) Voting with voter => add proposals
3) Voting with voter and proposal => Set vote
4) Voting with voter, proposal and vote => Tallyvote

## Link Project : 

Deployed contract Goerli address: https://goerli.etherscan.io/address/0x3D3b4d42F2D23a49A5f154421C57d80fb9d7Ab1d

Video : https://www.dropbox.com/s/ofmy0f9xugpj413/GrandvincentAndParejaWeb3Video.mp4

Vercel app : https://projet3-voting-nrvtz5sm2-max1000p.vercel.app/


## Author

👤 **Pareja Cyril**
👤 **GrandVincent Sam**


* Twitter: [@cypareja](https://twitter.com/cypareja)
* Github: [@Max1000p](https://github.com/Max1000p)