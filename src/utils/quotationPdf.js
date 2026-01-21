import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { companyService } from '../services';

// Logo en base64 (se cargará dinámicamente)
let logoBase64 = null;

// Cargar y comprimir logo al iniciar
async function loadLogo() {
  try {
    const response = await fetch('/LOGOS-CLASSIC-CARS (2).png');
    const blob = await response.blob();
    
    // Crear imagen para obtener dimensiones
    const img = new Image();
    const imageUrl = URL.createObjectURL(blob);
    
    return new Promise((resolve) => {
      img.onload = () => {
        // Crear canvas para comprimir la imagen
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Redimensionar a un tamaño más pequeño para el PDF (max 200px de ancho)
        const maxWidth = 100;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convertir a JPEG con compresión (0.8 = 80% calidad)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        
        URL.revokeObjectURL(imageUrl);
        resolve(compressedBase64);
      };
      img.onerror = () => {
        URL.revokeObjectURL(imageUrl);
        resolve(null);
      };
      img.src = imageUrl;
    });
  } catch (error) {
    console.warn('No se pudo cargar el logo:', error);
    return null;
  }
}

/**
 * Genera un PDF de cotización compacto (1 página)
 */
export const generateQuotationPDF = async (data, quotationNumber = null, companySettings = null) => {
  // Cargar logo si no está cargado
  if (!logoBase64) {
    logoBase64 = await loadLogo();
  }

  // Usar configuración pasada o valores por defecto
  const company = companySettings || {
    name: 'ESTACIÓN DE SERVICIOS AUTOMOTRIZ - FENIX CARS S.R.L',
    shortName: 'VEHÍCULOS CLÁSICOS',
    slogan: '"UN VIAJE AL PASADO"',
    address: 'AV. INTEGRACION ESQUINA CALLE EMAUS, BARRIO MONTECRISTO',
    city: 'TARIJA',
    phones: ['78709338', '71863354'],
    nit: '561367028',
    quotationPrefix: 'COT',
    quotationValidityDays: 2,
    serviceConditions: [
      'El alquiler mínimo es de 2 horas.',
      'Las horas adicionales se cobrarán a razón de Bs. 500 por hora.',
      'No se permite subarrendar el vehículo.',
      'El alquiler del vehículo incluye el conductor.'
    ],
    paymentMethods: [
      { id: 'cash', label: 'Efectivo', info: 'Av. Integración Esq. Emaus' },
      { id: 'bank_transfer', label: 'Transferencia Bancaria', info: 'BNB - CUENTA CORRIENTE - 7000060806' },
      { id: 'qr', label: 'QR', info: 'Solicitar a Administración' },
      { id: 'other', label: 'Otro', info: '' }
    ]
  };

  const doc = new jsPDF({ format: 'letter' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 35;
  let yPos = 10;

  // Generar número de cotización
  const year = new Date().getFullYear();
  const quoteNum = quotationNumber || Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const quotationId = `${quoteNum}/${year}`;

  // ===================== ENCABEZADO CON LOGO =====================
  const logoSize = 22; // Tamaño del logo circular
  const headerHeight = 22; // Altura de la banda negra

  // Fondo negro para todo el encabezado (desde el margen hasta el final)
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, yPos, pageWidth - margin * 2, headerHeight, 'F');
  
  // Logo circular a la izquierda (se dibuja encima de la banda negra)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'JPEG', margin + 2, yPos, logoSize, logoSize);
    } catch (e) {
      console.warn('Error agregando logo:', e);
    }
  }

  // Texto "COTIZACIÓN N°" centrado en la parte derecha de la banda
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const textCenterX = margin + logoSize + ((pageWidth - margin * 2 - logoSize) / 2);
  doc.text('COTIZACIÓN N°', textCenterX, yPos + 8, { align: 'center' });
  
  // Número de cotización debajo
  doc.setFontSize(13);
  doc.text(quotationId, textCenterX, yPos + 16, { align: 'center' });
  
  yPos += headerHeight + 2;

  // Línea separadora fina
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 4;

  // Fecha y ciudad alineada a la derecha
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  const todayDate = new Date();
  const todayFormatted = `${todayDate.getDate()} DE ${['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'][todayDate.getMonth()]} DE ${todayDate.getFullYear()}`;
  doc.text(`${company.city}, ${todayFormatted}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 6;

  // Banda gris con nombre de empresa y slogan
  doc.setFillColor(80, 80, 80);
  doc.rect(margin, yPos, pageWidth - margin * 2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(company.shortName || company.name, pageWidth / 2, yPos + 3, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.text(company.slogan || '', pageWidth / 2, yPos + 6.5, { align: 'center' });
  
  yPos += 10;

  // ===================== DATOS DE LA EMPRESA =====================
  drawSectionHeader(doc, 'DATOS DE LA EMPRESA', margin, yPos, pageWidth);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 'auto' }
    },
    body: [
      ['EMPRESA', company.name],
      ['DIRECCIÓN:', company.address],
      ['TELÉFONO:', (company.phones || []).join(' - ')],
      ['NIT:', `NIT: ${company.nit}`]
    ]
  });
  
  yPos = doc.lastAutoTable.finalY + 3;

  // ===================== DATOS DEL CLIENTE =====================
  drawSectionHeader(doc, 'DATOS DEL CLIENTE', margin, yPos, pageWidth);
  yPos += 5;

  // Formatear fecha de reserva en mayúsculas
  const reservationDate = formatDateSpanishUppercase(data.service?.date);

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 'auto' }
    },
    body: [
      ['NOMBRES Y APELLIDOS:', data.client?.name || 'No especificado'],
      ['TELÉFONO:', data.client?.phone || 'No especificado'],
      ['FECHA PARA LA RESERVA', reservationDate]
    ]
  });

  yPos = doc.lastAutoTable.finalY + 3;

  // ===================== DATOS DEL VEHÍCULO =====================
  drawSectionHeader(doc, 'DATOS DEL VEHÍCULO', margin, yPos, pageWidth);
  yPos += 5;

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 22, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 38 },
      2: { cellWidth: 22, fontStyle: 'bold', fillColor: [245, 245, 245] },
      3: { cellWidth: 'auto' }
    },
    body: [
      ['MARCA:', data.vehicle?.brand || '-', 'MODELO:', data.vehicle?.model || '-'],
      ['TAMAÑO:', data.vehicle?.size || '-', 'PLACA:', data.vehicle?.plate || '-'],
      ['COLOR:', data.vehicle?.color || '-', '', '']
    ]
  });

  yPos = doc.lastAutoTable.finalY + 3;

  // ===================== DETALLE DEL SERVICIO =====================
  drawSectionHeader(doc, 'DETALLE DEL SERVICIO', margin, yPos, pageWidth);
  yPos += 5;

  const hours = calculateHours(data.service?.startTime, data.service?.endTime);
  
  // Formatear fecha del servicio: "07 DE FEBRERO DE 2026"
  const formattedServiceDate = formatDateSpanishUppercase(data.service?.date);

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 'auto' }
    },
    body: [
      ['FECHA DEL SERVICIO:', formattedServiceDate],
      ['HORA DE INICIO DEL SERVICIO:', data.service?.startTime || 'Por confirmar'],
      ['HORA FIN DEL SERVICIO:', data.service?.endTime || 'Por confirmar'],
      ['LUGAR DE INICIO:', data.service?.pickupLocation || 'Por confirmar'],
      ['LUGAR DE DESTINO:', data.service?.destinationLocation || 'Por confirmar'],
      ['COSTO DEL SERVICIO HORA:', `Bs. ${data.service?.baseRate || 0}`],
      ['CANTIDAD DE HORAS:', hours.toString()],
    ]
  });

  // Fila de TOTAL
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold', fillColor: [255, 200, 100], textColor: [0, 0, 0] },
      1: { cellWidth: 'auto', fontStyle: 'bold', fillColor: [255, 200, 100], textColor: [0, 0, 0] }
    },
    body: [
      ['TOTAL', `Bs. ${data.service?.amount || 0}`]
    ]
  });

  yPos = doc.lastAutoTable.finalY + 1;

  // Validez
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'italic');
  doc.text(`VALIDEZ DE LA OFERTA ${company.quotationValidityDays || 2} DÍAS`, margin, yPos + 3);
  
  yPos += 5;

  // ===================== CONDICIONES DEL SERVICIO =====================
  drawSectionHeader(doc, 'CONDICIONES DEL SERVICIO', margin, yPos, pageWidth);
  yPos += 6;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  
  const conditions = company.serviceConditions || [];
  doc.setDrawColor(200, 200, 200);
  const condHeight = conditions.length * 3.5 + 3;
  doc.rect(margin, yPos, pageWidth - margin * 2, condHeight);
  
  yPos += 2;
  conditions.forEach((condition, index) => {
    doc.text(`- ${condition}`, margin + 2, yPos + (index * 3.5));
  });
  
  yPos += condHeight + 2;

  // ===================== FORMA DE PAGO =====================
  drawSectionHeader(doc, 'FORMA DE PAGO', margin, yPos, pageWidth);
  yPos += 5;

  // Crear tabla de métodos de pago con checkboxes dibujados manualmente
  const paymentMethods = company.paymentMethods || [];
  
  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 38 },
      1: { cellWidth: 'auto' }
    },
    body: paymentMethods.map(method => [
      method.label,
      method.info || '-'
    ]),
    didDrawCell: function(data) {
      // Dibujar checkbox cuadrado al inicio de cada fila en la primera columna
      if (data.column.index === 0 && data.section === 'body') {
        const checkboxSize = 2.5;
        const cellX = data.cell.x + 1;
        const cellY = data.cell.y + (data.cell.height / 2) - (checkboxSize / 2);
        
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.rect(cellX, cellY, checkboxSize, checkboxSize);
        
        // Mover el texto para que no se superponga con el checkbox
        // El texto ya fue dibujado, así que redibujamos
      }
    },
    willDrawCell: function(data) {
      // Añadir espacio para el checkbox en la primera columna
      if (data.column.index === 0 && data.section === 'body') {
        data.cell.text = ['     ' + data.cell.text.join('')];
      }
    }
  });

  yPos = doc.lastAutoTable.finalY + 3;

  // ===================== OBSERVACIONES =====================
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, pageWidth - margin * 2, 10);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVACIONES:', margin + 2, yPos + 3);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  
  if (data.observations) {
    const obsLines = doc.splitTextToSize(data.observations, pageWidth - margin * 2 - 4);
    doc.text(obsLines, margin + 2, yPos + 6);
  }

  // ===================== DESCARGAR =====================
  const fileName = `Cotizacion_${quotationId.replace(/\//g, '-')}_${data.client?.name?.replace(/\s+/g, '_') || 'Cliente'}.pdf`;
  doc.save(fileName);
  
  return fileName;
};

/**
 * Dibuja un encabezado de sección
 */
function drawSectionHeader(doc, title, margin, yPos, pageWidth) {
  doc.setFillColor(30, 30, 30);
  doc.rect(margin, yPos, pageWidth - margin * 2, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, yPos + 2.8, { align: 'center' });
}

/**
 * Formatea una fecha al formato español: "07 de febrero de 2026"
 */
function formatDateSpanish(dateStr) {
  if (!dateStr) return 'Por confirmar';
  
  try {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate().toString().padStart(2, '0');
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} de ${month} de ${year}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Formatea una fecha al formato español en mayúsculas: "07 DE FEBRERO DE 2026"
 */
function formatDateSpanishUppercase(dateStr) {
  if (!dateStr) return 'Por confirmar';
  
  try {
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate().toString().padStart(2, '0');
    const months = [
      'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
      'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
    ];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} DE ${month} DE ${year}`;
  } catch (e) {
    return dateStr;
  }
}

/**
 * Calcula las horas entre dos tiempos
 */
function calculateHours(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  
  const diffMinutes = endMinutes - startMinutes;
  return Math.max(0, Math.ceil(diffMinutes / 60));
}

/**
 * Genera cotización desde datos del formulario (sin BD)
 * @param {Object} formData - Datos del formulario
 * @param {Array} clients - Lista de clientes
 * @param {Array} vehicles - Lista de vehículos
 * @param {Array} drivers - Lista de conductores (no se usa en el PDF)
 * @param {string} observations - Observaciones para la cotización
 * @param {Object} companySettings - Configuración de empresa (opcional)
 */
export const generateQuotationFromForm = async (formData, clients, vehicles, drivers, observations = '', companySettings = null) => {
  // Intentar cargar configuración de empresa si no se proporciona
  let company = companySettings;
  if (!company) {
    try {
      company = await companyService.getSettings();
    } catch (error) {
      console.warn('No se pudo cargar configuración de empresa:', error);
    }
  }

  const client = formData.isNewClient 
    ? { name: formData.newClientName, phone: formData.newClientPhone }
    : clients.find(c => c.id === Number(formData.clientId)) || {};
    
  const vehicle = formData.isNewVehicle
    ? { brand: formData.newVehicleBrand, model: formData.newVehicleModel, size: formData.newVehicleSize, color: formData.newVehicleColor, plate: formData.newVehiclePlate }
    : vehicles.find(v => v.id === Number(formData.vehicleId)) || {};

  const data = {
    client: {
      name: client.name,
      phone: client.phone
    },
    vehicle: {
      brand: vehicle.brand,
      model: vehicle.model,
      size: vehicle.size,
      color: vehicle.color,
      plate: vehicle.plate
    },
    service: {
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      pickupLocation: formData.pickupLocation,
      destinationLocation: formData.destinationLocation,
      baseRate: formData.baseRate,
      amount: formData.amount,
      category: formData.category,
      eventName: formData.eventName
    },
    observations: observations
  };

  return generateQuotationPDF(data, null, company);
};

/**
 * Genera cotización desde una renta existente (datos de BD)
 * @param {Object} rental - Datos de la renta
 * @param {Array} clients - Lista de clientes
 * @param {Array} vehicles - Lista de vehículos  
 * @param {Array} drivers - Lista de conductores (no se usa en el PDF)
 * @param {string} observations - Observaciones para la cotización
 * @param {Object} companySettings - Configuración de empresa (opcional)
 */
export const generateQuotationFromRental = async (rental, clients, vehicles, drivers, observations = '', companySettings = null) => {
  // Intentar cargar configuración de empresa si no se proporciona
  let company = companySettings;
  if (!company) {
    try {
      company = await companyService.getSettings();
    } catch (error) {
      console.warn('No se pudo cargar configuración de empresa:', error);
    }
  }

  const client = clients.find(c => c.id === rental.clientId) || {};
  const vehicle = vehicles.find(v => v.id === rental.vehicleId) || {};

  const data = {
    client: {
      name: client.name,
      phone: client.phone
    },
    vehicle: {
      brand: vehicle.brand,
      model: vehicle.model,
      size: vehicle.size,
      color: vehicle.color,
      plate: vehicle.plate
    },
    service: {
      date: rental.date,
      startTime: rental.startTime,
      endTime: rental.endTime,
      pickupLocation: rental.pickupLocation,
      destinationLocation: rental.destinationLocation,
      baseRate: rental.baseRate,
      amount: rental.amount,
      category: rental.category,
      eventName: rental.eventName
    },
    observations: observations
  };

  return generateQuotationPDF(data, rental.id, company);
};

export default {
  generateQuotationPDF,
  generateQuotationFromForm,
  generateQuotationFromRental
};
