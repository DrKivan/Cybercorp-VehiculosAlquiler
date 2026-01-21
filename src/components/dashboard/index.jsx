import React from 'react';
import { Card } from '../ui';
import { Icons } from '../Icons';

/**
 * KPI Cards - Display key metrics at top of dashboard
 */
export const KPICards = ({ dashboardStats, vehiclesCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="p-4 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
        <div className="flex items-center justify-between">
          <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">Vehículos Disponibles</span>
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-100 text-emerald-700">
            <Icons.Car className="w-4 h-4"/>
          </span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <span className="text-3xl font-extrabold text-emerald-700">{dashboardStats.availableVehicles}</span>
          <span className="text-xs text-emerald-600">de {vehiclesCount} total</span>
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-white border border-blue-200">
        <div className="flex items-center justify-between">
          <span className="text-blue-700 text-xs font-bold uppercase tracking-wider">En Alquiler Activo</span>
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 text-blue-700">🚗</span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <span className="text-3xl font-extrabold text-blue-700">{dashboardStats.reserved}</span>
          <span className="text-xs text-blue-600">{dashboardStats.vehiclesInUse} vehículos</span>
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-br from-amber-50 to-white border border-amber-200">
        <div className="flex items-center justify-between">
          <span className="text-amber-700 text-xs font-bold uppercase tracking-wider">Pagos Pendientes</span>
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-amber-100 text-amber-700">💳</span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <span className="text-3xl font-extrabold text-amber-700">Bs {dashboardStats.totalPendingAmount.toLocaleString()}</span>
          <span className="text-xs text-amber-600">{dashboardStats.totalPending} alquileres</span>
        </div>
      </Card>
      
      <Card className="p-4 bg-gradient-to-br from-purple-50 to-white border border-purple-200">
        <div className="flex items-center justify-between">
          <span className="text-purple-700 text-xs font-bold uppercase tracking-wider">Ingresos del Mes</span>
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-purple-100 text-purple-700">📈</span>
        </div>
        <div className="flex items-end justify-between mt-2">
          <span className="text-3xl font-extrabold text-purple-700">Bs {dashboardStats.thisMonthRevenue.toLocaleString()}</span>
          <span className="text-xs text-purple-600">{dashboardStats.thisMonthRentals} alquileres</span>
        </div>
      </Card>
    </div>
  );
};

/**
 * Summary Card - REMOVED (not used anymore)
 * Keeping export for backwards compatibility
 */
export const SummaryCard = () => null;

/**
 * Calendar Widget - Dropdown calendar with rental indicators
 */
export const CalendarWidget = ({ 
  calendarDays, 
  calendarMonth, 
  selectedCalendarDate, 
  onNavigateMonth, 
  onDateClick,
  isOpen,
  onToggle
}) => {
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="relative">
      {/* Botón para abrir/cerrar el calendario */}
      <button
        onClick={onToggle}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all
          ${isOpen 
            ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200' 
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-orange-400'
          }
        `}
      >
        <Icons.Calendar className="w-4 h-4" />
        <span>
          {selectedCalendarDate 
            ? `Filtro: ${selectedCalendarDate}` 
            : 'Filtrar por Fecha'
          }
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown del calendario */}
      {isOpen && (
        <>
          {/* Overlay para cerrar al hacer clic fuera */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onToggle}
          />
          
          <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl border border-gray-200 shadow-xl p-4 min-w-[300px] animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Header con navegación */}
            <div className="flex items-center justify-between mb-3">
              <button 
                onClick={() => onNavigateMonth(-1)} 
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-sm font-bold text-gray-900">
                {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </span>
              <button 
                onClick={() => onNavigateMonth(1)} 
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map(d => (
                <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>
            
            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((d, i) => {
                const isToday = d.date === today;
                const isSelected = d.date === selectedCalendarDate;
                
                return (
                  <button
                    key={i}
                    onClick={() => {
                      if (d.isCurrentMonth && d.date) {
                        onDateClick(d.date);
                      }
                    }}
                    disabled={!d.isCurrentMonth}
                    className={`
                      relative text-xs p-2 rounded-lg transition-all
                      ${!d.isCurrentMonth ? 'text-gray-300 cursor-default' : 'hover:bg-gray-100 cursor-pointer'}
                      ${isToday ? 'ring-2 ring-orange-400 ring-offset-1' : ''}
                      ${isSelected ? 'bg-orange-600 text-white hover:bg-orange-700' : ''}
                      ${d.hasRentals && !isSelected ? 'bg-blue-100 text-blue-800 font-bold' : ''}
                    `}
                    title={d.hasRentals ? `${d.rentalCount} alquiler(es)` : ''}
                  >
                    {d.day}
                    {d.hasRentals && !isSelected && (
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full"></span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Leyenda y acciones */}
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
              <div className="flex flex-wrap gap-3 text-xs">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 bg-blue-100 rounded"></span> Con alquileres
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 ring-2 ring-orange-400 rounded"></span> Hoy
                </span>
              </div>
              {selectedCalendarDate && (
                <button 
                  onClick={() => onDateClick(selectedCalendarDate)}
                  className="w-full text-xs text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors font-medium"
                >
                  ✕ Quitar filtro: {selectedCalendarDate}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/**
 * Payment Tracking Card - Shows pending payment recommendations
 */
export const PaymentTrackingCard = ({ rentals }) => {
  const pendingRentals = rentals.filter(r => r.paymentStatus === 'pending');
  const paidRentals = rentals.filter(r => r.paymentStatus === 'paid');

  if (paidRentals.length === rentals.length) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💰</span>
            Seguimiento de Pagos Pendientes
          </h3>
          <div className="space-y-3">
            {pendingRentals.length > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm font-bold text-red-900">
                  ⚠ {pendingRentals.length} alquiler(es) con pago pendiente
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Monto total pendiente: <span className="font-bold">Bs {pendingRentals.reduce((sum, r) => sum + (r.pendingAmount || 0), 0)}</span>
                </p>
                <p className="text-xs text-red-700 mt-2">
                  Recomendación: Contacte al cliente para completar el pago antes de la fecha del servicio.
                </p>
              </div>
            )}
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded">
              <p className="text-sm font-bold text-emerald-900">
                ✓ {paidRentals.length} alquiler(es) pagados completamente
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default { KPICards, CalendarWidget, PaymentTrackingCard };
