import { useEffect, useState } from "react";

import { AlertCircle, X } from "lucide-react";

import {
    createProduct,
    updateProduct,
    generateSku
} from "../../services/product.service";

import { getCategories } from "../../services/category.service";

import CustomSelect from "../CustomSelect/CustomSelect";

import "./ProductFormModal.css";

function ProductFormModal({
    open,
    product,
    onClose,
    onSuccess
}) {

    const isEditing = Boolean(product);

    const [name, setName] = useState("");
    const [sku, setSku] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [price, setPrice] = useState("");
    const [stockInitial, setStockInitial] = useState("");
    const [stockMinimum, setStockMinimum] = useState("");

    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(false);
    const [generatingSku, setGeneratingSku] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        const loadCategories = async () => {

            try {

                const response = await getCategories();

                setCategories(response);

            } catch (error) {

                console.error(error);

            }

        };

        loadCategories();

    }, []);

    useEffect(() => {

        if (!open) return;

        if (isEditing) {

            setName(product.name);
            setSku(product.sku);
            setCategoryId(product.categoryId);
            setPrice(product.price);
            setStockInitial("");
            setStockMinimum(product.stockMinimum);

        } else {

            setName("");
            setSku("");
            setCategoryId("");
            setPrice("");
            setStockInitial("");
            setStockMinimum("");

        }

        setError("");

    }, [open, product, isEditing]);

    const handleGenerateSku = async () => {

        if (!categoryId) {

            setError("Seleccione una categoría primero.");

            return;

        }

        try {

            setGeneratingSku(true);

            const generatedSku = await generateSku(categoryId);

            setSku(generatedSku);

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "No fue posible generar el SKU."
            );

        } finally {

            setGeneratingSku(false);

        }

    };

    const handleSubmit = async () => {

        if (
            !name.trim() ||
            !categoryId ||
            !price ||
            (!isEditing && stockInitial === "") ||
            stockMinimum === ""
        ) {

            setError(
                "Todos los campos obligatorios deben estar completos."
            );

            return;

        }

        if (Number(price) <= 0) {

            setError("El precio debe ser mayor que cero.");

            return;

        }

        if (
            (!isEditing && Number(stockInitial) < 0) ||
            Number(stockMinimum) < 0
        ) {

            setError("Los valores de stock no pueden ser negativos.");

            return;

        }

        try {

            setLoading(true);
            setError("");

            const data = {

                name,
                sku,
                categoryId,
                price: Number(price),
                stockMinimum: Number(stockMinimum)

            };

            if (!isEditing) {

                data.stockCurrent = Number(stockInitial);

            }

            let response;

            if (isEditing) {

                response = await updateProduct(
                    product.id,
                    data
                );

            } else {

                response = await createProduct(data);

            }

            onSuccess(response);

            onClose();

        } catch (error) {

            setError(
                error.response?.data?.message ||
                "No fue posible guardar el producto."
            );

        } finally {

            setLoading(false);

        }

    };

    if (!open) {
        return null;
    }

    const title = isEditing
        ? "Editar Producto"
        : "Crear Producto";

    const buttonLabel = isEditing
        ? "Guardar Cambios"
        : "Crear Producto";

    return (

        <div
            className="product-form-overlay"
            onClick={onClose}
        >

            <div
                className="product-form-modal"
                onClick={(event) => event.stopPropagation()}
            >

                <button
                    type="button"
                    className="modal-close-button"
                    onClick={onClose}
                    title="Cerrar"
                >
                    <X size={22} />
                </button>

                <h2>{title}</h2>

                <div className="form-group">

                    <label>Nombre</label>

                    <input
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                    />

                </div>

                <div className="form-group">

                    <label>Categoría</label>

                    <CustomSelect
                        value={categoryId}
                        onChange={setCategoryId}
                        options={categories}
                        placeholder="Seleccione una categoría"
                    />

                </div>

                <div className="form-group">

                    <label>SKU</label>

                    <div className="sku-container">

                        <input
                            type="text"
                            value={sku}
                            onChange={(event) =>
                                setSku(event.target.value)
                            }
                        />

                        <button
                            type="button"
                            className="generate-sku-button"
                            onClick={handleGenerateSku}
                            disabled={generatingSku}
                        >

                            {generatingSku
                                ? "Generando..."
                                : "Generar"}

                        </button>

                    </div>

                    <small className="field-help">
                        Si deja este campo vacío, el sistema generará un SKU automáticamente según la categoría seleccionada.
                    </small>

                </div>

                <div className="form-group">

                    <label>Precio</label>

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(event) =>
                            setPrice(event.target.value)
                        }
                    />

                </div>

                <div className="stock-inputs">

                    {!isEditing && (

                        <div className="form-group">

                            <label>Stock inicial</label>

                            <input
                                type="number"
                                min="0"
                                value={stockInitial}
                                onChange={(event) =>
                                    setStockInitial(event.target.value)
                                }
                            />

                        </div>

                    )}

                    {isEditing && (

                        <div className="form-group stock-info-group">

                            <label>Stock actual</label>

                            <div className="stock-info">

                                <span>
                                    {product.stockCurrent} unidades
                                </span>

                            </div>

                        </div>

                    )}

                    <div className="form-group">

                        <label>Stock mínimo</label>

                        <input
                            type="number"
                            min="0"
                            value={stockMinimum}
                            onChange={(event) =>
                                setStockMinimum(event.target.value)
                            }
                        />

                    </div>

                </div>

                {error && (

                    <div className="form-error">

                        <AlertCircle size={20} />

                        <p>{error}</p>

                    </div>

                )}

                <div className="modal-actions">

                    <button
                        type="button"
                        onClick={onClose}
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleSubmit}
                    >

                        {loading
                            ? "Guardando..."
                            : buttonLabel}

                    </button>

                </div>

            </div>

        </div>

    );

}

export default ProductFormModal;