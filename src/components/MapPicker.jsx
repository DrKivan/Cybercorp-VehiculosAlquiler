import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui';
import { Icons } from './Icons';

/**
 * Map Picker Component - Leaflet integration for selecting coordinates
 */
export const MapPicker = ({ onConfirm, onCancel }) => {
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

export default MapPicker;
