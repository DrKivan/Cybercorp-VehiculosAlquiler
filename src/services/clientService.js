import { supabase } from '../lib/supabase';

/**
 * Servicio para gestionar clientes en Supabase
 */
export const clientService = {
  /**
   * Obtener todos los clientes
   */
  async getAll() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Obtener un cliente por ID
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crear un nuevo cliente
   */
  async create(client) {
    const { data, error } = await supabase
      .from('clients')
      .insert([{
        name: client.name,
        phone: client.phone
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar un cliente existente
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar un cliente
   */
  async delete(id) {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

export default clientService;
