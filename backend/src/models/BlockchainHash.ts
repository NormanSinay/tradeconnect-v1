/**
 * @fileoverview Modelo de Hash de Blockchain para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la entidad Hash de Blockchain con validaciones y métodos
 *
 * Archivo: backend/src/models/BlockchainHash.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  Index,
  AllowNull,
  Validate,
  Default,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  Unique
} from 'sequelize-typescript';
import { User } from './User';

/**
 * Tipos de entidad que pueden registrarse en blockchain
 */
export enum EntityType {
  QR_CODE = 'qr_code',
  ATTENDANCE = 'attendance',
  CERTIFICATE = 'certificate',
  EVENT = 'event',
  USER = 'user'
}

/**
 * Redes blockchain soportadas
 */
export enum BlockchainNetwork {
  ETHEREUM_MAINNET = 'ethereum_mainnet',
  SEPOLIA_TESTNET = 'sepolia_testnet',
  GOERLI_TESTNET = 'goerli_testnet',
  POLYGON_MAINNET = 'polygon_mainnet',
  POLYGON_MUMBAI = 'polygon_mumbai'
}

/**
 * Estados de transacción en blockchain
 */
export enum BlockchainStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  ORPHANED = 'orphaned'
}

/**
 * Atributos del modelo BlockchainHash
 */
