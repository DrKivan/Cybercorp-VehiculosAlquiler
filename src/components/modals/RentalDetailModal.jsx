import React, { useState } from 'react';
import { Card, Button, Badge, Input } from '../ui';
import { Icons } from '../Icons';
import { generateQuotationFromRental } from '../../utils/quotationPdf';

/**
 * Rental Detail Modal - Clean modern design
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

  // Calcular duración
  const calculateDuration = () => {
    if (!rental.startTime || !rental.endTime) return null;
    const [startH, startM] = rental.startTime.split(':').map(Number);
    const [endH, endM] = rental.endTime.split(':').map(Number);
    const diff = (endH * 60 + endM) - (startH * 60 + startM);
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return hours > 0 ? `${hours}h ${minutes > 0 ? minutes + 'm' : ''}` : `${minutes}m`;
  };

  const amount = Number(rental.amount) || 0;
  const totalPaid = Number(rental.totalPaid) || 0;
  const pendingAmount = Math.max(0, amount - totalPaid);
  const balance = totalPaid - amount;
  const isOverpaid = balance > 0;
  const isPending = pendingAmount > 0;
  const isPaid = !isPending;
  const statusLabel = isPending ? 'Pendiente' : (isOverpaid ? 'Sobrepago' : 'Completo');
  const statusValue = isPending ? `Bs ${pendingAmount}` : (isOverpaid ? `Bs ${balance}` : '✓');
  const statusColor = isPending ? 'text-amber-400' : (isOverpaid ? 'text-teal-400' : 'text-emerald-400');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-violet-200 text-xs font-medium uppercase tracking-wider">Contrato N°</p>
              <p className="text-3xl font-black">{rental.id}</p>
            </div>
            <div className="flex items-center gap-2">
              {rental.status === 'completed' ? (
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">✓ Completado</span>
              ) : (
                <span className="px-3 py-1 bg-amber-400 text-amber-900 rounded-full text-xs font-bold">Reservado</span>
              )}
              <button 
                onClick={onClose} 
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <Icons.X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Cliente */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
              <Icons.User className="w-6 h-6 text-violet-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium uppercase">Cliente</p>
              <p className="text-lg font-bold text-gray-900">{getClientName(rental.clientId)}</p>
            </div>
          </div>

          {/* Vehículo y Conductor */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-2 mb-1">
                <Icons.Car className="w-4 h-4 text-indigo-500" />
                <p className="text-xs text-indigo-600 font-semibold uppercase">Vehículo</p>
              </div>
              <p className="font-bold text-gray-900 text-sm">{getVehicleName(rental.vehicleId)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <Icons.User className="w-4 h-4 text-purple-500" />
                <p className="text-xs text-purple-600 font-semibold uppercase">Conductor</p>
              </div>
              <p className="font-bold text-gray-900 text-sm">{rental.driverId ? getDriverName(rental.driverId) : 'Sin asignar'}</p>
            </div>
          </div>

          {/* Evento */}
          <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-pink-600 font-semibold uppercase mb-1">Evento</p>
                <p className="font-bold text-gray-900">{rental.category || 'General'}</p>
                {rental.eventName && <p className="text-sm text-gray-600">{rental.eventName}</p>}
              </div>
              <span className="text-3xl">🎊</span>
            </div>
          </div>

          {/* Fecha y Horario */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <Icons.Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-[10px] text-gray-500 font-medium uppercase">Fecha</p>
              <p className="font-bold text-gray-900 text-sm">{rental.date}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <Icons.Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
              <p className="text-[10px] text-gray-500 font-medium uppercase">Horario</p>
              <p className="font-bold text-gray-900 text-sm">{rental.startTime} - {rental.endTime}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl text-center">
              <span className="text-lg">⏱️</span>
              <p className="text-[10px] text-gray-500 font-medium uppercase">Duración</p>
              <p className="font-bold text-gray-900 text-sm">{calculateDuration() || '—'}</p>
            </div>
          </div>

          {/* Ubicaciones */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">A</span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 font-medium uppercase">Recogida</p>
                <p className="text-sm text-gray-900">{rental.pickupLocation || 'A confirmar'}</p>
                {rental.pickupCoords && (
                  <a 
                    href={`https://www.google.com/maps?q=${rental.pickupCoords.lat},${rental.pickupCoords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs text-violet-600 hover:text-violet-800 hover:underline"
                  >
                    <Icons.MapPin className="w-3 h-3" />
                    Ver en Google Maps
                  </a>
                )}
              </div>
            </div>
            <div className="ml-3 border-l-2 border-dashed border-gray-300 h-4"></div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">B</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-medium uppercase">Destino</p>
                <p className="text-sm text-gray-900">{rental.destinationLocation || 'A confirmar'}</p>
              </div>
            </div>
          </div>

          {/* Montos */}
          <div className="bg-gray-900 rounded-xl p-4 text-white">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-[10px] font-medium uppercase">Total</p>
                <p className="text-xl font-black">Bs {amount}</p>
              </div>
              <div className="border-x border-gray-700">
                <p className="text-emerald-400 text-[10px] font-medium uppercase">Pagado</p>
                <p className="text-xl font-black text-emerald-400">Bs {totalPaid}</p>
              </div>
              <div>
                <p className={`text-[10px] font-medium uppercase ${statusColor}`}>
                  {statusLabel}
                </p>
                <p className={`text-xl font-black ${statusColor}`}>
                  {statusValue}
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={handleDownloadQuotation}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all"
            >
              <Icons.Download className="w-4 h-4" />
              Descargar Cotización
            </button>
            <button 
              onClick={onClose}
              className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Observaciones */}
      {showObservationPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Icons.FileText className="w-5 h-5 text-violet-600" />
                ¿Agregar observaciones?
              </h4>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Estas observaciones aparecerán en la cotización PDF.
              </p>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none"
                rows={3}
                placeholder="Escriba las observaciones aquí (opcional)..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
              />
              <div className="flex gap-3">
                <Button 
                  variant="primary" 
                  className="flex-1 bg-violet-600 hover:bg-violet-700"
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
