import hre from 'hardhat'

const deployedAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'

async function main() {
  // Connect to the network
  const connection = await hre.network.connect()

  // Get all accounts
  const accounts = await connection.ethers.getSigners()

  // Connect to the token contract
  const token = await connection.ethers.getContractAt('OPENC', deployedAddress)

  // Print each account address and its token balance
  for (let i = 0; i < accounts.length; i++) {
    const account = accounts[i]
    const balance = await token.balanceOf(account.address)
    console.log(
      `Account #${i}: ${account.address} | Balance: ${balance.toString()}`,
    )
  }
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
