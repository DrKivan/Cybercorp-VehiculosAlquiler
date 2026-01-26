import React, { useState, useEffect, useMemo } from 'react';
import { exportRentalsToExcel } from '../utils/excelExport';
import { useSupabaseData } from '../hooks/useSupabaseData';

// Import all components
import {
  Card,
  Button,
  Icons,
  KPICards,
  CalendarWidget,
  PaymentTrackingCard,
  FiltersToolbar,
  RentalsTable,
  RentalDetailModal,
  PaymentModal,
  RentalFormModal,
  CatalogsModal
} from '../components';

/**
 * Header Component
 */
const Header = ({ onOpenCatalogs }) => (
  <header className="bg-gradient-to-r from-orange-50 via-white to-purple-50 border-b border-orange-100/60 h-16 flex items-center justify-between px-6 sticky top-0 z-20 shadow-md backdrop-blur">
    <div className="flex items-center gap-3">
      <div className="bg-orange-600 rounded-xl p-1.5 text-white shadow-sm ring-1 ring-orange-300/40">
        <Icons.Car className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-extrabold tracking-tight text-gray-900">
        Fenix<span className="text-orange-600">Cars</span>
        <span className="text-gray-400 font-semibold text-sm ml-3">Gestión v1.0</span>
      </h1>
    </div>
    <div className="flex items-center gap-3">
      <Button variant="outline" icon={Icons.Settings} onClick={onOpenCatalogs}>
        Catalogos
      </Button>
      <div className="h-9 w-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold shadow-sm ring-2 ring-orange-200/60">AD</div>
    </div>
  </header>
);

/**
 * Loading State Component
 */
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Cargando datos...</p>
    </div>
  </div>
);

/**
 * Error State Component
 */
const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center bg-red-50 p-6 rounded-lg border border-red-200">
      <p className="text-red-600 font-bold mb-2">Error al cargar datos</p>
      <p className="text-red-500 text-sm mb-4">{error}</p>
      <Button variant="primary" onClick={onRetry}>Reintentar</Button>
    </div>
  </div>
);

