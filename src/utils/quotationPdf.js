import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { companyService } from '../services';

// Logo en base64 (se cargará dinámicamente)
let logoBase64 = null;

// Cargar logo al iniciar
async function loadLogo() {
  try {
    const response = await fetch('/LOGOS-CLASSIC-CARS (2).png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
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

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  let yPos = 10;

  // Generar número de cotización
  const year = new Date().getFullYear();
  const quoteNum = quotationNumber || Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const quotationId = `${quoteNum}/${year}`;

  // ===================== ENCABEZADO CON LOGO =====================
  // Logo a la izquierda
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, yPos, 35, 30);
    } catch (e) {
      console.warn('Error agregando logo:', e);
    }
  }

  // Título a la derecha del logo
  doc.setFillColor(0, 0, 0);
  doc.rect(margin + 40, yPos, pageWidth - margin * 2 - 40, 22, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('COTIZACIÓN N°', margin + 42 + (pageWidth - margin * 2 - 44) / 2, yPos + 9, { align: 'center' });
  doc.setFontSize(16);
  doc.text(quotationId, margin + 42 + (pageWidth - margin * 2 - 44) / 2, yPos + 18, { align: 'center' });
  
  yPos += 25;

  // Fecha y ciudad
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const today = new Date().toLocaleDateString('es-BO', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).toUpperCase();
  doc.text(`${company.city}, ${today}`, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 5;

  // Nombre de empresa y slogan
  doc.setFillColor(80, 80, 80);
  doc.rect(margin, yPos, pageWidth - margin * 2, 10, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(company.shortName || company.name, pageWidth / 2, yPos + 4, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(company.slogan || '', pageWidth / 2, yPos + 8, { align: 'center' });
  
  yPos += 13;

  // ===================== DATOS DE LA EMPRESA =====================
  drawSectionHeader(doc, 'DATOS DE LA EMPRESA', margin, yPos, pageWidth);
  yPos += 6;

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', fillColor: [245, 245, 245] },
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
  yPos += 6;

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 42, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 'auto' }
    },
    body: [
      ['NOMBRES Y APELLIDOS:', data.client?.name || 'No especificado'],
      ['TELÉFONO:', data.client?.phone || 'No especificado'],
      ['FECHA PARA LA RESERVA', data.service?.date || 'Por confirmar']
    ]
  });

  yPos = doc.lastAutoTable.finalY + 3;

  // ===================== DATOS DEL VEHÍCULO =====================
  drawSectionHeader(doc, 'DATOS DEL VEHÍCULO', margin, yPos, pageWidth);
  yPos += 6;

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: 'bold', fillColor: [245, 245, 245] },
      1: { cellWidth: 45 },
      2: { cellWidth: 28, fontStyle: 'bold', fillColor: [245, 245, 245] },
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
  yPos += 6;

  const hours = calculateHours(data.service?.startTime, data.service?.endTime);
  
  // Formatear fecha del servicio: "07 de febrero de 2026"
  const formattedServiceDate = formatDateSpanish(data.service?.date);

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 52, fontStyle: 'bold', fillColor: [245, 245, 245] },
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
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 52, fontStyle: 'bold', fillColor: [255, 200, 100], textColor: [0, 0, 0] },
      1: { cellWidth: 'auto', fontStyle: 'bold', fillColor: [255, 200, 100], textColor: [0, 0, 0] }
    },
    body: [
      ['TOTAL', `Bs. ${data.service?.amount || 0}`]
    ]
  });

  yPos = doc.lastAutoTable.finalY + 1;

  // Validez
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text(`VALIDEZ DE LA OFERTA ${company.quotationValidityDays || 2} DÍAS`, margin, yPos + 3);
  
  yPos += 6;

  // ===================== CONDICIONES DEL SERVICIO =====================
  drawSectionHeader(doc, 'CONDICIONES DEL SERVICIO', margin, yPos, pageWidth);
  yPos += 7;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  const conditions = company.serviceConditions || [];
  doc.setDrawColor(200, 200, 200);
  const condHeight = conditions.length * 4 + 4;
  doc.rect(margin, yPos, pageWidth - margin * 2, condHeight);
  
  yPos += 3;
  conditions.forEach((condition, index) => {
    doc.text(`- ${condition}`, margin + 2, yPos + (index * 4));
  });
  
  yPos += condHeight + 3;

  // ===================== FORMA DE PAGO =====================
  drawSectionHeader(doc, 'FORMA DE PAGO', margin, yPos, pageWidth);
  yPos += 6;

  const paymentBody = (company.paymentMethods || []).map(method => [
    `☐ ${method.label}`,
    method.info || '-'
  ]);

  autoTable(doc, {
    startY: yPos,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 1.5 },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 'auto' }
    },
    body: paymentBody
  });

  yPos = doc.lastAutoTable.finalY + 3;

  // ===================== OBSERVACIONES =====================
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPos, pageWidth - margin * 2, 12);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('OBSERVACIONES:', margin + 2, yPos + 4);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  
  if (data.observations) {
    const obsLines = doc.splitTextToSize(data.observations, pageWidth - margin * 2 - 4);
    doc.text(obsLines, margin + 2, yPos + 8);
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
  doc.rect(margin, yPos, pageWidth - margin * 2, 5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, yPos + 3.5, { align: 'center' });
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
