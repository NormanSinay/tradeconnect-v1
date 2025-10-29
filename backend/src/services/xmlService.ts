/**
 * @fileoverview Servicio de Construcción XML FEL para TradeConnect
 * @version 1.0.0
 * @author TradeConnect Team
 * @description Servicio para construcción de XML según normativa SAT Guatemala
 */

import { create } from 'xmlbuilder2';
import crypto from 'crypto';
import { logger } from '../utils/logger';
import { ApiResponse } from '../types/global.types';

/**
 * Datos del emisor (TradeConnect)
 */
interface IssuerData {
  nit: string;
  name: string;
  address: string;
  municipality: string;
  department: string;
  country: string;
  email?: string;
  phone?: string;
}

/**
 * Datos del receptor (cliente)
 */
interface ReceiverData {
  nit?: string; // Para NIT
  cui?: string; // Para CUI consumidor final
  name: string;
  address: string;
  email?: string;
  phone?: string;
}

/**
 * Detalle de producto/servicio
 */
interface ItemDetail {
  number: number;
  type: 'B' | 'S'; // Bien o Servicio
  quantity: number;
  unit: string;
  description: string;
  unitPrice: number;
  discount: number;
  taxableAmount: number;
}

/**
 * Datos para generar DTE
 */
interface DteData {
  issuer: IssuerData;
  receiver: ReceiverData;
  items: ItemDetail[];
  currency: string;
  exchangeRate?: number;
  paymentType: 'CASH' | 'CARD' | 'TRANSFER' | 'CHECK';
  paymentMethod: string;
  notes?: string;
}

/**
 * Resultado de construcción XML
 */
interface XmlBuildResult {
  xml: string;
  uuid: string;
  hash: string;
  totalTaxable: number;
  totalTax: number;
  total: number;
}

/**
 * Servicio para construcción de XML FEL
 */
export class XmlService {
  private issuerData: IssuerData;

  constructor() {
    // Configuración del emisor (TradeConnect)
    this.issuerData = {
      nit: process.env.FEL_ISSUER_NIT || '12345678-9',
      name: process.env.FEL_ISSUER_NAME || 'TRADECONNECT S.A.',
      address: process.env.FEL_ISSUER_ADDRESS || 'Ciudad de Guatemala',
      municipality: process.env.FEL_ISSUER_MUNICIPALITY || 'Guatemala',
      department: process.env.FEL_ISSUER_DEPARTMENT || 'Guatemala',
      country: process.env.FEL_ISSUER_COUNTRY || 'GT',
      email: process.env.FEL_ISSUER_EMAIL,
      phone: process.env.FEL_ISSUER_PHONE
    };

    logger.info('XML Service initialized', {
      issuer: this.issuerData.name,
      nit: this.issuerData.nit
    });
  }

