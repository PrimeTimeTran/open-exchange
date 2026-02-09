import hre from 'hardhat'
import { formatUnits } from 'ethers'

async function main() {
  const deployedAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'

  const TREASURY = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
  const TEAM = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'
  const REWARDS = '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC'

  const connection = await hre.network.connect()
  const token = await connection.ethers.getContractAt('OPENC', deployedAddress)

  const wallets = [
    { name: 'Treasury', address: TREASURY },
    { name: 'Team', address: TEAM },
    { name: 'Rewards', address: REWARDS },
  ]

  for (const w of wallets) {
    const balanceRaw = await token.balanceOf(w.address)
    const decimals = await token.decimals()

    // Convert to human-readable and add commas
    const balanceHuman = Number(
      formatUnits(balanceRaw, decimals),
    ).toLocaleString()

    console.log('----')
    console.log(`Name: ${w.name}`)
    console.log(`Address: ${w.address}`)
    console.log(`Balance (OPENC): ${balanceHuman}`)
  }

  const totalSupplyRaw = await token.totalSupply()
  const totalSupplyHuman = Number(
    formatUnits(totalSupplyRaw, await token.decimals()),
  ).toLocaleString()

  console.log('----')
  console.log(`Total Supply (OPENC): ${totalSupplyHuman}`)
  console.log('----')
}

main().catch(console.error)
