// Exportar todos los servicios desde un punto central
export { clientService } from './clientService';
export { vehicleService } from './vehicleService';
export { rentalService, mapRentalFromSupabase } from './rentalService';
export { categoryService } from './categoryService';
export { driverService } from './driverService';
export { paymentService, mapPaymentFromSupabase, PAYMENT_TYPES } from './paymentService';
