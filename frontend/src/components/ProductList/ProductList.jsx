import ProductCard from "../ProductCard/ProductCard";

import "./ProductList.css";

function ProductList({
    products,
    loading,
    onAdd
}) {
    if (loading) {
        return (
            <div className="product-list">
                <div className="product-list-message">
                    Cargando productos...
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="product-list">
                <div className="product-list-message">
                    No se encontraron productos.
                </div>
            </div>
        );
    }

    return (
        <div className="product-list">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={onAdd}
                />
            ))}
        </div>
    );
}

export default ProductList;