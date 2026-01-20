import { supabase } from '../lib/supabase';

/**
 * Servicio para gestionar la configuración de la empresa
 */
export const companyService = {
  /**
   * Obtener la configuración de la empresa
   */
  async getSettings() {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    if (error) throw error;
    return mapCompanyFromSupabase(data);
  },

  /**
   * Actualizar la configuración de la empresa
   */
  async updateSettings(settings) {
    const { data, error } = await supabase
      .from('company_settings')
      .update({
        name: settings.name,
        short_name: settings.shortName,
        slogan: settings.slogan,
        address: settings.address,
        city: settings.city,
        phones: settings.phones,
        email: settings.email,
        nit: settings.nit,
        bank_name: settings.bankName,
        bank_account_type: settings.bankAccountType,
        bank_account_number: settings.bankAccountNumber,
        bank_account_holder: settings.bankAccountHolder,
        quotation_prefix: settings.quotationPrefix,
        quotation_validity_days: settings.quotationValidityDays,
        service_conditions: settings.serviceConditions,
        payment_methods: settings.paymentMethods,
        logo_url: settings.logoUrl
      })
      .eq('id', 1)
      .select()
      .single();

    if (error) throw error;
    return mapCompanyFromSupabase(data);
  }
};

/**
 * Mapear datos de empresa desde Supabase
 */
function mapCompanyFromSupabase(data) {
  if (!data) return null;
  
  return {
    id: data.id,
    name: data.name,
    shortName: data.short_name,
    slogan: data.slogan,
    address: data.address,
    city: data.city,
    phones: data.phones || [],
    email: data.email,
    nit: data.nit,
    bankName: data.bank_name,
    bankAccountType: data.bank_account_type,
    bankAccountNumber: data.bank_account_number,
    bankAccountHolder: data.bank_account_holder,
    quotationPrefix: data.quotation_prefix,
    quotationValidityDays: data.quotation_validity_days,
    serviceConditions: data.service_conditions || [],
    paymentMethods: data.payment_methods || [],
    logoUrl: data.logo_url,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

export default companyService;
