import { ethers } from 'hardhat'

async function main() {
  // Get the contract factory
  const Greeter = await ethers.getContractFactory('Greeter')

  // Deploy the contract with the constructor argument
  const greeter = await Greeter.deploy('Hello World')
  await greeter.waitForDeployment()

  // Get the deployed contract address
  const address = await greeter.getAddress()
  console.log(`Contract successfully deployed to ${address}`)
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
