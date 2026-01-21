import React from 'react';
import { Card, Button, Input, Select, Badge } from '../ui';
import { Icons } from '../Icons';

/**
 * Filters Toolbar - Search and filter controls
 */
export const FiltersToolbar = ({
  searchQuery,
  setSearchQuery,
  columnFilters,
  setColumnFilters,
  uniqueCategories,
  drivers,
  selectedCalendarDate,
  clearFilters,
  filteredCount,
  totalCount
}) => {
  const hasFilters = searchQuery || Object.values(columnFilters).some(v => v) || selectedCalendarDate;

  return (
    <Card className="p-4 bg-white/80 backdrop-blur border border-gray-200 shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {/* Buscador principal */}
        <div className="flex-1 min-w-[250px]">
          <Input 
            label="Buscar por cliente o placa"
            icon={Icons.Search}
            placeholder="Nombre del cliente o placa del vehículo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Filtro Estado */}
        <div className="w-40">
          <Select
            label="Estado"
            value={columnFilters.status}
            onChange={e => setColumnFilters(prev => ({...prev, status: e.target.value}))}
            options={[
              { value: 'reserved', label: 'Reservado' },
              { value: 'completed', label: 'Completado' }
            ]}
          />
        </div>
        
        {/* Filtro Pago */}
        <div className="w-40">
          <Select
            label="Pago"
            value={columnFilters.paymentStatus}
            onChange={e => setColumnFilters(prev => ({...prev, paymentStatus: e.target.value}))}
            options={[
              { value: 'paid', label: 'Pagado' },
              { value: 'pending', label: 'Pendiente' }
            ]}
          />
        </div>
        
        {/* Filtro Categoría */}
        <div className="w-40">
          <Select
            label="Categoría"
            value={columnFilters.category}
            onChange={e => setColumnFilters(prev => ({...prev, category: e.target.value}))}
            options={uniqueCategories.map(c => ({ value: c, label: c }))}
          />
        </div>

        {/* Filtro Conductor */}
        <div className="w-44">
          <Select
            label="Conductor"
            value={columnFilters.driverId}
            onChange={e => setColumnFilters(prev => ({...prev, driverId: e.target.value}))}
            options={drivers.map(d => ({ value: String(d.id), label: d.name }))}
          />
        </div>

        {/* Botón limpiar filtros */}
        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters} className="text-red-600 hover:text-red-800">
            <Icons.X className="w-4 h-4 mr-1" /> Limpiar
          </Button>
        )}
      </div>
      
      {/* Indicador de resultados */}
      <div className="mt-3 text-xs text-gray-500">
        Mostrando {filteredCount} de {totalCount} registros
        {hasFilters && (
          <span className="ml-2 text-orange-600 font-semibold">
            (filtrado{selectedCalendarDate ? ` por ${selectedCalendarDate}` : ''})
          </span>
        )}
      </div>
    </Card>
  );
};

/**
 * Rentals Table Row
 */
