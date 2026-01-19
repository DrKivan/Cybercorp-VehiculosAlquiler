import React from 'react';
import { Card, Button, Input, Select } from '../ui';
import { Icons } from '../Icons';
import { MapPicker } from '../MapPicker';

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
  if (!isOpen) return null;

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
                         options={clients.map(c => ({ label: c.name, value: c.id }))}
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
                          options={categories.map(c => ({ label: c, value: c }))}
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
                          options={vehicles.map(v => ({ label: `${v.brand} ${v.model} - ${v.plate}`, value: v.id }))} 
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
                          options={[
                            { label: "Sin Chofer", value: "" },
                            ...drivers.map(d => ({ label: d.name, value: d.id }))
                          ]} 
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
                            onChange={e => setFormData({...formData, startTime: e.target.value})}
                        />
                        <Input 
                            type="time" label="Fin" 
                            value={formData.endTime} 
                            onChange={e => setFormData({...formData, endTime: e.target.value})}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Input 
                        type="number" 
                        label="Tarifa Base (Bs por Hora)" 
                        value={formData.baseRate}
                        onChange={e => setFormData({...formData, baseRate: Number(e.target.value)})}
                    />
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <label className="text-sm font-bold text-gray-800 uppercase block">Total Calculado</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 font-bold text-lg">Bs</span>
                    <input 
                        className="w-full pl-10 pr-3 py-3 bg-orange-50 border border-orange-200 rounded font-bold text-2xl text-orange-700 focus:outline-none" 
                        value={formData.amount}
                        onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
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
                <Button variant="primary" className="w-full py-6 text-base shadow-lg shadow-orange-200" onClick={onSave}>
                  {formData.id ? 'Guardar Cambios' : 'Generar Contrato'}
                </Button>
                <Button variant="outline" className="w-full" onClick={onClose}>
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

    </div>
  );
};

export default RentalFormModal;
