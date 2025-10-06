# 🔐 Configuración Blockchain para Certificados

Este documento explica cómo configurar y desplegar el sistema de blockchain para certificados digitales en TradeConnect.

## 📋 Requisitos Previos

### 1. **Cuenta en Infura (o similar)**
- Crear cuenta en [Infura.io](https://infura.io)
- Obtener Project ID para Sepolia testnet
- Configurar endpoints RPC

### 2. **Wallet Ethereum**
- Crear wallet con Metamask o similar
- Obtener dirección pública y clave privada
- **⚠️ IMPORTANTE**: Nunca compartir la clave privada

### 3. **Fondos en Testnet**
- Obtener ETH de testnet desde faucet:
  - [Sepolia Faucet](https://sepoliafaucet.com/)
  - [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- Mínimo recomendado: 0.1 ETH para deployments y transacciones

## 🚀 Guía de Configuración

### Paso 1: Instalar Dependencias

```bash
cd backend
npm install ethers dotenv
```

### Paso 2: Configurar Variables de Entorno

Crear o actualizar el archivo `.env` con:

```env
# Blockchain Configuration
BLOCKCHAIN_ENABLED=true
ETHEREUM_TESTNET_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETHEREUM_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
ETHEREUM_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b844Bc454e4438f44e
ETHEREUM_WALLET_KEY=your_private_key_without_0x_prefix
INFURA_PROJECT_ID=your_infura_project_id

# Transaction Settings
ETHEREUM_CONFIRMATIONS=3
ETHEREUM_TIMEOUT=300
ETHEREUM_MAX_RETRIES=3
ETHEREUM_MAX_GAS_PRICE=50
ETHEREUM_GAS_LIMIT=200000
```

### Paso 3: Desplegar Smart Contract

#### Opción A: Usar Script Automático

```bash
# Configurar variables de entorno primero
export ETHEREUM_WALLET_KEY=your_private_key
export INFURA_PROJECT_ID=your_infura_id

# Ejecutar deployment
node scripts/deploy-contract.js deploy sepolia
```

#### Opción B: Deployment Manual

1. **Compilar contrato** (requiere Hardhat/Truffle):
```bash
npm install -g hardhat
cd backend/contracts
npx hardhat compile
```

2. **Desplegar contrato**:
```javascript
// Usar script deploy-contract.js o herramientas como Remix IDE
// Obtener la dirección del contrato desplegado
```

### Paso 4: Verificar Deployment

```bash
# Verificar que el contrato funciona
node scripts/deploy-contract.js verify sepolia 0xYOUR_CONTRACT_ADDRESS
```

### Paso 5: Actualizar Configuración

Una vez desplegado, actualizar `.env`:

```env
ETHEREUM_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
BLOCKCHAIN_ENABLED=true
```

## 🔧 Funciones del Smart Contract

### `registerCertificate(string hash, uint256 entityId, string entityType, string metadata)`
Registra un nuevo certificado en blockchain.

**Parámetros:**
- `hash`: Hash SHA-256 del certificado (64 caracteres)
- `entityId`: ID del certificado en base de datos
- `entityType`: Tipo de entidad ("certificate")
- `metadata`: JSON con información adicional

**Emite evento:** `CertificateRegistered`

### `verifyCertificate(string hash)`
Verifica si un certificado existe y está activo.

**Retorna:**
- `exists`: Si el hash está registrado
- `entityId`: ID de la entidad
- `entityType`: Tipo de entidad
- `registrar`: Dirección que registró
- `timestamp`: Timestamp del registro
- `isActive`: Estado del certificado

### `revokeCertificate(string hash)`
Revoca un certificado (solo owner).

**Emite evento:** `CertificateRevoked`

## 🧪 Testing en Testnet

### 1. Probar Health Check

```bash
curl http://localhost:3000/api/blockchain/health
```

### 2. Generar Certificado de Prueba

```bash
curl -X POST http://localhost:3000/api/certificates/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 1,
    "userId": 1,
    "registrationId": 1,
    "certificateType": "attendance"
  }'
```

### 3. Verificar en Blockchain

```bash
curl http://localhost:3000/api/public/certificates/verify/CERT-2025-XXXXXX
```

## 🔍 Monitoreo y Troubleshooting

### Verificar Estado del Servicio

```bash
# Health check del servicio blockchain
curl http://localhost:3000/api/blockchain/health

# Balance de la wallet
curl http://localhost:3000/api/blockchain/balance
```

### Logs Comunes de Error

1. **"Contract not initialized"**
   - Verificar `ETHEREUM_CONTRACT_ADDRESS`
   - Asegurar que el ABI sea correcto

2. **"Insufficient funds"**
   - Recargar wallet con faucet
   - Verificar balance mínimo

3. **"Network error"**
   - Verificar conexión a internet
   - Confirmar RPC URL de Infura

4. **"Transaction timeout"**
   - Aumentar `ETHEREUM_TIMEOUT`
   - Verificar congestión de red

### Exploradores de Blockchain

- **Sepolia Testnet**: https://sepolia.etherscan.io/
- Verificar transacciones y contratos desplegados

## 🔒 Seguridad

### ⚠️ Medidas de Seguridad Críticas

1. **Nunca commitear claves privadas**
2. **Usar variables de entorno para configuración**
3. **Rotar claves regularmente**
4. **Monitorear balance de wallet**
5. **Implementar límites de gas**

### Configuración de Producción

Para mainnet, cambiar configuración:

```env
ETHEREUM_TESTNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
ETHEREUM_CONTRACT_ADDRESS=0xMAINNET_CONTRACT_ADDRESS
ETHEREUM_CONFIRMATIONS=12  # Más confirmaciones en mainnet
```

## 📊 Costos Estimados

### Deployment Inicial
- **Gas estimado**: ~200,000 units
- **Costo aproximado**: 0.01 - 0.05 ETH

### Por Transacción de Registro
- **Gas estimado**: ~150,000 units
- **Costo aproximado**: 0.005 - 0.02 ETH

### Optimizaciones de Gas
- Batch transactions para múltiples certificados
- Optimizar tamaño de metadata
- Usar gas price dinámico

## 🆘 Soporte

Si encuentras problemas:

1. Revisar logs de la aplicación
2. Verificar configuración de variables de entorno
3. Confirmar balance de wallet
4. Consultar documentación de Ethers.js
5. Revisar estado de la red Sepolia

## 📚 Recursos Adicionales

- [Documentación Ethers.js](https://docs.ethers.org/)
- [Sepolia Testnet](https://sepolia.dev/)
- [Infura Documentation](https://docs.infura.io/)
- [Solidity Documentation](https://docs.soliditylang.org/)