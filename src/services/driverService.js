import { supabase } from '../lib/supabase';

/**
 * Servicio para gestionar conductores en Supabase
 */
export const driverService = {
  /**
   * Obtener todos los conductores
   */
  async getAll() {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Obtener un conductor por ID
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crear un nuevo conductor
   */
  async create(driver) {
    const { data, error } = await supabase
      .from('drivers')
      .insert([{
        name: driver.name,
        phone: driver.phone,
        license: driver.license,
        status: driver.status || 'available'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar un conductor existente
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('drivers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar un conductor
   */
  async delete(id) {
    const { error } = await supabase
      .from('drivers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

export default driverService;