  /**
   * Construye XML de factura según normativa SAT
   */
  async buildInvoiceXml(data: DteData): Promise<ApiResponse<XmlBuildResult>> {
    try {
      // Generar UUID único
      const uuid = this.generateUUID();

      // Calcular totales
      const totals = this.calculateTotals(data.items);

      // Construir XML
      const xmlObj = {
        'dte:GTDocumento': {
          '@xmlns:dte': 'http://www.sat.gob.gt/dte/fel/0.2.0',
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@Version': '0.4',
          '@xsi:schemaLocation': 'http://www.sat.gob.gt/dte/fel/0.2.0 GT_Documento-0.4.xsd',
          'dte:SAT': {
            '@ClaseDocumento': 'dte',
            'dte:DTE': {
              '@ID': `DatosCertificados-${uuid}`,
              'dte:DatosEmision': {
                '@ID': 'DatosEmision',
                'dte:DatosGenerales': {
                  '@NumeroAcceso': this.generateAccessNumber(),
                  '@FechaHoraEmision': new Date().toISOString(),
                  '@Tipo': 'FACT',
                  '@CodigoMoneda': data.currency
                },
                'dte:Emisor': this.buildIssuerXml(),
                'dte:Receptor': this.buildReceiverXml(data.receiver),
                'dte:Frases': this.buildPhrasesXml(),
                'dte:Items': {
                  'dte:Item': data.items.map(item => this.buildItemXml(item))
                },
                'dte:Totales': this.buildTotalsXml(totals, data.currency)
              }
            }
          }
        }
      };

      // Convertir a XML string
      const xml = create(xmlObj).end({ prettyPrint: true });

      // Generar hash del XML
      const hash = this.generateXmlHash(xml);

      const result: XmlBuildResult = {
        xml,
        uuid,
        hash,
        totalTaxable: totals.taxable,
        totalTax: totals.tax,
        total: totals.total
      };

      logger.info('XML invoice built successfully', {
        uuid,
        items: data.items.length,
        total: totals.total
      });

      return {
        success: true,
        message: 'XML de factura construido exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error building invoice XML', {
        error: error?.message || 'Unknown error',
        itemsCount: data.items.length
      });

      return {
        success: false,
        message: 'Error al construir XML de factura',
        error: 'XML_BUILD_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Construye XML de nota de crédito
   */
  async buildCreditNoteXml(invoiceUuid: string, reason: string, data: DteData): Promise<ApiResponse<XmlBuildResult>> {
    try {
      // Generar UUID único
      const uuid = this.generateUUID();

      // Calcular totales
      const totals = this.calculateTotals(data.items);

      const xmlObj = {
        'dte:GTDocumento': {
          '@xmlns:dte': 'http://www.sat.gob.gt/dte/fel/0.2.0',
          '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
          '@Version': '0.4',
          '@xsi:schemaLocation': 'http://www.sat.gob.gt/dte/fel/0.2.0 GT_Documento-0.4.xsd',
          'dte:SAT': {
            '@ClaseDocumento': 'dte',
            'dte:DTE': {
              '@ID': `DatosCertificados-${uuid}`,
              'dte:DatosEmision': {
                '@ID': 'DatosEmision',
                'dte:DatosGenerales': {
                  '@NumeroAcceso': this.generateAccessNumber(),
                  '@FechaHoraEmision': new Date().toISOString(),
                  '@Tipo': 'NCRE',
                  '@CodigoMoneda': data.currency,
                  '@NumeroDocumentoOrigen': invoiceUuid,
                  '@FechaHoraDocumentoOrigen': new Date().toISOString()
                },
                'dte:Emisor': this.buildIssuerXml(),
                'dte:Receptor': this.buildReceiverXml(data.receiver),
                'dte:Frases': this.buildPhrasesXml(),
                'dte:Items': {
                  'dte:Item': data.items.map(item => this.buildItemXml(item))
                },
                'dte:Totales': this.buildTotalsXml(totals, data.currency)
              }
            }
          }
        }
      };

      const xml = create(xmlObj).end({ prettyPrint: true });
      const hash = this.generateXmlHash(xml);

      const result: XmlBuildResult = {
        xml,
        uuid,
        hash,
        totalTaxable: totals.taxable,
        totalTax: totals.tax,
        total: totals.total
      };

      return {
        success: true,
        message: 'XML de nota de crédito construido exitosamente',
        data: result,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('Error building credit note XML', {
        error: error?.message || 'Unknown error',
        invoiceUuid
      });

      return {
        success: false,
        message: 'Error al construir XML de nota de crédito',
        error: 'XML_BUILD_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Construye sección del emisor en XML
   */
  private buildIssuerXml() {
    return {
      '@CorreoEmisor': this.issuerData.email || '',
      '@NITEmisor': this.issuerData.nit,
      '@NombreComercial': this.issuerData.name,
      '@NombreEmisor': this.issuerData.name,
      'dte:DireccionEmisor': {
        'dte:Direccion': this.issuerData.address,
        'dte:CodigoPostal': '01001',
        'dte:Municipio': this.issuerData.municipality,
        'dte:Departamento': this.issuerData.department,
        'dte:Pais': this.issuerData.country
      }
    };
  }

  /**
   * Construye sección del receptor en XML
   */
  private buildReceiverXml(receiver: ReceiverData) {
    const receptor = {
      '@CorreoReceptor': receiver.email || '',
      '@NombreReceptor': receiver.name,
      'dte:DireccionReceptor': {
        'dte:Direccion': receiver.address,
        'dte:CodigoPostal': '01001',
        'dte:Municipio': 'Guatemala',
        'dte:Departamento': 'Guatemala',
        'dte:Pais': 'GT'
      }
    };

    // Agregar NIT o CUI según corresponda
    if (receiver.nit) {
      (receptor as any)['@NITReceptor'] = receiver.nit;
      (receptor as any)['@TipoEspecial'] = 'CUI'; // Para NIT
    } else if (receiver.cui) {
      (receptor as any)['@IDReceptor'] = receiver.cui;
      (receptor as any)['@TipoEspecial'] = 'CUI'; // Para consumidor final
    }

    return receptor;
  }

  /**
   * Construye frases requeridas por SAT
   */
  private buildPhrasesXml() {
    return {
      'dte:Frase': [
        {
          '@TipoFrase': '1',
          '@CodigoEscenario': '1'
        },
        {
          '@TipoFrase': '2',
          '@CodigoEscenario': '1'
        }
      ]
    };
  }

  /**
   * Construye item en XML
   */
  private buildItemXml(item: ItemDetail) {
    const itemTotal = (item.quantity * item.unitPrice) - item.discount;
    const taxAmount = itemTotal * 0.12; // IVA 12%

    return {
      '@NumeroLinea': item.number,
      '@BienOServicio': item.type,
      '@Cantidad': item.quantity,
      '@UnidadMedida': item.unit,
      '@Descripcion': item.description,
      '@PrecioUnitario': item.unitPrice.toFixed(4),
      '@Precio': itemTotal.toFixed(4),
      '@Descuento': item.discount.toFixed(4),
      'dte:Impuestos': {
        'dte:Impuesto': {
          '@NombreCorto': 'IVA',
          '@CodigoUnidadGravable': '1',
          '@MontoGravable': itemTotal.toFixed(4),
          '@MontoImpuesto': taxAmount.toFixed(4)
        }
      },
      '@Total': (itemTotal + taxAmount).toFixed(4)
    };
  }

  /**
   * Construye sección de totales en XML
   */
  private buildTotalsXml(totals: { taxable: number; tax: number; total: number }, currency: string) {
    return {
      '@TotalSinImpuesto': totals.taxable.toFixed(4),
      '@TotalConImpuesto': totals.total.toFixed(4),
      '@TotalImpuestoIva': totals.tax.toFixed(4),
      '@GranTotal': totals.total.toFixed(4),
      '@Moneda': currency
    };
  }

  /**
   * Calcula totales de la factura
   */
  private calculateTotals(items: ItemDetail[]): { taxable: number; tax: number; total: number } {
    let totalTaxable = 0;
    let totalTax = 0;

    for (const item of items) {
      const itemTotal = (item.quantity * item.unitPrice) - item.discount;
      totalTaxable += itemTotal;
      totalTax += itemTotal * 0.12; // IVA 12%
    }

    const total = totalTaxable + totalTax;

    return {
      taxable: totalTaxable,
      tax: totalTax,
      total
    };
  }

  /**
   * Genera UUID único para DTE
   */
  private generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Genera número de acceso único
   */
  private generateAccessNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${timestamp}${random}`;
  }

  /**
   * Genera hash SHA-256 del XML
   */
  private generateXmlHash(xml: string): string {
    return crypto.createHash('sha256').update(xml).digest('hex');
  }

  /**
   * Valida XML contra esquema XSD (simulado)
   */
  async validateXmlSchema(xml: string): Promise<ApiResponse<boolean>> {
    try {
      // En producción, aquí se haría validación real contra XSD del SAT
      // Por ahora, validación básica de estructura XML

      if (!xml.includes('<dte:GTDocumento')) {
        return {
          success: false,
          message: 'XML no contiene estructura GTDocumento válida',
          data: false,
          timestamp: new Date().toISOString()
        };
      }

      if (!xml.includes('<dte:DTE')) {
        return {
          success: false,
          message: 'XML no contiene elemento DTE',
          data: false,
          timestamp: new Date().toISOString()
        };
      }

      if (!xml.includes('<dte:Emisor')) {
        return {
          success: false,
          message: 'XML no contiene información del emisor',
          data: false,
          timestamp: new Date().toISOString()
        };
      }

      if (!xml.includes('<dte:Receptor')) {
        return {
          success: false,
          message: 'XML no contiene información del receptor',
          data: false,
          timestamp: new Date().toISOString()
        };
      }

      return {
        success: true,
        message: 'XML válido según validación básica',
        data: true,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('XML schema validation error', {
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Error en validación de esquema XML',
        error: 'SCHEMA_VALIDATION_ERROR',
        data: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Firma digitalmente el XML (simulado)
   */
  async signXml(xml: string): Promise<ApiResponse<string>> {
    try {
      // En producción, aquí se implementaría firma digital real con certificado FEL
      // Por ahora, simulamos agregando una firma dummy

      const signedXml = xml.replace(
        '</dte:GTDocumento>',
        `  <dte:Signature xmlns:dte="http://www.sat.gob.gt/dte/fel/0.2.0">
    <!-- Firma digital simulada para desarrollo -->
    <ds:SignedInfo>
      <ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"/>
      <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha256"/>
      <ds:Reference URI="#DatosEmision">
        <ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha256"/>
        <ds:DigestValue>${this.generateXmlHash(xml)}</ds:DigestValue>
      </ds:Reference>
    </ds:SignedInfo>
    <ds:SignatureValue>SIMULATED_SIGNATURE_${Date.now()}</ds:SignatureValue>
  </dte:Signature>
</dte:GTDocumento>`
      );

      return {
        success: true,
        message: 'XML firmado digitalmente (simulado)',
        data: signedXml,
        timestamp: new Date().toISOString()
      };

    } catch (error: any) {
      logger.error('XML signing error', {
        error: error?.message || 'Unknown error'
      });

      return {
        success: false,
        message: 'Error al firmar XML digitalmente',
        error: 'XML_SIGNING_ERROR',
        timestamp: new Date().toISOString()
      };
    }
  }
}

/**
 * Instancia singleton del servicio XML
 */
let xmlServiceInstance: XmlService | null = null;

/**
 * Factory para obtener instancia del servicio XML
 */
export function getXmlService(): XmlService {
  if (!xmlServiceInstance) {
    xmlServiceInstance = new XmlService();
  }

  return xmlServiceInstance;
}

export const xmlService = getXmlService();
