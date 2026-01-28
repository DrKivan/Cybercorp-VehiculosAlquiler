import React from 'react';
import { Card, Button } from '../ui';
import { Icons } from '../Icons';

/**
 * Payment Modal - Complete payment and view transaction history
 */
export const PaymentModal = ({
  rental,
  isOpen,
  onClose,
  payments,
  getClientName,
  additionalPaymentAmount,
  setAdditionalPaymentAmount,
  selectedPaymentType,
  setSelectedPaymentType,
  paymentReference,
  setPaymentReference,
  onAddPayment
}) => {
  if (!isOpen || !rental) return null;

  const amount = Number(rental.amount) || 0;
  const totalPaid = Number(rental.totalPaid) || 0;
  const pendingAmount = Math.max(0, amount - totalPaid);
  const balance = totalPaid - amount;
  const isOverpaid = balance > 0;
  const isPending = pendingAmount > 0;
  const headerTitle = isPending ? 'Completar Pago' : (isOverpaid ? 'Registrar Devolución' : 'Historial de Pagos');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <Card className="relative w-full max-w-md max-h-[85vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="text-2xl">💰</span>
              {headerTitle}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* INFORMACIÓN DEL ALQUILER */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Cliente</p>
                <p className="font-bold text-gray-900">{getClientName(rental.clientId)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-600 uppercase">ID Contrato</p>
                <p className="font-mono text-gray-700">#{rental.id}</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">Monto Total</p>
                <p className="font-bold text-lg text-gray-900">Bs {amount}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-600 uppercase">Pagado</p>
                <p className="font-bold text-lg text-emerald-700">Bs {totalPaid}</p>
              </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase">Estado de Pago</p>
              {isPending && (
                <p className="text-sm font-bold text-red-700">Pendiente: Bs {pendingAmount}</p>
              )}
              {!isPending && isOverpaid && (
                <p className="text-sm font-bold text-teal-700">Sobrepago: Bs {balance}</p>
              )}
              {!isPending && !isOverpaid && (
                <p className="text-sm font-bold text-emerald-700">✓ Pagado</p>
              )}
            </div>
          </div>

          {/* HISTORIAL DE TRANSACCIONES */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900">Historial de Transacciones</h4>
            {payments.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">Sin registros de pago</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {payments.map((payment) => {
                  const isRefund = payment.amount < 0;
                  const displayAmount = Math.abs(payment.amount);

                  return (
                    <div key={payment.id} className="flex justify-between items-center text-xs bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">
                          {payment.paymentTypeLabel || payment.paymentType}
                        </p>
                        <p className="text-gray-500">{payment.paymentDate} {payment.paymentTime}</p>
                        {payment.reference && <p className="text-gray-400 text-[10px]">Ref: {payment.reference}</p>}
                      </div>
                      <p className={`font-bold ${isRefund ? 'text-orange-700' : 'text-emerald-700'}`}>
                        {isRefund ? '-' : ''}Bs {displayAmount}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* MONTO PENDIENTE Y FORMULARIO */}
          {isPending && (
            <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-blue-900">Monto Pendiente:</p>
                <p className="text-2xl font-bold text-blue-700">Bs {pendingAmount}</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase">Tipo de Pago</label>
                  <select 
                    value={selectedPaymentType}
                    onChange={e => setSelectedPaymentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                  >
                    <option value="cash">💵 Efectivo</option>
                    <option value="bank_transfer">🏦 Transferencia Bancaria</option>
                    <option value="qr">📱 Pago QR</option>
                    <option value="other">📋 Otro</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase">Monto a Pagar</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 font-bold text-lg">Bs</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      placeholder={`Máximo: Bs ${pendingAmount}`}
                      value={additionalPaymentAmount === 0 ? '' : additionalPaymentAmount}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setAdditionalPaymentAmount(val === '' ? 0 : Math.max(0, Number(val)));
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase">Referencia (opcional)</label>
                  <input 
                    type="text"
                    placeholder="Nº de comprobante, transferencia..."
                    value={paymentReference}
                    onChange={e => setPaymentReference(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                  />
                </div>
              </div>

                <Button 
                  variant="primary" 
                  className="w-full py-3"
                  onClick={() => onAddPayment('charge')}
                  disabled={additionalPaymentAmount <= 0 || additionalPaymentAmount > pendingAmount}
                >
                  ✓ Registrar Pago de Bs {additionalPaymentAmount || 0}
                </Button>
            </div>
          )}

          {isOverpaid && (
            <div className="space-y-4 p-4 bg-teal-50 border border-teal-200 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-sm font-bold text-teal-900">Monto a Devolver:</p>
                <p className="text-2xl font-bold text-teal-700">Bs {balance}</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase">Tipo de Devolución</label>
                  <select 
                    value={selectedPaymentType}
                    onChange={e => setSelectedPaymentType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                  >
                    <option value="cash">💵 Efectivo</option>
                    <option value="bank_transfer">🏦 Transferencia Bancaria</option>
                    <option value="qr">📱 Pago QR</option>
                    <option value="other">📋 Otro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase">Monto a Devolver</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 font-bold text-lg">Bs</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      placeholder={`Máximo: Bs ${balance}`}
                      value={additionalPaymentAmount === 0 ? '' : additionalPaymentAmount}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9.]/g, '');
                        setAdditionalPaymentAmount(val === '' ? 0 : Math.max(0, Number(val)));
                      }}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase">Referencia (opcional)</label>
                  <input 
                    type="text"
                    placeholder="Nº de comprobante, transferencia..."
                    value={paymentReference}
                    onChange={e => setPaymentReference(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600 text-sm"
                  />
                </div>
              </div>

              <Button 
                variant="primary" 
                className="w-full py-3 bg-teal-600 hover:bg-teal-700"
                onClick={() => onAddPayment('refund')}
                disabled={additionalPaymentAmount <= 0 || additionalPaymentAmount > balance}
              >
                ↩ Registrar Devolución de Bs {additionalPaymentAmount || 0}
              </Button>
            </div>
          )}

          {!isPending && !isOverpaid && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-700">✓ Pago Completado</p>
              <p className="text-xs text-emerald-600 mt-1">Todo el monto ha sido pagado</p>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PaymentModal;
