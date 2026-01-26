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
  const amount = Number(rental.amount) || 0;
  const totalPaid = Number(rental.totalPaid) || 0;
  const pendingAmount = Math.max(0, amount - totalPaid);
  const balance = totalPaid - amount;
  const isOverpaid = balance > 0;
  const isPending = pendingAmount > 0;
  const isPaid = !isPending;
  const [isActionOpen, setIsActionOpen] = React.useState(false);
  const [menuStyle, setMenuStyle] = React.useState(null);
  const actionRef = React.useRef(null);
  const actionButtonRef = React.useRef(null);

  const openActionMenu = () => {
    if (!actionButtonRef.current) return;
    const rect = actionButtonRef.current.getBoundingClientRect();
    const right = Math.max(8, window.innerWidth - rect.right);
    const bottom = Math.max(8, window.innerHeight - rect.top + 8);
    setMenuStyle({ right, bottom });
    setIsActionOpen(true);
  };

  React.useEffect(() => {
    if (!isActionOpen) return;

    const handleOutsideClick = (event) => {
      if (actionRef.current && !actionRef.current.contains(event.target)) {
        setIsActionOpen(false);
      }
    };

    const handleScroll = () => setIsActionOpen(false);

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isActionOpen]);

  const handleAction = (action) => {
    if (action === 'detail') onOpenDetail(rental);
    if (action === 'edit') onEdit(rental);
    if (action === 'delete') onDelete(rental.id);
    if (action === 'history') onOpenPayment(rental);
    if (action === 'pay') onOpenPayment(rental);

    setIsActionOpen(false);
  };

  return (
    <tr className="hover:bg-orange-50/40 transition-all duration-150 group">

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
      <td className="px-3 py-3 text-gray-600 text-xs whitespace-nowrap">{rental.date}</td>
      <td className="px-3 py-3 font-semibold">Bs {amount}</td>
      <td className="px-3 py-3">
        {rental.status === 'completed' && <Badge variant="success">Completado</Badge>}
        {rental.status === 'reserved' && <Badge variant="warning">Reservado</Badge>}
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-col gap-1">
          {isPaid && (
            <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded text-center">
              ✓ Pagado
            </div>
          )}
          {isOverpaid && (
            <div className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-1 rounded text-center">
              Sobrepago: Bs {balance}
            </div>
          )}
          {isPending && totalPaid > 0 && (
            <div className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
              Pago: Bs {totalPaid}
            </div>
          )}
          {isPending && (
            <div className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded text-center">
              Pendiente
            </div>
          )}
          {isPending && (
            <div className="text-xs text-gray-600">
              Falta: Bs {pendingAmount}
            </div>
          )}
          {isOverpaid && (
            <div className="text-xs text-gray-600">
              Exceso: Bs {balance}
            </div>
          )}
        </div>
      </td>
      <td className="px-3 py-3 text-right">
        <div className="flex items-center justify-end">
          <div className="relative" ref={actionRef}>
            <button
              type="button"
              onClick={() => (isActionOpen ? setIsActionOpen(false) : openActionMenu())}
              aria-haspopup="menu"
              aria-expanded={isActionOpen}
              className="h-9 w-9 rounded-full border border-gray-200 bg-white text-purple-600 shadow-sm hover:border-purple-300 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              title="Acciones"
              ref={actionButtonRef}
            >
              <Icons.Settings className="w-4 h-4 mx-auto" />
            </button>

            {isActionOpen && (
              <div
                className="fixed w-44 rounded-xl border border-gray-200 bg-white shadow-xl z-[100] overflow-hidden text-[12px]"
                style={menuStyle}
              >
                <button
                  type="button"
                  onClick={() => handleAction('detail')}
                  className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                >
                  <Icons.Eye className="w-4 h-4 text-gray-600" />
                  Ver detalle
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('edit')}
                  className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                >
                  <Icons.Edit className="w-4 h-4 text-blue-600" />
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('history')}
                  className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                >
                  <Icons.FileText className="w-4 h-4 text-purple-600" />
                  Ver historial
                </button>
                {isPending && (
                  <button
                    type="button"
                    onClick={() => handleAction('pay')}
                    className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                  >
                    <Icons.CreditCard className="w-4 h-4 text-emerald-600" />
                    Registrar pago
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleAction('delete')}
                  className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
                >
                  <Icons.Trash className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
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
    <Card className="overflow-visible">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px] leading-4">
          <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200 font-medium text-gray-700">
            <tr>
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
              <th className="px-3 py-3 text-right">ACCIÓN</th>
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
