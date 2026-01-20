import { supabase } from '../lib/supabase';

/**
 * Servicio para gestionar vehículos en Supabase
 * Campos: brand (marca), model (modelo), size (tamaño), plate (placa)
 */
export const vehicleService = {
  /**
   * Obtener todos los vehículos
   */
  async getAll() {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('brand', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Obtener un vehículo por ID
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crear un nuevo vehículo
   */
  async create(vehicle) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([{
        brand: vehicle.brand,
        model: vehicle.model,
        size: vehicle.size || null,
        color: vehicle.color || null,
        plate: vehicle.plate,
        status: vehicle.status || 'available'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar un vehículo existente
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar un vehículo
   */
  async delete(id) {
    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

export default vehicleService;
