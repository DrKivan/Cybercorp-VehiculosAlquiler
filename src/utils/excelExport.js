import * as XLSX from 'xlsx';

/**
 * Servicio Profesional de Exportación a Excel
 * Genera reportes gerenciales con formato y hojas múltiples si es necesario.
 */
export const exportRentalsToExcel = (rentals, clients, vehicles) => {
  // 1. Preparar Dataset Plano (Flatten Data)
  // Cruzamos los datos relacionales (ID de cliente/vehículo) con sus nombres reales
  const flatData = rentals.map(r => {
    const client = clients.find(c => c.id === r.clientId) || {};
    const vehicle = vehicles.find(v => v.id === r.vehicleId) || {};
    
    // Formatear coordenadas si existen
    const strCoords = r.locationCoords 
        ? `${r.locationCoords.lat}, ${r.locationCoords.lng}` 
        : 'N/A';

    return {
      "ID Contrato": r.id,
      "Estado": r.status === 'rented' ? 'EN CURSO' : r.status === 'reserved' ? 'RESERVADO' : 'FINALIZADO',
      "Fecha": r.date,
      "Hora Inicio": r.startTime || '-',
      "Hora Fin": r.endTime || '-',
      "Cliente": client.name || 'Desconocido',
      "Teléfono": client.phone || '-',
      "Vehículo": vehicle.name || 'Desconocido',
      "Placa": vehicle.plate || '-',
      "Categoría": r.category || 'General',
      "Evento": r.eventName || '-',
      "Ubicación": r.locationText || '-',
      "Coordenadas GPS": strCoords,
      "Chofer ID": r.driverId ? (r.driverId === "1" ? "Carlos Mamani" : "Otro") : "Sin Chofer",
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
    { wch: 30 }, // Ubicacion
    { wch: 20 }, // GPS
    { wch: 15 }, // Chofer
    { wch: 12 }, // Tarifa
    { wch: 12 }, // Total
  ];
  ws['!cols'] = colWidths;

  // 5. Agregar Hoja al Libro
  XLSX.utils.book_append_sheet(wb, ws, "Reporte Operativo");

  // 6. Generar Blob y Descargar
  const fileName = `Reporte_FenixCars_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