const RentalRow = ({ rental, getClientName, getVehicleName, getDriverName, onOpenDetail, onEdit, onDelete, onOpenPayment }) => {
  return (
    <tr className="hover:bg-orange-50/40 transition-all duration-150 group">
      <td className="px-3 py-3 font-mono text-gray-500">#{rental.id}</td>
      <td className="px-3 py-3 font-medium">{getClientName(rental.clientId)}</td>
      <td className="px-3 py-3 text-xs">{getVehicleName(rental.vehicleId)}</td>
      <td className="px-3 py-3">
        {rental.driverId ? (
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
            {getDriverName(rental.driverId)}
          </span>
        ) : (
          <span className="text-xs text-gray-400">Sin asignar</span>
        )}
      </td>
      <td className="px-3 py-3">
        <span className="text-xs text-gray-600 max-w-[120px] truncate block" title={rental.pickupLocation}>
          📍 {rental.pickupLocation || 'A confirmar'}
        </span>
      </td>
      <td className="px-3 py-3">
        <span className="text-xs text-gray-600 max-w-[120px] truncate block" title={rental.destinationLocation}>
          🏁 {rental.destinationLocation || 'A confirmar'}
        </span>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col">
            <Badge variant="default">{rental.category || rental.event}</Badge>
            {rental.eventName && <span className="text-xs text-gray-400 mt-1">{rental.eventName}</span>}
        </div>
      </td>
      <td className="px-3 py-3 text-gray-600 text-xs">{rental.date}</td>
      <td className="px-3 py-3 font-semibold">Bs {rental.amount}</td>
      <td className="px-3 py-3">
        {rental.status === 'completed' && <Badge variant="success">Completado</Badge>}
        {rental.status === 'reserved' && <Badge variant="warning">Reservado</Badge>}
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col gap-1">
          {rental.paymentStatus === 'paid' && (
            <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded text-center">
              ✓ Pagado
            </div>
          )}
          {rental.paymentStatus === 'pending' && rental.totalPaid > 0 && (
            <div className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
              Pago: Bs {rental.totalPaid || 0}
            </div>
          )}
          {rental.paymentStatus === 'pending' && (
            <div className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded text-center">
              Pendiente
            </div>
          )}
          <button 
            onClick={() => onOpenPayment(rental)}
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline"
            title="Ver historial de transacciones"
          >
            📋 Ver historial
          </button>
          {rental.paymentStatus === 'pending' && (
            <div className="text-xs text-gray-600">
              Falta: Bs {rental.pendingAmount || (rental.amount - (rental.totalPaid || 0))}
            </div>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
            {rental.paymentStatus === 'pending' && (
              <button 
                onClick={() => onOpenPayment(rental)} 
                className="text-green-600 hover:text-green-800 p-1 font-bold text-sm" 
                title="Completar Pago"
              >
                💳
              </button>
            )}
            <button onClick={() => onOpenDetail(rental)} className="text-gray-700 hover:text-gray-900 p-1" title="Ver Detalle"><Icons.Eye className="w-4 h-4"/></button>
            <button onClick={() => onEdit(rental)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar"><Icons.Edit className="w-4 h-4"/></button>
            <button onClick={() => onDelete(rental.id)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar"><Icons.Trash className="w-4 h-4"/></button>
        </div>
      </td>
    </tr>
  );
};

/**
 * Rentals Table - Main data table component
 */
export const RentalsTable = ({
  rentals,
  getClientName,
  getVehicleName,
  getDriverName,
  sortConfig,
  onSort,
  onOpenDetail,
  onEdit,
  onDelete,
  onOpenPayment
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/70 backdrop-blur border-b border-gray-200 font-medium text-gray-700">
            <tr>
              <th className="px-3 py-3 cursor-pointer hover:bg-gray-100" onClick={() => onSort('id')}>
                ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 py-3">CLIENTE</th>
              <th className="px-3 py-3">VEHÍCULO</th>
              <th className="px-3 py-3">CONDUCTOR</th>
              <th className="px-3 py-3">RECOGIDA</th>
              <th className="px-3 py-3">DESTINO</th>
              <th className="px-3 py-3">EVENTO</th>
              <th className="px-3 py-3 cursor-pointer hover:bg-gray-100" onClick={() => onSort('date')}>
                FECHA {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 py-3 cursor-pointer hover:bg-gray-100" onClick={() => onSort('amount')}>
                MONTO {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-3 py-3">ESTADO</th>
              <th className="px-3 py-3">PAGO</th>
              <th className="px-3 py-3 text-right">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rentals.map((rental) => (
              <RentalRow
                key={rental.id}
                rental={rental}
                getClientName={getClientName}
                getVehicleName={getVehicleName}
                getDriverName={getDriverName}
                onOpenDetail={onOpenDetail}
                onEdit={onEdit}
                onDelete={onDelete}
                onOpenPayment={onOpenPayment}
              />
            ))}
            {rentals.length === 0 && (
                <tr><td colSpan="12" className="px-4 py-8 text-center text-gray-400">
                  No hay registros o no se encontraron resultados con los filtros aplicados
                </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default { FiltersToolbar, RentalsTable };
