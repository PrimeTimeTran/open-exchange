import hre from 'hardhat'

const TREASURY = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
const TEAM = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'
const REWARDS = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc'

async function main() {
  const connection = await hre.network.connect()
  const [deployer] = await connection.ethers.getSigners()

  console.log('Deploying OPENC with deployer:', deployer.address)

  const Token = await connection.ethers.getContractFactory('OPENC')

  // In v6, deploy() already returns the deployed contract
  const token = await Token.deploy(TREASURY, TEAM, REWARDS)

  console.log('OPENC deployed to:', token.target)

  // Optional: Print balances of the wallets
  console.log('Treasury balance:', (await token.balanceOf(TREASURY)).toString())
  console.log('Team balance:', (await token.balanceOf(TEAM)).toString())
  console.log('Rewards balance:', (await token.balanceOf(REWARDS)).toString())
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
