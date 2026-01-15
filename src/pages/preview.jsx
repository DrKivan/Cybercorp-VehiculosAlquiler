import React, { useState, useEffect, useRef } from 'react';
import { exportRentalsToExcel } from '../utils/excelExport';

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
  // --- MOCK DATA INICIAL ---
  const [rentals, setRentals] = useState([
    { 
      id: 1024, clientId: 1, vehicleId: 1, 
      category: "Supervisión", eventName: "Visita de Obra", 
      date: "2024-01-15", status: "rented", amount: 450,
      initialPayment: 150, pendingAmount: 300, paymentStatus: "partial",
      startTime: "08:00", endTime: "17:00", baseRate: 50,
      locationText: "Mina San Cristobal", locationCoords: null, driverId: "1"
    },
    { 
      id: 1023, clientId: 101, vehicleId: 2, 
      category: "Matrimonio", eventName: "Boda Juan y Ana",
      date: "2024-01-14", status: "finished", amount: 300,
      initialPayment: 300, pendingAmount: 0, paymentStatus: "paid",
      startTime: "14:00", endTime: "20:00", baseRate: 50,
      locationText: "Salón Los Olivos", locationCoords: null, driverId: ""
    },
  ]);

  const [clients, setClients] = useState([
    { id: 1, name: "Empresa Minera X", phone: "700123456" },
    { id: 101, name: "Juan Pérez", phone: "700987654" }
  ]);

  const vehicles = [
    { id: 1, name: "Toyota Hilux", plate: "V5A-992", color: "Blanco" },
    { id: 2, name: "Hyundai H1", plate: "Z1Z-555", color: "Negro" },
    { id: 3, name: "Nissan Versa", plate: "444-ABC", color: "Plata" }
  ];

  const [categories, setCategories] = useState(["Matrimonio", "Corporativo", "Turismo", "Graduación"]);

  // --- UI STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  
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
    locationText: "",
    locationCoords: null,
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "18:00",
    baseRate: 50, // Tarifa base editable
    amount: 0,
    initialPayment: 0, // Pago Inicial
    pendingAmount: 0, // Monto Pendiente (calculado)
    paymentStatus: "pending", // pending, partial, paid
    paymentHistory: [], // Array de transacciones: [{amount, date, time, type}, ...]
    status: "reserved"
  };

  const [formData, setFormData] = useState(initialFormState);
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [tempCategory, setTempCategory] = useState("");
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [additionalPaymentAmount, setAdditionalPaymentAmount] = useState(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRentalForPayment, setSelectedRentalForPayment] = useState(null);
  // --- CALCULADORA AUTOMÁTICA ---
  useEffect(() => {
    // Calculo automático del monto
    if (formData.startTime && formData.endTime && formData.baseRate) {
      const [startH, startM] = formData.startTime.split(':').map(Number);
      const [endH, endM] = formData.endTime.split(':').map(Number);
      
      let duration = (endH + endM/60) - (startH + startM/60);
      if (duration < 0) duration += 24; // Handle overnight logic simply
      
      // Mínimo 1 hora cobrable
      if (duration < 1) duration = 1;
      
      const total = Math.round(duration * formData.baseRate);
      
      // Calcular monto pendiente
      const initial = formData.initialPayment || 0;
      const pending = Math.max(0, total - initial);
      
      // Determinar estado de pago
      let paymentStatus = "pending";
      if (initial > 0 && pending > 0) paymentStatus = "partial";
      if (pending === 0 && initial > 0) paymentStatus = "paid";
      
      setFormData(prev => ({ 
        ...prev, 
        amount: total,
        pendingAmount: pending,
        paymentStatus: paymentStatus
      }));
    }
  }, [formData.startTime, formData.endTime, formData.baseRate, formData.initialPayment]);


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
      category: rental.category || rental.event || "", // Compatibilidad
      eventName: rental.eventName || "",
      driverId: rental.driverId || "",
      locationText: rental.locationText || "",
      locationCoords: rental.locationCoords || null
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que desea eliminar este registro?")) {
      setRentals(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleOpenPaymentModal = (rental) => {
    setSelectedRentalForPayment(rental);
    setAdditionalPaymentAmount(0);
    setPaymentModalOpen(true);
  };

  const handleAddPayment = () => {
    if (additionalPaymentAmount <= 0) {
      alert("Ingrese un monto válido");
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    // Crear nueva transacción
    const newTransaction = {
      amount: additionalPaymentAmount,
      date: dateStr,
      time: timeStr,
      type: "additional"
    };

    // Actualizar el alquiler con el nuevo pago
    setRentals(prev => prev.map(r => {
      if (r.id === selectedRentalForPayment.id) {
        const updatedHistory = [...(r.paymentHistory || []), newTransaction];
        const totalPaid = updatedHistory.reduce((sum, t) => sum + t.amount, 0);
        const pending = Math.max(0, r.amount - totalPaid);
        
        let newPaymentStatus = "pending";
        if (totalPaid > 0 && pending > 0) newPaymentStatus = "partial";
        if (pending === 0 && totalPaid > 0) newPaymentStatus = "paid";

        const updatedRental = {
          ...r,
          initialPayment: totalPaid,
          pendingAmount: pending,
          paymentStatus: newPaymentStatus,
          paymentHistory: updatedHistory
        };

        // Actualizar selectedRentalForPayment para que el modal se refresque
        setSelectedRentalForPayment(updatedRental);

        return updatedRental;
      }
      return r;
    }));

    setAdditionalPaymentAmount(0);
    alert(`Pago de S/ ${additionalPaymentAmount} registrado exitosamente`);
  };

  const handleSave = () => {
    // Logica de Guardado (Create or Update)
    let finalClientId = formData.clientId;

    // 1. Crear Cliente si es nuevo
    if (formData.isNewClient) {
      if (!formData.newClientName) return alert("Ingrese nombre del cliente nuevo");
      const newClient = {
        id: Date.now(),
        name: formData.newClientName,
        phone: formData.newClientPhone
      };
      setClients([...clients, newClient]);
      finalClientId = newClient.id;
    } else {
        if (!finalClientId) return alert("Seleccione un cliente");
    }

    if (!formData.vehicleId) return alert("Seleccione un vehículo");

    // Preparar historial de pagos
    let paymentHistory = formData.paymentHistory || [];
    
    // Si es creación nueva (no update) y hay pago inicial, agregarlo al historial
    if (!formData.id && formData.initialPayment > 0 && paymentHistory.length === 0) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0];
      paymentHistory = [{
        amount: formData.initialPayment,
        date: dateStr,
        time: timeStr,
        type: "initial"
      }];
    }

    const rentalData = {
      id: formData.id || Date.now(), // ID nuevo o existente
      clientId: finalClientId,
      vehicleId: Number(formData.vehicleId),
      // Guardado completo de todos los campos del form
      category: formData.category || "General",
      eventName: formData.eventName || "",
      date: formData.date,
      status: formData.status,
      amount: formData.amount,
      initialPayment: formData.initialPayment || 0,
      pendingAmount: formData.pendingAmount,
      paymentStatus: formData.paymentStatus,
      paymentHistory: paymentHistory,
      startTime: formData.startTime,
      endTime: formData.endTime,
      baseRate: formData.baseRate,
      locationCoords: formData.locationCoords,
      locationText: formData.locationText,
      driverId: formData.driverId
    };

    if (formData.id) {
      // Update
      setRentals(prev => prev.map(r => r.id === formData.id ? { ...r, ...rentalData } : r));
    } else {
      // Create
      setRentals([rentalData, ...rentals]);
    }

    setIsModalOpen(false);
  };

  const handleCreateCategory = () => {
    if (tempCategory.trim()) {
      setCategories([...categories, tempCategory]);
      setFormData({...formData, category: tempCategory});
      setNewCategoryMode(false);
      setTempCategory("");
    }
  };

  // Helper para mostrar nombres en tabla
  const getClientName = (id) => clients.find(c => c.id === id)?.name || "Desconocido";
  const getVehicleName = (id) => {
      const v = vehicles.find(v => v.id === id);
      return v ? `${v.name} (${v.plate})` : "Desconocido";
  };

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
          <Button variant="outline" className="hidden sm:flex" icon={Icons.Search}>Buscar contrato...</Button>
          <div className="h-9 w-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold">AD</div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* KPI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["Disponibles: 12", "En Renta: 5", "Mantenimiento: 2", "Reservados: 3"].map((stat, i) => (
            <Card key={i} className="p-4 flex flex-col border-l-4 border-l-orange-500 shadow-sm">
               <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Estado de Flota</span>
               <span className="text-xl font-bold text-gray-800">{stat}</span>
            </Card>
          ))}
        </div>

        {/* RENTALS TABLE */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Alquileres Recientes</h2>
              <p className="text-sm text-gray-500">Gestión de contratos activos y reservas.</p>
            </div>
            <Button onClick={() => exportRentalsToExcel(rentals, clients, vehicles)} variant="outline" icon={Icons.Download} className="mr-2">
                Exportar Excel
            </Button>
            <Button onClick={handleOpenNew} icon={Icons.Plus}>Nuevo Alquiler</Button>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 font-medium text-gray-600">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">CLIENTE</th>
                    <th className="px-4 py-3">VEHÍCULO</th>
                    <th className="px-4 py-3">EVENTO</th>
                    <th className="px-4 py-3">FECHA</th>
                    <th className="px-4 py-3">MONTO</th>
                    <th className="px-4 py-3">ESTADO</th>
                    <th className="px-4 py-3">PAGO</th>
                    <th className="px-4 py-3 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rentals.map((r) => (
                    <tr key={r.id} className="hover:bg-orange-50/30 transition-colors group">
                      <td className="px-4 py-3 font-mono text-gray-500">#{r.id}</td>
                      <td className="px-4 py-3 font-medium">{getClientName(r.clientId)}</td>
                      <td className="px-4 py-3">{getVehicleName(r.vehicleId)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                            <Badge variant="default">{r.category || r.event}</Badge>
                            {r.eventName && <span className="text-xs text-gray-400 mt-1">{r.eventName}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.date}</td>
                      <td className="px-4 py-3 font-semibold">S/ {r.amount}</td>
                      <td className="px-4 py-3">
                        {r.status === 'rented' && <Badge variant="info">En Curso</Badge>}
                        {r.status === 'finished' && <Badge variant="success">Finalizado</Badge>}
                        {r.status === 'reserved' && <Badge variant="warning">Reservado</Badge>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {r.paymentStatus === 'paid' && (
                            <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded text-center">
                              ✓ Pagado
                            </div>
                          )}
                          {r.paymentStatus === 'partial' && (
                            <div className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded">
                              Pago: S/ {r.initialPayment || 0}
                            </div>
                          )}
                          {r.paymentStatus === 'pending' && (
                            <div className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded text-center">
                              Pendiente
                            </div>
                          )}
                          {(r.paymentHistory && r.paymentHistory.length > 0) && (
                            <button 
                              onClick={() => handleOpenPaymentModal(r)}
                              className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline"
                              title={`${r.paymentHistory.length} transacción(es)`}
                            >
                              📋 Ver {r.paymentHistory.length} transacción(es)
                            </button>
                          )}
                          {(r.paymentStatus === 'partial' || r.paymentStatus === 'pending') && (
                            <div className="text-xs text-gray-600 px-2">
                              Falta: S/ {r.pendingAmount || (r.amount - (r.initialPayment || 0))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
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
                  {rentals.length === 0 && (
                      <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-400">No hay registros</td></tr>
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
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Ubicación</label>
                    <div className="grid grid-cols-1 gap-3">
                       <Input 
                        placeholder="Calle / Avenida / Referencia" 
                        icon={Icons.MapPin} 
                        value={formData.locationText}
                        onChange={e => setFormData({...formData, locationText: e.target.value})}
                       />
                       
                       {!formData.locationCoords ? (
                         <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-gray-500 bg-white hover:bg-gray-50 cursor-pointer" onClick={() => setShowMap(true)}>
                            <Icons.Map className="h-8 w-8 mb-2 text-gray-400" />
                            <span className="text-sm font-medium">Click para fijar en mapa</span>
                         </div>
                       ) : (
                         <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-md text-green-800">
                            <div className="flex items-center gap-2">
                               <Icons.MapPin className="h-5 w-5 text-green-600" />
                               <span className="text-xs font-bold text-green-700">Ubicación Fijada: {formData.locationCoords.lat}, {formData.locationCoords.lng}</span>
                            </div>
                            <button onClick={() => setFormData({...formData, locationCoords: null})} className="text-xs underline px-2">Quitar</button>
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
                      <Select 
                        label="Seleccionar Unidad"
                        options={vehicles.map(v => ({ label: `${v.name} - ${v.plate}`, value: v.id }))} 
                        value={formData.vehicleId}
                        onChange={e => setFormData({...formData, vehicleId: e.target.value})}
                      />
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-900 border-b pb-1 border-gray-100 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">4</span>
                        Chofer
                      </h4>
                        value={formData.driverId}
                        onChange={e => setFormData({...formData, driverId: e.target.value})}
                      <Select 
                        label="Asignar Conductor"
                        options={[{ label: "Sin Chofer", value: "" }, { label: "Carlos Mamani", value: "1" }]} 
                      />
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
                            onChange={e => setFormData({...formData, amount: Number(e.target.value)})} // Permite override manual
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-right italic">Se calculó automáticamente según horas</p>
                    </div>

                    <div className="space-y-2 pt-4">
                      <Input 
                        type="number" 
                        label="Pago Inicial (Opcional)" 
                        placeholder="0"
                        value={formData.initialPayment || 0}
                        onChange={e => setFormData({...formData, initialPayment: Math.max(0, Number(e.target.value))})}
                      />
                      <p className="text-xs text-gray-500">Adelanto que realiza el cliente. Si deja vacío será 0.</p>
                    </div>

                    {/* TRACKING DE PAGO */}
                    <div className="space-y-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-900 uppercase">Pendiente:</span>
                        <span className="text-lg font-bold text-blue-700">S/ {formData.pendingAmount}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-blue-700 mb-1">
                          <span>Progreso de Pago</span>
                          <span>{Math.round((formData.initialPayment / formData.amount) * 100 || 0)}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all" 
                            style={{ width: `${Math.min(100, (formData.initialPayment / formData.amount) * 100 || 0)}%` }}
                          />
                        </div>
                      </div>
                      {formData.paymentStatus === 'paid' && (
                        <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded text-center">
                          ✓ PAGO COMPLETADO
                        </div>
                      )}
                      {formData.paymentStatus === 'partial' && (
                        <div className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded text-center">
                          ⚠ PAGO PARCIAL - Falta: S/ {formData.pendingAmount}
                        </div>
                      )}
                      {formData.paymentStatus === 'pending' && (
                        <div className="text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded text-center">
                          ✕ SIN PAGO INICIAL - Pendiente: S/ {formData.pendingAmount}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                        <Select 
                            label="Estado Inicial" 
                            options={[{ label: "Reservado", value: "reserved"}, { label: "En Curso", value: "rented" }]}
                            value={formData.status}
                            onChange={e => setFormData({...formData, status: e.target.value})}
                        />
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
                   onConfirm={(coords) => { setFormData({...formData, locationCoords: coords}); setShowMap(false); }} 
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
                    <p className="font-bold text-lg text-emerald-700">S/ {selectedRentalForPayment.initialPayment || 0}</p>
                  </div>
                </div>
              </div>

              {/* HISTORIAL DE TRANSACCIONES */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900">Historial de Transacciones</h4>
                {(selectedRentalForPayment.paymentHistory || []).length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">Sin registros de pago</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(selectedRentalForPayment.paymentHistory || []).map((payment, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-3 rounded border border-gray-200">
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">
                            {payment.type === 'initial' ? '💳 Pago Inicial' : '➕ Pago Adicional'}
                          </p>
                          <p className="text-gray-500">{payment.date} {payment.time}</p>
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

                  <div className="space-y-2">
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
                    <p className="text-xs text-gray-600">
                      Puede pagar parcialmente o completar el monto pendiente.
                    </p>
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
