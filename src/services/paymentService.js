import { supabase } from '../lib/supabase';

/**
 * Tipos de pago disponibles
 */
export const PAYMENT_TYPES = {
  CASH: { value: 'cash', label: 'Efectivo' },
  BANK_TRANSFER: { value: 'bank_transfer', label: 'Transferencia Bancaria' },
  QR: { value: 'qr', label: 'Pago QR' },
  OTHER: { value: 'other', label: 'Otro' }
};

/**
 * Servicio para gestionar pagos en Supabase
 */
export const paymentService = {
  /**
   * Obtener todos los pagos de un alquiler
   */
  async getByRentalId(rentalId) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('rental_id', rentalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Obtener un pago por ID
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Crear un nuevo pago
   */
  async create(payment) {
    const now = new Date();
    
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        rental_id: payment.rentalId,
        amount: payment.amount,
        payment_type: payment.paymentType,
        payment_type_label: payment.paymentTypeLabel || PAYMENT_TYPES[payment.paymentType.toUpperCase()]?.label || payment.paymentType,
        reference: payment.reference || null,
        notes: payment.notes || null,
        payment_date: payment.paymentDate || now.toISOString().split('T')[0],
        payment_time: payment.paymentTime || now.toTimeString().split(' ')[0],
        created_by: payment.createdBy || null
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Actualizar un pago existente
   */
  async update(id, updates) {
    const mappedUpdates = {};
    
    if (updates.amount !== undefined) mappedUpdates.amount = updates.amount;
    if (updates.paymentType !== undefined) mappedUpdates.payment_type = updates.paymentType;
    if (updates.paymentTypeLabel !== undefined) mappedUpdates.payment_type_label = updates.paymentTypeLabel;
    if (updates.reference !== undefined) mappedUpdates.reference = updates.reference;
    if (updates.notes !== undefined) mappedUpdates.notes = updates.notes;

    const { data, error } = await supabase
      .from('payments')
      .update(mappedUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar un pago
   */
  async delete(id) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  /**
   * Obtener resumen de pagos por alquiler
   */
  async getSummaryByRentalId(rentalId) {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, payment_type')
      .eq('rental_id', rentalId);

    if (error) throw error;

    const total = data.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const byType = data.reduce((acc, p) => {
      acc[p.payment_type] = (acc[p.payment_type] || 0) + parseFloat(p.amount);
      return acc;
    }, {});

    return { total, byType, count: data.length };
  }
};

/**
 * Función auxiliar para mapear pago de Supabase a formato del frontend
 */
export function mapPaymentFromSupabase(payment) {
  return {
    id: payment.id,
    rentalId: payment.rental_id,
    amount: parseFloat(payment.amount),
    paymentType: payment.payment_type,
    paymentTypeLabel: payment.payment_type_label,
    reference: payment.reference,
    notes: payment.notes,
    paymentDate: payment.payment_date,
    paymentTime: payment.payment_time,
    createdAt: payment.created_at,
    createdBy: payment.created_by
  };
}

export default paymentService;
