import {
    useCallback,
    useEffect,
    useState
} from "react";

import {
    FiDownload
} from "react-icons/fi";

import "./Sales.css";

import SalesTabs from "../../components/SalesTabs/SalesTabs";
import ProductSearch from "../../components/ProductSearch/ProductSearch";
import ProductList from "../../components/ProductList/ProductList";
import Cart from "../../components/Cart/Cart";
import SalesHistory from "../../components/SalesHistory/SalesHistory";

import {
    getProducts
} from "../../services/product.service";

import {
    createSale,
    getSales
} from "../../services/sale.service";


function Sales() {

    const [activeTab, setActiveTab] = useState("new");

    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);

    const [loadingProducts, setLoadingProducts] = useState(false);
    const [registeringSale, setRegisteringSale] = useState(false);

    const [salesHistory, setSalesHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);


    const normalizeProducts = (response) => {

        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.products)) {
            return response.products;
        }

        return [];
    };


    const normalizeSales = (response) => {

        if (Array.isArray(response)) {
            return response;
        }

        if (Array.isArray(response?.data)) {
            return response.data;
        }

        if (Array.isArray(response?.sales)) {
            return response.sales;
        }

        return [];
    };


    const searchProducts = useCallback(
        async (search = "") => {

            try {

                setLoadingProducts(true);

                const response = await getProducts({
                    search
                });

                setProducts(
                    normalizeProducts(response)
                );

            } catch (error) {

                console.error(
                    "Error buscando productos:",
                    error
                );

                setProducts([]);

            } finally {

                setLoadingProducts(false);

            }

        },
        []
    );


    const loadSalesHistory = useCallback(
        async () => {

            try {

                setLoadingHistory(true);

                const response = await getSales();

                setSalesHistory(
                    normalizeSales(response)
                );

            } catch (error) {

                console.error(
                    "Error cargando historial:",
                    error
                );

                setSalesHistory([]);

            } finally {

                setLoadingHistory(false);

            }

        },
        []
    );


    useEffect(() => {

        searchProducts("");

    }, [searchProducts]);


    useEffect(() => {

        if (activeTab !== "history") {
            return;
        }

        loadSalesHistory();

    }, [
        activeTab,
        loadSalesHistory
    ]);


    const addToCart = (product) => {

        const stock = Number(
            product.stockCurrent ??
            product.stock ??
            0
        );

        if (stock <= 0) {
            return;
        }


        setCart((currentCart) => {

            const existingProduct =
                currentCart.find(
                    (item) =>
                        item.id === product.id
                );


            if (existingProduct) {

                if (
                    existingProduct.quantity >= stock
                ) {
                    return currentCart;
                }


                return currentCart.map(
                    (item) =>
                        item.id === product.id
                            ? {
                                ...item,
                                quantity:
                                    item.quantity + 1
                            }
                            : item
                );

            }


            return [
                ...currentCart,
                {
                    ...product,
                    quantity: 1
                }
            ];

        });

    };


    const updateCartQuantity = (
        productId,
        quantity
    ) => {

        setCart((currentCart) => {

            return currentCart.map((item) => {

                if (item.id !== productId) {
                    return item;
                }


                const stock = Number(
                    item.stockCurrent ??
                    item.stock ??
                    0
                );


                const newQuantity = Math.min(
                    Math.max(
                        Number(quantity),
                        1
                    ),
                    stock
                );


                return {
                    ...item,
                    quantity: newQuantity
                };

            });

        });

    };


    const removeFromCart = (productId) => {

        setCart((currentCart) =>
            currentCart.filter(
                (item) =>
                    item.id !== productId
            )
        );

    };


    const registerSale = async () => {

        if (
            cart.length === 0 ||
            registeringSale
        ) {
            return;
        }


        try {

            setRegisteringSale(true);


            const items = cart.map(
                (item) => ({
                    productId: item.id,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.price)
                })
            );


            await createSale({
                items
            });

            window.dispatchEvent(
                new Event("sale-created")
            );


            setCart([]);


            /*
             * Actualizar productos inmediatamente
             * después de registrar la venta.
             */
            await searchProducts("");


            /*
             * Actualizar historial.
             */
            await loadSalesHistory();


            /*
             * Avisar al Topbar que se registró una venta.
             * El Topbar volverá a consultar las alertas.
             */
            window.dispatchEvent(
                new CustomEvent("sale-registered")
            );


        } catch (error) {

            console.error(
                "Error registrando venta:",
                error
            );

        } finally {

            setRegisteringSale(false);

        }

    };


    const total = cart.reduce(
        (accumulator, item) =>
            accumulator +
            Number(item.price) *
            Number(item.quantity),
        0
    );


    return (
        <div className="sales-page">

            <div className="sales-header">

                <h1>
                    Ventas
                </h1>

            </div>


            <SalesTabs
                activeTab={activeTab}
                onChange={setActiveTab}
            />


            {activeTab === "new" && (

                <div className="sales-content">

                    <section className="new-sale-section">

                        <div className="section-heading">

                            <h2>
                                Nueva venta
                            </h2>

                            <p>
                                Agrega productos al carrito
                            </p>

                        </div>


                        <ProductSearch
                            onSearch={searchProducts}
                        />


                        <ProductList
                            products={products}
                            loading={loadingProducts}
                            onAdd={addToCart}
                        />

                    </section>


                    <Cart
                        cart={cart}
                        total={total}
                        onUpdateQuantity={
                            updateCartQuantity
                        }
                        onRemove={
                            removeFromCart
                        }
                        onRegister={
                            registerSale
                        }
                        loading={
                            registeringSale
                        }
                    />

                </div>

            )}


            {activeTab === "history" && (

                <section className="history-section">

                    <div className="history-header">

                        <div>

                            <h2>
                                Historial de ventas
                            </h2>

                            <p>
                                {salesHistory.length}{" "}
                                ventas encontradas
                            </p>

                        </div>


                        <button
                            type="button"
                            className="export-button"
                        >

                            <FiDownload size={17} />
                            Exportar CSV
                        </button>

                    </div>


                    <SalesHistory
                        sales={salesHistory}
                        loading={loadingHistory}
                    />

                </section>

            )}

        </div>
    );
}


export default Sales;