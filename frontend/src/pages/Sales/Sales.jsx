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
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";

import * as XLSX from "xlsx";

import {
    getProducts
} from "../../services/product.service";

import {
    createSale,
    getSales
} from "../../services/sale.service";


function Sales() {
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [appliedStartDate, setAppliedStartDate] = useState("");
    const [appliedEndDate, setAppliedEndDate] = useState("");

    const [saleDialog, setSaleDialog] = useState({
        open: false,
        type: "success",
        title: "",
        message: ""
    });

    const [activeTab, setActiveTab] = useState("new");

    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);

    const [loadingProducts, setLoadingProducts] =
        useState(false);

    const [registeringSale, setRegisteringSale] =
        useState(false);

    const [salesHistory, setSalesHistory] =
        useState([]);


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


    const loadSalesHistory = async () => {

        try {

            setLoadingHistory(true);

            const response = await getSales({
                startDate:
                    appliedStartDate || undefined,

                endDate:
                    appliedEndDate || undefined
            });

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

    };

    useEffect(() => {

        const timeout = setTimeout(() => {
            searchProducts("");
        }, 0);

        return () => {
            clearTimeout(timeout);
        };

    }, [searchProducts]);


    useEffect(() => {

        if (activeTab !== "history") {
            return;
        }

        let isMounted = true;

        const fetchHistory = async () => {

            try {

                setLoadingHistory(true);

                const response = await getSales({
                    startDate:
                        appliedStartDate || undefined,

                    endDate:
                        appliedEndDate || undefined
                });

                if (!isMounted) {
                    return;
                }

                setSalesHistory(
                    normalizeSales(response)
                );

            } catch (error) {

                console.error(
                    "Error cargando historial:",
                    error
                );

                if (isMounted) {
                    setSalesHistory([]);
                }

            } finally {

                if (isMounted) {
                    setLoadingHistory(false);
                }

            }

        };

        void fetchHistory();

        return () => {
            isMounted = false;
        };

    }, [
        activeTab,
        appliedStartDate,
        appliedEndDate
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

            setCart([]);

            await searchProducts("");

            await loadSalesHistory();

            window.dispatchEvent(
                new Event("sale-created")
            );

            setSaleDialog({
                open: true,
                type: "success",
                title: "Venta registrada",
                message: "La venta se registró correctamente."
            });

        } catch (error) {

            console.error(
                "Error registrando venta:",
                error
            );

            setSaleDialog({
                open: true,
                type: "error",
                title: "No se pudo registrar la venta",
                message:
                    error.response?.data?.message ||
                    "Ocurrió un error al registrar la venta."
            });

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

    const exportSalesToExcel = () => {

        if (salesHistory.length === 0) {
            return;
        }

        const rows = salesHistory.map((sale) => {

            const items = Array.isArray(sale.items)
                ? sale.items
                : [];

            return {
                Fecha: new Date(
                    sale.createdAt
                ).toLocaleDateString("es-CO"),

                "Número de venta":
                    `V-${String(sale.id).padStart(4, "0")}`,

                "Items vendidos": items.length,

                Total: Number(sale.total ?? 0)
            };

        });

        const worksheet =
            XLSX.utils.json_to_sheet(rows);

        worksheet["!cols"] = [
            { wch: 16 },
            { wch: 24 },
            { wch: 18 },
            { wch: 16 }
        ];

        const workbook =
            XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "Ventas"
        );

        const fileName =
            `ventas-${appliedStartDate || "todas"}-${appliedEndDate || "todas"}.xlsx`;

        XLSX.writeFileXLSX(
            workbook,
            fileName
        );
    };


    return (
        <div className="sales-page">


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
                            onClick={exportSalesToExcel}
                            disabled={salesHistory.length === 0}
                        >
                            <FiDownload size={17} />
                            Exportar Excel
                        </button>

                    </div>

                    <div className="sales-history-filters">

                        <div className="sales-date-field">

                            <label htmlFor="start-date">
                                Desde
                            </label>

                            <input
                                id="start-date"
                                type="date"
                                value={startDate}
                                max={endDate || undefined}
                                onChange={(event) =>
                                    setStartDate(event.target.value)
                                }
                            />

                        </div>

                        <div className="sales-date-field">

                            <label htmlFor="end-date">
                                Hasta
                            </label>

                            <input
                                id="end-date"
                                type="date"
                                value={endDate}
                                min={startDate || undefined}
                                onChange={(event) =>
                                    setEndDate(event.target.value)
                                }
                            />

                        </div>

                        <button
                            type="button"
                            className="sales-filter-button"
                            onClick={() => {

                                setAppliedStartDate(startDate);
                                setAppliedEndDate(endDate);

                            }}
                        >
                            Filtrar
                        </button>

                        <button
                            type="button"
                            className="sales-clear-filter-button"
                            onClick={() => {

                                setStartDate("");
                                setEndDate("");
                                setAppliedStartDate("");
                                setAppliedEndDate("");

                            }}
                        >
                            Limpiar
                        </button>

                    </div>

                    <SalesHistory
                        sales={salesHistory}
                        loading={loadingHistory}
                    />

                </section>

            )}

            <ConfirmDialog
                open={saleDialog.open}
                type={saleDialog.type}
                title={saleDialog.title}
                message={saleDialog.message}
                confirmText="Aceptar"
                cancelText=""
                loadingText="Registrando..."
                onConfirm={() =>
                    setSaleDialog((current) => ({
                        ...current,
                        open: false
                    }))
                }
                onCancel={() =>
                    setSaleDialog((current) => ({
                        ...current,
                        open: false
                    }))
                }
            />

        </div>
    );

}


export default Sales;