export interface BlockchainHashAttributes {
  id?: number;
  entityId: number;
  entityType: EntityType;
  hash: string;
  txHash?: string;
  blockNumber?: number;
  blockTimestamp?: Date;
  network: BlockchainNetwork;
  contractAddress?: string;
  gasUsed?: number;
  gasPrice?: string;
  status: BlockchainStatus;
  confirmationCount: number;
  requiredConfirmations: number;
  retryCount: number;
  maxRetries: number;
  lastRetryAt?: Date;
  errorMessage?: string;
  metadata?: any;
  createdBy?: number;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

/**
 * Interface para creación de hash de blockchain
 */
export interface BlockchainHashCreationAttributes extends Omit<BlockchainHashAttributes, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'> {}

/**
 * @swagger
 * components:
 *   schemas:
 *     BlockchainHash:
 *       type: object
 *       required:
 *         - entityId
 *         - entityType
 *         - hash
 *         - network
 *         - status
 *         - confirmationCount
 *         - requiredConfirmations
 *         - retryCount
 *         - maxRetries
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del registro de blockchain
 *           example: 1
 *         entityId:
 *           type: integer
 *           description: ID de la entidad en la base de datos local
 *           example: 123
 *         entityType:
 *           type: string
 *           enum: [qr_code, attendance, certificate, event, user]
 *           description: Tipo de entidad que se registró en blockchain
 *           example: "qr_code"
 *         hash:
 *           type: string
 *           description: Hash SHA-256 del contenido registrado
 *           example: "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
 *         txHash:
 *           type: string
 *           description: Hash de la transacción de blockchain
 *           example: "0x1234567890abcdef..."
 *         blockNumber:
 *           type: integer
 *           description: Número del bloque donde se confirmó la transacción
 *           example: 18500000
 *         blockTimestamp:
 *           type: string
 *           format: date-time
 *           description: Timestamp del bloque en blockchain
 *         network:
 *           type: string
 *           enum: [ethereum_mainnet, sepolia_testnet, goerli_testnet, polygon_mainnet, polygon_mumbai]
 *           description: Red blockchain donde se registró el hash
 *           default: "sepolia_testnet"
 *           example: "sepolia_testnet"
 *         contractAddress:
 *           type: string
 *           description: Dirección del smart contract usado
 *           example: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
 *         gasUsed:
 *           type: integer
 *           description: Gas utilizado en la transacción
 *           example: 21000
 *         gasPrice:
 *           type: string
 *           description: Precio del gas en wei/gwei
 *           example: "20000000000"
 *         status:
 *           type: string
 *           enum: [pending, confirmed, failed, orphaned]
 *           description: Estado de la transacción en blockchain
 *           default: "pending"
 *           example: "confirmed"
 *         confirmationCount:
 *           type: integer
 *           description: Número de confirmaciones de la transacción
 *           default: 0
 *           example: 12
 *         requiredConfirmations:
 *           type: integer
 *           description: Número de confirmaciones requeridas
 *           default: 12
 *           example: 12
 *         retryCount:
 *           type: integer
 *           description: Número de reintentos realizados
 *           default: 0
 *           example: 0
 *         maxRetries:
 *           type: integer
 *           description: Máximo número de reintentos permitidos
 *           default: 3
 *           example: 3
 *         lastRetryAt:
 *           type: string
 *           format: date-time
 *           description: Fecha del último intento de registro
 *         errorMessage:
 *           type: string
 *           description: Mensaje de error si el registro falló
 *         metadata:
 *           type: object
 *           description: Metadatos adicionales de la transacción
 *         createdBy:
 *           type: integer
 *           description: Usuario que inició el registro en blockchain
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de actualización
 */

@Table({
  tableName: 'blockchain_hashes',
  modelName: 'BlockchainHash',
  paranoid: true,
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['entity_id', 'entity_type']
    },
    {
      fields: ['hash']
    },
    {
      unique: true,
      fields: ['tx_hash']
    },
    {
      fields: ['block_number']
    },
    {
      fields: ['network']
    },
    {
      fields: ['contract_address']
    },
    {
      fields: ['status']
    },
    {
      fields: ['confirmation_count']
    },
    {
      fields: ['created_by']
    },
    {
      fields: ['entity_type', 'status']
    },
    {
      fields: ['network', 'status']
    },
    {
      fields: ['status', 'confirmation_count']
    }
  ]
})
export class BlockchainHash extends Model<BlockchainHashAttributes, BlockchainHashCreationAttributes> implements BlockchainHashAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'ID de la entidad en la base de datos local (qr_code, attendance, etc.)'
  })
  declare entityId: number;

  @AllowNull(false)
  @Column({
    type: DataType.ENUM(...Object.values(EntityType)),
    comment: 'Tipo de entidad que se registró en blockchain'
  })
  declare entityType: EntityType;

  @AllowNull(false)
  @Validate({
    isLength: {
      args: [64, 64],
      msg: 'El hash debe tener exactamente 64 caracteres (SHA-256)'
    },
    is: {
      args: /^[a-f0-9]+$/i,
      msg: 'El hash debe contener solo caracteres hexadecimales'
    },
    notEmpty: {
      msg: 'El hash es requerido'
    }
  })
  @Column({
    type: DataType.STRING(64),
    comment: 'Hash SHA-256 del contenido registrado en blockchain'
  })
  declare hash: string;

  @Unique
  @Validate({
    is: {
      args: /^0x[a-fA-F0-9]{64}$/,
      msg: 'El hash de transacción debe tener formato válido de Ethereum'
    }
  })
  @Column({
    type: DataType.STRING(66),
    comment: 'Hash de la transacción de blockchain'
  })
  declare txHash?: string;

  @Index
  @Column({
    type: DataType.BIGINT,
    comment: 'Número del bloque donde se confirmó la transacción'
  })
  declare blockNumber?: number;

  @Column({
    type: DataType.DATE,
    comment: 'Timestamp del bloque en blockchain'
  })
  declare blockTimestamp?: Date;

  @AllowNull(false)
  @Default(BlockchainNetwork.SEPOLIA_TESTNET)
  @Column({
    type: DataType.ENUM(...Object.values(BlockchainNetwork)),
    comment: 'Red blockchain donde se registró el hash'
  })
  declare network: BlockchainNetwork;

  @Validate({
    is: {
      args: /^0x[a-fA-F0-9]{40}$/,
      msg: 'La dirección del contrato debe tener formato válido de Ethereum'
    }
  })
  @Column({
    type: DataType.STRING(42),
    comment: 'Dirección del smart contract usado'
  })
  declare contractAddress?: string;

  @Column({
    type: DataType.BIGINT,
    comment: 'Gas utilizado en la transacción'
  })
  declare gasUsed?: number;

  @Column({
    type: DataType.DECIMAL(36, 18),
    comment: 'Precio del gas en wei/gwei'
  })
  declare gasPrice?: string;

  @AllowNull(false)
  @Default(BlockchainStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(BlockchainStatus)),
    comment: 'Estado de la transacción en blockchain'
  })
  declare status: BlockchainStatus;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de confirmaciones de la transacción'
  })
  declare confirmationCount: number;

  @AllowNull(false)
  @Default(12)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de confirmaciones requeridas'
  })
  declare requiredConfirmations: number;

  @AllowNull(false)
  @Default(0)
  @Column({
    type: DataType.INTEGER,
    comment: 'Número de reintentos realizados'
  })
  declare retryCount: number;

  @AllowNull(false)
  @Default(3)
  @Column({
    type: DataType.INTEGER,
    comment: 'Máximo número de reintentos permitidos'
  })
  declare maxRetries: number;

  @Column({
    type: DataType.DATE,
    comment: 'Fecha del último intento de registro'
  })
  declare lastRetryAt?: Date;

  @Column({
    type: DataType.TEXT,
    comment: 'Mensaje de error si el registro falló'
  })
  declare errorMessage?: string;

  @Column({
    type: DataType.JSON,
    comment: 'Metadatos adicionales de la transacción'
  })
  declare metadata?: any;

  @ForeignKey(() => User)
  @Index
  @Column({
    type: DataType.INTEGER,
    comment: 'Usuario que inició el registro en blockchain'
  })
  declare createdBy?: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de creación'
  })
  declare createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de actualización'
  })
  declare updatedAt: Date;

  @DeletedAt
  @Column({
    type: DataType.DATE,
    comment: 'Fecha de eliminación (soft delete)'
  })
  declare deletedAt?: Date;

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => User, {
    foreignKey: 'createdBy',
    as: 'creator'
  })
  declare creator?: User;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Verifica si la transacción está pendiente
   */
  public get isPending(): boolean {
    return this.status === BlockchainStatus.PENDING;
  }

  /**
   * Verifica si la transacción está confirmada
   */
  public get isConfirmed(): boolean {
    return this.status === BlockchainStatus.CONFIRMED;
  }

  /**
   * Verifica si la transacción falló
   */
  public get isFailed(): boolean {
    return this.status === BlockchainStatus.FAILED;
  }

  /**
   * Verifica si tiene suficientes confirmaciones
   */
  public get isFullyConfirmed(): boolean {
    return this.confirmationCount >= this.requiredConfirmations;
  }

  /**
   * Verifica si puede reintentarse
   */
  public get canRetry(): boolean {
    return this.retryCount < this.maxRetries && this.status !== BlockchainStatus.CONFIRMED;
  }

  /**
   * Incrementa el contador de confirmaciones
   */
  public incrementConfirmations(): void {
    this.confirmationCount++;
    if (this.confirmationCount >= this.requiredConfirmations) {
      this.status = BlockchainStatus.CONFIRMED;
    }
  }

  /**
   * Marca como confirmado con información del bloque
   */
  public async confirmTransaction(blockNumber: number, blockTimestamp: Date): Promise<void> {
    this.status = BlockchainStatus.CONFIRMED;
    this.blockNumber = blockNumber;
    this.blockTimestamp = blockTimestamp;
    this.confirmationCount = this.requiredConfirmations;
    await this.save();
  }

  /**
   * Registra un fallo en la transacción
   */
  public async markAsFailed(errorMessage: string): Promise<void> {
    this.status = BlockchainStatus.FAILED;
    this.errorMessage = errorMessage;
    this.retryCount++;
    this.lastRetryAt = new Date();
    await this.save();
  }

  /**
   * Incrementa contador de reintentos
   */
  public incrementRetryCount(): void {
    this.retryCount++;
    this.lastRetryAt = new Date();
  }

  /**
   * Calcula el costo total de gas en ETH
   */
  public get totalGasCost(): string | null {
    if (!this.gasUsed || !this.gasPrice) return null;

    const gasUsed = BigInt(this.gasUsed);
    const gasPrice = BigInt(this.gasPrice);
    const totalWei = gasUsed * gasPrice;

    // Convertir wei a ETH (1 ETH = 10^18 wei)
    const ethValue = Number(totalWei) / Math.pow(10, 18);
    return ethValue.toFixed(18);
  }

  /**
   * Serializa el hash para respuestas de API
   */
  public toPublicJSON(): object {
    return {
      id: this.id,
      entityId: this.entityId,
      entityType: this.entityType,
      hash: this.hash,
      txHash: this.txHash,
      blockNumber: this.blockNumber,
      blockTimestamp: this.blockTimestamp,
      network: this.network,
      contractAddress: this.contractAddress,
      gasUsed: this.gasUsed,
      gasPrice: this.gasPrice,
      totalGasCost: this.totalGasCost,
      status: this.status,
      confirmationCount: this.confirmationCount,
      requiredConfirmations: this.requiredConfirmations,
      retryCount: this.retryCount,
      maxRetries: this.maxRetries,
      lastRetryAt: this.lastRetryAt,
      errorMessage: this.errorMessage,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Serializa con metadatos completos (para debugging)
   */
  public toDetailedJSON(): object {
    return {
      ...this.toPublicJSON(),
      metadata: this.metadata,
      creator: this.creator?.toPublicJSON()
    };
  }

  // ====================================================================
  // MÉTODOS ESTÁTICOS
  // ====================================================================

  /**
   * Crea un nuevo registro de hash de blockchain
   */
  static async createBlockchainHash(data: {
    entityId: number;
    entityType: EntityType;
    hash: string;
    network?: BlockchainNetwork;
    contractAddress?: string;
    createdBy?: number;
    metadata?: any;
  }): Promise<BlockchainHash> {
    return this.create({
      ...data,
      status: BlockchainStatus.PENDING,
      confirmationCount: 0,
      requiredConfirmations: 12,
      retryCount: 0,
      maxRetries: 3,
      network: data.network || BlockchainNetwork.SEPOLIA_TESTNET
    });
  }

  /**
   * Busca hash por entidad
   */
  static async findByEntity(entityId: number, entityType: EntityType): Promise<BlockchainHash | null> {
    return this.findOne({
      where: { entityId, entityType }
    });
  }

  /**
   * Busca por hash de transacción
   */
  static async findByTxHash(txHash: string): Promise<BlockchainHash | null> {
    return this.findOne({
      where: { txHash }
    });
  }

  /**
   * Busca hashes pendientes de confirmación
   */
  static async findPendingConfirmations(limit: number = 100): Promise<BlockchainHash[]> {
    return this.findAll({
      where: {
        status: BlockchainStatus.PENDING,
        txHash: { [require('sequelize').Op.ne]: null }
      },
      order: [['createdAt', 'ASC']],
      limit
    });
  }

  /**
   * Busca hashes que necesitan reintento
   */
  static async findHashesToRetry(maxRetries: number = 3): Promise<BlockchainHash[]> {
    const retryWindow = new Date(Date.now() - 5 * 60 * 1000); // 5 minutos

    return this.findAll({
      where: {
        status: [BlockchainStatus.PENDING, BlockchainStatus.FAILED],
        retryCount: { [require('sequelize').Op.lt]: maxRetries },
        [require('sequelize').Op.or]: [
          { lastRetryAt: null },
          { lastRetryAt: { [require('sequelize').Op.lt]: retryWindow } }
        ]
      },
      order: [
        ['retryCount', 'ASC'],
        ['createdAt', 'ASC']
      ]
    });
  }

  /**
   * Obtiene estadísticas de blockchain por red
   */
  static async getNetworkStats(network?: BlockchainNetwork): Promise<{
    totalHashes: number;
    confirmedHashes: number;
    pendingHashes: number;
    failedHashes: number;
    averageConfirmations: number;
    averageGasUsed: number;
    totalGasCost: string;
  }> {
    const where: any = {};
    if (network) where.network = network;

    const hashes = await this.findAll({
      where,
      attributes: ['status', 'confirmationCount', 'gasUsed', 'gasPrice']
    });

    const stats = {
      totalHashes: hashes.length,
      confirmedHashes: 0,
      pendingHashes: 0,
      failedHashes: 0,
      totalConfirmations: 0,
      totalGasUsed: 0,
      totalGasCostWei: BigInt(0)
    };

    hashes.forEach(hash => {
      switch (hash.status) {
        case BlockchainStatus.CONFIRMED:
          stats.confirmedHashes++;
          stats.totalConfirmations += hash.confirmationCount;
          break;
        case BlockchainStatus.PENDING:
          stats.pendingHashes++;
          break;
        case BlockchainStatus.FAILED:
          stats.failedHashes++;
          break;
      }

      if (hash.gasUsed) {
        stats.totalGasUsed += hash.gasUsed;
      }

      if (hash.gasUsed && hash.gasPrice) {
        const gasUsed = BigInt(hash.gasUsed);
        const gasPrice = BigInt(hash.gasPrice);
        stats.totalGasCostWei += gasUsed * gasPrice;
      }
    });

    // Convertir wei a ETH
    const totalGasCostEth = Number(stats.totalGasCostWei) / Math.pow(10, 18);

    return {
      totalHashes: stats.totalHashes,
      confirmedHashes: stats.confirmedHashes,
      pendingHashes: stats.pendingHashes,
      failedHashes: stats.failedHashes,
      averageConfirmations: stats.confirmedHashes > 0 ? stats.totalConfirmations / stats.confirmedHashes : 0,
      averageGasUsed: stats.totalHashes > 0 ? stats.totalGasUsed / stats.totalHashes : 0,
      totalGasCost: totalGasCostEth.toFixed(18)
    };
  }

  /**
   * Valida formato de hash SHA-256
   */
  static validateHashFormat(hash: string): boolean {
    return /^[a-f0-9]{64}$/i.test(hash);
  }

  /**
   * Valida formato de dirección Ethereum
   */
  static validateAddressFormat(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Valida formato de hash de transacción Ethereum
   */
  static validateTxHashFormat(txHash: string): boolean {
    return /^0x[a-fA-F0-9]{64}$/.test(txHash);
  }
}