/**
 * Main Preview Component - Orchestrates all sub-components
 */
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
    createCategory,
    updateCategory,
    updateClient,
    updateVehicle,
    updateDriver,
    getClientName,
    getVehicleName,
    getDriverName
  } = useSupabaseData();

  // --- UI STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRentalForDetail, setSelectedRentalForDetail] = useState(null);
  const [catalogsOpen, setCatalogsOpen] = useState(false);
  
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
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
  
  // --- PAYMENT STATES ---
  const [additionalPaymentAmount, setAdditionalPaymentAmount] = useState(0);
  const [selectedPaymentType, setSelectedPaymentType] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRentalForPayment, setSelectedRentalForPayment] = useState(null);
  const [rentalPayments, setRentalPayments] = useState([]);

  // --- CALENDAR LOGIC ---
  const rentalDatesSet = new Set(rentals.map(r => r.date).filter(Boolean));

  const getCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startPadding - 1; i >= 0; i--) {
      days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, date: null });
    }
    
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
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ day: i, isCurrentMonth: false, date: null });
    }
    
    return days;
  };

  const calendarDays = getCalendarDays(calendarMonth);

  const navigateMonth = (delta) => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleCalendarDateClick = (dateStr) => {
    setSelectedCalendarDate(prev => prev === dateStr ? null : dateStr);
  };

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const filteredAndSortedRentals = useMemo(() => {
    let result = [...rentals];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => {
        const clientName = getClientName(r.clientId).toLowerCase();
        const vehicleName = getVehicleName(r.vehicleId).toLowerCase();
        return clientName.includes(query) || vehicleName.includes(query);
      });
    }
    
    if (columnFilters.status) result = result.filter(r => r.status === columnFilters.status);
    if (columnFilters.paymentStatus) result = result.filter(r => r.paymentStatus === columnFilters.paymentStatus);
    if (columnFilters.category) result = result.filter(r => r.category === columnFilters.category);
    if (columnFilters.driverId) result = result.filter(r => String(r.driverId) === columnFilters.driverId);
    if (selectedCalendarDate) result = result.filter(r => r.date === selectedCalendarDate);
    
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
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

  const uniqueCategories = [...new Set(rentals.map(r => r.category).filter(Boolean))];

  // --- ESTADÍSTICAS DEL DASHBOARD ---
  const dashboardStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    
    const reserved = rentals.filter(r => r.status === 'reserved').length;
    const completed = rentals.filter(r => r.status === 'completed').length;
    const pendingRentals = rentals.filter(r => r.paymentStatus === 'pending');
    const totalPending = pendingRentals.length;
    const totalPaid = rentals.filter(r => r.paymentStatus === 'paid').length;
    const totalRevenue = rentals.reduce((sum, r) => sum + (r.amount || 0), 0);
    const totalCollected = rentals.reduce((sum, r) => sum + (r.totalPaid || 0), 0);
    // Solo sumar lo que falta por pagar de alquileres pendientes
    const totalPendingAmount = pendingRentals.reduce((sum, r) => {
      const amount = Number(r.amount) || 0;
      const totalPaid = Number(r.totalPaid) || 0;
      const pending = Math.max(0, amount - totalPaid);
      return sum + pending;
    }, 0);
    const thisMonthRentals = rentals.filter(r => r.date && r.date.startsWith(thisMonth));
    const thisMonthRevenue = thisMonthRentals.reduce((sum, r) => sum + (r.amount || 0), 0);
    const todayRentals = rentals.filter(r => r.date === today);
    
    return {
      reserved, completed, totalPending, totalPaid,
      totalRevenue, totalCollected, totalPendingAmount,
      thisMonthRevenue, thisMonthRentals: thisMonthRentals.length,
      todayRentals: todayRentals.length, totalRentals: rentals.length,
      vehiclesInUse: [...new Set(rentals.filter(r => r.status === 'reserved').map(r => r.vehicleId))].length,
      availableVehicles: vehicles.length - [...new Set(rentals.filter(r => r.status === 'reserved').map(r => r.vehicleId))].length
    };
  }, [rentals, vehicles]);

  // --- HANDLERS ---
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

  const handleOpenDetail = (rental) => {
    setSelectedRentalForDetail(rental);
    setDetailModalOpen(true);
  };

  const handleOpenNew = () => {
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEdit = (rental) => {
    setFormData({
      ...initialFormState,
      ...rental,
      clientId: rental.clientId,
      isNewClient: false,
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
    
    try {
      const payments = await getPaymentsByRental(rental.id);
      setRentalPayments(payments);
    } catch (err) {
      console.error('Error cargando pagos:', err);
      setRentalPayments([]);
    }
  };

  const handleAddPayment = async (mode = 'charge') => {
    const amountValue = Number(additionalPaymentAmount) || 0;
    if (!selectedRentalForPayment) return;
    if (amountValue <= 0) {
      alert("Ingrese un monto válido");
      return;
    }

    const amount = Number(selectedRentalForPayment.amount) || 0;
    const totalPaid = Number(selectedRentalForPayment.totalPaid) || 0;
    const pendingAmount = Math.max(0, amount - totalPaid);
    const balance = totalPaid - amount;
    const isRefund = mode === 'refund';

    if (!isRefund && amountValue > pendingAmount) {
      alert("El monto excede el pendiente");
      return;
    }

    if (isRefund && amountValue > balance) {
      alert("El monto excede el sobrepago");
      return;
    }

    try {
      const paymentTypeLabels = {
        cash: 'Efectivo',
        bank_transfer: 'Transferencia Bancaria',
        qr: 'Pago QR',
        other: 'Otro'
      };

      const paymentLabel = paymentTypeLabels[selectedPaymentType];
      const paymentTypeLabel = isRefund ? `Devolución - ${paymentLabel}` : paymentLabel;
      const paymentAmount = isRefund ? -amountValue : amountValue;
      
      const updatedRental = await addPayment(selectedRentalForPayment.id, {
        amount: paymentAmount,
        paymentType: selectedPaymentType,
        paymentTypeLabel,
        reference: paymentReference
      });
      
      setSelectedRentalForPayment(updatedRental);
      setAdditionalPaymentAmount(0);
      setPaymentReference('');
      
      const payments = await getPaymentsByRental(selectedRentalForPayment.id);
      setRentalPayments(payments);

      alert(`${isRefund ? 'Devolución' : 'Pago'} de Bs ${amountValue} registrada exitosamente`);
    } catch (err) {
      alert("Error al registrar pago: " + err.message);
    }
  };

  const handleSave = async () => {
    let finalClientId = formData.clientId;

    try {
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
        await updateRental(formData.id, rentalData);
      } else {
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

  // --- EFECTO AUTO-COMPLETE RENTALS ---
  useEffect(() => {
    const checkAndCompleteRentals = async () => {
      const now = new Date();
      
      for (const rental of rentals) {
        if (rental.status !== 'reserved' || rental.paymentStatus !== 'paid') continue;
        
        const rentalDate = new Date(rental.date);
        const [endH, endM] = (rental.endTime || "23:59").split(':').map(Number);
        rentalDate.setHours(endH, endM, 0, 0);
        
        if (now > rentalDate) {
          try {
            await updateRental(rental.id, { status: 'completed' });
          } catch (err) {
            console.error('Error al completar alquiler automáticamente:', err);
          }
        }
      }
    };
    
    if (rentals.length > 0) checkAndCompleteRentals();
    const interval = setInterval(checkAndCompleteRentals, 60000);
    return () => clearInterval(interval);
  }, [rentals, updateRental]);

  // --- EFECTO CALCULADORA AUTOMÁTICA ---
  useEffect(() => {
    if (formData.startTime && formData.endTime && formData.baseRate) {
      const [startH, startM] = formData.startTime.split(':').map(Number);
      const [endH, endM] = formData.endTime.split(':').map(Number);
      
      let duration = (endH + endM/60) - (startH + startM/60);
      if (duration < 0) duration += 24;
      if (duration < 1) duration = 1;
      
      const total = Math.round(duration * formData.baseRate);
      setFormData(prev => ({ ...prev, amount: total }));
    }
  }, [formData.startTime, formData.endTime, formData.baseRate]);

  // --- RENDER ---
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={refresh} />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-orange-100">
      <Header onOpenCatalogs={() => setCatalogsOpen(true)} />

      <main className="p-6 w-full max-w-screen-2xl mx-auto space-y-6">
        {/* KPI Dashboard */}
        <KPICards dashboardStats={dashboardStats} vehiclesCount={vehicles.length} />

        {/* Rentals Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Alquileres Recientes</h2>
              <p className="text-sm text-gray-500">Gestión de contratos activos y reservas.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Calendario Dropdown */}
              <CalendarWidget 
                calendarDays={calendarDays}
                calendarMonth={calendarMonth}
                selectedCalendarDate={selectedCalendarDate}
                onNavigateMonth={navigateMonth}
                onDateClick={handleCalendarDateClick}
                isOpen={isCalendarOpen}
                onToggle={() => setIsCalendarOpen(!isCalendarOpen)}
              />
              <Button onClick={() => exportRentalsToExcel(rentals, clients, vehicles, drivers)} variant="outline" icon={Icons.Download}>
                Exportar Excel
              </Button>
              <Button onClick={handleOpenNew} icon={Icons.Plus}>Nuevo Alquiler</Button>
            </div>
          </div>

          <FiltersToolbar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            uniqueCategories={uniqueCategories}
            drivers={drivers}
            selectedCalendarDate={selectedCalendarDate}
            clearFilters={clearFilters}
            filteredCount={filteredAndSortedRentals.length}
            totalCount={rentals.length}
          />

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-3 lg:items-start">
            <div className="lg:h-[calc(100vh-360px)] lg:overflow-y-auto">
              <RentalsTable
                rentals={filteredAndSortedRentals}
                getClientName={getClientName}
                getVehicleName={getVehicleName}
                getDriverName={getDriverName}
                sortConfig={sortConfig}
                onSort={handleSort}
                onOpenDetail={handleOpenDetail}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onOpenPayment={handleOpenPaymentModal}
              />
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <PaymentTrackingCard rentals={rentals} />
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      <RentalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        setFormData={setFormData}
        clients={clients}
        vehicles={vehicles}
        drivers={drivers}
        categories={categories}
        newCategoryMode={newCategoryMode}
        setNewCategoryMode={setNewCategoryMode}
        tempCategory={tempCategory}
        setTempCategory={setTempCategory}
        onCreateCategory={handleCreateCategory}
        newVehicleMode={newVehicleMode}
        setNewVehicleMode={setNewVehicleMode}
        tempVehicle={tempVehicle}
        setTempVehicle={setTempVehicle}
        onCreateVehicle={handleCreateVehicle}
        newDriverMode={newDriverMode}
        setNewDriverMode={setNewDriverMode}
        tempDriver={tempDriver}
        setTempDriver={setTempDriver}
        onCreateDriver={handleCreateDriver}
        showMap={showMap}
        setShowMap={setShowMap}
        onSave={handleSave}
      />

      <PaymentModal
        rental={selectedRentalForPayment}
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        payments={rentalPayments}
        getClientName={getClientName}
        additionalPaymentAmount={additionalPaymentAmount}
        setAdditionalPaymentAmount={setAdditionalPaymentAmount}
        selectedPaymentType={selectedPaymentType}
        setSelectedPaymentType={setSelectedPaymentType}
        paymentReference={paymentReference}
        setPaymentReference={setPaymentReference}
        onAddPayment={handleAddPayment}
      />

      <RentalDetailModal
        rental={selectedRentalForDetail}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        getClientName={getClientName}
        getVehicleName={getVehicleName}
        getDriverName={getDriverName}
        clients={clients}
        vehicles={vehicles}
        drivers={drivers}
      />

      <CatalogsModal
        isOpen={catalogsOpen}
        onClose={() => setCatalogsOpen(false)}
        clients={clients}
        vehicles={vehicles}
        drivers={drivers}
        categories={categories}
        onCreateClient={createClient}
        onCreateVehicle={createVehicle}
        onCreateDriver={createDriver}
        onCreateCategory={createCategory}
        onUpdateClient={updateClient}
        onUpdateVehicle={updateVehicle}
        onUpdateDriver={updateDriver}
        onUpdateCategory={updateCategory}
      />
    </div>
  );
};

export default Preview;
