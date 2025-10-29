/**
 * @fileoverview Tipos TypeScript para integración con blockchain
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Definiciones de tipos específicos para Ethereum y otras blockchains
 *
 * Archivo: backend/src/types/blockchain.types.ts
 */

import { EntityType, BlockchainNetwork, BlockchainStatus } from '../models/BlockchainHash';

// ====================================================================
// INTERFACES PARA ETHEREUM/BLOCKCHAIN
// ====================================================================

/**
 * Información de una transacción de blockchain
 */
export interface BlockchainTransaction {
  /** Hash de la transacción */
  txHash: string;
  /** Número del bloque */
  blockNumber: number;
  /** Hash del bloque */
  blockHash: string;
  /** Timestamp del bloque */
  blockTimestamp: Date;
  /** Dirección del remitente */
  from: string;
  /** Dirección del destinatario */
  to?: string;
  /** Valor transferido (en wei) */
  value: string;
  /** Gas utilizado */
  gasUsed: number;
  /** Precio del gas */
  gasPrice: string;
  /** Límite de gas */
  gasLimit: number;
  /** Estado de la transacción */
  status: boolean;
  /** Logs de la transacción */
  logs: BlockchainLog[];
  /** Confirmaciones */
  confirmations: number;
}

/**
 * Log de una transacción de blockchain
 */
export interface BlockchainLog {
  /** Dirección del contrato */
  address: string;
  /** Topics del log */
  topics: string[];
  /** Datos del log */
  data: string;
  /** Número del log en la transacción */
  logIndex: number;
  /** Hash de la transacción */
  transactionHash: string;
  /** Índice de la transacción en el bloque */
  transactionIndex: number;
  /** Número del bloque */
  blockNumber: number;
  /** Hash del bloque */
  blockHash: string;
}

/**
 * Información de un bloque de blockchain
 */
export interface BlockchainBlock {
  /** Número del bloque */
  number: number;
  /** Hash del bloque */
  hash: string;
  /** Hash del bloque padre */
  parentHash: string;
  /** Timestamp del bloque */
  timestamp: Date;
  /** Dirección del minero */
  miner: string;
  /** Dificultad del bloque */
  difficulty: string;
  /** Límite de gas del bloque */
  gasLimit: number;
  /** Gas utilizado en el bloque */
  gasUsed: number;
  /** Transacciones en el bloque */
  transactions: string[];
}

// ====================================================================
// INTERFACES PARA SMART CONTRACTS
// ====================================================================

/**
 * Datos para registrar un hash en el smart contract
 */
export interface RegisterHashData {
  /** Hash SHA-256 a registrar */
  hash: string;
  /** Tipo de entidad */
  entityType: EntityType;
  /** ID de la entidad */
  entityId: number;
  /** Metadatos adicionales */
  metadata?: any;
  /** Timestamp de registro */
  timestamp: Date;
}

/**
 * Resultado del registro en blockchain
 */
export interface RegisterHashResult {
  /** Hash de la transacción */
  txHash: string;
  /** Gas utilizado */
  gasUsed: number;
  /** Costo total en ETH */
  totalCost: string;
  /** Estado de confirmación */
  status: BlockchainStatus;
  /** Número del bloque */
  blockNumber?: number;
  /** Timestamp del bloque */
  blockTimestamp?: Date;
}

/**
 * Datos de verificación de hash en blockchain
 */
export interface VerifyHashData {
  /** Hash a verificar */
  hash: string;
  /** Red blockchain */
  network: BlockchainNetwork;
  /** Dirección del contrato */
  contractAddress?: string;
}

/**
 * Resultado de verificación de hash
 */
export interface VerifyHashResult {
  /** Si el hash existe en blockchain */
  exists: boolean;
  /** Hash de la transacción donde se registró */
  txHash?: string;
  /** Número del bloque */
  blockNumber?: number;
  /** Timestamp del registro */
  timestamp?: Date;
  /** Confirmaciones */
  confirmations?: number;
  /** Si está completamente confirmado */
  isConfirmed: boolean;
}

// ====================================================================
// INTERFACES PARA CONFIGURACIÓN DE BLOCKCHAIN
// ====================================================================

/**
 * Configuración de red blockchain
 */
