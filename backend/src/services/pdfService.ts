/**
 * @fileoverview Servicio de Generación de PDFs para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para generar PDFs dinámicos de certificados usando Puppeteer
 *
 * Archivo: backend/src/services/pdfService.ts
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { logger } from '../utils/logger';
import {
  PDFGenerationOptions,
  PDFTemplateData,
  PDFGenerationResult,
  QRCodeOptions,
  QRCodeResult,
  PDFEngineConfig
} from '../types/certificate.types';

/**
 * Servicio para generación de PDFs de certificados
 */
export class PDFService {
  private browser: Browser | null = null;
  private isInitialized = false;

  // Configuración por defecto
  private readonly defaultConfig: PDFEngineConfig = {
    defaultOrientation: 'landscape',
    defaultPageSize: 'A4',
    defaultMargins: {
      top: 20,
      bottom: 20,
      left: 20,
      right: 20
    },
    maxFileSizeMB: 2,
    quality: 'high',
    compressionLevel: 6,
    fonts: {
      primary: 'Arial, sans-serif',
      secondary: 'Times New Roman, serif'
    }
  };

  // ====================================================================
  // INICIALIZACIÓN
  // ====================================================================

  /**
   * Inicializa el servicio de PDFs
   */
  async initialize(): Promise<void> {
    try {
      if (this.isInitialized) return;

      // Iniciar Puppeteer con configuración optimizada
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });

