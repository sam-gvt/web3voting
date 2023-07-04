const { ethers } = require("hardhat")

async function main() {
    let owner, addr1, addr2

    [owner, addr1, addr2] = await ethers.getSigners()

    const myContract = await hre.ethers.getContractAt("Voting", "0x5fbdb2315678afecb367f032d93f642f64180aa3");
    // Add voter
    let transaction = await myContract.connect(owner).startVotingSession()
    transaction.wait()
}

main()
    .then(() => process.exit(0)) 
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })