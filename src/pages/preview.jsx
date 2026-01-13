import React, { useState, useEffect, useRef } from 'react';

/**
 * Componentes UI Reutilizables (Simulando Shadcn/Enterprise Design System)
 * Estilo: Clean, Denso, Accent Orange-600
 */

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", className = "", icon: Icon, ...props }) => {
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
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </button>
  );
};

const Input = ({ label, error, icon: Icon, className = "", ...props }) => (
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

// --- ICONOS SVG INLINE (Estilo Lucide) ---
const Icons = {
  Plus: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  MapPin: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Calendar: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Car: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 012-2v0a2 2 0 012 2v0" /></svg>,
  Search: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  X: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>,
  Map: (props) => <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
};

// --- MAP PICKER COMPONENT (LEAFLET via CDN) ---
const MapPicker = ({ onConfirm, onCancel }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [selectedCoords, setSelectedCoords] = useState(null);

  useEffect(() => {
    // Si Leaflet no está cargado (CDN falló), no hacer nada
    if (!window.L || !mapRef.current) return;
    
    // Evitar reinicializar
    if (mapInstanceRef.current) return;

    // Configurar iconos para que funcionen con CDN
    const L = window.L;
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    // Inicializar Mapa - Centro Default: Tarija, Bolivia
    const defaultCenter = [-21.5322, -64.7331]; 
    const map = L.map(mapRef.current).setView(defaultCenter, 13);
    
    // Capa OpenStreetMap

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);

    // Evento Click
    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        // Redondear para estética
        const coords = { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
        
        setSelectedCoords(coords);
        
        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng]).addTo(map);
        }
    });
    
    mapInstanceRef.current = map;

    // Fix tamaño al cargar
    setTimeout(() => {
       map.invalidateSize();
    }, 100);
    
    // Cleanup
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
                   ) : (
                      <span className="text-gray-500 animate-pulse">Haga clic en mapa para marcar pin...</span>
                   )}
               </div>
               <div className="flex gap-2">
                   <Button variant="outline" onClick={onCancel}>Cancelar</Button>
                   <Button 
                     variant="primary" 
                     onClick={() => selectedCoords && onConfirm(selectedCoords)}
                     disabled={!selectedCoords}
                     className={!selectedCoords ? "opacity-50 cursor-not-allowed" : ""}
                   >
                     Confirmar
                   </Button>
               </div>
           </div>
      </div>
  );
};

export const Preview = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState(null); 
  
  // Estado para Categories (simulando "Crear si no existe")
  const [categories, setCategories] = useState(["Matrimonio", "Corporativo", "Turismo", "Graduación"]);
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tempCategory, setTempCategory] = useState("");

  const handleCreateCategory = () => {
    if (tempCategory.trim()) {
      setCategories([...categories, tempCategory]);
      setSelectedCategory(tempCategory);
      setNewCategoryMode(false);
      setTempCategory("");
    }
  };

  const handleSetLocation = (coords) => {
    setLocation(coords);
    setShowMap(false);
  };

  // Mock data para tablas
  const rentals = [
    { id: 1024, client: "Empresa Minera X", vehicle: "Toyota Hilux 2024", plate: "V5A-992", event: "Supervisión", date: "2024-01-15", status: "rented" },
    { id: 1023, client: "Juan Pérez", vehicle: "Kia Cerato", plate: "X2B-123", event: "Matrimonio", date: "2024-01-14", status: "finished" },
    { id: 1022, client: "Maria G.", vehicle: "H-1 Van", plate: "Z1Z-555", event: "Turismo", date: "2024-01-12", status: "reserved" },
  ];

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
          <div className="h-9 w-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold">
            AD
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* KPI / STATUS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {["Disponibles: 12", "En Renta: 5", "Mantenimiento: 2", "Reservados: 3"].map((stat, i) => (
            <Card key={i} className="p-4 flex flex-col border-l-4 border-l-orange-500 shadow-sm">
               <span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Estado de Flota</span>
               <span className="text-xl font-bold text-gray-800">{stat}</span>
            </Card>
          ))}
        </div>

        {/* RENTALS TABLE SECTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Alquileres Recientes</h2>
              <p className="text-sm text-gray-500">Gestión de contratos activos y reservas.</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} icon={Icons.Plus}>Nuevo Alquiler</Button>
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
                    <th className="px-4 py-3">ESTADO</th>
                    <th className="px-4 py-3 text-right">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rentals.map((r) => (
                    <tr key={r.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-gray-500">#{r.id}</td>
                      <td className="px-4 py-3 font-medium">{r.client}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span>{r.vehicle}</span>
                          <span className="text-xs text-gray-400">{r.plate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge variant="default">{r.event}</Badge></td>
                      <td className="px-4 py-3 text-gray-600">{r.date}</td>
                      <td className="px-4 py-3">
                        {r.status === 'rented' && <Badge variant="info">En Curso</Badge>}
                        {r.status === 'finished' && <Badge variant="success">Finalizado</Badge>}
                        {r.status === 'reserved' && <Badge variant="warning">Reservado</Badge>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" className="h-8 px-2 text-xs">Ver detalle</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </main>

      {/* FORM MODAL - CREATE RENTAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop w/ blur */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <Card className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-orange-100 text-orange-700 p-1 rounded"><Icons.Plus className="w-5 h-5"/></span>
                  Nuevo Contrato de Alquiler
                </h3>
                <p className="text-xs text-gray-500 mt-1">Complete todos los campos requeridos para generar la orden.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
                <Icons.X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: PRIMARY RENTAL DATA */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* SECTION: CLIENTE */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 border-b pb-1 border-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">1</span>
                    Datos del Cliente
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Buscar Cliente Existente" placeholder="Escriba DNI o Nombre..." icon={Icons.Search} /> 
                    <div className="flex items-end gap-2">
                      <Button variant="outline" className="w-full border-dashed text-gray-500 hover:text-orange-600 hover:border-orange-300">
                        + Crear Nuevo Cliente
                      </Button>
                    </div>
                    {/* Campos manuales ocultos o mostrados según lógica de negocio real */}
                    <Input label="Nombre Completo" placeholder="Ej. Juan Perez" />
                    <Input label="Teléfono / Celular" placeholder="+51 900 000 000" />
                  </div>
                </div>

                {/* SECTION: EVENTO & UBICACION */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-900 border-b pb-1 border-gray-100 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">2</span>
                    Evento y Ubicación
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CATEGORY SELECTOR WITH CREATE OPTION */}
                    <div className="space-y-1.5 w-full">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Categoría Evento</label>
                      {!newCategoryMode ? (
                        <div className="flex gap-2">
                          <div className="relative w-full">
                            <select 
                              className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-orange-600"
                              value={selectedCategory}
                              onChange={(e) => setSelectedCategory(e.target.value)}
                            >
                              <option value="">-- Seleccionar --</option>
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <Button variant="outline" onClick={() => setNewCategoryMode(true)} className="px-3" title="Crear nueva categoría">+</Button>
                        </div>
                      ) : (
                        <div className="flex gap-2 animate-in fade-in slide-in-from-left-2">
                           <Input 
                              placeholder="Nueva categoría..." 
                              value={tempCategory} 
                              onChange={(e) => setTempCategory(e.target.value)}
                              autoFocus
                           />
                           <Button variant="primary" onClick={handleCreateCategory} className="px-3">OK</Button>
                           <Button variant="ghost" onClick={() => setNewCategoryMode(false)} className="px-3">X</Button>
                        </div>
                      )}
                    </div>

                    <Input label="Nombre Específico Evento" placeholder="Ej. Boda Flores-Mamani" />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Ubicación Exacta</label>
                    <div className="grid grid-cols-1 gap-3">
                       <Input placeholder="Calle / Avenida / Referencia escrita" icon={Icons.MapPin} />
                       
                       {/* MAP WIDGET TRIGGER */}
                       {!location ? (
                         <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-gray-500 bg-white hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => setShowMap(true)}>
                            <Icons.Map className="h-8 w-8 mb-2 text-gray-400" />
                            <span className="text-sm font-medium">Click para fijar ubicación en mapa</span>
                            <span className="text-xs text-gray-400">Permite abrir en Google Maps posteriormente</span>
                         </div>
                       ) : (
                         <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-md text-green-800 animate-in fade-in">
                            <div className="flex items-center gap-2">
                               <Icons.MapPin className="h-5 w-5 text-green-600" />
                               <div className="flex flex-col">
                                 <span className="text-xs font-bold text-green-700">Ubicación Fijada</span>
                                 <span className="text-xs opacity-75">{location.lat}, {location.lng}</span>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <a 
                                 href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="text-xs bg-white border border-green-200 px-2 py-1 rounded hover:bg-green-100 text-green-700 flex items-center gap-1"
                                 onClick={(e) => e.stopPropagation()}
                               >
                                 Abrir Maps ↗
                               </a>
                               <button onClick={() => setLocation(null)} className="text-xs text-green-700 underline px-2">Cambiar</button>
                            </div>
                         </div>
                       )}
                    </div>
                  </div>
                </div>

                {/* SECTION: VEHICULO & CHOFER */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                   <div className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-900 border-b pb-1 border-gray-100 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">3</span>
                        Vehículo
                      </h4>
                      <Select 
                        label="Seleccionar Unidad"
                        options={[
                          { label: "Toyota Hilux - V5A-992 (Disponible)", value: 1 },
                          { label: "Hyundai H1 - Z1Z-555 (Disponible)", value: 2 }
                        ]} 
                      />
                      <div className="bg-blue-50 text-blue-800 text-xs p-2 rounded border border-blue-100">
                        Capacidad: 4 Pasajeros <br/> Color: Negro Metálico
                      </div>
                   </div>
                   <div className="space-y-3">
                      <h4 className="text-sm font-bold text-gray-900 border-b pb-1 border-gray-100 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">4</span>
                        Chofer
                      </h4>
                      <Select 
                        label="Asignar Conductor"
                        options={[
                          { label: "Carlos Mamani (Turno Mañana)", value: 1 },
                          { label: "Miguel Ángel (Turno Noche)", value: 2 }
                        ]} 
                      />
                      <div className="flex gap-2 mt-4 items-center">
                        <input type="checkbox" id="sin_chofer" className="rounded border-gray-300 text-orange-600 focus:ring-orange-600" />
                        <label htmlFor="sin_chofer" className="text-sm text-gray-700">Alquiler sin chofer</label>
                      </div>
                   </div>
                </div>

              </div>

              {/* RIGHT COLUMN: SUMMARY & PAYMENT */}
              <div className="lg:col-span-4 space-y-6">
                <Card className="bg-gray-50 border-gray-200 p-5 h-full flex flex-col">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Resumen Financiero</h4>
                  
                  <div className="space-y-4 flex-1">
                    <Input type="date" label="Fecha Inicio" defaultValue="2026-01-13" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input type="time" label="Hora Inicio" defaultValue="09:00" />
                      <Input type="time" label="Hora Fin" defaultValue="18:00" />
                    </div>
                    
                    <div className="py-2">
                       <div className="flex justify-between text-sm mb-1">
                         <span className="text-gray-500">Tiempo Total:</span>
                         <span className="font-medium">9 Horas</span>
                       </div>
                       <div className="flex justify-between text-sm mb-1">
                         <span className="text-gray-500">Tarifa Base:</span>
                         <span className="font-medium">S/ 50.00 / hr</span>
                       </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <label className="text-xs font-semibold text-gray-600 uppercase">Monto Acordado (S/)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1.5 text-gray-500 font-bold">S/</span>
                        <input className="w-full pl-8 pr-3 py-2 bg-white border border-gray-300 rounded font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-500" defaultValue="450.00" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                       <label className="text-xs font-semibold text-gray-600 uppercase">A cuenta / Adelanto</label>
                       <Input placeholder="0.00" />
                    </div>

                    <div className="pt-4">
                       <label className="text-xs font-semibold text-gray-600 uppercase block mb-1">Estado Inicial</label>
                       <div className="flex gap-2">
                          <Badge variant="warning">Pendiente</Badge>
                          <span className="text-xs text-gray-400 self-center">Se cambiará al guardar</span>
                       </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 space-y-3">
                    <Button variant="primary" className="w-full py-6 text-base shadow-lg shadow-orange-200">
                      Confirmar Contrato
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setIsModalOpen(false)}>
                      Cancelar
                    </Button>
                  </div>
                </Card>
              </div>

            </div>
          </Card>
          
          {/* MAPA MODAL OVERLAY (NOW USING LEAFLET) */}
          {showMap && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
               <div className="w-full max-w-2xl h-[500px] shadow-2xl animate-in fade-in zoom-in-95">
                 <MapPicker 
                   onConfirm={handleSetLocation} 
                   onCancel={() => setShowMap(false)} 
                 />
               </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Preview;
