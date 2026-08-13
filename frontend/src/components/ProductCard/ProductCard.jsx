import { FiPackage, FiPlus } from "react-icons/fi";

import "./ProductCard.css";

function ProductCard({ product, onAdd }) {
    const stock = Number(
        product.stockCurrent ?? product.stock ?? 0
    );

    const price = Number(product.price ?? 0);

    return (
        <article className="product-card">

            {/* Icono */}
            <div className="product-card-icon">
                <FiPackage size={20} />
            </div>

            {/* Información */}
            <div className="product-card-info">

                <h3>
                    {product.name}
                </h3>

                <div className="product-card-details">

                    <span className="product-price">
                        $ {price.toLocaleString("es-CO")}
                    </span>

                    <span
                        className={
                            stock <= Number(product.stockMinimum ?? 0)
                                ? "product-stock low"
                                : "product-stock"
                        }
                    >
                        {stock} en stock
                    </span>

                </div>

            </div>

            {/* BOTÓN PROPIO DEL PRODUCTO */}
            <button
                type="button"
                className="add-product-button"
                disabled={stock <= 0}
                onClick={() => onAdd(product)}
                aria-label={`Agregar ${product.name}`}
            >
                <FiPlus size={22} />
            </button>

        </article>
    );
}

export default ProductCard;