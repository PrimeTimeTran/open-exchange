import hre from 'hardhat'
import { formatUnits } from 'viem' // or ethers.js utils if you prefer

async function main() {
  // Connect to the network using Hardhat v6+ syntax
  const connection = await hre.network.connect()
  const signers = await connection.ethers.getSigners()

  // Assign wallets from signers
  const DEPLOYER = signers[0].address
  const TREASURY = signers[1].address
  const TEAM = signers[2].address
  const LIQUIDITY = signers[3].address
  const REWARDS = signers[4].address
  const OPERATIONS = signers[5]?.address || DEPLOYER // fallback to deployer if not enough accounts

  console.log('Deploying OPENC with deployer:\n', DEPLOYER)
  console.log('Treasury:\n', TREASURY)
  console.log('Team:\n', TEAM)
  console.log('Liquidity:\n', LIQUIDITY)
  console.log('Rewards:\n', REWARDS)
  console.log('Operations:\n', OPERATIONS)

  // Vesting start/duration (4 years for team and rewards)
  const now = Math.floor(Date.now() / 1000)
  const fourYears = 365 * 4 * 24 * 60 * 60

  // Get contract factory connected to deployerSigner
  const Token = await connection.ethers.getContractFactory('OPENC', signers[0])

  // Deploy contract with constructor args
  const token = await Token.deploy(
    DEPLOYER,
    TREASURY,
    TEAM,
    REWARDS,
    LIQUIDITY,
    OPERATIONS,
    now, // teamStart
    fourYears, // teamDuration
    now, // rewardsStart
    fourYears, // rewardsDuration
  )

  console.log('OPENC deployed to:\n', token.target)

  // -----------------------------
  // Print report
  // -----------------------------
  const balances = {
    Deployer: await token.balanceOf(DEPLOYER),
    Treasury: await token.balanceOf(TREASURY),
    'Team (Vesting)': await token.balanceOf(TEAM),
    Liquidity: await token.balanceOf(LIQUIDITY),
    'Rewards (Vesting)': await token.balanceOf(REWARDS),
    Operations: await token.balanceOf(OPERATIONS),
  }

  // Helper to format numbers nicely
  function formatTokens(balance: any) {
    return Number(formatUnits(balance, 18)).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // -----------------------------
  // Print report
  // -----------------------------
  console.log('\n=== Deployment Report ===\n')
  for (const [account, balance] of Object.entries(balances)) {
    console.log(
      `Account: ${account}\nPrivateKey: <from Hardhat config>\nAllocation(OPENC): ${formatTokens(
        balance,
      )}\n`,
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
