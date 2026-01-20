/**
 * Configuración de la Empresa (valores por defecto/fallback)
 * Los datos reales se cargan desde la BD (tabla company_settings)
 * Este archivo se usa como fallback si no hay conexión a BD
 */
export const COMPANY_INFO = {
  // Datos principales
  name: 'ESTACIÓN DE SERVICIOS AUTOMOTRIZ - FENIX CARS S.R.L',
  shortName: 'VEHÍCULOS CLÁSICOS',
  slogan: '"UN VIAJE AL PASADO"',
  
  // Contacto
  address: 'AV. INTEGRACION ESQUINA CALLE EMAUS, BARRIO MONTECRISTO',
  city: 'TARIJA',
  phones: ['78709338', '71863354'],
  email: 'fenixcars@gmail.com',
  
  // Datos fiscales
  nit: '561367028',
  
  // Información bancaria para pagos
  bankInfo: {
    bank: 'BNB',
    accountType: 'CUENTA CORRIENTE',
    accountNumber: '7000060806',
    accountHolder: 'FENIX CARS S.R.L'
  },
  
  // Métodos de pago disponibles
  paymentMethods: [
    { id: 'cash', label: 'Efectivo', info: 'Av. Integración Esq. Emaus' },
    { id: 'bank_transfer', label: 'Transferencia Bancaria', info: 'BNB - CUENTA CORRIENTE - 7000060806' },
    { id: 'qr', label: 'QR', info: 'Solicitar a Administración' },
    { id: 'other', label: 'Otro', info: '' }
  ],
  
  // Condiciones del servicio (para cotizaciones)
  serviceConditions: [
    'El alquiler mínimo es de 2 horas.',
    'Las horas adicionales se cobrarán a razón de Bs. 500 por hora.',
    'No se permite subarrendar el vehículo.',
    'El alquiler del vehículo incluye el conductor.'
  ],
  
  // Configuración de cotización
  quotationPrefix: 'COT',
  quotationValidityDays: 2,
  
  // Logo - se carga desde /public/LOGOS-CLASSIC-CARS (2).png
  logo: '/LOGOS-CLASSIC-CARS (2).png',
};

export default COMPANY_INFO;
