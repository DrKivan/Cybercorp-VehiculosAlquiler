-- =====================================================
-- ESQUEMA DE BASE DE DATOS PARA SUPABASE
-- FenixCars - Sistema de Alquiler de Vehículos
-- =====================================================

-- Tabla de Clientes
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Vehículos
CREATE TABLE vehicles (
    id BIGSERIAL PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,        -- Marca (Toyota, Hyundai, etc.)
    model VARCHAR(100) NOT NULL,        -- Modelo (Hilux, H1, etc.)
    size VARCHAR(50),                   -- Tamaño (Compacto, Sedán, SUV, Van, Camioneta)
    color VARCHAR(50),                  -- Color del vehículo
    plate VARCHAR(20) NOT NULL UNIQUE,  -- Placa
    status VARCHAR(50) DEFAULT 'available', -- available, rented, maintenance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Conductores
CREATE TABLE drivers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    license VARCHAR(50),
    status VARCHAR(50) DEFAULT 'available', -- available, busy
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Categorías de Eventos
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Alquileres/Contratos
CREATE TABLE rentals (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT REFERENCES clients(id) ON DELETE SET NULL,
    vehicle_id BIGINT REFERENCES vehicles(id) ON DELETE SET NULL,
    driver_id BIGINT REFERENCES drivers(id) ON DELETE SET NULL,
    
    -- Información del evento
    category VARCHAR(100),
    event_name VARCHAR(255),
    
    -- Fechas y horarios
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    
    -- Ubicaciones
    pickup_location TEXT DEFAULT 'A confirmar',      -- Lugar de recogida
    destination_location TEXT DEFAULT 'A confirmar', -- Lugar de destino
    pickup_coords JSONB,                             -- Coordenadas del lugar de recogida {lat, lng}
    
    -- Información financiera (montos calculados/resumen)
    base_rate DECIMAL(10, 2) DEFAULT 50,
    amount DECIMAL(10, 2) NOT NULL,
    total_paid DECIMAL(10, 2) DEFAULT 0,      -- Total pagado (suma de payments)
    pending_amount DECIMAL(10, 2) DEFAULT 0,  -- Monto pendiente
    payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid
    
    -- Estado del alquiler
    status VARCHAR(50) DEFAULT 'reserved', -- reserved, completed
    
    -- Metadatos
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Pagos (Auditoría independiente)
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    rental_id BIGINT REFERENCES rentals(id) ON DELETE CASCADE NOT NULL,
    
    -- Información del pago
    amount DECIMAL(10, 2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL,  -- cash, bank_transfer, qr, other
    payment_type_label VARCHAR(100),    -- Etiqueta descriptiva del tipo
    
    -- Metadatos del pago
    reference VARCHAR(255),             -- Número de referencia/comprobante
    notes TEXT,                         -- Notas adicionales
    
    -- Auditoría
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_time TIME DEFAULT CURRENT_TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by VARCHAR(255)             -- Usuario que registró el pago (futuro)
);

-- Tabla de Configuración de Empresa (singleton - solo 1 registro)
CREATE TABLE company_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Solo permite 1 registro
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    slogan VARCHAR(255),
    address TEXT,
    city VARCHAR(100),
    phones TEXT[],                      -- Array de teléfonos
    email VARCHAR(255),
    nit VARCHAR(50),
    -- Información bancaria
    bank_name VARCHAR(100),
    bank_account_type VARCHAR(50),
    bank_account_number VARCHAR(50),
    bank_account_holder VARCHAR(255),
    -- Configuración de cotizaciones
    quotation_prefix VARCHAR(10) DEFAULT 'COT',
    quotation_validity_days INTEGER DEFAULT 2,
    -- Condiciones del servicio (array de textos)
    service_conditions TEXT[],
    -- Métodos de pago (JSONB para flexibilidad)
    payment_methods JSONB,
    -- Logo (URL o base64)
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

CREATE INDEX idx_rentals_date ON rentals(date);
CREATE INDEX idx_rentals_status ON rentals(status);
CREATE INDEX idx_rentals_payment_status ON rentals(payment_status);
CREATE INDEX idx_rentals_client_id ON rentals(client_id);
CREATE INDEX idx_rentals_vehicle_id ON rentals(vehicle_id);
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_payments_rental_id ON payments(rental_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
CREATE INDEX idx_payments_payment_type ON payments(payment_type);

-- =====================================================
-- TRIGGERS PARA ACTUALIZAR updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at
    BEFORE UPDATE ON vehicles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_drivers_updated_at
    BEFORE UPDATE ON drivers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rentals_updated_at
    BEFORE UPDATE ON rentals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIÓN PARA ACTUALIZAR TOTALES DE PAGO EN RENTAL
-- =====================================================

CREATE OR REPLACE FUNCTION update_rental_payment_totals()
RETURNS TRIGGER AS $$
DECLARE
    v_total_paid DECIMAL(10, 2);
    v_amount DECIMAL(10, 2);
    v_pending DECIMAL(10, 2);
    v_status VARCHAR(50);
BEGIN
    -- Calcular total pagado para este rental
    SELECT COALESCE(SUM(amount), 0) INTO v_total_paid
    FROM payments
    WHERE rental_id = COALESCE(NEW.rental_id, OLD.rental_id);
    
    -- Obtener monto total del rental
    SELECT amount INTO v_amount
    FROM rentals
    WHERE id = COALESCE(NEW.rental_id, OLD.rental_id);
    
    -- Calcular pendiente
    v_pending := GREATEST(0, v_amount - v_total_paid);
    
    -- Determinar estado de pago
    IF v_total_paid = 0 OR v_pending > 0 THEN
        v_status := 'pending';
    ELSE
        v_status := 'paid';
    END IF;
    
    -- Actualizar rental
    UPDATE rentals
    SET total_paid = v_total_paid,
        pending_amount = v_pending,
        payment_status = v_status
    WHERE id = COALESCE(NEW.rental_id, OLD.rental_id);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para INSERT en payments
CREATE TRIGGER after_payment_insert
    AFTER INSERT ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_rental_payment_totals();

-- Trigger para UPDATE en payments
CREATE TRIGGER after_payment_update
    AFTER UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_rental_payment_totals();

-- Trigger para DELETE en payments
CREATE TRIGGER after_payment_delete
    AFTER DELETE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_rental_payment_totals();

-- =====================================================
-- DATOS INICIALES (SEED DATA)
-- =====================================================

-- Insertar categorías predeterminadas
INSERT INTO categories (name) VALUES
    ('Matrimonio'),
    ('Corporativo'),
    ('Turismo'),
    ('Graduación'),
    ('Supervisión'),
    ('Quinceañero'),
    ('Eventos Especiales');

-- Insertar conductor de ejemplo
INSERT INTO drivers (name, phone, license, status) VALUES
    ('Carlos Mamani', '700111222', 'LIC-001', 'available');

-- Insertar vehículos de ejemplo
INSERT INTO vehicles (brand, model, size, color, plate, status) VALUES
    ('Toyota', 'Hilux', 'Camioneta', 'Blanco', 'ABC-123', 'available'),
    ('Hyundai', 'H1', 'Van', 'Negro', 'XYZ-789', 'available');

-- Insertar configuración de empresa
INSERT INTO company_settings (
    name, short_name, slogan, address, city, phones, email, nit,
    bank_name, bank_account_type, bank_account_number, bank_account_holder,
    quotation_prefix, quotation_validity_days,
    service_conditions, payment_methods
) VALUES (
    'ESTACIÓN DE SERVICIOS AUTOMOTRIZ - FENIX CARS S.R.L',
    'VEHÍCULOS CLÁSICOS',
    '"UN VIAJE AL PASADO"',
    'AV. INTEGRACION ESQUINA CALLE EMAUS, BARRIO MONTECRISTO',
    'TARIJA',
    ARRAY['78709338', '71863354'],
    'fenixcars@gmail.com',
    '561367028',
    'BNB',
    'CUENTA CORRIENTE',
    '7000060806',
    'FENIX CARS S.R.L',
    'COT',
    2,
    ARRAY[
        'El alquiler mínimo es de 2 horas.',
        'Las horas adicionales se cobrarán a razón de Bs. 500 por hora.',
        'No se permite subarrendar el vehículo.',
        'El alquiler del vehículo incluye el conductor.'
    ],
    '[
        {"id": "cash", "label": "Efectivo", "info": "Av. Integración Esq. Emaus"},
        {"id": "bank_transfer", "label": "Transferencia Bancaria", "info": "BNB - CUENTA CORRIENTE - 7000060806"},
        {"id": "qr", "label": "QR", "info": "Solicitar a Administración"},
        {"id": "other", "label": "Otro", "info": ""}
    ]'::jsonb
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Opcional pero recomendado
-- =====================================================

-- Habilitar RLS en las tablas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir todas las operaciones (ajustar según necesidades de autenticación)
-- Por ahora permitimos acceso completo para el anon key
CREATE POLICY "Allow all for clients" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all for vehicles" ON vehicles FOR ALL USING (true);
CREATE POLICY "Allow all for drivers" ON drivers FOR ALL USING (true);
CREATE POLICY "Allow all for categories" ON categories FOR ALL USING (true);
CREATE POLICY "Allow all for rentals" ON rentals FOR ALL USING (true);
CREATE POLICY "Allow all for payments" ON payments FOR ALL USING (true);
CREATE POLICY "Allow all for company_settings" ON company_settings FOR ALL USING (true);
