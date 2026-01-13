# 🏢 DriveManage Pro - Sistema de Gestión de Rent-a-Car

## 📋 Resumen del Proyecto
Este es un software de nivel **empresarial** diseñado para centralizar la operación de una agencia de alquiler de vehículos. El objetivo es eliminar la gestión en papel y hojas de cálculo, ofreciendo una interfaz rápida, moderna y eficiente para los operadores de flota.

## 🛠 Stack de Desarrollo
- **Gestor:** `pnpm` (Estrictamente por rendimiento y manejo de dependencias).
- **Frontend:** React (JSX) + Vite.
- **Estética:** Tailwind CSS mediante `@tailwindcss/vite` (Arquitectura v4).
- **Enfoque de Despliegue:** Preparado para empaquetado Desktop (Neutralino/Electron).

## 🎨 Guía de Estilo y UX (Contexto)
Para este entorno empresarial, la interfaz debe seguir estas reglas:
- **Densidad de Información:** Alta pero limpia. El operador necesita ver muchos datos (placas, nombres, fechas) sin hacer demasiado scroll.
- **Sistema cromático de estados:**
    - `Disponible`: Verde esmeralda (Éxito).
    - `Rentado`: Azul corporativo (Información).
    - `Mantenimiento`: Ámbar/Rojo (Atención necesaria).
- **Interactividad:** Uso de modales para creación de contratos y filtros rápidos por tipo de vehículo (SUV, Sedán, Compacto).

## 🚀 Instalación y Comandos Core
```bash
# Instalación de herramientas
pnpm add

# Ejecución en desarrollo (Alacritty recomendada)
pnpm dev