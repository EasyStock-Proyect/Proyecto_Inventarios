import { useEffect, useState } from "react";

import {
    Search,
    Mic,
    TriangleAlert,
    Pencil,
    CirclePlus,
    Check,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import { getProducts } from "../../services/product.service";
import { getCategories } from "../../services/category.service";

import "./ProductTable.css";

function ProductTable() {

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [categoryId, setCategoryId] = useState("");

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        const cargarCategorias = async () => {

            try {

                const response = await getCategories();

                setCategories(response);

            } catch (error) {

                console.error(
                    "Error cargando categorías:",
                    error
                );

            }

        };

        cargarCategorias();

    }, []);


    useEffect(() => {

        const timer = setTimeout(() => {

            cargarProductos();

        }, 300);

        return () => clearTimeout(timer);

    }, [search, categoryId, page]);


    const cargarProductos = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await getProducts({
                page,
                limit: 20,
                search,
                categoryId
            });

            setProducts(response.data);
            setPagination(response.pagination);

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "No fue posible cargar los productos."
            );

        } finally {

            setLoading(false);

        }

    };

    const handleSearch = (event) => {

        setSearch(event.target.value);

        setPage(1);

    };
    const handleCategoryChange = (id) => {

        setCategoryId(id);

        setPage(1);

    };
    const productoStockBajo = (product) => {

        return product.stockCurrent < product.stockMinimum;

    };

    const productosStockBajo = products.filter(
        productoStockBajo
    ).length;

    const formatoPrecio = (price) => {

        return Number(price).toLocaleString("es-CO");

    };


    return (

        <div className="product-table-container">

            <div className="inventory-header">

                <div>

                    <h1>Inventario</h1>

                    <p>

                        {pagination.total} productos

                        <span className="inventory-separator">
                            •
                        </span>

                        <span className="stock-low-text">

                            {productosStockBajo} con stock bajo

                        </span>

                    </p>

                </div>

            </div>


            <div className="product-search">

                <Search
                    className="search-icon"
                    size={19}
                />

                <input
                    type="text"
                    placeholder="Buscar por nombre o SKU..."
                    value={search}
                    onChange={handleSearch}
                />

                <Mic
                    className="microphone-icon"
                    size={17}
                />

            </div>


            <div className="category-filters">

                <button
                    type="button"
                    className={
                        categoryId === ""
                            ? "category-button active"
                            : "category-button"
                    }
                    onClick={() => handleCategoryChange("")}
                >

                    {categoryId === "" && (
                        <Check size={14} />
                    )}

                    Todos

                </button>

                {categories.map((category) => (

                    <button
                        type="button"
                        key={category.id}
                        className={
                            categoryId === category.id
                                ? "category-button active"
                                : "category-button"
                        }
                        onClick={() =>
                            handleCategoryChange(category.id)
                        }
                    >

                        {category.name}

                    </button>

                ))}

            </div>

            {error && (

                <div className="product-table-error">

                    {error}

                </div>

            )}

            {loading && (

                <div className="product-table-loading">

                    Cargando productos...

                </div>

            )}

            {!loading && !error && (

                <div className="product-table-wrapper">

                    <table className="product-table">

                        <thead>

                            <tr>

                                <th>Nombre</th>

                                <th>SKU</th>

                                <th>Categoría</th>

                                <th>Stock actual</th>

                                <th>Stock mín.</th>

                                <th>Precio</th>

                                <th>Acciones</th>

                            </tr>

                        </thead>


                        <tbody>

                            {products.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="7"
                                        className="empty-products"
                                    >

                                        No hay productos disponibles.

                                    </td>

                                </tr>

                            ) : (

                                products.map((product) => {

                                    const stockBajo =
                                        productoStockBajo(product);

                                    return (

                                        <tr key={product.id}>


                                            {/* NOMBRE */}

                                            <td className="product-name">

                                                {product.name}

                                            </td>
                                            <td className="product-sku">

                                                {product.sku}

                                            </td>

                                            <td>

                                                <span className="category-badge">

                                                    {product.category?.name ||
                                                        "Sin categoría"}

                                                </span>

                                            </td>

                                            <td>

                                                {stockBajo ? (

                                                    <span className="stock-badge">

                                                        <TriangleAlert
                                                            size={12}
                                                        />

                                                        {product.stockCurrent}

                                                    </span>

                                                ) : (

                                                    <span className="stock-normal">

                                                        {product.stockCurrent}

                                                    </span>

                                                )}

                                            </td>

                                            <td>

                                                {product.stockMinimum}

                                            </td>


                                            {/* PRECIO */}

                                            <td className="product-price">

                                                ${formatoPrecio(product.price)}

                                            </td>

                                            <td>

                                                <div className="product-actions">


                                                    <button
                                                        type="button"
                                                        title="Editar producto"
                                                        className="action-button"
                                                    >

                                                        <Pencil
                                                            size={17}
                                                        />

                                                    </button>


                                                    <button
                                                        type="button"
                                                        title="Ajustar stock"
                                                        className="action-button"
                                                    >

                                                        <CirclePlus
                                                            size={18}
                                                        />

                                                    </button>


                                                </div>

                                            </td>

                                        </tr>

                                    );

                                })

                            )}

                        </tbody>

                    </table>

                </div>

            )}

            <div className="product-table-pagination">


                <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    title="Página anterior"
                >

                    <ChevronLeft size={16} />
                    Anterior
                </button>


                <span>

                    Página {pagination.page} de{" "}
                    {pagination.totalPages || 1}

                </span>


                <button
                    type="button"
                    disabled={
                        page >= pagination.totalPages
                    }
                    onClick={() => setPage(page + 1)}
                    title="Página siguiente"
                >

                    Siguiente

                    <ChevronRight size={16} />

                </button>

            </div>

            <button
                type="button"
                className="add-product-button"
                title="Agregar producto"
            >

                +

            </button>

        </div>

    );

}

export default ProductTable;