export interface BlockchainNetworkConfig {
  /** Nombre de la red */
  name: BlockchainNetwork;
  /** URL del RPC */
  rpcUrl: string;
  /** ID de la cadena */
  chainId: number;
  /** Símbolo de la moneda */
  symbol: string;
  /** Dirección del contrato de registro */
  contractAddress: string;
  /** ABI del contrato */
  contractAbi: any[];
  /** Dirección del wallet del sistema */
  systemWalletAddress: string;
  /** Clave privada del wallet (encriptada) */
  systemWalletKey: string;
  /** Confirmaciones requeridas */
  requiredConfirmations: number;
  /** Timeout de transacción (segundos) */
  transactionTimeoutSeconds: number;
  /** Máximo de reintentos */
  maxRetries: number;
  /** Gas price máximo (gwei) */
  maxGasPriceGwei: number;
  /** Gas limit por transacción */
  gasLimit: number;
}

/**
 * Configuración general de blockchain
 */
export interface BlockchainConfig {
  /** Red por defecto */
  defaultNetwork: BlockchainNetwork;
  /** Configuraciones por red */
  networks: Record<BlockchainNetwork, BlockchainNetworkConfig>;
  /** Habilitar modo de solo lectura */
  readOnlyMode: boolean;
  /** Intervalo de monitoreo (segundos) */
  monitoringIntervalSeconds: number;
  /** Batch size para procesamiento */
  batchSize: number;
  /** Reintentos automáticos */
  autoRetryEnabled: boolean;
  /** Notificaciones de fallos */
  failureNotificationsEnabled: boolean;
}

// ====================================================================
// INTERFACES PARA PROCESAMIENTO EN LOTES
// ====================================================================

/**
 * Lote de hashes para registro en blockchain
 */
