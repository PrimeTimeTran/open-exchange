import * as dotenv from 'dotenv'
dotenv.config()

interface NetworkConfig {
  url: string
  deployer: string
}

interface Networks {
  [key: string]: NetworkConfig
}

const networks: Networks = {
  localhost: {
    url: 'http://127.0.0.1:8545',
    deployer: process.env.LOCAL_DEPLOYER_PRIVATE_KEY || '',
  },
  goerli: {
    url: process.env.GOERLI_RPC_URL || '',
    deployer: process.env.GOERLI_DEPLOYER_PRIVATE_KEY || '',
  },
  mainnet: {
    url: process.env.MAINNET_RPC_URL || '',
    deployer: process.env.MAINNET_DEPLOYER_PRIVATE_KEY || '',
  },
}

export default networks
