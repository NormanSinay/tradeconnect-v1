/**
 * Script para deploy del smart contract CertificateRegistry
 * @version 1.0.0
 * @author TradeConnect Team
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuración de redes
const networks = {
  sepolia: {
    name: 'sepolia_testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    chainId: 11155111,
    symbol: 'ETH',
    blockExplorer: 'https://sepolia.etherscan.io'
  },
  // Agregar otras redes según sea necesario
};

/**
 * Despliega el contrato CertificateRegistry
 */
async function deployContract(networkName = 'sepolia') {
  try {
    console.log(`🚀 Iniciando deployment en ${networkName}...`);

    const network = networks[networkName];
    if (!network) {
      throw new Error(`Red ${networkName} no configurada`);
    }

    // Leer variables de entorno
    const privateKey = process.env.ETHEREUM_WALLET_KEY;
    const infuraKey = process.env.INFURA_PROJECT_ID;

    if (!privateKey) {
      throw new Error('ETHEREUM_WALLET_KEY no configurada');
    }

    if (!infuraKey && network.rpcUrl.includes('infura.io')) {
      throw new Error('INFURA_PROJECT_ID no configurada');
    }

    // Configurar provider
    const rpcUrl = network.rpcUrl.replace('YOUR_INFURA_KEY', infuraKey);
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    // Verificar conexión
    const networkInfo = await provider.getNetwork();
    console.log(`✅ Conectado a ${networkInfo.name} (Chain ID: ${networkInfo.chainId})`);

    // Configurar signer
    const wallet = new ethers.Wallet(privateKey, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance de wallet: ${ethers.formatEther(balance)} ETH`);
    console.log(`📍 Dirección: ${wallet.address}`);

    // Leer contrato
    const contractPath = path.join(__dirname, '../contracts/CertificateRegistry.sol');
    const contractSource = fs.readFileSync(contractPath, 'utf8');

    // Compilar contrato (simplificado - en producción usar Hardhat/Truffle)
    console.log('🔨 Compilando contrato...');
    // Nota: Esta es una compilación simplificada. En producción usar herramientas completas.

    // Leer bytecode (debería generarse con compilador)
    // Para este ejemplo, asumimos que el bytecode está disponible
    const bytecode = '0x' + '608060405234801561001057600080fd5b50d3801561001d57600080fd5b50d2801561002a57600080fd5b50600080546001600160a01b0319163317905561019c8061004b6000396000f3fe608060405234801561001057600080fd5b50d3801561001d57600080fd5b50d2801561002a57600080fd5b50600436106100405760003560e01c8063893d20e814610045575b600080fd5b61004d61006c565b6040805173ffffffffffffffffffffffffffffffffffffffff9092168252519081900360200190f35b60005473ffffffffffffffffffffffffffffffffffffffff169056fe'; // Placeholder

    // Crear factory del contrato
    const abi = JSON.parse(fs.readFileSync(path.join(__dirname, '../contracts/CertificateRegistryABI.json'), 'utf8'));
    const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);

    // Estimar gas
    console.log('⛽ Estimando costo de deployment...');
    const gasEstimate = await contractFactory.signer.estimateGas(contractFactory.getDeployTransaction());
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
    const estimatedCost = gasEstimate * gasPrice;

    console.log(`💸 Costo estimado: ${ethers.formatEther(estimatedCost)} ETH`);

    // Verificar balance suficiente
    if (balance < estimatedCost) {
      throw new Error(`Balance insuficiente. Necesario: ${ethers.formatEther(estimatedCost)} ETH, Disponible: ${ethers.formatEther(balance)} ETH`);
    }

    // Desplegar contrato
    console.log('📦 Desplegando contrato...');
    const contract = await contractFactory.deploy();
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();

    console.log('✅ Contrato desplegado exitosamente!');
    console.log(`📄 Dirección del contrato: ${contractAddress}`);
    console.log(`🔗 Transaction Hash: ${deploymentTx?.hash}`);
    console.log(`🌐 Explorador: ${network.blockExplorer}/address/${contractAddress}`);

    // Verificar deployment
    const owner = await contract.owner();
    console.log(`👤 Owner del contrato: ${owner}`);

    // Guardar información de deployment
    const deploymentInfo = {
      network: networkName,
      contractAddress,
      deploymentTxHash: deploymentTx?.hash,
      deployer: wallet.address,
      deployedAt: new Date().toISOString(),
      blockNumber: await provider.getBlockNumber(),
      abi: abi
    };

    const deploymentPath = path.join(__dirname, `../contracts/deployment-${networkName}.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

    console.log(`💾 Información de deployment guardada en: ${deploymentPath}`);

    // Instrucciones para configuración
    console.log('\n📋 INSTRUCCIONES PARA CONFIGURACIÓN:');
    console.log('========================================');
    console.log(`1. Agregar a .env:`);
    console.log(`   ETHEREUM_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`   ETHEREUM_CONTRACT_ABI=${JSON.stringify(abi)}`);
    console.log(`   BLOCKCHAIN_ENABLED=true`);
    console.log('');
    console.log(`2. Verificar en explorador: ${network.blockExplorer}/address/${contractAddress}`);
    console.log('');
    console.log('3. Probar contrato con una transacción de prueba');

    return {
      success: true,
      contractAddress,
      deploymentInfo
    };

  } catch (error) {
    console.error('❌ Error en deployment:', error);
    throw error;
  }
}

/**
 * Verifica el estado del contrato desplegado
 */
async function verifyDeployment(networkName = 'sepolia', contractAddress) {
  try {
    console.log(`🔍 Verificando contrato en ${networkName}...`);

    const network = networks[networkName];
    const rpcUrl = network.rpcUrl.replace('YOUR_INFURA_KEY', process.env.INFURA_PROJECT_ID);
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const abi = JSON.parse(fs.readFileSync(path.join(__dirname, '../contracts/CertificateRegistryABI.json'), 'utf8'));
    const contract = new ethers.Contract(contractAddress, abi, provider);

    // Verificar funciones básicas
    const owner = await contract.owner();
    const totalCertificates = await contract.getTotalCertificates();
    const paused = await contract.paused();

    console.log('✅ Verificación exitosa:');
    console.log(`   Owner: ${owner}`);
    console.log(`   Total Certificates: ${totalCertificates}`);
    console.log(`   Paused: ${paused}`);

    return { success: true, owner, totalCertificates, paused };

  } catch (error) {
    console.error('❌ Error en verificación:', error);
    throw error;
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'deploy';
  const network = args[1] || 'sepolia';

  switch (command) {
    case 'deploy':
      deployContract(network).catch(console.error);
      break;
    case 'verify':
      const contractAddress = args[2];
      if (!contractAddress) {
        console.error('Uso: node deploy-contract.js verify <network> <contractAddress>');
        process.exit(1);
      }
      verifyDeployment(network, contractAddress).catch(console.error);
      break;
    default:
      console.log('Uso: node deploy-contract.js [deploy|verify] [network] [contractAddress]');
      console.log('Ejemplos:');
      console.log('  node deploy-contract.js deploy sepolia');
      console.log('  node deploy-contract.js verify sepolia 0x123...');
  }
}

module.exports = { deployContract, verifyDeployment };