export interface HashBatch {
  /** ID único del lote */
  batchId: string;
  /** Hashes a procesar */
  hashes: RegisterHashData[];
  /** Red blockchain */
  network: BlockchainNetwork;
  /** Prioridad del lote */
  priority: 'low' | 'normal' | 'high' | 'critical';
  /** Timestamp de creación */
  createdAt: Date;
  /** Estado del procesamiento */
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

/**
 * Resultado del procesamiento de lote
 */
export interface BatchProcessingResult {
  /** ID del lote */
  batchId: string;
  /** Total de hashes procesados */
  totalProcessed: number;
  /** Procesados exitosamente */
  successful: number;
  /** Fallidos */
  failed: number;
  /** Gas total utilizado */
  totalGasUsed: number;
  /** Costo total */
  totalCost: string;
  /** Errores encontrados */
  errors: Array<{
    hash: string;
    error: string;
  }>;
  /** Timestamp de finalización */
  completedAt: Date;
}

// ====================================================================
// INTERFACES PARA MONITOREO Y MÉTRICAS
// ====================================================================

/**
 * Métricas de blockchain
 */
export interface BlockchainMetrics {
  /** Red blockchain */
  network: BlockchainNetwork;
  /** Transacciones pendientes */
  pendingTransactions: number;
  /** Transacciones confirmadas en las últimas 24h */
  confirmedTransactions24h: number;
  /** Tasa de éxito de transacciones */
  successRate: number;
  /** Gas promedio utilizado */
  averageGasUsed: number;
  /** Costo promedio por transacción */
  averageCostPerTx: string;
  /** Tiempo promedio de confirmación (segundos) */
  averageConfirmationTime: number;
  /** Número de reintentos promedio */
  averageRetries: number;
  /** Último bloque procesado */
  lastProcessedBlock: number;
  /** Timestamp de última actualización */
  lastUpdated: Date;
}

/**
 * Estado de salud de la integración blockchain
 */
export interface BlockchainHealthStatus {
  /** Estado general */
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  /** Estado por red */
  networkStatus: Record<BlockchainNetwork, {
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastBlock: number;
    lastTransaction: Date;
    pendingTransactions: number;
    errorRate: number;
  }>;
  /** Alertas activas */
  activeAlerts: Array<{
    type: 'high_error_rate' | 'stuck_transactions' | 'network_down' | 'gas_price_spike';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
  }>;
  /** Timestamp de última verificación */
  lastChecked: Date;
}

// ====================================================================
// INTERFACES PARA WEB3.js/ETHERS.js
// ====================================================================

/**
 * Proveedor de Web3 configurado
 */
export interface Web3Provider {
  /** Instancia del proveedor */
  provider: any;
  /** Red actual */
  network: BlockchainNetwork;
  /** Si está conectado */
  isConnected: boolean;
  /** Último bloque */
  latestBlock: number;
  /** Gas price actual */
  currentGasPrice: string;
}

/**
 * Contrato inteligente de registro de hashes
 */
export interface HashRegistryContract {
  /** Dirección del contrato */
  address: string;
  /** Instancia del contrato */
  contract: any;
  /** ABI del contrato */
  abi: any[];
  /** Métodos disponibles */
  methods: {
    registerHash: (hash: string, metadata: any) => any;
    verifyHash: (hash: string) => any;
    getHashInfo: (hash: string) => any;
    getTransactionCount: () => any;
  };
}

// ====================================================================
// INTERFACES PARA MANEJO DE ERRORES
// ====================================================================

/**
 * Tipos de errores de blockchain
 */
export enum BlockchainErrorType {
  NETWORK_ERROR = 'network_error',
  CONTRACT_ERROR = 'contract_error',
  INSUFFICIENT_FUNDS = 'insufficient_funds',
  GAS_TOO_HIGH = 'gas_too_high',
  TRANSACTION_FAILED = 'transaction_failed',
  TIMEOUT = 'timeout',
  INVALID_ADDRESS = 'invalid_address',
  INVALID_HASH = 'invalid_hash',
  NONCE_TOO_LOW = 'nonce_too_low',
  REPLACEMENT_UNDERPRICED = 'replacement_underpriced'
}

/**
 * Error de blockchain
 */
export interface BlockchainError {
  /** Tipo de error */
  type: BlockchainErrorType;
  /** Mensaje descriptivo */
  message: string;
  /** Código de error original */
  originalError?: any;
  /** Datos adicionales del error */
  data?: any;
  /** Si es recuperable */
  isRecoverable: boolean;
  /** Sugerencia de resolución */
  suggestedAction?: string;
}

// ====================================================================
// INTERFACES PARA EVENTOS DE BLOCKCHAIN
// ====================================================================

/**
 * Evento de confirmación de transacción
 */
export interface TransactionConfirmedEvent {
  /** Hash de la transacción */
  txHash: string;
  /** Número de confirmaciones */
  confirmations: number;
  /** Si está completamente confirmado */
  isConfirmed: boolean;
  /** Timestamp del evento */
  timestamp: Date;
}

/**
 * Evento de nuevo bloque
 */
export interface NewBlockEvent {
  /** Número del bloque */
  blockNumber: number;
  /** Hash del bloque */
  blockHash: string;
  /** Timestamp del bloque */
  timestamp: Date;
  /** Transacciones en el bloque */
  transactions: string[];
}

/**
 * Evento de cambio en el estado de una transacción
 */
export interface TransactionStatusChangedEvent {
  /** ID del registro en la base de datos */
  recordId: number;
  /** Hash de la transacción */
  txHash: string;
  /** Estado anterior */
  previousStatus: BlockchainStatus;
  /** Nuevo estado */
  newStatus: BlockchainStatus;
  /** Timestamp del cambio */
  timestamp: Date;
}

// ====================================================================
// TYPES ADICIONALES
// ====================================================================

/**
 * Estrategias de gas price
 */
export enum GasPriceStrategy {
  FAST = 'fast',
  STANDARD = 'standard',
  SLOW = 'slow',
  CUSTOM = 'custom'
}

/**
 * Configuración de gas
 */
export interface GasConfig {
  /** Estrategia de gas price */
  strategy: GasPriceStrategy;
  /** Gas price personalizado (si strategy = custom) */
  customGasPrice?: string;
  /** Multiplicador de gas price */
  multiplier: number;
  /** Gas limit base */
  baseGasLimit: number;
  /** Incremento por byte de datos */
  gasPerByte: number;
}

/**
 * Wallet del sistema
 */
export interface SystemWallet {
  /** Dirección del wallet */
  address: string;
  /** Balance actual (en wei) */
  balance: string;
  /** Nonce actual */
  nonce: number;
  /** Si está bloqueado */
  isLocked: boolean;
  /** Última transacción */
  lastTransaction?: Date;
}
