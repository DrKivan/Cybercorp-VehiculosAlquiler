import React, { useState } from 'react';
import { Card, Button, Input, Select } from '../ui';
import { Icons } from '../Icons';
import { MapPicker } from '../MapPicker';
import { generateQuotationFromForm } from '../../utils/quotationPdf';

/**
 * Rental Form Modal - Create/Edit rental contracts
 */
export const RentalFormModal = ({
  isOpen,
  onClose,
  formData,
  setFormData,
  clients,
  vehicles,
  drivers,
  categories,
  rentals,
  // Category handlers
  newCategoryMode,
  setNewCategoryMode,
  tempCategory,
  setTempCategory,
  onCreateCategory,
  // Vehicle handlers
  newVehicleMode,
  setNewVehicleMode,
  tempVehicle,
  setTempVehicle,
  onCreateVehicle,
  // Driver handlers
  newDriverMode,
  setNewDriverMode,
  tempDriver,
  setTempDriver,
  onCreateDriver,
  // Map handlers
  showMap,
  setShowMap,
  // Save handler
  onSave
}) => {
  const [showObservationPrompt, setShowObservationPrompt] = useState(false);
  const [observations, setObservations] = useState('');
  const [quotationNumber, setQuotationNumber] = useState('');
  const [timeError, setTimeError] = useState('');

  // Validar que la hora fin no sea menor a la hora inicio
  const validateTimes = () => {
    if (!formData.startTime || !formData.endTime) {
      setTimeError('');
      return true;
    }
    
    const [startH, startM] = formData.startTime.split(':').map(Number);
    const [endH, endM] = formData.endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    if (endMinutes <= startMinutes) {
      setTimeError('La hora de fin debe ser mayor a la hora de inicio');
      return false;
    }
    
    setTimeError('');
    return true;
  };

  // Convertir tiempo a minutos para comparaciones
  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // Verificar si dos rangos de tiempo se solapan
  const timeRangesOverlap = (start1, end1, start2, end2) => {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);
    
    // Se solapan si: inicio1 < fin2 AND inicio2 < fin1
    return s1 < e2 && s2 < e1;
  };

  // Obtener reservas que generan conflicto para la fecha y horario seleccionados
  const getConflictingRentals = () => {
    if (!formData.date || !formData.startTime || !formData.endTime) return [];
    
    const normalizedRentals = Array.isArray(rentals) ? rentals : [];
    
    return normalizedRentals.filter(r => {
      // No considerar la misma renta si se está editando
      if (formData.id && r.id === formData.id) return false;
      
      // Solo considerar reservas activas (no completadas)
      if (r.status === 'completed') return false;
      
      // Verificar si es la misma fecha
      if (r.date !== formData.date) return false;
      
      // Verificar si hay solapamiento de horarios
      return timeRangesOverlap(formData.startTime, formData.endTime, r.startTime, r.endTime);
    });
  };

  const conflictingRentals = getConflictingRentals();

  // Vehículos en conflicto (ya reservados en ese horario)
  const conflictingVehicleIds = conflictingRentals.map(r => r.vehicleId);
  
  // Conductores en conflicto (ya asignados en ese horario)
  const conflictingDriverIds = conflictingRentals
    .filter(r => r.driverId) // Solo los que tienen conductor asignado
    .map(r => r.driverId);

  const normalizedClients = Array.isArray(clients) ? clients : [];
  const normalizedVehicles = Array.isArray(vehicles) ? vehicles : [];
  const normalizedDrivers = Array.isArray(drivers) ? drivers : [];
  const normalizedCategories = Array.isArray(categories)
    ? categories.map(c => (typeof c === 'string' ? { id: c, name: c, is_active: true } : c))
    : [];

  const selectedClient = normalizedClients.find(c => c.id === Number(formData.clientId));
  const activeClients = normalizedClients.filter(c => c.is_active !== false);
  const clientOptions = [...activeClients, ...(selectedClient && !activeClients.some(c => c.id === selectedClient.id) ? [selectedClient] : [])]
    .map(c => ({ label: `${c.name}${c.is_active === false ? ' (Inactivo)' : ''}`, value: c.id }));

  const selectedVehicle = normalizedVehicles.find(v => v.id === Number(formData.vehicleId));
  const activeVehicles = normalizedVehicles.filter(v => v.is_active !== false);
  const vehicleOptions = [...activeVehicles, ...(selectedVehicle && !activeVehicles.some(v => v.id === selectedVehicle.id) ? [selectedVehicle] : [])]
    .map(v => {
      const isConflict = conflictingVehicleIds.includes(v.id);
      const isInactive = v.is_active === false;
      let label = `${v.brand} ${v.model} - ${v.plate}`;
      if (isConflict) label += ' ⚠️ (Ocupado)';
      else if (isInactive) label += ' (Inactivo)';
      return { label, value: v.id, disabled: isConflict };
    });

  const selectedDriver = normalizedDrivers.find(d => d.id === Number(formData.driverId));
  const activeDrivers = normalizedDrivers.filter(d => d.is_active !== false);
  const driverOptions = [
    { label: "Sin Chofer", value: "", disabled: false },
    ...activeDrivers.map(d => {
      const isConflict = conflictingDriverIds.includes(d.id);
      const isInactive = d.is_active === false;
      let label = d.name;
      if (isConflict) label += ' ⚠️ (Ocupado)';
      else if (isInactive) label += ' (Inactivo)';
      return { label, value: d.id, disabled: isConflict };
    }),
    ...(selectedDriver && !activeDrivers.some(d => d.id === selectedDriver.id)
      ? [{ label: `${selectedDriver.name} (Inactivo)`, value: selectedDriver.id, disabled: false }]
      : [])
  ];

  const selectedCategory = normalizedCategories.find(c => c.name === formData.category);
  const activeCategories = normalizedCategories.filter(c => c.is_active !== false);
  const categoryOptions = [...activeCategories, ...(selectedCategory && !activeCategories.some(c => c.name === selectedCategory.name) ? [selectedCategory] : [])]
    .map(c => ({ label: `${c.name}${c.is_active === false ? ' (Inactivo)' : ''}`, value: c.name }));

  if (!isOpen) return null;

  const handleDownloadQuotation = () => {
    setShowObservationPrompt(true);
  };

  const handleConfirmDownload = async (withObservation) => {
    try {
      const obs = withObservation ? observations : '';
      const quotNum = quotationNumber.trim() || null;
      await generateQuotationFromForm(formData, clients, vehicles, drivers, obs, null, quotNum);
      setShowObservationPrompt(false);
      setObservations('');
      setQuotationNumber('');
    } catch (error) {
      console.error('Error generando cotización:', error);
      alert('Error al generar la cotización: ' + error.message);
    }
  };

  const handleCancelObservation = () => {
    setShowObservationPrompt(false);
    setObservations('');
    setQuotationNumber('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-orange-100 text-orange-700 p-1 rounded"><Icons.Plus className="w-5 h-5"/></span>
              {formData.id ? 'Editar Contrato' : 'Nuevo Contrato de Alquiler'}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. CLIENTE */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-gray-900 border-b pb-1 border-gray-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">1</span>
                Datos del Cliente
              </h4>
              
              {/* Selector: Cliente Nuevo vs Existente */}
              <div className="flex gap-4 mb-2">
                 <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                       type="radio" 
                       checked={!formData.isNewClient} 
                       onChange={() => setFormData({...formData, isNewClient: false})} 
                       className="text-orange-600 focus:ring-orange-600"
                    />
                    Buscar Existente
                 </label>
                 <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input 
                       type="radio" 
                       checked={formData.isNewClient} 
                       onChange={() => setFormData({...formData, isNewClient: true})} 
                       className="text-orange-600 focus:ring-orange-600"
                    />
                    + Registrar Nuevo
                 </label>
              </div>

              {/* Formulario Cliente Dinámico */}
              <div className="bg-gray-50 p-4 rounded-md border border-gray-200 transition-all">
                  {!formData.isNewClient ? (
                      <Select 
                         label="Seleccionar Cliente" 
                         className="bg-white"
                         options={clientOptions}
                         value={formData.clientId}
                         onChange={(e) => setFormData({...formData, clientId: Number(e.target.value)})}
                      />
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
                          <Input 
                            label="Nombre Completo" 
                            placeholder="Ej. Juan Perez" 
                            value={formData.newClientName}
                            onChange={e => setFormData({...formData, newClientName: e.target.value})}
                          />
                          <Input 
                            label="Teléfono / Celular" 
                            placeholder="+51 ..." 
                            value={formData.newClientPhone}
                            onChange={e => setFormData({...formData, newClientPhone: e.target.value})}
                          />
                      </div>
                  )}
              </div>
            </div>

            {/* 2. EVENTO & UBICACION */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 border-b pb-1 border-gray-100 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">2</span>
                Evento y Ubicación
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 w-full">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoría Evento</label>
                  {!newCategoryMode ? (
                    <div className="flex gap-2">
                        <Select 
                          options={categoryOptions}
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                        />
                        <Button variant="outline" onClick={() => setNewCategoryMode(true)} className="px-3">+</Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                       <Input placeholder="Nueva cat..." value={tempCategory} onChange={(e) => setTempCategory(e.target.value)} autoFocus />
                       <Button variant="primary" onClick={onCreateCategory} className="px-3">OK</Button>
                    </div>
                  )}
                </div>
                <Input 
                    label="Nombre Evento" 
                    placeholder="Ej. Boda Civil" 
                    value={formData.eventName} 
                    onChange={e => setFormData({...formData, eventName: e.target.value})} 
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3 block">Ubicaciones</label>
                <div className="grid grid-cols-1 gap-4">
                   <Input 
                    label="Lugar de Recogida"
                    placeholder="Dirección o 'A confirmar'" 
                    icon={Icons.MapPin} 
                    value={formData.pickupLocation}
                    onChange={e => setFormData({...formData, pickupLocation: e.target.value})}
                   />
                   
                   <Input 
                    label="Lugar de Destino"
                    placeholder="Dirección o 'A confirmar'" 
                    icon={Icons.MapPin} 
                    value={formData.destinationLocation}
                    onChange={e => setFormData({...formData, destinationLocation: e.target.value})}
                   />
                   
                   {!formData.pickupCoords ? (
                     <div className="border-2 border-dashed border-gray-300 rounded-md p-4 flex flex-col items-center justify-center text-gray-500 bg-white hover:bg-gray-50 cursor-pointer" onClick={() => setShowMap(true)}>
                        <Icons.Map className="h-6 w-6 mb-1 text-gray-400" />
                        <span className="text-xs font-medium">Click para fijar recogida en mapa (opcional)</span>
                     </div>
                   ) : (
                     <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-md text-green-800">
                        <div className="flex items-center gap-2">
                           <Icons.MapPin className="h-5 w-5 text-green-600" />
                           <span className="text-xs font-bold text-green-700">Recogida: {formData.pickupCoords.lat}, {formData.pickupCoords.lng}</span>
                        </div>
                        <button onClick={() => setFormData({...formData, pickupCoords: null})} className="text-xs underline px-2">Quitar</button>
                     </div>
                   )}
                </div>
              </div>
            </div>

            {/* Alerta de conflictos */}
            {conflictingRentals.length > 0 && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 text-lg">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Conflicto de horario detectado</p>
                    <p className="text-xs text-amber-700 mt-1">
                      Ya existen {conflictingRentals.length} reserva(s) para el {formData.date} que se cruzan con el horario {formData.startTime} - {formData.endTime}.
                      Los vehículos y conductores ocupados aparecen marcados como <strong>"⚠️ (Ocupado)"</strong> y no pueden seleccionarse.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. VEHICULO & CHOFER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
               <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 border-b pb-1 border-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">3</span>
                    Vehículo
                  </h4>
                  <div className="space-y-1.5 w-full">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Seleccionar Unidad</label>
                    {!newVehicleMode ? (
                      <div className="flex gap-2">
                        <Select 
                          options={vehicleOptions} 
                          value={formData.vehicleId}
                          onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                        />
                        <Button variant="outline" onClick={() => setNewVehicleMode(true)} className="px-3">+</Button>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-gray-50 p-3 rounded border border-gray-200">
                        <Input placeholder="Marca (ej: Toyota)" value={tempVehicle.brand} onChange={(e) => setTempVehicle({...tempVehicle, brand: e.target.value})} autoFocus />
                        <Input placeholder="Modelo (ej: Hilux)" value={tempVehicle.model} onChange={(e) => setTempVehicle({...tempVehicle, model: e.target.value})} />
                        <Select 
                          options={[
                            { label: 'Compacto', value: 'Compacto' },
                            { label: 'Sedán', value: 'Sedán' },
                            { label: 'SUV', value: 'SUV' },
                            { label: 'Van', value: 'Van' },
                            { label: 'Camioneta', value: 'Camioneta' }
                          ]}
                          value={tempVehicle.size}
                          onChange={(e) => setTempVehicle({...tempVehicle, size: e.target.value})}
                        />
                        <Input placeholder="Placa (ej: ABC-123)" value={tempVehicle.plate} onChange={(e) => setTempVehicle({...tempVehicle, plate: e.target.value})} />
                        <div className="flex gap-2">
                          <Button variant="primary" onClick={onCreateVehicle} className="flex-1">Guardar</Button>
                          <Button variant="outline" onClick={() => { setNewVehicleMode(false); setTempVehicle({ brand: "", model: "", size: "", plate: "" }); }}>Cancelar</Button>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
               <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 border-b pb-1 border-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">4</span>
                    Chofer
                  </h4>
                  <div className="space-y-1.5 w-full">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Asignar Conductor</label>
                    {!newDriverMode ? (
                      <div className="flex gap-2">
                        <Select 
                          options={driverOptions} 
                          value={formData.driverId}
                          onChange={e => setFormData({...formData, driverId: e.target.value})}
                        />
                        <Button variant="outline" onClick={() => setNewDriverMode(true)} className="px-3">+</Button>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-gray-50 p-3 rounded border border-gray-200">
                        <Input placeholder="Nombre completo" value={tempDriver.name} onChange={(e) => setTempDriver({...tempDriver, name: e.target.value})} autoFocus />
                        <Input placeholder="Teléfono" value={tempDriver.phone} onChange={(e) => setTempDriver({...tempDriver, phone: e.target.value})} />
                        <Input placeholder="Licencia" value={tempDriver.license} onChange={(e) => setTempDriver({...tempDriver, license: e.target.value})} />
                        <div className="flex gap-2">
                          <Button variant="primary" onClick={onCreateDriver} className="flex-1">Guardar</Button>
                          <Button variant="outline" onClick={() => { setNewDriverMode(false); setTempDriver({ name: "", phone: "", license: "" }); }}>Cancelar</Button>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FINANCIALS */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-gray-50 border-gray-200 p-5 h-full flex flex-col">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Cálculo Financiero</h4>
              
              <div className="space-y-4 flex-1">
                <Input 
                    type="date" label="Fecha" 
                    value={formData.date} 
                    onChange={e => setFormData({...formData, date: e.target.value})}
                />
                
                <div className="p-3 bg-white rounded border border-gray-200 space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase">Tiempo de Alquiler</label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input 
                            type="time" label="Inicio" 
                            value={formData.startTime} 
                            onChange={e => {
                              setFormData({...formData, startTime: e.target.value});
                              validateTimes();
                            }}
                        />
                        <Input 
                            type="time" label="Fin" 
                            value={formData.endTime} 
                            onChange={e => {
                              setFormData({...formData, endTime: e.target.value});
                              validateTimes();
                            }}
                        />
                    </div>
                    {timeError && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-semibold flex items-center gap-2">
                        <span>⚠️</span>
                        {timeError}
                      </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="space-y-1.5 w-full">
                        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Tarifa Base (Bs por Hora)</label>
                        <input 
                            type="text"
                            inputMode="numeric"
                            className="flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-600"
                            value={formData.baseRate === 0 ? '' : formData.baseRate}
                            onChange={e => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setFormData({...formData, baseRate: val === '' ? 0 : Number(val)});
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <label className="text-sm font-bold text-gray-800 uppercase block">Total Calculado</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 font-bold text-lg">Bs</span>
                    <input 
                        type="text"
                        inputMode="numeric"
                        className="w-full pl-10 pr-3 py-3 bg-orange-50 border border-orange-200 rounded font-bold text-2xl text-orange-700 focus:outline-none" 
                        value={formData.amount === 0 ? '' : formData.amount}
                        onChange={e => {
                            const val = e.target.value.replace(/[^0-9.]/g, '');
                            setFormData({...formData, amount: val === '' ? 0 : Number(val)});
                        }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-right italic">Se calculó automáticamente según horas</p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>ℹ️ Nota:</strong> Los pagos se registran después de crear el contrato desde la tabla de alquileres.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                <Button 
                  variant="primary" 
                  className="w-full py-6 text-base shadow-lg shadow-orange-200" 
                  onClick={() => {
                    if (!validateTimes()) {
                      return;
                    }
                    // Validar conflicto de vehículo
                    if (formData.vehicleId && conflictingVehicleIds.includes(Number(formData.vehicleId))) {
                      alert('El vehículo seleccionado ya tiene una reserva en ese horario. Por favor, seleccione otro vehículo.');
                      return;
                    }
                    // Validar conflicto de conductor
                    if (formData.driverId && conflictingDriverIds.includes(Number(formData.driverId))) {
                      alert('El conductor seleccionado ya tiene una reserva en ese horario. Por favor, seleccione otro conductor.');
                      return;
                    }
                    onSave();
                  }}
                  disabled={timeError !== ''}
                >
                  {formData.id ? 'Guardar Cambios' : 'Generar Contrato'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDownloadQuotation();
                  }}
                >
                  <Icons.Download className="w-4 h-4 mr-2" />
                  Descargar Cotización PDF
                </Button>
                <Button variant="outline" className="w-full text-gray-500" onClick={onClose}>
                  Cancelar
                </Button>
              </div>
            </Card>
          </div>

        </div>
      </Card>
      
      {/* MAPA MODAL */}
      {showMap && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="w-full max-w-2xl h-[500px] shadow-2xl animate-in fade-in zoom-in-95">
             <MapPicker 
               onConfirm={(coords) => { setFormData({...formData, pickupCoords: coords}); setShowMap(false); }} 
               onCancel={() => setShowMap(false)} 
             />
           </div>
        </div>
      )}

      {/* Modal de Observaciones */}
      {showObservationPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-gray-100">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Icons.FileText className="w-5 h-5 text-orange-600" />
                Generar Cotización PDF
              </h4>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-sm text-gray-600">
                Complete los datos para generar la cotización.
              </p>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Número de Cotización *
                </label>
                <Input
                  placeholder="Ej: 001, COT-2026-001, etc."
                  value={quotationNumber}
                  onChange={e => setQuotationNumber(e.target.value)}
                  autoFocus
                />
                <p className="text-xs text-gray-500">
                  💡 Este número aparecerá en la cotización PDF
                </p>
              </div>
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
                  disabled={!quotationNumber.trim()}
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

export default RentalFormModal;
