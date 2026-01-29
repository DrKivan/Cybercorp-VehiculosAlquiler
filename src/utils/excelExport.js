import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { supabase } from '../lib/supabase';

/**
 * Obtener años y meses con registros
 */
export const getAvailablePeriodsFromRentals = (rentals) => {
  const periods = {};
  const currentYear = new Date().getFullYear();
  
  rentals.forEach(r => {
    if (!r.date) return;
    const [year, month] = r.date.split('-').map(Number);
    if (!periods[year]) {
      periods[year] = new Set();
    }
    periods[year].add(month);
  });

  const result = {};
  Object.keys(periods).forEach(year => {
    result[year] = Array.from(periods[year]).sort((a, b) => a - b);
  });

  if (!result[currentYear]) {
    result[currentYear] = [];
  }

  return result;
};

/**
 * Nombres de los meses en español
 */
export const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Filtrar rentals por año y mes
 */
export const filterRentalsByPeriod = (rentals, year, month = null) => {
  return rentals.filter(r => {
    if (!r.date) return false;
    const [rYear, rMonth] = r.date.split('-').map(Number);
    
    if (year && rYear !== year) return false;
    if (month && rMonth !== month) return false;
    
    return true;
  });
};

/**
 * Obtener todos los pagos de la base de datos
 */
const getAllPayments = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (error) throw error;
  return data || [];
};

/**
 * Formatear fecha en español
 */
const formatDateSpanish = (date) => {
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return date.toLocaleDateString('es-ES', options);
};

/**
 * Colores del tema empresarial
 */
const COLORS = {
  primary: 'FF1E3A5F',      // Azul oscuro
  secondary: 'FF2E7D32',    // Verde
  accent: 'FFFF6F00',       // Naranja
  danger: 'FFC62828',       // Rojo
  light: 'FFF5F5F5',        // Gris claro
  white: 'FFFFFFFF',
  black: 'FF000000',
  gold: 'FFFFD700',
  headerBg: 'FF1E3A5F',
  headerText: 'FFFFFFFF',
  altRow: 'FFF8F9FA',
  success: 'FF4CAF50',
  warning: 'FFFFC107',
  paid: 'FFE8F5E9',
  pending: 'FFFFEBEE',
};

/**
 * Estilo para celdas de encabezado
 */
const headerStyle = {
  font: { name: 'Calibri', bold: true, color: { argb: COLORS.headerText }, size: 11 },
  fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.headerBg } },
  alignment: { horizontal: 'center', vertical: 'middle', wrapText: true },
  border: {
    top: { style: 'thin', color: { argb: COLORS.black } },
    left: { style: 'thin', color: { argb: COLORS.black } },
    bottom: { style: 'thin', color: { argb: COLORS.black } },
    right: { style: 'thin', color: { argb: COLORS.black } }
  }
};

/**
 * Estilo para celdas de datos
 */
const dataStyle = {
  alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
  border: {
    top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
    right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
  }
};

/**
 * Generar URL de Google Maps
 */
const getMapsUrl = (coords) => {
  if (!coords || !coords.lat || !coords.lng) return null;
  return `https://www.google.com/maps?q=${coords.lat},${coords.lng}`;
};

/**
 * Servicio Profesional de Exportación a Excel con ExcelJS
 * Genera reportes empresariales con colores, estilos e hipervínculos
 */
