import { supabase } from '../lib/supabase';

/**
 * Servicio para gestionar alquileres/contratos en Supabase
 */
export const rentalService = {
  /**
   * Obtener todos los alquileres con información relacionada
   */
  async getAll() {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        client:clients(id, name, phone),
        vehicle:vehicles(id, brand, model, size, plate)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Obtener un alquiler por ID
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        client:clients(id, name, phone),
        vehicle:vehicles(id, brand, model, size, plate)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crear un nuevo alquiler
   */
  async create(rental) {
    const { data, error } = await supabase
      .from('rentals')
      .insert([{
        client_id: rental.clientId,
        vehicle_id: rental.vehicleId,
        driver_id: rental.driverId || null,
        category: rental.category,
        event_name: rental.eventName,
        date: rental.date,
        start_time: rental.startTime,
        end_time: rental.endTime,
        base_rate: rental.baseRate,
        amount: rental.amount,
        total_paid: 0,
        pending_amount: rental.amount,
        payment_status: 'pending',
        status: rental.status || 'reserved',
        pickup_location: rental.pickupLocation || 'A confirmar',
        destination_location: rental.destinationLocation || 'A confirmar',
        pickup_coords: rental.pickupCoords || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar un alquiler existente
   */
  async update(id, updates) {
    // Mapear nombres de campos de camelCase a snake_case
    const mappedUpdates = {};
    
    if (updates.clientId !== undefined) mappedUpdates.client_id = updates.clientId;
    if (updates.vehicleId !== undefined) mappedUpdates.vehicle_id = updates.vehicleId;
    if (updates.driverId !== undefined) mappedUpdates.driver_id = updates.driverId;
    if (updates.category !== undefined) mappedUpdates.category = updates.category;
    if (updates.eventName !== undefined) mappedUpdates.event_name = updates.eventName;
    if (updates.date !== undefined) mappedUpdates.date = updates.date;
    if (updates.startTime !== undefined) mappedUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) mappedUpdates.end_time = updates.endTime;
    if (updates.baseRate !== undefined) mappedUpdates.base_rate = updates.baseRate;
    if (updates.amount !== undefined) mappedUpdates.amount = updates.amount;
    if (updates.status !== undefined) mappedUpdates.status = updates.status;
    if (updates.pickupLocation !== undefined) mappedUpdates.pickup_location = updates.pickupLocation;
    if (updates.destinationLocation !== undefined) mappedUpdates.destination_location = updates.destinationLocation;
    if (updates.pickupCoords !== undefined) mappedUpdates.pickup_coords = updates.pickupCoords;

    const { data, error } = await supabase
      .from('rentals')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar un alquiler
   */
  async delete(id) {
    const { error } = await supabase
      .from('rentals')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

/**
 * Función auxiliar para convertir datos de Supabase a formato del frontend
 */
export function mapRentalFromSupabase(rental) {
  return {
    id: rental.id,
    clientId: rental.client_id,
    vehicleId: rental.vehicle_id,
    driverId: rental.driver_id,
    category: rental.category,
    eventName: rental.event_name,
    date: rental.date,
    startTime: rental.start_time,
    endTime: rental.end_time,
    baseRate: parseFloat(rental.base_rate),
    amount: parseFloat(rental.amount),
    totalPaid: parseFloat(rental.total_paid || 0),
    pendingAmount: parseFloat(rental.pending_amount || 0),
    paymentStatus: rental.payment_status,
    status: rental.status,
    pickupLocation: rental.pickup_location,
    destinationLocation: rental.destination_location,
    pickupCoords: rental.pickup_coords,
    notes: rental.notes,
    createdAt: rental.created_at,
    // Datos relacionados (si vienen de join)
    client: rental.client,
    vehicle: rental.vehicle
  };
}

export default rentalService;
