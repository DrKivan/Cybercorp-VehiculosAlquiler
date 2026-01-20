import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '../ui';
import { Icons } from '../Icons';
import { generateQuotationFromRental } from '../../utils/quotationPdf';

/**
 * Rental Detail Modal - Read-only view of rental information
 */
export const RentalDetailModal = ({ 
  rental, 
  isOpen, 
  onClose, 
  getClientName, 
  getVehicleName, 
  getDriverName,
  clients,
  vehicles,
  drivers
}) => {
  const [showObservationPrompt, setShowObservationPrompt] = useState(false);
  const [observations, setObservations] = useState('');

  if (!isOpen || !rental) return null;

  const handleDownloadQuotation = async () => {
    setShowObservationPrompt(true);
  };

  const handleConfirmDownload = async (withObservation) => {
    try {
      const obs = withObservation ? observations : '';
      await generateQuotationFromRental(rental, clients, vehicles, drivers, obs);
      setShowObservationPrompt(false);
      setObservations('');
    } catch (error) {
      console.error('Error generando cotización:', error);
      alert('Error al generar la cotización: ' + error.message);
    }
  };

  const handleCancelObservation = () => {
    setShowObservationPrompt(false);
    setObservations('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <Card className="relative w-full max-w-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-orange-100 text-orange-700">👁️</span>
            <h3 className="text-lg font-bold text-gray-900">Detalle del Alquiler</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-gray-600 uppercase">Cliente</p>
              <p className="font-bold text-gray-900">{getClientName(rental.clientId)}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-blue-700 uppercase">Vehículo</p>
              <p className="font-bold text-blue-900">{getVehicleName(rental.vehicleId)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-purple-700 uppercase">Conductor</p>
              <p className="font-bold text-purple-900">{rental.driverId ? getDriverName(rental.driverId) : 'Sin asignar'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase">Evento</p>
              <div className="flex items-center gap-2">
                <Badge variant="info">{rental.category || '—'}</Badge>
                {rental.eventName && (
                  <span className="text-xs text-gray-500">{rental.eventName}</span>
                )}
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase">Fecha y Horas</p>
              <div className="text-sm text-gray-700">
                <span className="font-bold">{rental.date}</span>
                <span className="ml-2">{rental.startTime} - {rental.endTime}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase">Recogida</p>
              <p className="text-sm text-gray-700">{rental.pickupLocation || 'A confirmar'}</p>
              {rental.pickupCoords && (
                <p className="text-xs text-gray-500">📍 {rental.pickupCoords.lat}, {rental.pickupCoords.lng}</p>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase">Destino</p>
              <p className="text-sm text-gray-700">{rental.destinationLocation || 'A confirmar'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-orange-700 uppercase">Monto</p>
              <p className="text-2xl font-extrabold text-orange-700">Bs {rental.amount}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-emerald-700 uppercase">Pagado</p>
              <p className="text-2xl font-extrabold text-emerald-700">Bs {rental.totalPaid || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-amber-700 uppercase">Pendiente</p>
              <p className="text-2xl font-extrabold text-amber-700">Bs {rental.pendingAmount || (rental.amount - (rental.totalPaid || 0))}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {rental.status === 'completed' && <Badge variant="success">Completado</Badge>}
            {rental.status === 'reserved' && <Badge variant="warning">Reservado</Badge>}
            {rental.paymentStatus === 'paid' && <Badge variant="success">Pago Completo</Badge>}
            {rental.paymentStatus === 'partial' && <Badge variant="warning">Pago Parcial</Badge>}
            {rental.paymentStatus === 'pending' && <Badge variant="default">Pago Pendiente</Badge>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleDownloadQuotation}
            >
              <Icons.Download className="w-4 h-4 mr-2" />
              Descargar Cotización
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal de Observaciones */}
      {showObservationPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Icons.FileText className="w-5 h-5 text-orange-600" />
                ¿Desea agregar observaciones?
              </h4>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Puede agregar observaciones adicionales que aparecerán en la cotización PDF.
              </p>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Observaciones (opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  rows={3}
                  placeholder="Escriba las observaciones aquí..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={() => handleConfirmDownload(observations.trim() !== '')}
                >
                  <Icons.Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleCancelObservation}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RentalDetailModal;