export const exportRentalsToExcel = async (rentals, clients, vehicles, drivers = [], year = null, month = null) => {
  try {
    // Filtrar por período
    let filteredRentals = rentals;
    if (year) {
      filteredRentals = filterRentalsByPeriod(rentals, year, month);
    }

    if (filteredRentals.length === 0) {
      alert('No hay registros para exportar en el período seleccionado');
      return;
    }

    // Obtener pagos
    const allPayments = await getAllPayments();
    const paymentsByRental = {};
    allPayments.forEach(p => {
      if (!paymentsByRental[p.rental_id]) {
        paymentsByRental[p.rental_id] = [];
      }
      paymentsByRental[p.rental_id].push(p);
    });

    // Calcular totales
    let totalMonto = 0;
    let totalPagado = 0;
    let totalPendiente = 0;
    let contratosPagados = 0;
    let contratosPendientes = 0;

    // Crear workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Fenix Cars';
    workbook.created = new Date();
    
    // Fuente por defecto: Calibri
    const defaultFont = { name: 'Calibri', size: 11 };

    // Título del período
    let periodoTitulo = 'General';
    if (month && year) {
      periodoTitulo = `${MONTH_NAMES[month]} ${year}`;
    } else if (year) {
      periodoTitulo = `Año ${year}`;
    }

    // ========== HOJA 1: REPORTE PRINCIPAL ==========
    const ws = workbook.addWorksheet('Reporte Principal', {
      properties: { tabColor: { argb: COLORS.primary } }
    });

    // Logo / Título empresa (fila 1-2)
    ws.mergeCells('A1:U2');
    const titleCell = ws.getCell('A1');
    titleCell.value = '🚗  FENIX CARS';
    titleCell.font = { name: 'Calibri', bold: true, size: 28, color: { argb: COLORS.primary } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.gold } };
    ws.getRow(1).height = 45;

    // Subtítulo (fila 3)
    ws.mergeCells('A3:U3');
    const subtitleCell = ws.getCell('A3');
    subtitleCell.value = `REPORTE DE ALQUILERES DE VEHÍCULOS - ${periodoTitulo.toUpperCase()}`;
    subtitleCell.font = { name: 'Calibri', bold: true, size: 14, color: { argb: COLORS.white } };
    subtitleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    subtitleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
    ws.getRow(3).height = 30;

    // Fecha generación (fila 4)
    ws.mergeCells('A4:U4');
    const dateCell = ws.getCell('A4');
    dateCell.value = `📅 Generado el: ${formatDateSpanish(new Date())}`;
    dateCell.font = { name: 'Calibri', italic: true, size: 10, color: { argb: 'FF666666' } };
    dateCell.alignment = { horizontal: 'center', vertical: 'middle' };
    dateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } };

    // Fila vacía
    ws.getRow(5).height = 10;

    // Preparar datos y calcular totales
    const dataRows = filteredRentals.map(r => {
      const client = clients.find(c => c.id === r.clientId) || {};
      const vehicle = vehicles.find(v => v.id === r.vehicleId) || {};
      const driver = drivers.find(d => d.id === r.driverId) || {};
      const payments = paymentsByRental[r.id] || [];
      
      const totalPaidForRental = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const pendingForRental = (r.amount || 0) - totalPaidForRental;
      
      totalMonto += parseFloat(r.amount || 0);
      totalPagado += totalPaidForRental;
      totalPendiente += pendingForRental > 0 ? pendingForRental : 0;
      
      if (pendingForRental <= 0) contratosPagados++;
      else contratosPendientes++;
      
      const pagosDetalle = payments.length > 0 
        ? payments.map(p => {
            const fecha = p.payment_date || p.created_at?.split('T')[0] || '-';
            const tipo = p.payment_type_label || p.payment_type || '-';
            return `${fecha}: Bs ${parseFloat(p.amount).toFixed(2)} (${tipo})`;
          }).join(' | ')
        : 'Sin pagos';
      
      const vehicleName = vehicle.brand && vehicle.model 
        ? `${vehicle.brand} ${vehicle.model}` 
        : 'Desconocido';

      return {
        id: r.id,
        status: r.status === 'rented' ? 'EN CURSO' : r.status === 'reserved' ? 'RESERVADO' : 'FINALIZADO',
        date: r.date,
        startTime: r.startTime || '-',
        endTime: r.endTime || '-',
        clientName: client.name || 'Desconocido',
        clientPhone: client.phone || '-',
        vehicleName,
        plate: vehicle.plate || '-',
        category: r.category || 'General',
        eventName: r.eventName || '-',
        pickup: r.pickupLocation || '-',
        destination: r.destinationLocation || '-',
        pickupUrl: getMapsUrl(r.pickupCoords),
        destinationUrl: getMapsUrl(r.destinationCoords),
        driver: driver.name || 'Sin asignar',
        amount: parseFloat(r.amount || 0),
        totalPaid: totalPaidForRental,
        pending: pendingForRental > 0 ? pendingForRental : 0,
        paymentStatus: pendingForRental <= 0 ? 'PAGADO' : 'PENDIENTE',
        paymentsDetail: pagosDetalle
      };
    });

    // Resumen ejecutivo (filas 6-9)
    ws.mergeCells('A6:G6');
    ws.getCell('A6').value = '📊 RESUMEN EJECUTIVO';
    ws.getCell('A6').font = { name: 'Calibri', bold: true, size: 12, color: { argb: COLORS.white } };
    ws.getCell('A6').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.secondary } };
    ws.getCell('A6').alignment = { horizontal: 'center', vertical: 'middle' };

    // Datos del resumen en formato tarjetas
    const summaryData = [
      ['📋 Total Contratos', filteredRentals.length, '✅ Pagados', contratosPagados, '⏳ Con Saldo', contratosPendientes, ''],
      ['💰 Ingresos Totales', `Bs ${totalMonto.toFixed(2)}`, '💵 Recaudado', `Bs ${totalPagado.toFixed(2)}`, '📌 Pendiente', `Bs ${totalPendiente.toFixed(2)}`, '']
    ];

    summaryData.forEach((row, idx) => {
      const rowNum = 7 + idx;
      row.forEach((val, colIdx) => {
        const cell = ws.getCell(rowNum, colIdx + 1);
        cell.value = val;
        if (colIdx % 2 === 0) {
          cell.font = { name: 'Calibri', bold: true, size: 10, color: { argb: 'FF555555' } };
        } else {
          cell.font = { name: 'Calibri', bold: true, size: 11, color: { argb: COLORS.primary } };
        }
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.light } };
      });
    });

    ws.getRow(9).height = 10;

    // Headers de la tabla (fila 10)
    const headers = [
      'N°', 'Estado', 'Fecha', 'Inicio', 'Fin', 'Cliente', 'Teléfono',
      'Vehículo', 'Placa', 'Categoría', 'Evento', 'Recogida', 'GPS Recogida',
      'Destino', 'GPS Destino', 'Chofer', 'Monto (Bs)', 'Pagado (Bs)', 
      'Pendiente (Bs)', 'Estado Pago', 'Detalle Pagos'
    ];

    const headerRow = ws.getRow(10);
    headers.forEach((header, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = header;
      Object.assign(cell, headerStyle);
    });
    headerRow.height = 35;

    // Datos de la tabla
    dataRows.forEach((data, rowIdx) => {
      const rowNum = 11 + rowIdx;
      const row = ws.getRow(rowNum);
      const isAltRow = rowIdx % 2 === 1;
      const isPaid = data.paymentStatus === 'PAGADO';
      
      const values = [
        data.id, data.status, data.date, data.startTime, data.endTime,
        data.clientName, data.clientPhone, data.vehicleName, data.plate,
        data.category, data.eventName, data.pickup, 
        data.pickupUrl ? '📍 Ver Mapa' : '-',
        data.destination,
        data.destinationUrl ? '📍 Ver Mapa' : '-',
        data.driver, data.amount.toFixed(2), data.totalPaid.toFixed(2),
        data.pending.toFixed(2), data.paymentStatus, data.paymentsDetail
      ];

      values.forEach((val, colIdx) => {
        const cell = row.getCell(colIdx + 1);
        cell.value = val;
        
        // Estilo base
        cell.font = { name: 'Calibri', size: 11 };
        cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
        cell.border = dataStyle.border;
        
        // Color de fondo alternado o por estado de pago
        if (colIdx === 19) { // Estado Pago
          cell.fill = { 
            type: 'pattern', 
            pattern: 'solid', 
            fgColor: { argb: isPaid ? COLORS.paid : COLORS.pending } 
          };
          cell.font = { name: 'Calibri', bold: true, color: { argb: isPaid ? COLORS.secondary : COLORS.danger } };
        } else if (isAltRow) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.altRow } };
        }

        // Columnas numéricas centradas
        if ([0, 16, 17, 18].includes(colIdx)) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        }

        // Hipervínculos GPS
        if (colIdx === 12 && data.pickupUrl) {
          cell.value = { text: '📍 Ver Mapa', hyperlink: data.pickupUrl };
          cell.font = { name: 'Calibri', color: { argb: 'FF0066CC' }, underline: true };
        }
        if (colIdx === 14 && data.destinationUrl) {
          cell.value = { text: '📍 Ver Mapa', hyperlink: data.destinationUrl };
          cell.font = { name: 'Calibri', color: { argb: 'FF0066CC' }, underline: true };
        }
      });
      
      row.height = 25;
    });

    // Fila de totales
    const totalRowNum = 11 + dataRows.length;
    ws.mergeCells(`A${totalRowNum}:P${totalRowNum}`);
    ws.getCell(`A${totalRowNum}`).value = 'TOTALES';
    ws.getCell(`A${totalRowNum}`).alignment = { horizontal: 'right', vertical: 'middle' };
    ws.getCell(`A${totalRowNum}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
    ws.getCell(`A${totalRowNum}`).font = { name: 'Calibri', bold: true, color: { argb: COLORS.white } };

    ['Q', 'R', 'S'].forEach((col, idx) => {
      const cell = ws.getCell(`${col}${totalRowNum}`);
      const values = [totalMonto, totalPagado, totalPendiente];
      cell.value = `Bs ${values[idx].toFixed(2)}`;
      cell.font = { name: 'Calibri', bold: true, color: { argb: COLORS.white } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Ajustar anchos de columna
    ws.columns = [
      { width: 6 },   // N°
      { width: 12 },  // Estado
      { width: 12 },  // Fecha
      { width: 8 },   // Inicio
      { width: 8 },   // Fin
      { width: 22 },  // Cliente
      { width: 14 },  // Teléfono
      { width: 20 },  // Vehículo
      { width: 10 },  // Placa
      { width: 14 },  // Categoría
      { width: 18 },  // Evento
      { width: 22 },  // Recogida
      { width: 12 },  // GPS Recogida
      { width: 22 },  // Destino
      { width: 12 },  // GPS Destino
      { width: 16 },  // Chofer
      { width: 12 },  // Monto
      { width: 12 },  // Pagado
      { width: 12 },  // Pendiente
      { width: 12 },  // Estado Pago
      { width: 45 },  // Detalle Pagos
    ];

    // ========== HOJA 2: DETALLE DE PAGOS ==========
    const wsPayments = workbook.addWorksheet('Detalle Pagos', {
      properties: { tabColor: { argb: COLORS.secondary } }
    });

    // Título
    wsPayments.mergeCells('A1:H1');
    wsPayments.getCell('A1').value = '💳 FENIX CARS - DETALLE DE PAGOS';
    wsPayments.getCell('A1').font = { name: 'Calibri', bold: true, size: 18, color: { argb: COLORS.white } };
    wsPayments.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.secondary } };
    wsPayments.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    wsPayments.getRow(1).height = 35;

    wsPayments.mergeCells('A2:H2');
    wsPayments.getCell('A2').value = `Período: ${periodoTitulo} | Generado: ${formatDateSpanish(new Date())}`;
    wsPayments.getCell('A2').font = { name: 'Calibri', italic: true, size: 10 };
    wsPayments.getCell('A2').alignment = { horizontal: 'center' };

    // Headers
    const paymentHeaders = ['N° Alquiler', 'Cliente', 'Vehículo', 'Fecha Pago', 'Monto (Bs)', 'Tipo', 'Referencia', 'Notas'];
    const paymentHeaderRow = wsPayments.getRow(4);
    paymentHeaders.forEach((h, idx) => {
      const cell = paymentHeaderRow.getCell(idx + 1);
      cell.value = h;
      Object.assign(cell, headerStyle);
    });

    // Datos de pagos
    let paymentRowNum = 5;
    filteredRentals.forEach(r => {
      const client = clients.find(c => c.id === r.clientId) || {};
      const vehicle = vehicles.find(v => v.id === r.vehicleId) || {};
      const payments = paymentsByRental[r.id] || [];
      
      const vehicleName = vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : 'Desconocido';

      payments.forEach(p => {
        const row = wsPayments.getRow(paymentRowNum);
        const isAlt = (paymentRowNum - 5) % 2 === 1;
        
        [
          r.id,
          client.name || 'Desconocido',
          vehicleName,
          p.payment_date || p.created_at?.split('T')[0] || '-',
          parseFloat(p.amount || 0).toFixed(2),
          p.payment_type_label || p.payment_type || '-',
          p.reference || '-',
          p.notes || '-'
        ].forEach((val, idx) => {
          const cell = row.getCell(idx + 1);
          cell.value = val;
          cell.border = dataStyle.border;
          if (isAlt) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.altRow } };
        });
        
        paymentRowNum++;
      });
    });

    // Total
    wsPayments.getCell(`D${paymentRowNum + 1}`).value = 'TOTAL RECAUDADO:';
    wsPayments.getCell(`D${paymentRowNum + 1}`).font = { name: 'Calibri', bold: true };
    wsPayments.getCell(`E${paymentRowNum + 1}`).value = `Bs ${totalPagado.toFixed(2)}`;
    wsPayments.getCell(`E${paymentRowNum + 1}`).font = { name: 'Calibri', bold: true, color: { argb: COLORS.secondary } };

    wsPayments.columns = [
      { width: 12 }, { width: 25 }, { width: 22 }, { width: 14 },
      { width: 14 }, { width: 20 }, { width: 20 }, { width: 30 }
    ];

    // ========== HOJA 3: RESUMEN POR VEHÍCULO ==========
    const wsVehicles = workbook.addWorksheet('Resumen Vehículos', {
      properties: { tabColor: { argb: COLORS.accent } }
    });

    wsVehicles.mergeCells('A1:F1');
    wsVehicles.getCell('A1').value = '🚗 FENIX CARS - RESUMEN POR VEHÍCULO';
    wsVehicles.getCell('A1').font = { name: 'Calibri', bold: true, size: 18, color: { argb: COLORS.white } };
    wsVehicles.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.accent } };
    wsVehicles.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    wsVehicles.getRow(1).height = 35;

    wsVehicles.mergeCells('A2:F2');
    wsVehicles.getCell('A2').value = `Período: ${periodoTitulo}`;
    wsVehicles.getCell('A2').font = { name: 'Calibri', italic: true };
    wsVehicles.getCell('A2').alignment = { horizontal: 'center' };

    const vHeaders = ['Vehículo', 'Placa', 'N° Servicios', 'Monto Total (Bs)', 'Recaudado (Bs)', 'Pendiente (Bs)'];
    const vHeaderRow = wsVehicles.getRow(4);
    vHeaders.forEach((h, idx) => {
      const cell = vHeaderRow.getCell(idx + 1);
      cell.value = h;
      Object.assign(cell, headerStyle);
    });

    // Calcular resumen por vehículo
    const vehicleSummary = {};
    filteredRentals.forEach(r => {
      const vehicle = vehicles.find(v => v.id === r.vehicleId) || {};
      const key = vehicle.plate || 'Sin placa';
      
      if (!vehicleSummary[key]) {
        vehicleSummary[key] = {
          name: vehicle.brand && vehicle.model ? `${vehicle.brand} ${vehicle.model}` : 'Desconocido',
          plate: key,
          count: 0,
          total: 0,
          paid: 0
        };
      }
      
      const payments = paymentsByRental[r.id] || [];
      vehicleSummary[key].count++;
      vehicleSummary[key].total += parseFloat(r.amount || 0);
      vehicleSummary[key].paid += payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    });

    let vRowNum = 5;
    Object.values(vehicleSummary).forEach(v => {
      const row = wsVehicles.getRow(vRowNum);
      const isAlt = (vRowNum - 5) % 2 === 1;
      
      [v.name, v.plate, v.count, v.total.toFixed(2), v.paid.toFixed(2), (v.total - v.paid).toFixed(2)]
        .forEach((val, idx) => {
          const cell = row.getCell(idx + 1);
          cell.value = val;
          cell.border = dataStyle.border;
          if (isAlt) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.altRow } };
          if (idx >= 2) cell.alignment = { horizontal: 'center' };
        });
      vRowNum++;
    });

    // Totales
    const vTotalRow = wsVehicles.getRow(vRowNum + 1);
    ['TOTALES', '', filteredRentals.length, totalMonto.toFixed(2), totalPagado.toFixed(2), totalPendiente.toFixed(2)]
      .forEach((val, idx) => {
        const cell = vTotalRow.getCell(idx + 1);
        cell.value = val;
        cell.font = { bold: true, color: { argb: COLORS.white } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.accent } };
        if (idx >= 2) cell.alignment = { horizontal: 'center' };
      });

    wsVehicles.columns = [
      { width: 25 }, { width: 12 }, { width: 14 }, { width: 18 }, { width: 18 }, { width: 18 }
    ];

    // ========== GENERAR ARCHIVO ==========
    let fileName;
    if (month && year) {
      fileName = `FenixCars_Reporte_${MONTH_NAMES[month]}_${year}.xlsx`;
    } else if (year) {
      fileName = `FenixCars_Reporte_Anual_${year}.xlsx`;
    } else {
      fileName = `FenixCars_Reporte_General_${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), fileName);
    
    return true;
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    alert('Error al generar el reporte: ' + error.message);
    return false;
  }
};
