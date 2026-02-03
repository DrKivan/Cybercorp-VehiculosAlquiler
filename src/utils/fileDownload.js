/**
 * Utilidad para descargas de archivos con opción de elegir ubicación
 */

/**
 * Descarga un archivo permitiendo elegir ubicación (si el navegador lo soporta)
 * @param {Blob} blob - El blob del archivo a descargar
 * @param {string} fileName - Nombre sugerido del archivo
 * @param {object} options - Opciones adicionales
 * @returns {{success: boolean, fileName: string, message: string}}
 */
export const downloadFile = async (blob, fileName, options = {}) => {
  const { 
    description = 'Archivo',
    mimeType = 'application/octet-stream',
    extension = ''
  } = options;

  // Intentar usar File System Access API (permite elegir ubicación)
  if ('showSaveFilePicker' in window) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{
          description,
          accept: { [mimeType]: [extension] }
        }]
      });

      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      return {
        success: true,
        fileName: fileHandle.name,
        message: `Archivo "${fileHandle.name}" guardado correctamente`
      };
    } catch (error) {
      // Si el usuario cancela el diálogo
      if (error.name === 'AbortError') {
        return {
          success: false,
          fileName,
          message: 'cancelled'
        };
      }
      // Si hay otro error, usar método tradicional
      console.warn('File picker falló, usando descarga directa:', error);
    }
  }

  // Método tradicional de descarga (carpeta de descargas)
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return {
      success: true,
      fileName,
      message: `Archivo "${fileName}" descargado correctamente`
    };
  } catch (error) {
    return {
      success: false,
      fileName,
      message: 'Error al descargar: ' + error.message
    };
  }
};

/**
 * Descarga un PDF
 * @param {jsPDF} pdfDoc - Documento jsPDF
 * @param {string} fileName - Nombre del archivo
 */
export const downloadPDF = async (pdfDoc, fileName) => {
  const blob = pdfDoc.output('blob');
  return downloadFile(blob, fileName, {
    description: 'Documento PDF',
    mimeType: 'application/pdf',
    extension: '.pdf'
  });
};

/**
 * Descarga un archivo Excel
 * @param {ArrayBuffer} buffer - Buffer del archivo Excel
 * @param {string} fileName - Nombre del archivo
 */
export const downloadExcel = async (buffer, fileName) => {
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  return downloadFile(blob, fileName, {
    description: 'Documento Excel',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: '.xlsx'
  });
};

export default {
  downloadFile,
  downloadPDF,
  downloadExcel
};
