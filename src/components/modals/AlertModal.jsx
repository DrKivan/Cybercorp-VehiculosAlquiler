import React from 'react';
import { Icons } from '../Icons';

/**
 * AlertModal - Modal reutilizable para alertas y confirmaciones
 * Reemplaza los alert() y confirm() nativos del navegador
 * 
 * @param {boolean} isOpen - Controla si el modal está visible
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onConfirm - Función para confirmar la acción (solo para type="confirm" o "danger")
 * @param {string} title - Título del modal
 * @param {string} message - Mensaje principal
 * @param {string} type - Tipo de alerta: "info", "success", "warning", "error", "confirm", "danger"
 * @param {string} confirmText - Texto del botón de confirmación
 * @param {string} cancelText - Texto del botón de cancelación
 * @param {function} onSecondaryAction - Función para acción secundaria (ej: abrir archivo)
 * @param {string} secondaryActionText - Texto del botón de acción secundaria
 * @param {boolean} showSecondaryAction - Mostrar botón de acción secundaria
 */
export const AlertModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onSecondaryAction,
  secondaryActionText = "Abrir Archivo",
  showSecondaryAction = false
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    info: {
      icon: Icons.Info || (() => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      ringColor: "ring-blue-500/20"
    },
    success: {
      icon: Icons.Check || (() => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      buttonColor: "bg-emerald-600 hover:bg-emerald-700",
      ringColor: "ring-emerald-500/20"
    },
    warning: {
      icon: Icons.Warning || (() => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>),
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      buttonColor: "bg-amber-600 hover:bg-amber-700",
      ringColor: "ring-amber-500/20"
    },
    error: {
      icon: Icons.X || (() => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonColor: "bg-red-600 hover:bg-red-700",
      ringColor: "ring-red-500/20"
    },
    confirm: {
      icon: Icons.Question || (() => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>),
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonColor: "bg-blue-600 hover:bg-blue-700",
      ringColor: "ring-blue-500/20"
    },
    danger: {
      icon: Icons.Trash || (() => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>),
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonColor: "bg-red-600 hover:bg-red-700",
      ringColor: "ring-red-500/20"
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const IconComponent = config.icon;
  const showCancelButton = type === "confirm" || type === "danger";
  const isDanger = type === "danger";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 transition-opacity duration-300 ${isDanger ? 'bg-red-900/30 backdrop-blur-sm' : 'bg-black/50 backdrop-blur-sm'}`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`relative w-full max-w-md transform transition-all duration-300 animate-in fade-in zoom-in-95 ${isDanger ? 'animate-shake' : ''}`}>
        <div className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${isDanger ? 'ring-2 ring-red-500/50' : ''}`}>
          
          {/* Danger Header Strip */}
          {isDanger && (
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 h-2 animate-pulse" />
          )}
          
          {/* Content */}
          <div className="p-6">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className={`${config.iconBg} ${config.iconColor} p-4 rounded-full ${config.ringColor} ring-8 ${isDanger ? 'animate-bounce' : ''}`}>
                <IconComponent className="w-8 h-8" />
              </div>
            </div>

            {/* Title */}
            <h3 className={`text-xl font-bold text-center mb-2 ${isDanger ? 'text-red-700' : 'text-gray-900'}`}>
              {title}
            </h3>

            {/* Message */}
            <p className={`text-center mb-6 ${isDanger ? 'text-red-600' : 'text-gray-600'}`}>
              {message}
            </p>

            {/* Danger Warning Box */}
            {isDanger && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-red-800">⚠️ Advertencia importante</h4>
                    <p className="text-xs text-red-700 mt-1">
                      Esta acción es <span className="font-bold underline">permanente</span> y no se puede deshacer. 
                      Todos los datos asociados serán eliminados definitivamente.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className={`flex gap-3 ${showCancelButton || showSecondaryAction ? 'flex-col sm:flex-row' : 'flex-col'}`}>
              {/* Botón de acción secundaria (Abrir Archivo) */}
              {showSecondaryAction && onSecondaryAction && (
                <button
                  onClick={() => {
                    onSecondaryAction();
                    onClose();
                  }}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-lg flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {secondaryActionText}
                </button>
              )}
              {showCancelButton && (
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  {cancelText}
                </button>
              )}
              <button
                onClick={() => {
                  if (showCancelButton && onConfirm) {
                    onConfirm();
                  }
                  onClose();
                }}
                className={`flex-1 px-4 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 shadow-lg ${config.buttonColor} ${isDanger ? 'hover:shadow-red-300 active:scale-95' : 'hover:shadow-lg'}`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animation Styles */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

/**
 * Hook para manejar alertas modales de forma más sencilla
 * Similar a usar alert() y confirm() pero con modales bonitos
 */
export const useAlertModal = () => {
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
    confirmText: "Aceptar",
    cancelText: "Cancelar",
    onConfirm: null
  });

  const showAlert = (options) => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        type: options.type || "info",
        title: options.title || "Información",
        message: options.message || "",
        confirmText: options.confirmText || "Aceptar",
        cancelText: options.cancelText || "Cancelar",
        onConfirm: () => resolve(true),
        onClose: () => resolve(false)
      });
    });
  };

  const closeModal = () => {
    if (modalState.onClose) modalState.onClose();
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const confirmAction = () => {
    if (modalState.onConfirm) modalState.onConfirm();
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  const AlertModalComponent = () => (
    <AlertModal
      isOpen={modalState.isOpen}
      onClose={closeModal}
      onConfirm={confirmAction}
      title={modalState.title}
      message={modalState.message}
      type={modalState.type}
      confirmText={modalState.confirmText}
      cancelText={modalState.cancelText}
    />
  );

  return { showAlert, AlertModalComponent, closeModal };
};

export default AlertModal;
