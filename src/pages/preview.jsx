import React, { useState, useEffect, useRef } from 'react';
import { exportRentalsToExcel } from '../utils/excelExport';
import { useSupabaseData } from '../hooks/useSupabaseData';

/**
 * Componentes UI Reutilizables
 */

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", className = "", icon: Icon, onClick, ...props }) => {
  const base = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-600 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 cursor-pointer";
  const variants = {
    primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-sm",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    success: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100"
  };
  
  return (
    <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

const Input = ({ label, error, icon: Icon, className = "", rightElement, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>}
    <div className="relative">
        <input 
        className={`flex h-9 w-full rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-600 disabled:cursor-not-allowed disabled:opacity-50 ${Icon ? 'pl-9' : ''} ${className} ${error ? 'border-red-500' : ''}`}
        {...props} 
        />
        {Icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                <Icon className="h-4 w-4" />
            </div>
        )}
        {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {rightElement}
            </div>
        )}
    </div>
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

const Select = ({ label, options, className = "", ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{label}</label>}
    <div className="relative">
      <select 
        className={`flex h-9 w-full appearance-none rounded-md border border-gray-300 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-600 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
      >
        <option value="">-- Seleccionar --</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
    </div>
  </div>
);

const Badge = ({ variant = "default", children }) => {
  const styles = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-emerald-100 text-emerald-800 border-emerald-200",
    warning: "bg-amber-100 text-amber-800 border-amber-200",
    info: "bg-blue-100 text-blue-800 border-blue-200"
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- ICONOS SVG ---
const Icons = {
  Plus: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,    Download: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,  MapPin: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Calendar: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Car: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 012-2v0a2 2 0 012 2v0" /></svg>,
  Search: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  X: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Map: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  Edit: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>,
  Trash: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
};

// --- MAP PICKER COMPONENT ---
const MapPicker = ({ onConfirm, onCancel }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState(null);

  useEffect(() => {
    if (!window.L || !mapRef.current) return;
    if (mapInstanceRef.current) return;

    const L = window.L;
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const defaultCenter = [-21.5322, -64.7331]; // TARIJA, BOLIVIA
    const map = L.map(mapRef.current).setView(defaultCenter, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const coords = { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
        setSelectedCoords(coords);
        
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng]).addTo(map);
        }
    });
    
    mapInstanceRef.current = map;

    setTimeout(() => { map.invalidateSize(); }, 100);
    
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []);

  return (
      <div className="flex flex-col h-full bg-white rounded-lg">
          <div className='flex items-center justify-between mb-4'>
             <h3 className="text-lg font-bold">Seleccionar Ubicación Exacta</h3>
             <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><Icons.X /></button>
          </div>
          <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative border border-gray-300 min-h-[400px]">
              <div ref={mapRef} className="absolute inset-0 z-0" />
          </div>
          <div className="mt-4 flex justify-between items-center bg-gray-50 p-3 rounded border border-gray-200">
               <div className="text-sm">
                   {selectedCoords ? (
                      <span className="flex items-center gap-2 text-green-700 font-bold">
                        <Icons.MapPin className="h-4 w-4"/>
                        {selectedCoords.lat}, {selectedCoords.lng}
                      </span>
                   ) : <span className="text-gray-500 animate-pulse">Haga clic en mapa para marcar pin...</span>}
               </div>
               <div className="flex gap-2">
                   <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                   <Button variant="primary" onClick={() => selectedCoords && onConfirm(selectedCoords)} disabled={!selectedCoords}>Confirmar</Button>
               </div>
           </div>
      </div>
  );
};

export const Preview = () => {
  // --- CONEXIÓN CON SUPABASE ---
  const {
    rentals,
    clients,
    vehicles,
    categories,
    drivers,
    loading,
    error,
    refresh,
    createClient,
    createVehicle,
    createDriver,
    createRental,
    updateRental,
    deleteRental,
    addPayment,
    getPaymentsByRental,
    PAYMENT_TYPES,
    createCategory,
    getClientName,
    getVehicleName,
    getDriverName
  } = useSupabaseData();

  // --- UI STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
  // --- FILTROS Y BÚSQUEDA ---
  const [searchQuery, setSearchQuery] = useState('');
  const [columnFilters, setColumnFilters] = useState({
    status: '',
    paymentStatus: '',
    category: '',
    driverId: ''
  });
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' });
  
  // --- CALENDARIO ---
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  
  // --- FORM STATE ---
  const initialFormState = {
    id: null,
    clientId: "",
    newClientName: "",
    newClientPhone: "",
    isNewClient: false,
    vehicleId: "", 
    driverId: "", 
    category: "",
    eventName: "",
    pickupLocation: "",
    destinationLocation: "",
    pickupCoords: null,
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "18:00",
    baseRate: 50,
    amount: 0,
    status: "reserved"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [tempCategory, setTempCategory] = useState("");
  const [newVehicleMode, setNewVehicleMode] = useState(false);
  const [tempVehicle, setTempVehicle] = useState({ brand: "", model: "", size: "", plate: "" });
  const [newDriverMode, setNewDriverMode] = useState(false);
  const [tempDriver, setTempDriver] = useState({ name: "", phone: "", license: "" });
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [additionalPaymentAmount, setAdditionalPaymentAmount] = useState(0);
  const [selectedPaymentType, setSelectedPaymentType] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRentalForPayment, setSelectedRentalForPayment] = useState(null);
  const [rentalPayments, setRentalPayments] = useState([]);

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const filteredAndSortedRentals = React.useMemo(() => {
    let result = [...rentals];
    
    // Búsqueda por nombre de cliente o placa de vehículo
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => {
        const clientName = getClientName(r.clientId).toLowerCase();
        const vehicleName = getVehicleName(r.vehicleId).toLowerCase();
        return clientName.includes(query) || vehicleName.includes(query);
      });
    }
    
    // Filtros por columna
    if (columnFilters.status) {
      result = result.filter(r => r.status === columnFilters.status);
    }
    if (columnFilters.paymentStatus) {
      result = result.filter(r => r.paymentStatus === columnFilters.paymentStatus);
    }
    if (columnFilters.category) {
      result = result.filter(r => r.category === columnFilters.category);
    }
    if (columnFilters.driverId) {
      result = result.filter(r => String(r.driverId) === columnFilters.driverId);
    }
    // Filtro por fecha del calendario
    if (selectedCalendarDate) {
      result = result.filter(r => r.date === selectedCalendarDate);
    }
    
    // Ordenamiento
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        // Manejo especial para campos numéricos
        if (['amount', 'id'].includes(sortConfig.key)) {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        }
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [rentals, searchQuery, columnFilters, sortConfig, selectedCalendarDate, getClientName, getVehicleName]);

  // Obtener valores únicos para filtros
  const uniqueCategories = [...new Set(rentals.map(r => r.category).filter(Boolean))];
  
  // Obtener fechas con alquileres para el calendario
  const rentalDatesSet = new Set(rentals.map(r => r.date).filter(Boolean));

  // --- FUNCIONES DEL CALENDARIO ---
  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Días del mes anterior (padding)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, date: null });
    }
    
    // Días del mes actual
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        day: d,
        isCurrentMonth: true,
        date: dateStr,
        hasRentals: rentalDatesSet.has(dateStr),
        rentalCount: rentals.filter(r => r.date === dateStr).length
      });
    }
    
    // Días del siguiente mes (padding)
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, date: null });
    }
    
    return days;
  };

  const calendarDays = getCalendarDays(calendarMonth);
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const navigateMonth = (delta) => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleCalendarDateClick = (dateStr) => {
    if (selectedCalendarDate === dateStr) {
      setSelectedCalendarDate(null); // Deseleccionar si ya está seleccionado
    } else {
      setSelectedCalendarDate(dateStr);
    }
  };

  // --- ESTADÍSTICAS REALES DEL DASHBOARD ---
  const dashboardStats = React.useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    
    // Alquileres por estado
    const reserved = rentals.filter(r => r.status === 'reserved').length;
    const completed = rentals.filter(r => r.status === 'completed').length;
    
    // Pagos
    const totalPending = rentals.filter(r => r.paymentStatus === 'pending').length;
    const totalPartial = rentals.filter(r => r.paymentStatus === 'partial').length;
    const totalPaid = rentals.filter(r => r.paymentStatus === 'paid').length;
    
    // Montos
    const totalRevenue = rentals.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalCollected = rentals.reduce((sum, r) => sum + (r.totalPaid || 0), 0);
    const totalPendingAmount = rentals.reduce((sum, r) => sum + (r.pendingAmount || 0), 0);
    
    // Este mes
    const thisMonthRentals = rentals.filter(r => r.date && r.date.startsWith(thisMonth));
    const thisMonthRevenue = thisMonthRentals.reduce((sum, r) => sum + (r.amount || 0), 0);
    
    // Hoy
    const todayRentals = rentals.filter(r => r.date === today);
    
    return {
      reserved,
      completed,
      totalPending,
      totalPartial,
      totalPaid,
      totalRevenue,
      totalCollected,
      totalPendingAmount,
      thisMonthRevenue,
      thisMonthRentals: thisMonthRentals.length,
      todayRentals: todayRentals.length,
      totalRentals: rentals.length,
      vehiclesInUse: [...new Set(rentals.filter(r => r.status === 'reserved').map(r => r.vehicleId))].length,
      availableVehicles: vehicles.length - [...new Set(rentals.filter(r => r.status === 'reserved').map(r => r.vehicleId))].length
    };
  }, [rentals, vehicles]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setColumnFilters({ status: '', paymentStatus: '', category: '', driverId: '' });
    setSelectedCalendarDate(null);
  };

  // --- EFECTO PARA AUTO-COMPLETAR ALQUILERES ---
  // Verifica si los alquileres cumplen las condiciones para ser marcados como "completed"
  useEffect(() => {
    const checkAndCompleteRentals = async () => {
      const now = new Date();
      
      for (const rental of rentals) {
        // Solo procesar si está en estado "reserved" 
        if (rental.status !== 'reserved') continue;
        
        // Verificar si el pago está completado
        if (rental.paymentStatus !== 'paid') continue;
        
        // Verificar si la fecha y hora del evento ya pasaron
        const rentalDate = new Date(rental.date);
        const [endH, endM] = (rental.endTime || "23:59").split(':').map(Number);
        rentalDate.setHours(endH, endM, 0, 0);
        
        if (now > rentalDate) {
          // Ambas condiciones cumplidas: marcar como completado
          try {
            await updateRental(rental.id, { status: 'completed' });
          } catch (err) {
            console.error('Error al completar alquiler automáticamente:', err);
          }
        }
      }
    };
    
    // Ejecutar verificación al cargar y cada minuto
    if (rentals.length > 0) {
      checkAndCompleteRentals();
    }
    
    const interval = setInterval(checkAndCompleteRentals, 60000); // Cada minuto
    return () => clearInterval(interval);
  }, [rentals, updateRental]);

  // --- CALCULADORA AUTOMÁTICA ---
  useEffect(() => {
    // Calculo automático del monto basado en horas
    if (formData.startTime && formData.endTime && formData.baseRate) {
      const [startH, startM] = formData.startTime.split(':').map(Number);
      const [endH, endM] = formData.endTime.split(':').map(Number);
      
      let duration = (endH + endM/60) - (startH + startM/60);
      if (duration < 0) duration += 24; // Handle overnight logic simply
      
      // Mínimo 1 hora cobrable
      if (duration < 1) duration = 1;
      
      const total = Math.round(duration * formData.baseRate);
      
      setFormData(prev => ({ 
        ...prev, 
        amount: total
      }));
    }
  }, [formData.startTime, formData.endTime, formData.baseRate]);


  // --- HANDLERS ---
  const handleOpenNew = () => {
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEdit = (rental) => {
    // Reconstruir estado del form basado en rental existente
    const rentalClient = clients.find(c => c.id === rental.clientId);
    setFormData({
      ...initialFormState,
      ...rental,
      clientId: rental.clientId,
      isNewClient: false,
      // Recuperar datos completos
      startTime: rental.startTime || "08:00", 
      endTime: rental.endTime || "17:00",
      baseRate: rental.baseRate || 50,
      category: rental.category || rental.event || "",
      eventName: rental.eventName || "",
      driverId: rental.driverId || "",
      pickupLocation: rental.pickupLocation || "A confirmar",
      destinationLocation: rental.destinationLocation || "A confirmar",
      pickupCoords: rental.pickupCoords || null
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que desea eliminar este registro?")) {
      try {
        await deleteRental(id);
      } catch (err) {
        alert("Error al eliminar: " + err.message);
      }
    }
  };

  const handleOpenPaymentModal = async (rental) => {
    setSelectedRentalForPayment(rental);
    setAdditionalPaymentAmount(0);
    setSelectedPaymentType('cash');
    setPaymentReference('');
    setPaymentModalOpen(true);
    
    // Cargar historial de pagos
    try {
      const payments = await getPaymentsByRental(rental.id);
      setRentalPayments(payments);
    } catch (err) {
      console.error('Error cargando pagos:', err);
      setRentalPayments([]);
    }
  };

  const handleAddPayment = async () => {
    if (additionalPaymentAmount <= 0) {
      alert("Ingrese un monto válido");
      return;
    }

    try {
      const paymentTypeLabels = {
        cash: 'Efectivo',
        bank_transfer: 'Transferencia Bancaria',
        qr: 'Pago QR',
        other: 'Otro'
      };
      
      const updatedRental = await addPayment(selectedRentalForPayment.id, {
        amount: additionalPaymentAmount,
        paymentType: selectedPaymentType,
        paymentTypeLabel: paymentTypeLabels[selectedPaymentType],
        reference: paymentReference
      });
      
      setSelectedRentalForPayment(updatedRental);
      setAdditionalPaymentAmount(0);
      setPaymentReference('');
      
      // Recargar pagos
      const payments = await getPaymentsByRental(selectedRentalForPayment.id);
      setRentalPayments(payments);
      
      alert(`Pago de S/ ${additionalPaymentAmount} registrado exitosamente`);
    } catch (err) {
      alert("Error al registrar pago: " + err.message);
    }
  };

  const handleSave = async () => {
    // Logica de Guardado (Create or Update)
    let finalClientId = formData.clientId;

    try {
      // 1. Crear Cliente si es nuevo
      if (formData.isNewClient) {
        if (!formData.newClientName) return alert("Ingrese nombre del cliente nuevo");
        const newClient = await createClient({
          name: formData.newClientName,
          phone: formData.newClientPhone
        });
        finalClientId = newClient.id;
      } else {
          if (!finalClientId) return alert("Seleccione un cliente");
      }

      if (!formData.vehicleId) return alert("Seleccione un vehículo");

      const rentalData = {
        clientId: finalClientId,
        vehicleId: Number(formData.vehicleId),
        category: formData.category || "General",
        eventName: formData.eventName || "",
        date: formData.date,
        status: formData.status || "reserved",
        amount: formData.amount,
        startTime: formData.startTime,
        endTime: formData.endTime,
        baseRate: formData.baseRate,
        pickupLocation: formData.pickupLocation || "A confirmar",
        destinationLocation: formData.destinationLocation || "A confirmar",
        pickupCoords: formData.pickupCoords,
        driverId: formData.driverId
      };

      if (formData.id) {
        // Update
        await updateRental(formData.id, rentalData);
      } else {
        // Create
        await createRental(rentalData);
      }

      setIsModalOpen(false);
    } catch (err) {
      alert("Error al guardar: " + err.message);
    }
  };

  const handleCreateCategory = async () => {
    if (tempCategory.trim()) {
      try {
        await createCategory(tempCategory);
        setFormData({...formData, category: tempCategory});
        setNewCategoryMode(false);
        setTempCategory("");
      } catch (err) {
        alert("Error al crear categoría: " + err.message);
      }
    }
  };

  const handleCreateVehicle = async () => {
    if (!tempVehicle.brand.trim() || !tempVehicle.model.trim() || !tempVehicle.plate.trim()) {
      alert("Ingrese marca, modelo y placa del vehículo");
      return;
    }
    try {
      const newVehicle = await createVehicle(tempVehicle);
      setFormData({...formData, vehicleId: newVehicle.id});
      setNewVehicleMode(false);
      setTempVehicle({ brand: "", model: "", size: "", plate: "" });
    } catch (err) {
      alert("Error al crear vehículo: " + err.message);
    }
  };

  const handleCreateDriver = async () => {
    if (!tempDriver.name.trim()) {
      alert("Ingrese el nombre del conductor");
      return;
    }
    try {
      const newDriver = await createDriver(tempDriver);
      setFormData({...formData, driverId: newDriver.id});
      setNewDriverMode(false);
      setTempDriver({ name: "", phone: "", license: "" });
    } catch (err) {
      alert("Error al crear conductor: " + err.message);
    }
  };

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
          <p className="text-red-600 font-bold mb-2">Error al cargar datos</p>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <Button variant="primary" onClick={refresh}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-orange-100">
      
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-orange-600 rounded-lg p-1.5 text-white">
            <Icons.Car className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Fenix<span className="text-orange-600">Cars</span> <span className="text-gray-400 font-normal text-sm ml-2">| Gestión v1.0</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold">AD</div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* KPI DASHBOARD - DATOS REALES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-emerald-500">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Vehículos Disponibles</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-bold text-emerald-700">{dashboardStats.availableVehicles}</span>
              <span className="text-xs text-gray-400">de {vehicles.length} total</span>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-blue-500">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">En Alquiler Activo</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-bold text-blue-700">{dashboardStats.reserved}</span>
              <span className="text-xs text-gray-400">{dashboardStats.vehiclesInUse} vehículos</span>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-amber-500">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pagos Pendientes</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-bold text-amber-700">S/ {dashboardStats.totalPendingAmount.toLocaleString()}</span>
              <span className="text-xs text-gray-400">{dashboardStats.totalPending + dashboardStats.totalPartial} alquileres</span>
            </div>
          </Card>
          <Card className="p-4 border-l-4 border-l-purple-500">
            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Ingresos del Mes</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-3xl font-bold text-purple-700">S/ {dashboardStats.thisMonthRevenue.toLocaleString()}</span>
              <span className="text-xs text-gray-400">{dashboardStats.thisMonthRentals} alquileres</span>
            </div>
          </Card>
        </div>

        {/* RESUMEN RÁPIDO */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Mini Stats */}
          <Card className="p-4 col-span-1 lg:col-span-2">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Resumen General</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalRentals}</p>
                <p className="text-xs text-gray-500">Total Alquileres</p>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-700">{dashboardStats.completed}</p>
                <p className="text-xs text-emerald-600">Completados</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">{dashboardStats.totalPaid}</p>
                <p className="text-xs text-blue-600">Pagos Completos</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-700">{dashboardStats.todayRentals}</p>
                <p className="text-xs text-orange-600">Hoy</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Facturado:</span>
                <span className="font-bold text-gray-900">S/ {dashboardStats.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Total Cobrado:</span>
                <span className="font-bold text-emerald-700">S/ {dashboardStats.totalCollected.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* CALENDARIO INTERACTIVO */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Icons.Calendar className="w-4 h-4" /> Calendario
              </h3>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => navigateMonth(-1)} 
                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                >◀</button>
                <span className="text-sm font-semibold px-2">
                  {monthNames[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </span>
                <button 
                  onClick={() => navigateMonth(1)} 
                  className="p-1 hover:bg-gray-100 rounded text-gray-600"
                >▶</button>
              </div>
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
                const isToday = d.date === new Date().toISOString().split('T')[0];
                const isSelected = d.date === selectedCalendarDate;
                
                return (
                  <button
                    key={i}
                    onClick={() => d.isCurrentMonth && d.date && handleCalendarDateClick(d.date)}
                    disabled={!d.isCurrentMonth}
                    className={`
                      relative text-xs p-1.5 rounded transition-all
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
            
            {/* Leyenda */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-blue-100 rounded"></span> Con alquileres
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 ring-2 ring-orange-400 rounded"></span> Hoy
              </span>
              {selectedCalendarDate && (
                <button 
                  onClick={() => setSelectedCalendarDate(null)}
                  className="text-red-600 hover:underline ml-auto"
                >
                  Quitar filtro: {selectedCalendarDate}
                </button>
              )}
            </div>
          </Card>
        </div>

        {/* RENTALS TABLE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Alquileres Recientes</h2>
              <p className="text-sm text-gray-500">Gestión de contratos activos y reservas.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => exportRentalsToExcel(rentals, clients, vehicles)} variant="outline" icon={Icons.Download}>
                  Exportar Excel
              </Button>
              <Button onClick={handleOpenNew} icon={Icons.Plus}>Nuevo Alquiler</Button>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <Card className="p-4">
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
                    { value: 'partial', label: 'Parcial' },
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
              {(searchQuery || Object.values(columnFilters).some(v => v) || selectedCalendarDate) && (
                <Button variant="ghost" onClick={clearFilters} className="text-red-600 hover:text-red-800">
                  <Icons.X className="w-4 h-4 mr-1" /> Limpiar
                </Button>
              )}
            </div>
            
            {/* Indicador de resultados */}
            <div className="mt-3 text-xs text-gray-500">
              Mostrando {filteredAndSortedRentals.length} de {rentals.length} registros
              {(searchQuery || Object.values(columnFilters).some(v => v) || selectedCalendarDate) && (
                <span className="ml-2 text-orange-600 font-semibold">
                  (filtrado{selectedCalendarDate ? ` por ${selectedCalendarDate}` : ''})
                </span>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 font-medium text-gray-600">
                  <tr>
                    <th className="px-3 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('id')}>
                      ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-3 py-3">CLIENTE</th>
                    <th className="px-3 py-3">VEHÍCULO</th>
                    <th className="px-3 py-3">CONDUCTOR</th>
                    <th className="px-3 py-3">RECOGIDA</th>
                    <th className="px-3 py-3">DESTINO</th>
                    <th className="px-3 py-3">EVENTO</th>
                    <th className="px-3 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('date')}>
                      FECHA {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-3 py-3 cursor-pointer hover:bg-gray-100" onClick={() => handleSort('amount')}>
                      MONTO {sortConfig.key === 'amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-3 py-3">ESTADO</th>
                    <th className="px-3 py-3">PAGO</th>
                    <th className="px-3 py-3 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAndSortedRentals.map((r) => (
                    <tr key={r.id} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-3 py-3 font-mono text-gray-500">#{r.id}</td>
                      <td className="px-3 py-3 font-medium">{getClientName(r.clientId)}</td>
                      <td className="px-3 py-3 text-xs">{getVehicleName(r.vehicleId)}</td>
                      <td className="px-3 py-3">
                        {r.driverId ? (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {getDriverName(r.driverId)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-gray-600 max-w-[120px] truncate block" title={r.pickupLocation}>
                          📍 {r.pickupLocation || 'A confirmar'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs text-gray-600 max-w-[120px] truncate block" title={r.destinationLocation}>
                          🏁 {r.destinationLocation || 'A confirmar'}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col">
                            <Badge variant="default">{r.category || r.event}</Badge>
                            {r.eventName && <span className="text-xs text-gray-400 mt-1">{r.eventName}</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-600 text-xs">{r.date}</td>
                      <td className="px-3 py-3 font-semibold">S/ {r.amount}</td>
                      <td className="px-3 py-3">
                        {r.status === 'completed' && <Badge variant="success">Completado</Badge>}
                        {r.status === 'reserved' && <Badge variant="warning">Reservado</Badge>}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          {r.paymentStatus === 'paid' && (
                            <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded text-center">
                              ✓ Pagado
                            </div>
                          )}
                          {r.paymentStatus === 'partial' && (
                            <div className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                              Pago: S/ {r.totalPaid || 0}
                            </div>
                          )}
                          {r.paymentStatus === 'pending' && (
                            <div className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded text-center">
                              Pendiente
                            </div>
                          )}
                          {/* Botón para ver historial de transacciones - disponible siempre */}
                          <button 
                            onClick={() => handleOpenPaymentModal(r)}
                            className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                            title="Ver historial de transacciones"
                          >
                            📋 Ver historial
                          </button>
                          {(r.paymentStatus === 'partial' || r.paymentStatus === 'pending') && (
                            <div className="text-xs text-gray-600">
                              Falta: S/ {r.pendingAmount || (r.amount - (r.totalPaid || 0))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                            {(r.paymentStatus === 'partial' || r.paymentStatus === 'pending') && (
                              <button 
                                onClick={() => handleOpenPaymentModal(r)} 
                                className="text-green-600 hover:text-green-800 p-1 font-bold text-sm" 
                                title="Completar Pago"
                              >
                                💳
                              </button>
                            )}
                            <button onClick={() => handleEdit(r)} className="text-blue-600 hover:text-blue-800 p-1" title="Editar"><Icons.Edit className="w-4 h-4"/></button>
                            <button onClick={() => handleDelete(r.id)} className="text-red-600 hover:text-red-800 p-1" title="Eliminar"><Icons.Trash className="w-4 h-4"/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredAndSortedRentals.length === 0 && (
                      <tr><td colSpan="12" className="px-4 py-8 text-center text-gray-400">
                        {rentals.length === 0 ? 'No hay registros' : 'No se encontraron resultados con los filtros aplicados'}
                      </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* SEGUIMIENTO Y RECOMENDACIONES DE PAGO */}
          {rentals.filter(r => r.paymentStatus !== 'paid').length > 0 && (
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">💰</span>
                    Seguimiento de Pagos Pendientes
                  </h3>
                  <div className="space-y-3">
                    {rentals.filter(r => r.paymentStatus === 'pending').length > 0 && (
                      <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                        <p className="text-sm font-bold text-red-900">
                          ⚠ {rentals.filter(r => r.paymentStatus === 'pending').length} alquiler(es) sin pago inicial
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          Monto total pendiente: <span className="font-bold">S/ {rentals.filter(r => r.paymentStatus === 'pending').reduce((sum, r) => sum + r.amount, 0)}</span>
                        </p>
                        <p className="text-xs text-red-700 mt-2">
                          Recomendación: Contacte al cliente para confirmar la reserva con al menos un pago inicial.
                        </p>
                      </div>
                    )}
                    {rentals.filter(r => r.paymentStatus === 'partial').length > 0 && (
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded">
                        <p className="text-sm font-bold text-amber-900">
                          ⚙ {rentals.filter(r => r.paymentStatus === 'partial').length} alquiler(es) con pago parcial
                        </p>
                        <p className="text-xs text-amber-700 mt-1">
                          Monto total faltante: <span className="font-bold">S/ {rentals.filter(r => r.paymentStatus === 'partial').reduce((sum, r) => sum + (r.pendingAmount || 0), 0)}</span>
                        </p>
                        <p className="text-xs text-amber-700 mt-2">
                          Recomendación: Envíe recordatorio de pago antes de la fecha del servicio.
                        </p>
                      </div>
                    )}
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded">
                      <p className="text-sm font-bold text-emerald-900">
                        ✓ {rentals.filter(r => r.paymentStatus === 'paid').length} alquiler(es) pagados completamente
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </section>
      </main>

      {/* FORM MODAL - CREATE/EDIT RENTAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-700 p-1 rounded"><Icons.Plus className="w-5 h-5"/></span>
                  {formData.id ? 'Editar Contrato' : 'Nuevo Contrato de Alquiler'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
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
                           <Button variant="primary" onClick={handleCreateCategory} className="px-3">OK</Button>
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
                              <Button variant="primary" onClick={handleCreateVehicle} className="flex-1">Guardar</Button>
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
                              <Button variant="primary" onClick={handleCreateDriver} className="flex-1">Guardar</Button>
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
                            label="Tarifa Base (S/ por Hora)" 
                            value={formData.baseRate}
                            onChange={e => setFormData({...formData, baseRate: Number(e.target.value)})}
                        />
                    </div>

                    <div className="space-y-2 pt-4 border-t border-gray-200">
                      <label className="text-sm font-bold text-gray-800 uppercase block">Total Calculado</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500 font-bold text-lg">S/</span>
                        <input 
                            className="w-full pl-9 pr-3 py-3 bg-orange-50 border border-orange-200 rounded font-bold text-2xl text-orange-700 focus:outline-none" 
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
                    <Button variant="primary" className="w-full py-6 text-base shadow-lg shadow-orange-200" onClick={handleSave}>
                      {formData.id ? 'Guardar Cambios' : 'Generar Contrato'}
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>
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
      )}

      {/* MODAL DE COMPLETAR PAGO */}
      {paymentModalOpen && selectedRentalForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPaymentModalOpen(false)}></div>
          
          <Card className="relative w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  Completar Pago
                </h3>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* INFORMACIÓN DEL ALQUILER */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Cliente</p>
                    <p className="font-bold text-gray-900">{getClientName(selectedRentalForPayment.clientId)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600 uppercase">ID Contrato</p>
                    <p className="font-mono text-gray-700">#{selectedRentalForPayment.id}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase">Monto Total</p>
                    <p className="font-bold text-lg text-gray-900">S/ {selectedRentalForPayment.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-600 uppercase">Pagado</p>
                    <p className="font-bold text-lg text-emerald-700">S/ {selectedRentalForPayment.totalPaid || 0}</p>
                  </div>
                </div>
              </div>

              {/* HISTORIAL DE TRANSACCIONES */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900">Historial de Transacciones</h4>
                {rentalPayments.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">Sin registros de pago</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {rentalPayments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center text-xs bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">
                            {payment.paymentTypeLabel || payment.paymentType}
                          </p>
                          <p className="text-gray-500">{payment.paymentDate} {payment.paymentTime}</p>
                          {payment.reference && <p className="text-gray-400 text-[10px]">Ref: {payment.reference}</p>}
                        </div>
                        <p className="font-bold text-emerald-700">S/ {payment.amount}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* MONTO PENDIENTE Y FORMULARIO */}
              {selectedRentalForPayment.paymentStatus !== 'paid' && (
                <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-blue-900">Monto Pendiente:</p>
                    <p className="text-2xl font-bold text-blue-700">S/ {selectedRentalForPayment.pendingAmount}</p>
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
                        <span className="absolute left-3 top-2 text-gray-500 font-bold text-lg">S/</span>
                        <input 
                          type="number"
                          placeholder={`Máximo: S/ ${selectedRentalForPayment.pendingAmount}`}
                          value={additionalPaymentAmount}
                          onChange={e => setAdditionalPaymentAmount(Math.max(0, Number(e.target.value)))}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
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
                    onClick={handleAddPayment}
                    disabled={additionalPaymentAmount <= 0 || additionalPaymentAmount > selectedRentalForPayment.pendingAmount}
                  >
                    ✓ Registrar Pago de S/ {additionalPaymentAmount || 0}
                  </Button>
                </div>
              )}

              {selectedRentalForPayment.paymentStatus === 'paid' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
                  <p className="text-lg font-bold text-emerald-700">✓ Pago Completado</p>
                  <p className="text-xs text-emerald-600 mt-1">Todo el monto ha sido pagado</p>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setPaymentModalOpen(false)}>
                Cerrar
              </Button>
            </div>
          </Card>
        </div>
      )}

    </div>
  );
};

export default Preview;
