import * as XLSX from 'xlsx';

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

  // Convertir Sets a Arrays ordenados
  const result = {};
  Object.keys(periods).forEach(year => {
    result[year] = Array.from(periods[year]).sort((a, b) => a - b);
  });

  // Asegurar que el año actual siempre esté disponible
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
 * Servicio Profesional de Exportación a Excel
 * Genera reportes gerenciales con formato y hojas múltiples si es necesario.
 */
export const exportRentalsToExcel = (rentals, clients, vehicles, drivers = [], year = null, month = null) => {
  // Filtrar por período si se especifica
  let filteredRentals = rentals;
  if (year) {
    filteredRentals = filterRentalsByPeriod(rentals, year, month);
  }

  if (filteredRentals.length === 0) {
    alert('No hay registros para exportar en el período seleccionado');
    return;
  }

  // 1. Preparar Dataset Plano (Flatten Data)
  // Cruzamos los datos relacionales (ID de cliente/vehículo/conductor) con sus nombres reales
  const flatData = filteredRentals.map(r => {
    const client = clients.find(c => c.id === r.clientId) || {};
    const vehicle = vehicles.find(v => v.id === r.vehicleId) || {};
    const driver = drivers.find(d => d.id === r.driverId) || {};
    
    // Generar link de Google Maps si existen coordenadas
    const mapsLink = r.pickupCoords 
        ? `https://www.google.com/maps?q=${r.pickupCoords.lat},${r.pickupCoords.lng}` 
        : 'N/A';
    
    // Formatear nombre completo del vehículo
    const vehicleName = vehicle.brand && vehicle.model 
        ? `${vehicle.brand} ${vehicle.model}` 
        : 'Desconocido';

    return {
      "ID Contrato": r.id,
      "Estado": r.status === 'rented' ? 'EN CURSO' : r.status === 'reserved' ? 'RESERVADO' : 'FINALIZADO',
      "Fecha": r.date,
      "Hora Inicio": r.startTime || '-',
      "Hora Fin": r.endTime || '-',
      "Cliente": client.name || 'Desconocido',
      "Teléfono": client.phone || '-',
      "Vehículo": vehicleName,
      "Placa": vehicle.plate || '-',
      "Categoría": r.category || 'General',
      "Evento": r.eventName || '-',
      "Ubicación Recogida": r.pickupLocation || '-',
      "Ubicación Destino": r.destinationLocation || '-',
      "Link GPS": mapsLink,
      "Chofer": driver.name || 'Sin Chofer',
      "Tarifa Base (S/)": r.baseRate || 0,
      "Total (S/)": r.amount || 0
    };
  });

  // 2. Crear Libro de Trabajo (Workbook)
  const wb = XLSX.utils.book_new();

  // 3. Convertir JSON a Hoja de Cálculo (Worksheet)
  const ws = XLSX.utils.json_to_sheet(flatData);

  // 4. Ajustar Ancho de Columnas (Auto-width cosmético)
  const colWidths = [
    { wch: 10 }, // ID
    { wch: 12 }, // Estado
    { wch: 12 }, // Fecha
    { wch: 10 }, // Hora I
    { wch: 10 }, // Hora F
    { wch: 25 }, // Cliente
    { wch: 12 }, // Telefono
    { wch: 20 }, // Vehiculo
    { wch: 10 }, // Placa
    { wch: 15 }, // Categoria
    { wch: 20 }, // Evento
    { wch: 30 }, // Ubicacion Recogida
    { wch: 30 }, // Ubicacion Destino
    { wch: 25 }, // GPS
    { wch: 15 }, // Chofer
    { wch: 12 }, // Tarifa
    { wch: 12 }, // Total
  ];
  ws['!cols'] = colWidths;

  // 5. Agregar Hoja al Libro
  const sheetName = month 
    ? `${MONTH_NAMES[month]} ${year}` 
    : year 
      ? `Año ${year}` 
      : "Reporte General";
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // 6. Generar nombre del archivo
  let fileName;
  if (month && year) {
    fileName = `Reporte_FenixCars_${MONTH_NAMES[month]}_${year}.xlsx`;
  } else if (year) {
    fileName = `Reporte_FenixCars_${year}.xlsx`;
  } else {
    fileName = `Reporte_FenixCars_General_${new Date().toISOString().split('T')[0]}.xlsx`;
  }
  
  XLSX.writeFile(wb, fileName);
};
