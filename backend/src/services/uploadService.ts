/**
 * @fileoverview Servicio de Subida de Archivos para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para gestión de archivos multimedia con Multer y Sharp
 *
 * Archivo: backend/src/services/uploadService.ts
 */

import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';
import { EventMedia } from '../models/EventMedia';
import { ApiResponse } from '../types/global.types';

export interface UploadConfig {
  maxFileSize: number;
  allowedTypes: string[];
  destination: string;
  thumbnailSizes: { [key: string]: { width: number; height: number } };
}

export interface ProcessedFile {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
  thumbnails?: { [key: string]: string };
  dimensions?: { width: number; height: number };
}

/**
 * Servicio para gestión de archivos multimedia
 */
export class UploadService {
  private readonly defaultConfig: UploadConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
    destination: path.join(__dirname, '../../uploads'),
    thumbnailSizes: {
      small: { width: 150, height: 150 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 600 }
    }
  };

  private config: UploadConfig;

  constructor(config?: Partial<UploadConfig>) {
    this.config = { ...this.defaultConfig, ...config };
    this.ensureUploadDirectory();
  }

  /**
   * Asegura que el directorio de uploads existe
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.config.destination);
    } catch {
      await fs.mkdir(this.config.destination, { recursive: true });
      logger.info(`Created upload directory: ${this.config.destination}`);
    }
  }

  /**
   * Configuración de Multer para subida de archivos
   */
  get multerConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.config.destination);
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (this.config.allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`));
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.config.maxFileSize
      }
    });
  }

  /**
   * Procesa una imagen con Sharp
   */
  private async processImage(
    inputPath: string,
    outputPath: string,
    options: { width?: number; height?: number; quality?: number }
  ): Promise<void> {
    const { width, height, quality = 80 } = options;

    let sharpInstance = sharp(inputPath);

    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: 'cover',
        position: 'center'
      });
    }

    await sharpInstance
      .jpeg({ quality })
      .toFile(outputPath);
  }

  /**
   * Genera thumbnails para una imagen
   */
  private async generateThumbnails(inputPath: string, filename: string): Promise<{ [key: string]: string }> {
    const thumbnails: { [key: string]: string } = {};
    const baseName = path.parse(filename).name;

    for (const [size, dimensions] of Object.entries(this.config.thumbnailSizes)) {
      const thumbnailFilename = `${baseName}_${size}.jpg`;
      const thumbnailPath = path.join(this.config.destination, thumbnailFilename);

      try {
        await this.processImage(inputPath, thumbnailPath, {
          width: dimensions.width,
          height: dimensions.height,
          quality: 85
        });

        thumbnails[size] = thumbnailFilename;
      } catch (error) {
        logger.error(`Error generating ${size} thumbnail for ${filename}:`, error);
      }
    }

    return thumbnails;
  }

  /**
   * Obtiene las dimensiones de una imagen
   */
  private async getImageDimensions(filePath: string): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0
      };
    } catch (error) {
      logger.error('Error getting image dimensions:', error);
      return { width: 0, height: 0 };
    }
  }

  /**
   * Procesa un archivo subido
   */
  async processUploadedFile(file: Express.Multer.File): Promise<ProcessedFile> {
    const filePath = path.join(this.config.destination, file.filename);
    const isImage = file.mimetype.startsWith('image/');

    let thumbnails: { [key: string]: string } | undefined;
    let dimensions: { width: number; height: number } | undefined;

    // Procesar imagen si es necesario
    if (isImage && file.mimetype !== 'image/gif') {
      try {
        // Generar thumbnails
        thumbnails = await this.generateThumbnails(filePath, file.filename);

        // Obtener dimensiones originales
        dimensions = await this.getImageDimensions(filePath);

        // Comprimir imagen original si es muy grande
        const stats = await fs.stat(filePath);
        if (stats.size > 2 * 1024 * 1024) { // > 2MB
          const tempPath = `${filePath}.temp`;
          await this.processImage(filePath, tempPath, { quality: 85 });
          await fs.rename(tempPath, filePath);
        }
      } catch (error) {
        logger.error('Error processing image:', error);
      }
    }

    // Obtener tamaño final del archivo
    const finalStats = await fs.stat(filePath);

    return {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: finalStats.size,
      path: filePath,
      url: `/uploads/${file.filename}`,
      thumbnails,
      dimensions
    };
  }

  /**
   * Guarda información del archivo en la base de datos
   */
  async saveFileToDatabase(
    eventId: number,
    processedFile: ProcessedFile,
    uploadedBy: number,
    metadata?: {
      altText?: string;
      description?: string;
      isFeatured?: boolean;
      sortOrder?: number;
    }
  ): Promise<EventMedia> {
    const mediaData = {
      eventId,
      filename: processedFile.filename,
      originalName: processedFile.originalName,
      mimetype: processedFile.mimetype,
      size: processedFile.size,
      path: processedFile.path,
      url: processedFile.url,
      type: this.getMediaType(processedFile.mimetype),
      altText: metadata?.altText,
      description: metadata?.description,
      isFeatured: metadata?.isFeatured || false,
      sortOrder: metadata?.sortOrder || 0,
      dimensions: processedFile.dimensions ? JSON.stringify(processedFile.dimensions) : null,
      thumbnails: processedFile.thumbnails ? JSON.stringify(processedFile.thumbnails) : null,
      uploadedBy,
      uploadedAt: new Date()
    };

    return EventMedia.create(mediaData);
  }

  /**
   * Determina el tipo de medio basado en el mimetype
   */
  private getMediaType(mimetype: string): 'image' | 'video' | 'document' | 'audio' | 'other' {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype === 'application/pdf') return 'document';
    return 'other';
  }

  /**
   * Elimina un archivo del sistema de archivos
   */
  async deleteFile(filename: string): Promise<void> {
    try {
      const filePath = path.join(this.config.destination, filename);
      await fs.unlink(filePath);

      // Eliminar thumbnails si existen
      const baseName = path.parse(filename).name;
      for (const size of Object.keys(this.config.thumbnailSizes)) {
        const thumbnailPath = path.join(this.config.destination, `${baseName}_${size}.jpg`);
        try {
          await fs.unlink(thumbnailPath);
        } catch {
          // Ignorar si el thumbnail no existe
        }
      }
    } catch (error) {
      logger.error(`Error deleting file ${filename}:`, error);
      throw error;
    }
  }

  /**
   * Valida archivos antes de procesar
   */
  validateFiles(files: Express.Multer.File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const file of files) {
      // Validar tamaño
      if (file.size > this.config.maxFileSize) {
        errors.push(`Archivo ${file.originalname} excede el tamaño máximo permitido`);
      }

      // Validar tipo
      if (!this.config.allowedTypes.includes(file.mimetype)) {
        errors.push(`Tipo de archivo no permitido para ${file.originalname}: ${file.mimetype}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Middleware para subida múltiple de archivos
   */
  uploadMultiple(fieldName: string, maxCount: number = 10) {
    return this.multerConfig.array(fieldName, maxCount);
  }

  /**
   * Middleware para subida de archivo único
   */
  uploadSingle(fieldName: string) {
    return this.multerConfig.single(fieldName);
  }

  /**
   * Middleware para subida de campos mixtos
   */
  uploadFields(fields: multer.Field[]) {
    return this.multerConfig.fields(fields);
  }
}

export const uploadService = new UploadService();
