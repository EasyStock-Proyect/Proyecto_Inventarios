import {
    FiChevronDown,
    FiChevronUp,
    FiPackage
} from "react-icons/fi";

import { useState } from "react";

import "./SalesHistory.css";

function SalesHistory({
    sales,
    loading
}) {

    const [expandedSale, setExpandedSale] = useState(null);

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "es-CO",
            {
                day: "numeric",
                month: "short",
                year: "numeric"
            }
        );

    };

    const getItems = (sale) => {

        if (Array.isArray(sale.items)) {
            return sale.items;
        }

        if (Array.isArray(sale.saleItems)) {
            return sale.saleItems;
        }

        return [];

    };

    const formatCurrency = (value) => {

        return Number(value ?? 0).toLocaleString(
            "es-CO"
        );

    };

    if (loading) {

        return (
            <div className="history-message">
                Cargando historial...
            </div>
        );

    }

    if (sales.length === 0) {

        return (
            <div className="history-message">
                No hay ventas registradas.
            </div>
        );

    }

    return (

        <div className="sales-history">

            {sales.map((sale) => {

                const items = getItems(sale);

                const isExpanded =
                    expandedSale === sale.id;

                const total =
                    Number(sale.total ?? 0);

                return (

                    <div
                        className="history-sale"
                        key={sale.id}
                    >

                        <button
                            type="button"
                            className="history-sale-header"
                            onClick={() =>
                                setExpandedSale(
                                    isExpanded
                                        ? null
                                        : sale.id
                                )
                            }
                        >

                            <span>
                                {formatDate(
                                    sale.createdAt
                                )}
                            </span>

                            <span>
                                V-{String(
                                    sale.id
                                ).padStart(4, "0")}
                            </span>

                            <span className="items-badge">
                                {items.length}{" "}
                                {items.length === 1
                                    ? "item"
                                    : "items"}
                            </span>

                            <strong>
                                $ {formatCurrency(total)}
                            </strong>

                            {isExpanded ? (
                                <FiChevronUp size={18} />
                            ) : (
                                <FiChevronDown size={18} />
                            )}

                        </button>

                        {isExpanded && (

                            <div className="history-sale-details">

                                {items.length === 0 ? (

                                    <div className="history-message">
                                        Esta venta no tiene productos registrados.
                                    </div>

                                ) : (

                                    items.map((item, index) => {

                                        const product =
                                            item.product;

                                        const quantity =
                                            Number(
                                                item.quantity ?? 0
                                            );

                                        const unitPrice =
                                            Number(
                                                item.unitPrice ?? 0
                                            );

                                        const subtotal =
                                            Number(
                                                item.subtotal ??
                                                quantity *
                                                unitPrice
                                            );

                                        return (

                                            <div
                                                className="history-item"
                                                key={
                                                    item.id ??
                                                    `${sale.id}-${index}`
                                                }
                                            >

                                                <div>
                                                    <FiPackage
                                                        size={16}
                                                    />

                                                    <span>
                                                        {
                                                            product?.name ??
                                                            item.productName ??
                                                            "Producto"
                                                        }
                                                    </span>
                                                </div>

                                                <span>
                                                    x{quantity}
                                                </span>

                                                <span>
                                                    ${" "}
                                                    {formatCurrency(
                                                        unitPrice
                                                    )}
                                                </span>

                                                <strong>
                                                    ${" "}
                                                    {formatCurrency(
                                                        subtotal
                                                    )}
                                                </strong>

                                            </div>

                                        );

                                    })

                                )}

                            </div>

                        )}

                    </div>

                );

            })}

        </div>

    );

}

export default SalesHistory;