import { useState, useEffect, useCallback } from 'react';
import { 
  clientService, 
  vehicleService, 
  rentalService, 
  categoryService,
  driverService,
  paymentService,
  mapRentalFromSupabase,
  mapPaymentFromSupabase,
  PAYMENT_TYPES
} from '../services';

/**
 * Hook personalizado para gestionar todos los datos con Supabase
 * Reemplaza los datos quemados (mock data) del estado local
 */
export function useSupabaseData() {
  // Estados para los datos
  const [rentals, setRentals] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [drivers, setDrivers] = useState([]);
  
  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Cargar todos los datos iniciales
   */
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [rentalsData, clientsData, vehiclesData, categoriesData, driversData] = await Promise.all([
        rentalService.getAll(),
        clientService.getAll(),
        vehicleService.getAll(),
        categoryService.getAll(),
        driverService.getAll()
      ]);

      // Mapear rentals de snake_case a camelCase
      setRentals(rentalsData.map(mapRentalFromSupabase));
      setClients(clientsData);
      setVehicles(vehiclesData);
      setCategories(categoriesData.map(c => c.name));
      setDrivers(driversData);
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // ==================== OPERACIONES DE CLIENTES ====================
  
  const createClient = async (clientData) => {
    try {
      const newClient = await clientService.create(clientData);
      setClients(prev => [...prev, newClient]);
      return newClient;
    } catch (err) {
      console.error('Error creando cliente:', err);
      throw err;
    }
  };

  const updateClient = async (id, updates) => {
    try {
      const updatedClient = await clientService.update(id, updates);
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
      return updatedClient;
    } catch (err) {
      console.error('Error actualizando cliente:', err);
      throw err;
    }
  };

  const deleteClient = async (id) => {
    try {
      await clientService.delete(id);
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error eliminando cliente:', err);
      throw err;
    }
  };

  // ==================== OPERACIONES DE VEHÍCULOS ====================
  
  const createVehicle = async (vehicleData) => {
    try {
      const newVehicle = await vehicleService.create(vehicleData);
      setVehicles(prev => [...prev, newVehicle]);
      return newVehicle;
    } catch (err) {
      console.error('Error creando vehículo:', err);
      throw err;
    }
  };

  const updateVehicle = async (id, updates) => {
    try {
      const updatedVehicle = await vehicleService.update(id, updates);
      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
      return updatedVehicle;
    } catch (err) {
      console.error('Error actualizando vehículo:', err);
      throw err;
    }
  };

  const deleteVehicle = async (id) => {
    try {
      await vehicleService.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      console.error('Error eliminando vehículo:', err);
      throw err;
    }
  };

  // ==================== OPERACIONES DE ALQUILERES ====================
  
  const createRental = async (rentalData) => {
    try {
      const newRental = await rentalService.create(rentalData);
      const mappedRental = mapRentalFromSupabase(newRental);
      setRentals(prev => [mappedRental, ...prev]);
      return mappedRental;
    } catch (err) {
      console.error('Error creando alquiler:', err);
      throw err;
    }
  };

  const updateRental = async (id, updates) => {
    try {
      const updatedRental = await rentalService.update(id, updates);
      const mappedRental = mapRentalFromSupabase(updatedRental);
      setRentals(prev => prev.map(r => r.id === id ? mappedRental : r));
      return mappedRental;
    } catch (err) {
      console.error('Error actualizando alquiler:', err);
      throw err;
    }
  };

  const deleteRental = async (id) => {
    try {
      await rentalService.delete(id);
      setRentals(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Error eliminando alquiler:', err);
      throw err;
    }
  };

  // ==================== OPERACIONES DE PAGOS ====================
  
  const addPayment = async (rentalId, paymentData) => {
    try {
      // Crear el pago
      await paymentService.create({
        rentalId,
        amount: paymentData.amount,
        paymentType: paymentData.paymentType,
        paymentTypeLabel: paymentData.paymentTypeLabel,
        reference: paymentData.reference,
        notes: paymentData.notes
      });
      
      // Recargar el rental actualizado (el trigger de Supabase actualizará los totales)
      const updatedRental = await rentalService.getById(rentalId);
      const mappedRental = mapRentalFromSupabase(updatedRental);
      setRentals(prev => prev.map(r => r.id === rentalId ? mappedRental : r));
      return mappedRental;
    } catch (err) {
      console.error('Error agregando pago:', err);
      throw err;
    }
  };

  const getPaymentsByRental = async (rentalId) => {
    try {
      const payments = await paymentService.getByRentalId(rentalId);
      return payments.map(mapPaymentFromSupabase);
    } catch (err) {
      console.error('Error obteniendo pagos:', err);
      throw err;
    }
  };

  const deletePayment = async (paymentId, rentalId) => {
    try {
      await paymentService.delete(paymentId);
      // Recargar el rental actualizado
      const updatedRental = await rentalService.getById(rentalId);
      const mappedRental = mapRentalFromSupabase(updatedRental);
      setRentals(prev => prev.map(r => r.id === rentalId ? mappedRental : r));
      return mappedRental;
    } catch (err) {
      console.error('Error eliminando pago:', err);
      throw err;
    }
  };

  // ==================== OPERACIONES DE CATEGORÍAS ====================
  
  const createCategory = async (name) => {
    try {
      const newCategory = await categoryService.create(name);
      setCategories(prev => [...prev, newCategory.name]);
      return newCategory;
    } catch (err) {
      console.error('Error creando categoría:', err);
      throw err;
    }
  };

  // ==================== OPERACIONES DE CONDUCTORES ====================
  
  const createDriver = async (driverData) => {
    try {
      const newDriver = await driverService.create(driverData);
      setDrivers(prev => [...prev, newDriver]);
      return newDriver;
    } catch (err) {
      console.error('Error creando conductor:', err);
      throw err;
    }
  };

  // ==================== HELPERS ====================
  
  const getClientName = (id) => clients.find(c => c.id === id)?.name || "Desconocido";
  
  const getVehicleName = (id) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.brand} ${v.model} (${v.plate})` : "Desconocido";
  };

  const getDriverName = (id) => {
    if (!id) return "Sin Chofer";
    const d = drivers.find(d => d.id === id);
    return d ? d.name : "Desconocido";
  };

  return {
    // Datos
    rentals,
    clients,
    vehicles,
    categories,
    drivers,
    
    // Estado
    loading,
    error,
    
    // Recargar datos
    refresh: loadAllData,
    
    // Operaciones de clientes
    createClient,
    updateClient,
    deleteClient,
    
    // Operaciones de vehículos
    createVehicle,
    updateVehicle,
    deleteVehicle,
    
    // Operaciones de alquileres
    createRental,
    updateRental,
    deleteRental,
    
    // Operaciones de pagos
    addPayment,
    getPaymentsByRental,
    deletePayment,
    PAYMENT_TYPES,
    
    // Operaciones de categorías
    createCategory,
    
    // Operaciones de conductores
    createDriver,
    
    // Helpers
    getClientName,
    getVehicleName,
    getDriverName
  };
}

export default useSupabaseData;
