/**
 * Utilidad para descargas de archivos con opción de elegir ubicación
 * Usa la File System Access API cuando está disponible
 */

// Almacén temporal de blobs para poder abrir archivos después de descargar
const downloadedFiles = new Map();

/**
 * Verifica si el navegador soporta la API de acceso al sistema de archivos
 */
export const supportsFilePicker = () => {
  return 'showSaveFilePicker' in window;
};

/**
 * Genera un ID único para el archivo descargado
 */
const generateFileId = () => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Guarda el blob temporalmente para poder abrirlo después
 */
const storeFileForOpening = (blob, fileName, mimeType) => {
  const fileId = generateFileId();
  const blobUrl = URL.createObjectURL(blob);
  
  downloadedFiles.set(fileId, {
    blobUrl,
    fileName,
    mimeType,
    timestamp: Date.now()
  });
  
  // Limpiar después de 5 minutos para no consumir memoria
  setTimeout(() => {
    cleanupFile(fileId);
  }, 5 * 60 * 1000);
  
  return fileId;
};

/**
 * Limpia un archivo del almacén temporal
 */
const cleanupFile = (fileId) => {
  const file = downloadedFiles.get(fileId);
  if (file) {
    URL.revokeObjectURL(file.blobUrl);
    downloadedFiles.delete(fileId);
  }
};

/**
 * Abre un archivo descargado usando su ID
 */
export const openDownloadedFile = (fileId) => {
  const file = downloadedFiles.get(fileId);
  if (file) {
    // Abrir en nueva ventana/pestaña
    window.open(file.blobUrl, '_blank');
    return true;
  }
  return false;
};

/**
 * Descarga un archivo con opción de elegir ubicación
 * @param {Blob} blob - El blob del archivo a descargar
 * @param {string} suggestedName - Nombre sugerido para el archivo
 * @param {object} options - Opciones adicionales
 * @returns {Promise<{success: boolean, path?: string, fileName: string, method: string, fileId?: string}>}
 */
export const downloadWithPicker = async (blob, suggestedName, options = {}) => {
  const { 
    description = 'Archivo',
    mimeType = 'application/octet-stream',
    extension = ''
  } = options;

  // Guardar el blob para poder abrirlo después
  const fileId = storeFileForOpening(blob, suggestedName, mimeType);

  // Intentar usar File System Access API (permite elegir ubicación)
  if (supportsFilePicker()) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName,
        types: [{
          description,
          accept: { [mimeType]: [extension] }
        }]
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      // Obtener el nombre del archivo guardado
      const savedFileName = fileHandle.name;
      
      return {
        success: true,
        fileName: savedFileName,
        method: 'picker',
        message: `Archivo guardado como "${savedFileName}"`,
        fileId,
        canOpen: true
      };
    } catch (error) {
      // Si el usuario cancela el diálogo, no es un error real
      if (error.name === 'AbortError') {
        cleanupFile(fileId);
        return {
          success: false,
          fileName: suggestedName,
          method: 'cancelled',
          message: 'Descarga cancelada por el usuario',
          fileId: null,
          canOpen: false
        };
      }
      // Si hay otro error, caer al método tradicional
      console.warn('File System Access API falló, usando método tradicional:', error);
    }
  }

  // Método tradicional de descarga
  return downloadTraditional(blob, suggestedName, fileId, mimeType);
};

/**
 * Descarga usando el método tradicional (crea link y hace click)
 * @param {Blob} blob - El blob del archivo
 * @param {string} fileName - Nombre del archivo
 * @param {string} fileId - ID del archivo para abrirlo después
 * @param {string} mimeType - Tipo MIME del archivo
 * @returns {{success: boolean, fileName: string, method: string, message: string, fileId: string, canOpen: boolean}}
 */
export const downloadTraditional = (blob, fileName, fileId = null, mimeType = '') => {
  try {
    // Si no tenemos fileId, crear uno nuevo
    if (!fileId) {
      fileId = storeFileForOpening(blob, fileName, mimeType);
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Obtener la carpeta de descargas predeterminada
    const downloadPath = getDefaultDownloadPath();

    return {
      success: true,
      fileName,
      method: 'traditional',
      path: downloadPath,
      message: `Archivo "${fileName}" descargado en ${downloadPath}`,
      fileId,
      canOpen: true
    };
  } catch (error) {
    return {
      success: false,
      fileName,
      method: 'error',
      message: 'Error al descargar el archivo: ' + error.message,
      fileId: null,
      canOpen: false
    };
  }
};

/**
 * Obtiene una descripción de la carpeta de descargas predeterminada
 * Nota: Por seguridad, los navegadores no revelan la ruta exacta
 */
export const getDefaultDownloadPath = () => {
  // Detectar sistema operativo para dar una mejor descripción
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('win')) {
    return 'Carpeta de Descargas (Windows)';
  } else if (userAgent.includes('mac')) {
    return 'Carpeta de Descargas (Mac)';
  } else if (userAgent.includes('linux')) {
    return 'Carpeta de Descargas (Linux)';
  }
  
  return 'Carpeta de Descargas del navegador';
};

/**
 * Descarga un PDF con opción de elegir ubicación
 */
export const downloadPDF = async (pdfDoc, suggestedName) => {
  // jsPDF tiene método output para obtener el blob
  const blob = pdfDoc.output('blob');
  
  return downloadWithPicker(blob, suggestedName, {
    description: 'Documento PDF',
    mimeType: 'application/pdf',
    extension: '.pdf'
  });
};

/**
 * Descarga un archivo Excel con opción de elegir ubicación
 */
export const downloadExcel = async (buffer, suggestedName) => {
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  return downloadWithPicker(blob, suggestedName, {
    description: 'Documento Excel',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: '.xlsx'
  });
};

export default {
  supportsFilePicker,
  downloadWithPicker,
  downloadTraditional,
  downloadPDF,
  downloadExcel,
  getDefaultDownloadPath,
  openDownloadedFile
};
