const { ethers } = require("hardhat")

async function main() {
    let owner, addr1, addr2

    [owner, addr1, addr2] = await ethers.getSigners()

    const myContract = await hre.ethers.getContractAt("Voting", "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");
    // Add voter
    let transaction = await myContract.connect(owner).addVoter('0x93B88a345aA39cE42b38ebDe5E821CF68106F477')
    transaction.wait()
    let transaction2 = await myContract.connect(owner).addVoter('0x90F79bf6EB2c4f870365E785982E1f101E93b906')
    transaction2.wait()

    
}

main()
    .then(() => process.exit(0)) 
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })