import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Input, Select, Badge } from '../ui';
import { Icons } from '../Icons';
import { companyService } from '../../services';

const VEHICLE_STATUSES = [
  { label: 'Disponible', value: 'available' },
  { label: 'Rentado', value: 'rented' },
  { label: 'Mantenimiento', value: 'maintenance' }
];

const DRIVER_STATUSES = [
  { label: 'Disponible', value: 'available' },
  { label: 'Ocupado', value: 'busy' }
];

const isActive = (item) => item?.is_active !== false;

export const CatalogsModal = ({
  isOpen,
  onClose,
  clients,
  vehicles,
  drivers,
  categories,
  onCreateClient,
  onCreateVehicle,
  onCreateDriver,
  onCreateCategory,
  onUpdateClient,
  onUpdateVehicle,
  onUpdateDriver,
  onUpdateCategory
}) => {
  const [activeTab, setActiveTab] = useState('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingTab, setCreatingTab] = useState(null);
  const [createValues, setCreateValues] = useState({});
  const [editingTab, setEditingTab] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  
  // Estados para la configuración de empresa
  const [companySettings, setCompanySettings] = useState(null);
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companySaving, setCompanySaving] = useState(false);
  const [companyError, setCompanyError] = useState('');
  const [companySuccess, setCompanySuccess] = useState('');

  const normalizedClients = Array.isArray(clients) ? clients : [];
  const normalizedVehicles = Array.isArray(vehicles) ? vehicles : [];
  const normalizedDrivers = Array.isArray(drivers) ? drivers : [];
  const normalizedCategories = Array.isArray(categories)
    ? categories.map(c => (typeof c === 'string' ? { id: c, name: c, is_active: true } : c))
    : [];

  useEffect(() => {
    setSearchQuery('');
    setCreatingTab(null);
    setEditingTab(null);
    setEditingId(null);
    setCreateValues({});
    setEditValues({});
    setCompanyError('');
    setCompanySuccess('');
    
    // Cargar datos de empresa cuando se seleccione el tab
    if (activeTab === 'company' && !companySettings) {
      loadCompanySettings();
    }
  }, [activeTab]);

  const loadCompanySettings = async () => {
    setCompanyLoading(true);
    setCompanyError('');
    try {
      const settings = await companyService.getSettings();
      setCompanySettings(settings);
    } catch (error) {
      setCompanyError('Error al cargar configuración: ' + error.message);
    } finally {
      setCompanyLoading(false);
    }
  };

  const saveCompanySettings = async () => {
    setCompanySaving(true);
    setCompanyError('');
    setCompanySuccess('');
    try {
      await companyService.updateSettings(companySettings);
      setCompanySuccess('Configuración guardada correctamente');
      setTimeout(() => setCompanySuccess(''), 3000);
    } catch (error) {
      setCompanyError('Error al guardar: ' + error.message);
    } finally {
      setCompanySaving(false);
    }
  };

  const updateCompanyField = (field, value) => {
    setCompanySettings(prev => ({ ...prev, [field]: value }));
  };

  const tabs = [
    { id: 'clients', label: 'Clientes', icon: Icons.User },
    { id: 'vehicles', label: 'Vehiculos', icon: Icons.Car },
    { id: 'drivers', label: 'Conductores', icon: Icons.User },
    { id: 'categories', label: 'Categorias', icon: Icons.FileText },
    { id: 'company', label: 'Empresa', icon: Icons.Settings }
  ];

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return normalizedClients;
    return normalizedClients.filter(c =>
      String(c.name || '').toLowerCase().includes(query) ||
      String(c.phone || '').toLowerCase().includes(query)
    );
  }, [normalizedClients, searchQuery]);

  const filteredVehicles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return normalizedVehicles;
    return normalizedVehicles.filter(v =>
      `${v.brand} ${v.model} ${v.plate}`.toLowerCase().includes(query)
    );
  }, [normalizedVehicles, searchQuery]);

  const filteredDrivers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return normalizedDrivers;
    return normalizedDrivers.filter(d =>
      String(d.name || '').toLowerCase().includes(query) ||
      String(d.phone || '').toLowerCase().includes(query)
    );
  }, [normalizedDrivers, searchQuery]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return normalizedCategories;
    return normalizedCategories.filter(c =>
      String(c.name || '').toLowerCase().includes(query)
    );
  }, [normalizedCategories, searchQuery]);

  if (!isOpen) return null;

  const startCreate = (tab) => {
    setCreatingTab(tab);
    if (tab === 'clients') setCreateValues({ name: '', phone: '' });
    if (tab === 'vehicles') setCreateValues({ brand: '', model: '', plate: '', size: '', color: '', status: 'available' });
    if (tab === 'drivers') setCreateValues({ name: '', phone: '', license: '', status: 'available' });
    if (tab === 'categories') setCreateValues({ name: '' });
  };

  const cancelCreate = () => {
    setCreatingTab(null);
    setCreateValues({});
  };

  const saveCreate = async () => {
    try {
      if (creatingTab === 'clients') {
        if (!createValues.name?.trim()) return alert('Ingrese el nombre del cliente');
        await onCreateClient({ name: createValues.name.trim(), phone: createValues.phone || '' });
      }
      if (creatingTab === 'vehicles') {
        if (!createValues.brand?.trim() || !createValues.model?.trim() || !createValues.plate?.trim()) {
          return alert('Complete marca, modelo y placa');
        }
        await onCreateVehicle({
          brand: createValues.brand.trim(),
          model: createValues.model.trim(),
          plate: createValues.plate.trim(),
          size: createValues.size || '',
          color: createValues.color || '',
          status: createValues.status || 'available'
        });
      }
      if (creatingTab === 'drivers') {
        if (!createValues.name?.trim()) return alert('Ingrese el nombre del conductor');
        await onCreateDriver({
          name: createValues.name.trim(),
          phone: createValues.phone || '',
          license: createValues.license || '',
          status: createValues.status || 'available'
        });
      }
      if (creatingTab === 'categories') {
        if (!createValues.name?.trim()) return alert('Ingrese el nombre de la categoria');
        await onCreateCategory(createValues.name.trim());
      }

      cancelCreate();
    } catch (error) {
      alert('Error al crear: ' + error.message);
    }
  };

  const startEdit = (tab, item) => {
    setEditingTab(tab);
    setEditingId(item.id);
    if (tab === 'clients') setEditValues({ name: item.name || '', phone: item.phone || '' });
    if (tab === 'vehicles') {
      setEditValues({
        brand: item.brand || '',
        model: item.model || '',
        plate: item.plate || '',
        size: item.size || '',
        color: item.color || '',
        status: item.status || 'available'
      });
    }
    if (tab === 'drivers') {
      setEditValues({
        name: item.name || '',
        phone: item.phone || '',
        license: item.license || '',
        status: item.status || 'available'
      });
    }
    if (tab === 'categories') setEditValues({ name: item.name || '' });
  };

  const cancelEdit = () => {
    setEditingTab(null);
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async () => {
    try {
      if (editingTab === 'clients') {
        await onUpdateClient(editingId, { name: editValues.name.trim(), phone: editValues.phone || '' });
      }
      if (editingTab === 'vehicles') {
        await onUpdateVehicle(editingId, {
          brand: editValues.brand.trim(),
          model: editValues.model.trim(),
          plate: editValues.plate.trim(),
          size: editValues.size || '',
          color: editValues.color || '',
          status: editValues.status || 'available'
        });
      }
      if (editingTab === 'drivers') {
        await onUpdateDriver(editingId, {
          name: editValues.name.trim(),
          phone: editValues.phone || '',
          license: editValues.license || '',
          status: editValues.status || 'available'
        });
      }
      if (editingTab === 'categories') {
        await onUpdateCategory(editingId, { name: editValues.name.trim() });
      }

      cancelEdit();
    } catch (error) {
      alert('Error al actualizar: ' + error.message);
    }
  };

  const toggleActive = async (tab, item) => {
    try {
      const updates = { is_active: !isActive(item) };
      if (tab === 'clients') await onUpdateClient(item.id, updates);
      if (tab === 'vehicles') await onUpdateVehicle(item.id, updates);
      if (tab === 'drivers') await onUpdateDriver(item.id, updates);
      if (tab === 'categories') await onUpdateCategory(item.id, updates);
    } catch (error) {
      alert('Error al actualizar estado: ' + error.message);
    }
  };

  const renderCreateForm = () => {
    if (creatingTab !== activeTab) return null;

    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-orange-900">Nuevo registro</h4>
          <button className="text-orange-600 text-xs font-semibold" onClick={cancelCreate}>Cerrar</button>
        </div>
        {activeTab === 'clients' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm"
              placeholder="Nombre del cliente"
              value={createValues.name || ''}
              onChange={(e) => setCreateValues({ ...createValues, name: e.target.value })}
            />
            <input
              className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm"
              placeholder="Telefono"
              value={createValues.phone || ''}
              onChange={(e) => setCreateValues({ ...createValues, phone: e.target.value })}
            />
          </div>
        )}
        {activeTab === 'vehicles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm"
              placeholder="Marca"
              value={createValues.brand || ''}
              onChange={(e) => setCreateValues({ ...createValues, brand: e.target.value })}
            />
            <input
              className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm"
              placeholder="Modelo"
              value={createValues.model || ''}
              onChange={(e) => setCreateValues({ ...createValues, model: e.target.value })}
            />
            <input
              className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm"
              placeholder="Placa"
              value={createValues.plate || ''}
              onChange={(e) => setCreateValues({ ...createValues, plate: e.target.value })}
            />
            <input
              className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm"
              placeholder="Tamaño (ej: SUV, Sedán, Van)"
              value={createValues.size || ''}
              onChange={(e) => setCreateValues({ ...createValues, size: e.target.value })}
            />
            <input
              className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm"
              placeholder="Color (ej: Blanco, Negro, Rojo)"
              value={createValues.color || ''}
              onChange={(e) => setCreateValues({ ...createValues, color: e.target.value })}
            />
            <Select
              options={VEHICLE_STATUSES}
              value={createValues.status || 'available'}
              onChange={(e) => setCreateValues({ ...createValues, status: e.target.value })}
              className="bg-white"
            />
          </div>
        )}
        {activeTab === 'drivers' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm"
              placeholder="Nombre"
              value={createValues.name || ''}
              onChange={(e) => setCreateValues({ ...createValues, name: e.target.value })}
            />
            <input
              className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm"
              placeholder="Telefono"
              value={createValues.phone || ''}
              onChange={(e) => setCreateValues({ ...createValues, phone: e.target.value })}
            />
            <input
              className="h-9 rounded-md border border-orange-200 bg-white px-3 text-sm"
              placeholder="Licencia"
              value={createValues.license || ''}
              onChange={(e) => setCreateValues({ ...createValues, license: e.target.value })}
            />
            <Select
              options={DRIVER_STATUSES}
              value={createValues.status || 'available'}
              onChange={(e) => setCreateValues({ ...createValues, status: e.target.value })}
              className="bg-white"
            />
          </div>
        )}
        {activeTab === 'categories' && (
          <input
            className="h-9 w-full rounded-md border border-orange-200 bg-white px-3 text-sm"
            placeholder="Nombre de categoria"
            value={createValues.name || ''}
            onChange={(e) => setCreateValues({ ...createValues, name: e.target.value })}
          />
        )}
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={cancelCreate}>Cancelar</Button>
          <Button variant="primary" className="h-8 px-3 text-xs" onClick={saveCreate}>Guardar</Button>
        </div>
      </div>
    );
  };

  const renderTable = () => {
    if (activeTab === 'clients') {
      return (
        <table className="w-full text-left text-[12px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2">Cliente</th>
              <th className="px-3 py-2">Telefono</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredClients.map((client) => {
              const editing = editingTab === 'clients' && editingId === client.id;
              return (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                        value={editValues.name || ''}
                        onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{client.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                        value={editValues.phone || ''}
                        onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                      />
                    ) : (
                      <span className="text-gray-600">{client.phone || '-'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={isActive(client) ? 'success' : 'default'}>
                      {isActive(client) ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      {editing ? (
                        <>
                          <button className="text-xs text-gray-500" onClick={cancelEdit}>Cancelar</button>
                          <button className="text-xs font-semibold text-orange-600" onClick={saveEdit}>Guardar</button>
                        </>
                      ) : (
                        <>
                          <button className="text-xs text-blue-600" onClick={() => startEdit('clients', client)}>Editar</button>
                          <button className="text-xs text-gray-500" onClick={() => toggleActive('clients', client)}>
                            {isActive(client) ? 'Desactivar' : 'Activar'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'vehicles') {
      return (
        <table className="w-full text-left text-[12px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2">Unidad</th>
              <th className="px-3 py-2">Placa</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Activo</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredVehicles.map((vehicle) => {
              const editing = editingTab === 'vehicles' && editingId === vehicle.id;
              return (
                <tr key={vehicle.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {editing ? (
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                          value={editValues.brand || ''}
                          onChange={(e) => setEditValues({ ...editValues, brand: e.target.value })}
                          placeholder="Marca"
                        />
                        <input
                          className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                          value={editValues.model || ''}
                          onChange={(e) => setEditValues({ ...editValues, model: e.target.value })}
                          placeholder="Modelo"
                        />
                        <input
                          className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                          value={editValues.size || ''}
                          onChange={(e) => setEditValues({ ...editValues, size: e.target.value })}
                          placeholder="Tamaño (ej: SUV, Sedán)"
                        />
                        <input
                          className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                          value={editValues.color || ''}
                          onChange={(e) => setEditValues({ ...editValues, color: e.target.value })}
                          placeholder="Color"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-[11px] text-gray-500">{vehicle.size || 'Sin tamaño'} {vehicle.color ? `- ${vehicle.color}` : ''}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                        value={editValues.plate || ''}
                        onChange={(e) => setEditValues({ ...editValues, plate: e.target.value })}
                      />
                    ) : (
                      <span className="font-mono text-gray-700">{vehicle.plate}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editing ? (
                      <Select
                        options={VEHICLE_STATUSES}
                        value={editValues.status || 'available'}
                        onChange={(e) => setEditValues({ ...editValues, status: e.target.value })}
                        className="bg-white"
                      />
                    ) : (
                      <Badge variant={vehicle.status === 'maintenance' ? 'warning' : vehicle.status === 'rented' ? 'info' : 'success'}>
                        {vehicle.status === 'maintenance' ? 'Mantenimiento' : vehicle.status === 'rented' ? 'Rentado' : 'Disponible'}
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={isActive(vehicle) ? 'success' : 'default'}>
                      {isActive(vehicle) ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      {editing ? (
                        <>
                          <button className="text-xs text-gray-500" onClick={cancelEdit}>Cancelar</button>
                          <button className="text-xs font-semibold text-orange-600" onClick={saveEdit}>Guardar</button>
                        </>
                      ) : (
                        <>
                          <button className="text-xs text-blue-600" onClick={() => startEdit('vehicles', vehicle)}>Editar</button>
                          <button className="text-xs text-gray-500" onClick={() => toggleActive('vehicles', vehicle)}>
                            {isActive(vehicle) ? 'Desactivar' : 'Activar'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'drivers') {
      return (
        <table className="w-full text-left text-[12px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2">Conductor</th>
              <th className="px-3 py-2">Telefono</th>
              <th className="px-3 py-2">Estado</th>
              <th className="px-3 py-2">Activo</th>
              <th className="px-3 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDrivers.map((driver) => {
              const editing = editingTab === 'drivers' && editingId === driver.id;
              return (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2">
                    {editing ? (
                      <div className="grid grid-cols-1 gap-2">
                        <input
                          className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                          value={editValues.name || ''}
                          onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                          placeholder="Nombre"
                        />
                        <input
                          className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                          value={editValues.license || ''}
                          onChange={(e) => setEditValues({ ...editValues, license: e.target.value })}
                          placeholder="Licencia"
                        />
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-gray-900">{driver.name}</p>
                        <p className="text-[11px] text-gray-500">Lic: {driver.license || 'N/A'}</p>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editing ? (
                      <input
                        className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                        value={editValues.phone || ''}
                        onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                      />
                    ) : (
                      <span className="text-gray-600">{driver.phone || '-'}</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {editing ? (
                      <Select
                        options={DRIVER_STATUSES}
                        value={editValues.status || 'available'}
                        onChange={(e) => setEditValues({ ...editValues, status: e.target.value })}
                        className="bg-white"
                      />
                    ) : (
                      <Badge variant={driver.status === 'busy' ? 'warning' : 'success'}>
                        {driver.status === 'busy' ? 'Ocupado' : 'Disponible'}
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={isActive(driver) ? 'success' : 'default'}>
                      {isActive(driver) ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-2">
                      {editing ? (
                        <>
                          <button className="text-xs text-gray-500" onClick={cancelEdit}>Cancelar</button>
                          <button className="text-xs font-semibold text-orange-600" onClick={saveEdit}>Guardar</button>
                        </>
                      ) : (
                        <>
                          <button className="text-xs text-blue-600" onClick={() => startEdit('drivers', driver)}>Editar</button>
                          <button className="text-xs text-gray-500" onClick={() => toggleActive('drivers', driver)}>
                            {isActive(driver) ? 'Desactivar' : 'Activar'}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }

    return (
      <table className="w-full text-left text-[12px]">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-3 py-2">Categoria</th>
            <th className="px-3 py-2">Estado</th>
            <th className="px-3 py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredCategories.map((category) => {
            const editing = editingTab === 'categories' && editingId === category.id;
            return (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-3 py-2">
                  {editing ? (
                    <input
                      className="h-8 w-full rounded-md border border-gray-300 px-2 text-xs"
                      value={editValues.name || ''}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                    />
                  ) : (
                    <span className="font-medium text-gray-900">{category.name}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={isActive(category) ? 'success' : 'default'}>
                    {isActive(category) ? 'Activo' : 'Inactivo'}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <div className="flex justify-end gap-2">
                    {editing ? (
                      <>
                        <button className="text-xs text-gray-500" onClick={cancelEdit}>Cancelar</button>
                        <button className="text-xs font-semibold text-orange-600" onClick={saveEdit}>Guardar</button>
                      </>
                    ) : (
                      <>
                        <button className="text-xs text-blue-600" onClick={() => startEdit('categories', category)}>Editar</button>
                        <button className="text-xs text-gray-500" onClick={() => toggleActive('categories', category)}>
                          {isActive(category) ? 'Desactivar' : 'Activar'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

      <Card className="relative w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 z-50">
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between z-10">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-gray-100 text-gray-700 p-1 rounded"><Icons.Settings className="w-5 h-5" /></span>
              Gestion de catalogos
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 cursor-pointer">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6">
          <div className="space-y-3">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                    isSelected
                      ? 'border-orange-200 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-orange-200 hover:text-orange-600'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {activeTab === 'company' ? (
              /* Formulario de configuración de empresa */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold text-gray-900">Configuración de Empresa</h4>
                  {companySuccess && (
                    <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">{companySuccess}</span>
                  )}
                </div>
                
                {companyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                    <span className="ml-3 text-gray-600">Cargando configuración...</span>
                  </div>
                ) : companyError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {companyError}
                    <button onClick={loadCompanySettings} className="ml-2 underline">Reintentar</button>
                  </div>
                ) : companySettings ? (
                  <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Información básica */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Información Básica</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Nombre de la Empresa"
                          value={companySettings.name || ''}
                          onChange={(e) => updateCompanyField('name', e.target.value)}
                        />
                        <Input
                          label="Nombre Corto"
                          value={companySettings.shortName || ''}
                          onChange={(e) => updateCompanyField('shortName', e.target.value)}
                        />
                        <Input
                          label="Slogan"
                          value={companySettings.slogan || ''}
                          onChange={(e) => updateCompanyField('slogan', e.target.value)}
                        />
                        <Input
                          label="NIT"
                          value={companySettings.nit || ''}
                          onChange={(e) => updateCompanyField('nit', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Ubicación y Contacto */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Ubicación y Contacto</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                          <Input
                            label="Dirección"
                            value={companySettings.address || ''}
                            onChange={(e) => updateCompanyField('address', e.target.value)}
                          />
                        </div>
                        <Input
                          label="Ciudad"
                          value={companySettings.city || ''}
                          onChange={(e) => updateCompanyField('city', e.target.value)}
                        />
                        <Input
                          label="Correo Electrónico"
                          type="email"
                          value={companySettings.email || ''}
                          onChange={(e) => updateCompanyField('email', e.target.value)}
                        />
                        <div className="md:col-span-2">
                          <Input
                            label="Teléfonos (separados por coma)"
                            value={(companySettings.phones || []).join(', ')}
                            onChange={(e) => updateCompanyField('phones', e.target.value.split(',').map(p => p.trim()).filter(p => p))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Datos Bancarios */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Datos Bancarios</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Nombre del Banco"
                          value={companySettings.bankName || ''}
                          onChange={(e) => updateCompanyField('bankName', e.target.value)}
                        />
                        <Input
                          label="Tipo de Cuenta"
                          value={companySettings.bankAccountType || ''}
                          onChange={(e) => updateCompanyField('bankAccountType', e.target.value)}
                          placeholder="Ej: Cuenta Corriente, Caja de Ahorro"
                        />
                        <Input
                          label="Número de Cuenta"
                          value={companySettings.bankAccountNumber || ''}
                          onChange={(e) => updateCompanyField('bankAccountNumber', e.target.value)}
                        />
                        <Input
                          label="Titular de la Cuenta"
                          value={companySettings.bankAccountHolder || ''}
                          onChange={(e) => updateCompanyField('bankAccountHolder', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Configuración de Cotizaciones */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Configuración de Cotizaciones</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Prefijo de Cotización"
                          value={companySettings.quotationPrefix || ''}
                          onChange={(e) => updateCompanyField('quotationPrefix', e.target.value)}
                          placeholder="Ej: COT"
                        />
                        <Input
                          label="Días de Validez"
                          type="number"
                          min="1"
                          value={companySettings.quotationValidityDays || 2}
                          onChange={(e) => updateCompanyField('quotationValidityDays', parseInt(e.target.value) || 2)}
                        />
                      </div>
                    </div>

                    {/* Condiciones del Servicio */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <h5 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Condiciones del Servicio</h5>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-600">Una condición por línea</label>
                        <textarea
                          className="w-full h-32 rounded-md border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-orange-600"
                          value={(companySettings.serviceConditions || []).join('\n')}
                          onChange={(e) => updateCompanyField('serviceConditions', e.target.value.split('\n').filter(c => c.trim()))}
                          placeholder="El alquiler mínimo es de 2 horas.&#10;Las horas adicionales se cobrarán a razón de Bs. 500 por hora.&#10;..."
                        />
                      </div>
                    </div>

                    {/* Botón Guardar */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button
                        variant="primary"
                        onClick={saveCompanySettings}
                        disabled={companySaving}
                        className="px-6"
                      >
                        {companySaving ? 'Guardando...' : 'Guardar Configuración'}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              /* Catálogos normales (Clientes, Vehículos, etc.) */
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder={`Buscar en ${tabs.find(tab => tab.id === activeTab)?.label || ''}`}
                      icon={Icons.Search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    className="h-9"
                    onClick={() => startCreate(activeTab)}
                  >
                    Nuevo
                  </Button>
                </div>

                {renderCreateForm()}

                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-[55vh] overflow-y-auto">
                    {renderTable()}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CatalogsModal;
