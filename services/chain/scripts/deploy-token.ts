import hre from 'hardhat'

async function main() {
  const connection = await hre.network.connect()
  const [deployer] = await connection.ethers.getSigners()

  console.log('Deploying with:', deployer.address)

  const Token = await connection.ethers.getContractFactory('OPENC')
  const token = await Token.deploy()
  await token.waitForDeployment()

  console.log('Token deployed at:', await token.getAddress())

  const name = await token.name()
  const supply = await token.totalSupply()
  const balance = await token.balanceOf(deployer.address)

  console.log('Name:', name)
  console.log('Total Supply:', supply.toString())
  console.log('Deployer Balance:', balance.toString())
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
