import { useEffect, useState } from "react";

import {
    Plus,
    X,
    Pencil,
    Trash2,
    Check,
    LoaderCircle
} from "lucide-react";

import {
    createCategory,
    updateCategory,
    deleteCategory
} from "../../services/category.service";

import "./CategoryManagementModal.css";

import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";

function CategoryManagementModal({
    open,
    categories,
    totalProducts,
    onClose,
    onSuccess
}) {

    const [name, setName] = useState("");
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const [categoryToDelete, setCategoryToDelete] = useState(null);

    useEffect(() => {

        if (!open) {

            setName("");
            setEditingCategoryId(null);
            setEditingName("");
            setError("");
            setSuccess("");
            setCategoryToDelete(null);

        }

    }, [open]);

    if (!open) {
        return null;
    }

    const handleCreate = async () => {

        if (!name.trim()) {

            setError(
                "El nombre de la categoría es obligatorio"
            );

            return;
        }

        try {

            setLoading(true);
            setError("");
            setSuccess("");

            const response = await createCategory(name.trim());

            setName("");

            setSuccess(`Categoría creada exitosamente.`);

            await onSuccess(response.category);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "No fue posible crear la categoría."
            );

        } finally {

            setLoading(false);

        }

    };

    const handleStartEdit = (category) => {

        setEditingCategoryId(category.id);
        setEditingName(category.name);
        setError("");

    };

    const handleCancelEdit = () => {

        setEditingCategoryId(null);
        setEditingName("");
        setError("");

    };

    const handleUpdate = async (categoryId) => {

        if (!editingName.trim()) {

            setError(
                "El nombre de la categoría es obligatorio"
            );

            return;
        }

        try {

            setLoading(true);
            setError("");

            const response = await updateCategory(
                categoryId,
                editingName.trim()
            );

            setEditingCategoryId(null);
            setEditingName("");

            await onSuccess({
                type: "update",
                category: response.category
            });

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "No fue posible actualizar la categoría."
            );

        } finally {

            setLoading(false);

        }

    };

    const handleDelete = (category) => {

        setError("");
        setSuccess("");

        setCategoryToDelete(category);

    };

    const handleConfirmDelete = async () => {

        if (!categoryToDelete) {
            return;
        }

        try {

            setLoading(true);
            setError("");
            setSuccess("");

            const deletedCategoryId = categoryToDelete.id;

            await deleteCategory(deletedCategoryId);

            setCategoryToDelete(null);

            await onSuccess({
                type: "delete",
                categoryId: deletedCategoryId
            });

            setSuccess("Categoría eliminada exitosamente.");

        } catch (error) {

            console.error(error);

            setCategoryToDelete(null);

            setError(
                error.response?.data?.message ||
                "No fue posible eliminar la categoría."
            );

        } finally {

            setLoading(false);

        }

    };

    const handleKeyDown = (event) => {

        if (event.key === "Enter") {
            handleCreate();
        }

    };

    const sortedCategories = [...categories].sort(
        (a, b) =>
            a.name.localeCompare(
                b.name,
                "es",
                {
                    sensitivity: "base"
                }
            )
    );

    return (

        <div
            className="category-modal-overlay"
            onMouseDown={(event) => {

                if (event.target === event.currentTarget) {
                    onClose();
                }

            }}
        >

            <div
                className="category-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="category-modal-title"
            >

                <div className="category-modal-header">

                    <h2 id="category-modal-title">
                        Gestionar categorías
                    </h2>

                    <button
                        type="button"
                        className="category-modal-close"
                        onClick={onClose}
                        title="Cerrar"
                    >

                        <X size={20} />

                    </button>

                </div>


                <div className="category-modal-content">

                    <section className="category-create-section">

                        <h3>
                            Nueva categoría
                        </h3>

                        <label htmlFor="category-name">
                            Nombre de la categoría
                        </label>

                        <div className="category-create-input">

                            <input
                                id="category-name"
                                type="text"
                                placeholder="Ej. Abarrotes"
                                value={name}
                                onChange={(event) => {

                                    setName(event.target.value);

                                    if (error) {
                                        setError("");
                                    }

                                }}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                maxLength={255}
                            />

                            <button
                                type="button"
                                className="category-add-button"
                                onClick={handleCreate}
                                disabled={loading}
                                title="Crear categoría"
                            >

                                {loading ? (

                                    <LoaderCircle
                                        size={18}
                                        className="category-loading-icon"
                                    />

                                ) : (

                                    <Plus size={19} />

                                )}

                            </button>

                        </div>

                    </section>


                    {error && (

                        <div className="category-modal-error">

                            {error}

                        </div>

                    )}

                    {success && (

                        <div className="category-modal-success">

                            {success}

                        </div>

                    )}


                    <section className="category-list-section">

                        <div className="category-list-header">

                            <h3>
                                Categorías existentes
                            </h3>

                        </div>


                        <div className="category-list">

                            <div className="category-list-item category-all-item">

                                <div className="category-list-name">

                                    <span className="category-all-name">
                                        Todos
                                    </span>

                                </div>

                                <span className="category-product-count">

                                    {totalProducts}{" "}

                                    {totalProducts === 1
                                        ? "producto"
                                        : "productos"}

                                </span>

                            </div>


                            {sortedCategories.length === 0 ? (

                                <div className="category-empty">

                                    No hay categorías creadas.

                                </div>

                            ) : (

                                sortedCategories.map((category) => (

                                    <div
                                        key={category.id}
                                        className="category-list-item"
                                    >

                                        {editingCategoryId === category.id ? (

                                            <div className="category-edit-row">

                                                <input
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(event) =>
                                                        setEditingName(
                                                            event.target.value
                                                        )
                                                    }
                                                    onKeyDown={(event) => {

                                                        if (
                                                            event.key ===
                                                            "Enter"
                                                        ) {

                                                            handleUpdate(
                                                                category.id
                                                            );

                                                        }

                                                        if (
                                                            event.key ===
                                                            "Escape"
                                                        ) {

                                                            handleCancelEdit();

                                                        }

                                                    }}
                                                    autoFocus
                                                    maxLength={255}
                                                    disabled={loading}
                                                />

                                                <button
                                                    type="button"
                                                    className="category-icon-button category-save-button"
                                                    onClick={() =>
                                                        handleUpdate(
                                                            category.id
                                                        )
                                                    }
                                                    disabled={loading}
                                                    title="Guardar"
                                                >

                                                    <Check size={17} />

                                                </button>

                                                <button
                                                    type="button"
                                                    className="category-icon-button"
                                                    onClick={handleCancelEdit}
                                                    disabled={loading}
                                                    title="Cancelar"
                                                >

                                                    <X size={17} />

                                                </button>

                                            </div>

                                        ) : (

                                            <>

                                                <div className="category-list-name">

                                                    <span>
                                                        {category.name}
                                                    </span>

                                                </div>

                                                <span className="category-product-count">

                                                    {category.productCount}{" "}

                                                    {category.productCount ===
                                                        1
                                                        ? "producto"
                                                        : "productos"}

                                                </span>

                                                <div className="category-actions">

                                                    <button
                                                        type="button"
                                                        className="category-icon-button"
                                                        onClick={() =>
                                                            handleStartEdit(
                                                                category
                                                            )
                                                        }
                                                        disabled={loading}
                                                        title="Editar categoría"
                                                    >

                                                        <Pencil size={16} />

                                                    </button>

                                                    <button
                                                        type="button"
                                                        className="category-icon-button category-delete-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                category
                                                            )
                                                        }
                                                        disabled={
                                                            loading ||
                                                            category.productCount >
                                                            0
                                                        }
                                                        title={
                                                            category.productCount >
                                                                0
                                                                ? "No se puede eliminar una categoría con productos"
                                                                : "Eliminar categoría"
                                                        }
                                                    >

                                                        <Trash2 size={16} />

                                                    </button>

                                                </div>

                                            </>

                                        )}

                                    </div>

                                ))

                            )}

                        </div>

                    </section>

                </div>

            </div>

            <ConfirmDialog
                open={Boolean(categoryToDelete)}
                type="confirm"
                title="Eliminar categoría"
                message={
                    categoryToDelete
                        ? `¿Estás seguro de eliminar la categoría "${categoryToDelete.name}"?`
                        : ""
                }
                confirmText="Eliminar"
                cancelText="Cancelar"
                onCancel={() => setCategoryToDelete(null)}
                onConfirm={handleConfirmDelete}
                loading={loading}
            />

        </div>

    );

}

export default CategoryManagementModal;