import { useRef, useState } from "react";
import {
    AlertCircle,
    CheckCircle2,
    Download,
    FileSpreadsheet,
    Loader2,
    Trash2,
    UploadCloud,
    X
} from "lucide-react";
import * as XLSX from "xlsx";
import {
    downloadExcelTemplate,
    importProductsFromExcel
} from "../../services/product.service";
import "./ImportExcelModal.css";

function ImportExcelModal({ open, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [validationErrors, setValidationErrors] = useState([]);
    const [successData, setSuccessData] = useState(null);

    const fileInputRef = useRef(null);

    if (!open) {
        return null;
    }

    const resetState = () => {
        setFile(null);
        setError("");
        setValidationErrors([]);
        setSuccessData(null);
        setLoading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleClose = () => {
        if (successData && onSuccess) {
            onSuccess();
        }
        resetState();
        onClose();
    };

    const handleDownloadTemplate = async () => {
        try {
            const templateData = [
                {
                    nombre: "Arroz Diana 1kg",
                    categoria: "Granos",
                    precio: 4500,
                    stock_inicial: 50,
                    stock_minimo: 10
                }
            ];

            const worksheet = XLSX.utils.json_to_sheet(templateData, {
                header: [
                    "nombre",
                    "categoria",
                    "precio",
                    "stock_inicial",
                    "stock_minimo"
                ]
            });

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");
            XLSX.writeFile(workbook, "plantilla_productos.xlsx");
        } catch {
            try {
                const blob = await downloadExcelTemplate();
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "plantilla_productos.xlsx");
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } catch {
                setError("No se pudo descargar la plantilla de ejemplo.");
            }
        }
    };

    const handleFileValidation = (selectedFile) => {
        setError("");
        setValidationErrors([]);
        setSuccessData(null);

        if (!selectedFile) {
            return;
        }

        const fileName = selectedFile.name.toLowerCase();
        const isValid = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

        if (!isValid) {
            setError("Solo se permiten archivos Excel (.xlsx o .xls).");
            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        setFile(selectedFile);
    };

    const handleFileInputChange = (event) => {
        const selectedFile = event.target.files?.[0];
        handleFileValidation(selectedFile);
    };

    const handleDrag = (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.type === "dragenter" || event.type === "dragover") {
            setDragActive(true);
        } else if (event.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);

        if (event.dataTransfer.files && event.dataTransfer.files[0]) {
            handleFileValidation(event.dataTransfer.files[0]);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setError("");
        setValidationErrors([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setError("Por favor, selecciona un archivo Excel antes de importar.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setValidationErrors([]);

            const result = await importProductsFromExcel(file);

            setSuccessData({
                createdProducts:
                    result.created_products ?? result.createdProducts ?? 0,
                createdCategories:
                    result.created_categories ?? result.createdCategories ?? 0
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            if (err.response?.status === 422) {
                const responseData = err.response.data;
                const errList = responseData.errors || responseData.details || [];
                setValidationErrors(errList);
                setError(
                    responseData.message ||
                        "Se encontraron errores de validación en el archivo."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                        "Ocurrió un error al procesar el archivo Excel."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) {
            return "0 B";
        }
        const k = 1024;
        const sizes = ["B", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
    };

    return (
        <div className="import-excel-overlay" onClick={handleClose}>
            <div
                className="import-excel-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    className="import-excel-close"
                    onClick={handleClose}
                    aria-label="Cerrar modal"
                >
                    <X size={18} />
                </button>

                <div className="import-excel-header">
                    <h2 className="import-excel-title">
                        Importar productos desde Excel
                    </h2>
                    <p className="import-excel-subtitle">
                        Sube un archivo .xlsx o .xls con tus productos para
                        cargarlos de forma masiva al inventario.
                    </p>
                </div>

                {successData ? (
                    <div className="import-success-box">
                        <CheckCircle2 size={52} className="import-success-icon" />
                        <h3 className="import-success-title">
                            ¡Importación exitosa!
                        </h3>
                        <p className="import-success-desc">
                            Los productos y categorías han sido registrados
                            correctamente en el inventario.
                        </p>
                        <div className="import-success-badge-group">
                            <div className="import-success-badge">
                                {successData.createdProducts} productos creados
                            </div>
                            <div className="import-success-badge">
                                {successData.createdCategories} categorías nuevas
                            </div>
                        </div>
                        <div className="import-modal-actions">
                            <button
                                type="button"
                                className="import-btn-submit"
                                onClick={handleClose}
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="template-download-box">
                            <div className="template-download-info">
                                <span className="template-download-title">
                                    ¿No tienes el formato requerido?
                                </span>
                                <span className="template-download-hint">
                                    Descarga la plantilla con encabezados y fila
                                    de ejemplo.
                                </span>
                            </div>
                            <button
                                type="button"
                                className="template-download-btn"
                                onClick={handleDownloadTemplate}
                            >
                                <Download size={15} />
                                Descargar plantilla
                            </button>
                        </div>

                        <div
                            className={`file-dropzone ${
                                dragActive ? "drag-active" : ""
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx, .xls"
                                style={{ display: "none" }}
                                onChange={handleFileInputChange}
                            />
                            <UploadCloud size={38} className="file-dropzone-icon" />
                            <p className="file-dropzone-text">
                                Arrastra tu archivo aquí o{" "}
                                <span className="file-dropzone-highlight">
                                    haz clic para examinar
                                </span>
                            </p>
                            <p className="file-dropzone-hint">
                                Formatos admitidos: .xlsx, .xls (Máximo 10 MB)
                            </p>
                        </div>

                        {file && (
                            <div className="file-selected-box">
                                <div className="file-selected-info">
                                    <FileSpreadsheet
                                        size={28}
                                        className="file-selected-icon"
                                    />
                                    <div className="file-selected-meta">
                                        <span className="file-selected-name">
                                            {file.name}
                                        </span>
                                        <span className="file-selected-size">
                                            {formatFileSize(file.size)}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="file-remove-btn"
                                    onClick={handleRemoveFile}
                                    aria-label="Quitar archivo"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="import-error-alert">
                                <AlertCircle
                                    size={18}
                                    className="import-error-icon"
                                />
                                <p className="import-error-text">{error}</p>
                            </div>
                        )}

                        {validationErrors.length > 0 && (
                            <div className="validation-errors-box">
                                <div className="validation-errors-title">
                                    Detalle de errores por fila:
                                </div>
                                <ul className="validation-errors-list">
                                    {validationErrors.map((item, idx) => {
                                        const rowNum =
                                            typeof item === "object"
                                                ? item.row
                                                : null;
                                        const msg =
                                            typeof item === "object"
                                                ? item.message || item.error
                                                : item;
                                        return (
                                            <li
                                                key={idx}
                                                className="validation-error-item"
                                            >
                                                {rowNum ? (
                                                    <span className="validation-error-row-badge">
                                                        Fila {rowNum}
                                                    </span>
                                                ) : null}
                                                <span>{msg}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        <div className="import-modal-actions">
                            <button
                                type="button"
                                className="import-btn-cancel"
                                onClick={handleClose}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="import-btn-submit"
                                onClick={handleSubmit}
                                disabled={loading || !file}
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={16}
                                            className="spinner-icon"
                                        />
                                        Importando...
                                    </>
                                ) : (
                                    "Importar productos"
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ImportExcelModal;
