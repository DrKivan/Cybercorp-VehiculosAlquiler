import { supabase } from '../lib/supabase';

/**
 * Servicio para gestionar categorías de eventos en Supabase
 */
export const categoryService = {
  /**
   * Obtener todas las categorías
   */
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data;
  },

  /**
   * Crear una nueva categoría
   */
  async create(name) {
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, is_active: true }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar una categoría existente
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar una categoría
   */
  async delete(id) {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

export default categoryService;