      this.isInitialized = true;
      logger.info('PDF Service initialized successfully');
    } catch (error) {
      logger.error('Error initializing PDF service:', error);
      throw new Error('Failed to initialize PDF service');
    }
  }

  /**
   * Cierra el navegador
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
    }
  }

  // ====================================================================
  // GENERACIÓN DE PDFs
  // ====================================================================

  /**
   * Genera un PDF desde un template HTML
   */
  async generatePDF(templateData: PDFTemplateData): Promise<PDFGenerationResult> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const { html, css, variables, options } = templateData;

      // Procesar template con variables
      const processedHtml = this.processTemplate(html, variables);
      const fullHtml = this.wrapWithCSS(processedHtml, css);

      // Crear página
      const page = await this.browser!.newPage();

      try {
        // Configurar página
        await page.setContent(fullHtml, {
          waitUntil: 'networkidle0',
          timeout: 30000
        });

        // Aplicar opciones de PDF
        const pdfOptions = this.buildPDFOptions(options);

        // Generar PDF
        const uint8Array = await page.pdf(pdfOptions);
        const buffer = Buffer.from(uint8Array);

        // Calcular hash
        const hash = crypto.createHash('sha256').update(buffer).digest('hex');

        // Verificar tamaño máximo
        const maxSizeBytes = this.defaultConfig.maxFileSizeMB * 1024 * 1024;
        if (buffer.length > maxSizeBytes) {
          throw new Error(`PDF size (${buffer.length} bytes) exceeds maximum allowed size (${maxSizeBytes} bytes)`);
        }

        // Obtener número de páginas (aproximado)
        const pages = Math.ceil(buffer.length / (1024 * 50)); // Estimación aproximada

        const result: PDFGenerationResult = {
          buffer,
          hash,
          size: buffer.length,
          pages,
          metadata: {
            format: pdfOptions.format || 'A4',
            orientation: pdfOptions.landscape ? 'landscape' : 'portrait',
            generatedAt: new Date(),
            generator: 'Puppeteer'
          }
        };

        logger.info('PDF generated successfully', {
          hash: result.hash,
          size: result.size,
          pages: result.pages
        });

        return result;

      } finally {
        await page.close();
      }

    } catch (error) {
      logger.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Genera múltiples PDFs en lote
   */
  async generatePDFsBatch(templates: PDFTemplateData[]): Promise<PDFGenerationResult[]> {
    const results: PDFGenerationResult[] = [];

    for (const template of templates) {
      try {
        const result = await this.generatePDF(template);
        results.push(result);
      } catch (error) {
        logger.error('Error generating PDF in batch:', error);
        // Continuar con el siguiente
      }
    }

    return results;
  }

  // ====================================================================
  // GENERACIÓN DE CÓDIGOS QR
  // ====================================================================

  /**
   * Genera un código QR
   */
  async generateQRCode(data: string, options?: QRCodeOptions): Promise<QRCodeResult> {
    try {
      const qrOptions = {
        errorCorrectionLevel: options?.errorCorrectionLevel || 'H',
        type: 'image/png' as const,
        quality: 0.92,
        margin: options?.margin || 4,
        color: {
          dark: options?.color?.dark || '#000000',
          light: options?.color?.light || '#FFFFFF'
        },
        width: options?.size || 256
      };

      // Generar QR como data URL
      const dataURL = await QRCode.toDataURL(data, qrOptions);

      // Calcular hash del contenido
      const base64Data = dataURL.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      const hash = crypto.createHash('sha256').update(buffer).digest('hex');

      const result: QRCodeResult = {
        dataURL,
        hash,
        size: buffer.length
      };

      logger.info('QR Code generated successfully', { hash: result.hash, size: result.size });

      return result;

    } catch (error) {
      logger.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Genera múltiples códigos QR en lote
   */
  async generateQRCodesBatch(dataArray: string[], options?: QRCodeOptions): Promise<QRCodeResult[]> {
    const results: QRCodeResult[] = [];

    for (const data of dataArray) {
      try {
        const result = await this.generateQRCode(data, options);
        results.push(result);
      } catch (error) {
        logger.error('Error generating QR code in batch:', error);
        // Continuar con el siguiente
      }
    }

    return results;
  }

  // ====================================================================
  // UTILIDADES DE TEMPLATE
  // ====================================================================

  /**
   * Procesa un template HTML reemplazando variables
   */
  private processTemplate(html: string, variables: Record<string, any>): string {
    let processedHtml = html;

    // Reemplazar variables simples {{variable}}
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedHtml = processedHtml.replace(regex, this.escapeHtml(String(value)));
    }

    // Reemplazar variables anidadas {{objeto.propiedad}}
    for (const [key, value] of Object.entries(variables)) {
      if (typeof value === 'object' && value !== null) {
        for (const [subKey, subValue] of Object.entries(value)) {
          const regex = new RegExp(`{{${key}\\.${subKey}}}`, 'g');
          processedHtml = processedHtml.replace(regex, this.escapeHtml(String(subValue)));
        }
      }
    }

    return processedHtml;
  }

  /**
   * Envuelve HTML con estilos CSS
   */
  private wrapWithCSS(html: string, css?: string): string {
    const defaultCSS = `
      @page {
        size: A4 landscape;
        margin: 20mm;
      }
      body {
        font-family: ${this.defaultConfig.fonts.primary};
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        color-adjust: exact;
      }
      .certificate-container {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }
      .qr-code {
        max-width: 150px;
        max-height: 150px;
      }
    `;

    const fullCSS = css ? `${defaultCSS}\n${css}` : defaultCSS;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>${fullCSS}</style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;
  }

  /**
   * Construye opciones de PDF para Puppeteer
   */
  private buildPDFOptions(options?: PDFGenerationOptions): any {
    const defaultOptions = {
      format: 'A4' as const,
      landscape: this.defaultConfig.defaultOrientation === 'landscape',
      printBackground: true,
      margin: this.defaultConfig.defaultMargins,
      preferCSSPageSize: false
    };

    if (!options) return defaultOptions;

    return {
      ...defaultOptions,
      format: options.format || defaultOptions.format,
      landscape: options.orientation === 'landscape',
      printBackground: options.printBackground !== undefined ? options.printBackground : defaultOptions.printBackground,
      margin: options.margin || defaultOptions.margin,
      preferCSSPageSize: options.preferCSSPageSize || defaultOptions.preferCSSPageSize,
      width: options.width,
      height: options.height,
      scale: options.scale,
      displayHeaderFooter: options.displayHeaderFooter,
      headerTemplate: options.headerTemplate,
      footerTemplate: options.footerTemplate,
      pageRanges: options.pageRanges
    };
  }

  /**
   * Escapa caracteres HTML
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      "'": '&#039;'
    };

    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  // ====================================================================
  // VALIDACIONES Y UTILIDADES
  // ====================================================================

  /**
   * Valida el tamaño de un buffer PDF
   */
  validatePDFSize(buffer: Buffer): boolean {
    const maxSizeBytes = this.defaultConfig.maxFileSizeMB * 1024 * 1024;
    return buffer.length <= maxSizeBytes;
  }

  /**
   * Obtiene información del PDF generado
   */
  getPDFInfo(buffer: Buffer): { size: number; pages: number; hash: string } {
    return {
      size: buffer.length,
      pages: Math.ceil(buffer.length / (1024 * 50)), // Estimación
      hash: crypto.createHash('sha256').update(buffer).digest('hex')
    };
  }

  /**
   * Verifica si el servicio está inicializado
   */
  isReady(): boolean {
    return this.isInitialized && this.browser !== null;
  }

  /**
   * Obtiene estadísticas del servicio
   */
  getStats(): {
    initialized: boolean;
    browserVersion?: string;
    pagesOpen?: number;
  } {
    return {
      initialized: this.isInitialized,
      browserVersion: this.browser ? 'Puppeteer' : undefined,
      pagesOpen: 0 // No podemos obtener esto fácilmente
    };
  }
}

export const pdfService = new PDFService();
