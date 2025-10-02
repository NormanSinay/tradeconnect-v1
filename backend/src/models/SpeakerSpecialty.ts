/**
 * @fileoverview Modelo de relación Speaker-Specialty para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Modelo Sequelize para la relación muchos-a-muchos entre Speaker y Specialty
 *
 * Archivo: backend/src/models/SpeakerSpecialty.ts
 */

import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { Speaker } from './Speaker';
import { Specialty } from './Specialty';

/**
 * Atributos del modelo SpeakerSpecialty
 */
export interface SpeakerSpecialtyAttributes {
  id?: number;
  speakerId: number;
  specialtyId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Interface para creación de relación speaker-specialty
 */
export interface SpeakerSpecialtyCreationAttributes extends Omit<SpeakerSpecialtyAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

@Table({
  tableName: 'speaker_specialties',
  modelName: 'SpeakerSpecialty',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['speaker_id']
    },
    {
      fields: ['specialty_id']
    },
    {
      fields: ['speaker_id', 'specialty_id'],
      unique: true
    }
  ]
})
export class SpeakerSpecialty extends Model<SpeakerSpecialtyAttributes, SpeakerSpecialtyCreationAttributes> implements SpeakerSpecialtyAttributes {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER)
  declare id: number;

  @ForeignKey(() => Speaker)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia al speaker'
  })
  declare speakerId: number;

  @ForeignKey(() => Specialty)
  @AllowNull(false)
  @Column({
    type: DataType.INTEGER,
    comment: 'Referencia a la especialidad'
  })
  declare specialtyId: number;

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

  // ====================================================================
  // RELACIONES
  // ====================================================================

  @BelongsTo(() => Speaker)
  declare speaker: Speaker;

  @BelongsTo(() => Specialty)
  declare specialty: Specialty;

  // ====================================================================
  // MÉTODOS DE INSTANCIA
  // ====================================================================

  /**
   * Serializa la relación para respuestas
   */
  public toJSON(): object {
    return {
      id: this.id,
      speakerId: this.speakerId,
      specialtyId: this.specialtyId,
      createdAt: this.createdAt
    };
  }
}