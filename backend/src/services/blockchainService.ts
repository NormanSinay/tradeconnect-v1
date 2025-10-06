/**
 * @fileoverview Servicio de Blockchain para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Integración con Ethereum para registro y verificación de hashes
 *
 * Archivo: backend/src/services/blockchainService.ts
 */

import { ethers } from 'ethers';
import { BlockchainHash, EntityType, BlockchainNetwork, BlockchainStatus } from '../models/BlockchainHash';
import {
  RegisterHashData,
  RegisterHashResult,
  VerifyHashData,
  VerifyHashResult,
  BlockchainNetworkConfig,
  BlockchainConfig,
  BlockchainError,
  BlockchainErrorType,
  Web3Provider,
  HashRegistryContract,
  GasConfig,
  GasPriceStrategy
} from '../types/blockchain.types';
import { ApiResponse } from '../types/global.types';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

/**
 * Servicio para integración con blockchain
 */
export class BlockchainService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;
  private networkConfig: BlockchainNetworkConfig;
  private isInitialized = false;

  constructor() {
    this.networkConfig = this.getNetworkConfig();
  }

  // ====================================================================
  // INICIALIZACIÓN Y CONEXIÓN
  // ====================================================================

  /**
   * Inicializa la conexión con blockchain
   */
  async initialize(): Promise<ApiResponse<void>> {
    try {
      if (this.isInitialized) {
        return { success: true, message: 'Servicio ya inicializado', timestamp: new Date().toISOString() };
      }

      // Crear proveedor
      this.provider = new ethers.JsonRpcProvider(this.networkConfig.rpcUrl);

      // Verificar conexión
      const network = await this.provider.getNetwork();
      if (Number(network.chainId) !== this.networkConfig.chainId) {
        throw new Error(`Chain ID mismatch. Expected: ${this.networkConfig.chainId}, Got: ${Number(network.chainId)}`);
      }

      // Crear signer si hay clave privada
      if (this.networkConfig.systemWalletKey) {
        this.signer = new ethers.Wallet(this.networkConfig.systemWalletKey, this.provider);
      }

      // Inicializar contrato
      if (this.networkConfig.contractAddress && this.networkConfig.contractAbi) {
        this.contract = new ethers.Contract(
          this.networkConfig.contractAddress,
          this.networkConfig.contractAbi,
          this.signer || this.provider
        );
      }

      this.isInitialized = true;

      logger.info(`Blockchain service initialized for network: ${this.networkConfig.name}`);

      return {
        success: true,
        message: 'Servicio de blockchain inicializado exitosamente',
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error inicializando blockchain service:', error);
      return {
        success: false,
        message: 'Error inicializando conexión con blockchain',
        error: 'BLOCKCHAIN_INIT_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Verifica el estado de la conexión
   */
  async healthCheck(): Promise<ApiResponse<{
    isConnected: boolean;
    network: string;
    latestBlock: number;
    gasPrice: string;
  }>> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const network = await this.provider!.getNetwork();
      const latestBlock = await this.provider!.getBlockNumber();
      const feeData = await this.provider!.getFeeData();
      const gasPrice = feeData.gasPrice?.toString() || '0';

      return {
        success: true,
        message: 'Verificación de estado completada exitosamente',
        data: {
          isConnected: true,
          network: network.name,
          latestBlock,
          gasPrice
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Blockchain health check failed:', error);
      return {
        success: false,
        message: 'Error verificando estado de blockchain',
        error: 'BLOCKCHAIN_HEALTH_CHECK_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // REGISTRO DE HASHES
  // ====================================================================

  /**
   * Registra un hash en blockchain
   */
  async registerHash(data: RegisterHashData): Promise<ApiResponse<RegisterHashResult>> {
    try {
      if (!this.isInitialized) {
        const initResult = await this.initialize();
        if (!initResult.success) {
          return initResult as any;
        }
      }

      // Validar hash
      if (!BlockchainHash.validateHashFormat(data.hash)) {
        return {
          success: false,
          message: 'Formato de hash inválido',
          error: 'INVALID_HASH_FORMAT',
          timestamp: new Date().toISOString()
        };
      }

      // Verificar si ya existe
      const existing = await BlockchainHash.findByEntity(data.entityId, data.entityType);
      if (existing && existing.status !== BlockchainStatus.FAILED) {
        return {
          success: false,
          message: 'Hash ya registrado en blockchain',
          error: 'HASH_ALREADY_EXISTS',
          timestamp: new Date().toISOString()
        };
      }

      // Crear registro en base de datos
      const blockchainHash = await BlockchainHash.createBlockchainHash({
        entityId: data.entityId,
        entityType: data.entityType,
        hash: data.hash,
        network: this.networkConfig.name,
        contractAddress: this.networkConfig.contractAddress,
        createdBy: 1, // TODO: Obtener del contexto
        metadata: data.metadata
      });

      // Enviar transacción
      const txResult = await this.sendRegisterTransaction(data);

      if (!txResult.success) {
        // Marcar como fallido
        await blockchainHash.markAsFailed(txResult.error || 'Transaction failed');
        return {
          success: false,
          message: txResult.message || 'Error en transacción blockchain',
          error: txResult.error,
          timestamp: new Date().toISOString()
        };
      }

      // Actualizar con datos de transacción
      blockchainHash.txHash = txResult.data!.txHash;
      blockchainHash.gasUsed = txResult.data!.gasUsed;
      blockchainHash.gasPrice = txResult.data!.gasPrice;
      await blockchainHash.save();

      // Iniciar monitoreo de confirmaciones
      this.monitorTransactionConfirmations(blockchainHash.id, txResult.data!.txHash);

      return {
        success: true,
        message: 'Hash registrado en blockchain exitosamente',
        data: {
          txHash: txResult.data!.txHash,
          gasUsed: txResult.data!.gasUsed,
          totalCost: txResult.data!.totalCost,
          status: BlockchainStatus.PENDING
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error registrando hash en blockchain:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Registra múltiples hashes en lote
   */
  async registerHashesBatch(hashes: RegisterHashData[]): Promise<ApiResponse<{
    successful: number;
    failed: number;
    results: Array<{
      entityId: number;
      entityType: EntityType;
      success: boolean;
      txHash?: string;
      error?: string;
    }>;
  }>> {
    const results = [];

    for (const hashData of hashes) {
      try {
        const result = await this.registerHash(hashData);
        results.push({
          entityId: hashData.entityId,
          entityType: hashData.entityType,
          success: result.success,
          txHash: result.data?.txHash,
          error: result.error
        });
      } catch (error) {
        results.push({
          entityId: hashData.entityId,
          entityType: hashData.entityType,
          success: false,
          error: 'INTERNAL_ERROR'
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    return {
      success: true,
      message: `Procesamiento por lotes completado: ${successful} exitosos, ${failed} fallidos`,
      data: {
        successful,
        failed,
        results
      },
      timestamp: new Date().toISOString()
    };
  }

  // ====================================================================
  // VERIFICACIÓN DE HASHES
  // ====================================================================

  /**
   * Verifica si un hash existe en blockchain
   */
  async verifyHash(data: VerifyHashData): Promise<ApiResponse<VerifyHashResult>> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Buscar en base de datos local primero
      const localRecord = await BlockchainHash.findOne({
        where: {
          hash: data.hash,
          network: data.network || this.networkConfig.name
        }
      });

      if (!localRecord) {
        return {
          success: true,
          message: 'Hash no encontrado en la base de datos local',
          data: {
            exists: false,
            isConfirmed: false
          },
          timestamp: new Date().toISOString()
        };
      }

      // Verificar en blockchain si hay transacción
      let blockchainExists = false;
      let confirmations = 0;

      if (localRecord.txHash && localRecord.status === BlockchainStatus.CONFIRMED) {
        try {
          const tx = await this.provider!.getTransaction(localRecord.txHash);
          if (tx && tx.blockNumber) {
            blockchainExists = true;
            const latestBlock = await this.provider!.getBlockNumber();
            confirmations = latestBlock - tx.blockNumber;
          }
        } catch (error) {
          logger.warn('Error verificando transacción en blockchain:', error);
        }
      }

      return {
        success: true,
        message: `Verificación completada: hash ${localRecord ? 'encontrado' : 'no encontrado'} en blockchain`,
        data: {
          exists: !!localRecord,
          txHash: localRecord.txHash || undefined,
          blockNumber: localRecord.blockNumber || undefined,
          timestamp: localRecord.blockTimestamp || undefined,
          confirmations,
          isConfirmed: localRecord.isConfirmed
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error verificando hash en blockchain:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // GESTIÓN DE TRANSACCIONES
  // ====================================================================

  /**
   * Envía transacción de registro al contrato
   */
  private async sendRegisterTransaction(data: RegisterHashData): Promise<ApiResponse<{
    txHash: string;
    gasUsed: number;
    gasPrice: string;
    totalCost: string;
  }>> {
    try {
      if (!this.contract || !this.signer) {
        const error: BlockchainError = {
          type: BlockchainErrorType.CONTRACT_ERROR,
          message: 'Contrato no inicializado',
          originalError: undefined,
          isRecoverable: true,
          suggestedAction: 'Verificar configuración del contrato'
        };
        throw error;
      }

      // Preparar datos para la transacción
      const metadata = JSON.stringify({
        entityType: data.entityType,
        entityId: data.entityId,
        timestamp: data.timestamp.toISOString(),
        ...data.metadata
      });

      // Estimar gas
      const gasEstimate = await this.contract.registerHash.estimateGas(data.hash, metadata);
      const gasLimit = gasEstimate * BigInt(120) / BigInt(100); // +20% buffer

      // Obtener gas price
      const feeData = await this.provider!.getFeeData();
      const gasPrice = await this.getOptimalGasPrice();

      // Enviar transacción
      const tx = await this.contract.registerHash(data.hash, metadata, {
        gasLimit,
        gasPrice
      });

      logger.info(`Transaction sent: ${tx.hash}`);

      // Esperar confirmación inicial
      const receipt = await tx.wait(1);

      const totalCost = ethers.formatEther(BigInt(receipt.gasUsed) * BigInt(gasPrice));

      return {
        success: true,
        message: 'Transacción enviada exitosamente',
        data: {
          txHash: tx.hash,
          gasUsed: Number(receipt.gasUsed),
          gasPrice: gasPrice.toString(),
          totalCost
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error enviando transacción:', error);

      const blockchainError = this.handleBlockchainError(error);
      return {
        success: false,
        message: blockchainError.message,
        error: blockchainError.type,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Monitorea confirmaciones de transacción
   */
  private async monitorTransactionConfirmations(recordId: number, txHash: string): Promise<void> {
    try {
      const record = await BlockchainHash.findByPk(recordId);
      if (!record) return;

      // Esperar confirmaciones requeridas
      const receipt = await this.provider!.waitForTransaction(txHash, record.requiredConfirmations);

      if (receipt) {
        const block = await this.provider!.getBlock(receipt.blockNumber);
        await record.confirmTransaction(receipt.blockNumber, new Date(Number(block!.timestamp) * 1000));
        logger.info(`Transaction confirmed: ${txHash}`);
      }

    } catch (error) {
      logger.error(`Error monitoreando confirmaciones para ${txHash}:`, error);

      // Marcar como fallido si es error permanente
      const record = await BlockchainHash.findByPk(recordId);
      if (record) {
        await record.markAsFailed('Error en monitoreo de confirmaciones');
      }
    }
  }

  /**
   * Reintenta transacciones fallidas
   */
  async retryFailedTransactions(): Promise<ApiResponse<{ retried: number; successful: number }>> {
    try {
      const failedHashes = await BlockchainHash.findHashesToRetry();

      let retried = 0;
      let successful = 0;

      for (const hash of failedHashes) {
        try {
          // Obtener datos originales
          const originalData: RegisterHashData = {
            hash: hash.hash,
            entityType: hash.entityType,
            entityId: hash.entityId,
            timestamp: hash.createdAt,
            metadata: hash.metadata
          };

          // Reintentar
          const result = await this.sendRegisterTransaction(originalData);

          if (result.success) {
            hash.txHash = result.data!.txHash;
            hash.gasUsed = result.data!.gasUsed;
            hash.gasPrice = result.data!.gasPrice;
            hash.retryCount = 0;
            hash.lastRetryAt = new Date();
            await hash.save();

            successful++;
            this.monitorTransactionConfirmations(hash.id, result.data!.txHash);
          } else {
            hash.incrementRetryCount();
            await hash.save();
          }

          retried++;

        } catch (error) {
          logger.error(`Error reintentando hash ${hash.id}:`, error);
          hash.incrementRetryCount();
          await hash.save();
        }
      }

      return {
        success: true,
        message: `Reintentos completados: ${successful} exitosos, ${retried} totales`,
        data: { retried, successful },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error en retry de transacciones:', error);
      return {
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  // ====================================================================
  // UTILIDADES
  // ====================================================================

  /**
   * Obtiene precio óptimo del gas
   */
  private async getOptimalGasPrice(): Promise<bigint> {
    try {
      const feeData = await this.provider!.getFeeData();

      // Usar maxFeePerGas para EIP-1559, o gasPrice legacy
      if (feeData.maxFeePerGas) {
        return feeData.maxFeePerGas;
      } else if (feeData.gasPrice) {
        return feeData.gasPrice;
      }

      // Fallback
      return ethers.parseUnits('20', 'gwei');

    } catch (error) {
      logger.warn('Error obteniendo gas price, usando fallback:', error);
      return ethers.parseUnits('20', 'gwei');
    }
  }

  /**
   * Maneja errores de blockchain
   */
  private handleBlockchainError(error: any): BlockchainError {
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return {
        type: BlockchainErrorType.INSUFFICIENT_FUNDS,
        message: 'Fondos insuficientes en la wallet',
        originalError: error,
        isRecoverable: true,
        suggestedAction: 'Recargar la wallet del sistema'
      };
    }

    if (error.code === 'REPLACEMENT_UNDERPRICED') {
      return {
        type: BlockchainErrorType.REPLACEMENT_UNDERPRICED,
        message: 'Gas price demasiado bajo para reemplazar transacción',
        originalError: error,
        isRecoverable: true,
        suggestedAction: 'Aumentar el gas price'
      };
    }

    if (error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT') {
      return {
        type: BlockchainErrorType.NETWORK_ERROR,
        message: 'Error de conexión con la red blockchain',
        originalError: error,
        isRecoverable: true,
        suggestedAction: 'Verificar conexión a internet y RPC endpoint'
      };
    }

    if (error.code === 'CALL_EXCEPTION') {
      return {
        type: BlockchainErrorType.CONTRACT_ERROR,
        message: 'Error en la ejecución del contrato inteligente',
        originalError: error,
        isRecoverable: false,
        suggestedAction: 'Verificar parámetros y estado del contrato'
      };
    }

    return {
      type: BlockchainErrorType.TRANSACTION_FAILED,
      message: 'Error desconocido en transacción blockchain',
      originalError: error,
      isRecoverable: false,
      suggestedAction: 'Revisar logs para más detalles'
    };
  }

  /**
   * Obtiene configuración de red
   */
  private getNetworkConfig(): BlockchainNetworkConfig {
    const network = config.blockchain?.defaultNetwork || 'sepolia_testnet';
    const networkConfig = config.blockchain?.networks?.[network as keyof typeof config.blockchain.networks];

    if (!networkConfig) {
      throw new Error(`Configuración de red blockchain no encontrada: ${network}`);
    }

    return {
      name: network as BlockchainNetwork,
      rpcUrl: networkConfig.rpcUrl,
      chainId: networkConfig.chainId,
      symbol: networkConfig.symbol,
      contractAddress: networkConfig.contractAddress,
      contractAbi: networkConfig.contractAbi,
      systemWalletAddress: networkConfig.systemWalletAddress,
      systemWalletKey: networkConfig.systemWalletKey,
      requiredConfirmations: networkConfig.requiredConfirmations,
      transactionTimeoutSeconds: networkConfig.transactionTimeoutSeconds,
      maxRetries: networkConfig.maxRetries,
      maxGasPriceGwei: networkConfig.maxGasPriceGwei,
      gasLimit: networkConfig.gasLimit
    };
  }

  /**
   * Verifica si el servicio está habilitado
   */
  isEnabled(): boolean {
    return config.blockchain?.enabled || false;
  }

  /**
   * Obtiene balance de la wallet del sistema
   */
  async getSystemWalletBalance(): Promise<ApiResponse<string>> {
    try {
      if (!this.signer) {
        return {
          success: false,
          message: 'Signer no configurado',
          error: 'SIGNER_NOT_CONFIGURED',
          timestamp: new Date().toISOString()
        };
      }

      const address = await this.signer.getAddress();
      const balance = await this.provider!.getBalance(address);

      return {
        success: true,
        message: 'Balance de wallet obtenido exitosamente',
        data: ethers.formatEther(balance),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      logger.error('Error obteniendo balance:', error);
      return {
        success: false,
        message: 'Error obteniendo balance de wallet',
        error: 'WALLET_BALANCE_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const blockchainService = new BlockchainService();