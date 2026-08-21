import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, ArrowRight, CircleDollarSign, CircleX, Package, ShoppingBag } from "lucide-react";
import { getAlerts } from "../../services/alert.service";
import { getProducts } from "../../services/product.service";
import { getSales } from "../../services/sale.service";
import "./Dashboard.css";

const formatDate = (date) => date.toISOString().slice(0, 10);
const getDateKey = (value) => formatDate(new Date(value));
const normalizeData = (response, key) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.[key])) return response[key];
    return [];
};
const money = (value) => `$ ${Number(value || 0).toLocaleString("es-CO")}`;

function Dashboard() {
    const navigate = useNavigate();
    const [sales, setSales] = useState([]);
    const [products, setProducts] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAllProducts, setShowAllProducts] = useState(false);

    useEffect(() => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 6);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");
                const [recentResponse, monthResponse, productsResponse, alertsResponse] = await Promise.all([
                    getSales({ startDate: formatDate(sevenDaysAgo), endDate: formatDate(today), limit: 1000 }),
                    getSales({ startDate: formatDate(monthStart), endDate: formatDate(today), limit: 1000 }),
                    getProducts({ page: 1, limit: 1000 }),
                    getAlerts()
                ]);
                const recentSales = normalizeData(recentResponse, "sales");
                const monthSales = normalizeData(monthResponse, "sales");
                setSales([...recentSales, ...monthSales.filter((sale) => !recentSales.some((recent) => recent.id === sale.id))]);
                setProducts(normalizeData(productsResponse, "products"));
                setAlerts(normalizeData(alertsResponse, "alerts"));
            } catch (loadError) {
                console.error("Error cargando dashboard:", loadError);
                setError("No fue posible cargar el resumen del negocio.");
            } finally {
                setLoading(false);
            }
        };
        loadDashboard();
    }, []);

    const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
    const stockAlerts = useMemo(() => {
        const alertsByProduct = new Map(
            alerts.map((alert) => [alert.productId, alert])
        );

        products
            .filter((product) => product.stockCurrent <= product.stockMinimum)
            .forEach((product) => {
                if (!alertsByProduct.has(product.id)) {
                    alertsByProduct.set(product.id, {
                        id: `stock-${product.id}`,
                        productId: product.id,
                        product
                    });
                }
            });

        return [...alertsByProduct.values()].filter((alert) => {
            const product = alert.product || productMap.get(alert.productId);
            return product && product.stockCurrent <= product.stockMinimum;
        });
    }, [alerts, products, productMap]);
    const todayKey = formatDate(new Date());
    const monthKey = todayKey.slice(0, 7);
    const todaySales = sales.filter((sale) => getDateKey(sale.createdAt) === todayKey);
    const monthSales = sales.filter((sale) => getDateKey(sale.createdAt).startsWith(monthKey));

    const topProducts = useMemo(() => {
        const totals = new Map();
        monthSales.forEach((sale) => sale.items?.forEach((item) => {
            const product = productMap.get(item.productId) || item.product || {};
            const current = totals.get(item.productId) || { id: item.productId, name: product.name || "Producto sin nombre", category: product.category?.name || "Sin categoría", quantity: 0, revenue: 0 };
            current.quantity += Number(item.quantity || 0);
            current.revenue += Number(item.subtotal || 0);
            totals.set(item.productId, current);
        }));
        return [...totals.values()].sort((a, b) => b.quantity - a.quantity);
    }, [monthSales, productMap]);

    const chartData = useMemo(() => {
        const today = new Date();
        return Array.from({ length: 7 }, (_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - (6 - index));
            const key = formatDate(date);
            const quantity = sales.filter((sale) => getDateKey(sale.createdAt) === key).reduce((total, sale) => total + (sale.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0), 0);
            return { key, label: date.toLocaleDateString("es-CO", { weekday: "short" }).replace(".", ""), quantity };
        });
    }, [sales]);

    const maxChartValue = Math.max(...chartData.map((day) => day.quantity), 1);
    const criticalProducts = products.filter(
        (product) => product.stockCurrent < product.stockMinimum / 2
    ).length;
    const todayRevenue = todaySales.reduce((total, sale) => total + Number(sale.total || 0), 0);

    return (
        <div className="dashboard-container">
            <div className="dashboard-heading"><div><h1>Panel principal</h1><p>{new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div>{error && <span className="dashboard-error">{error}</span>}</div>
            <section className="dashboard-metrics" aria-label="Métricas del negocio">
                <MetricCard icon={<ShoppingBag />} tone="green" label="Ventas hoy" value={loading ? "..." : todaySales.length} helper="Transacciones registradas" />
                <MetricCard icon={<CircleDollarSign />} tone="green" label="Ingresos hoy" value={loading ? "..." : money(todayRevenue)} helper="Total vendido hoy" />
                <MetricCard icon={<AlertTriangle />} tone="orange" label="Alertas activas" value={loading ? "..." : stockAlerts.length} helper="Stock bajo" />
                <MetricCard icon={<CircleX />} tone="red" label="Productos críticos" value={loading ? "..." : criticalProducts} helper="Reabastecer" />
            </section>
            <section className="dashboard-grid">
                <div className="dashboard-panel sales-chart-panel"><div className="panel-heading"><div><h2>Ventas últimos 7 días</h2><p>Unidades vendidas</p></div><span className="panel-badge">{chartData.reduce((sum, day) => sum + day.quantity, 0)} uds</span></div><div className="sales-chart" aria-label="Gráfica de ventas de los últimos 7 días">{chartData.map((day) => <div className="chart-column" key={day.key}><span className="chart-value">{day.quantity || ""}</span><div className="chart-bar-wrap"><div className="chart-bar" style={{ height: `${Math.max((day.quantity / maxChartValue) * 100, day.quantity ? 10 : 2)}%` }} /></div><span className="chart-label">{day.label}</span></div>)}</div></div>
                <div className="dashboard-panel top-products-panel"><div className="panel-heading"><div><h2>Más vendidos</h2><p>Este mes</p></div><button type="button" className="text-button" onClick={() => setShowAllProducts(true)}>Ver todo <ArrowRight size={14} /></button></div><ProductRanking products={topProducts.slice(0, 5)} /></div>
            </section>
            <section className="dashboard-panel alerts-panel"><div className="panel-heading"><div><h2>Alertas de stock <span className="count-badge">{stockAlerts.length}</span></h2><p>Productos que necesitan atención</p></div><button type="button" className="text-button" onClick={() => navigate("/inventario")}>Gestionar <ArrowRight size={14} /></button></div>{stockAlerts.length === 0 && !loading ? <p className="empty-state">No hay alertas activas.</p> : stockAlerts.map((alert) => <div className="alert-row" key={alert.id}><span className="alert-icon"><AlertTriangle size={16} /></span><div className="alert-details"><strong>{alert.product?.name || productMap.get(alert.productId)?.name || "Producto"}</strong><div className="stock-progress"><span style={{ width: `${Math.min(((alert.product?.stockCurrent || productMap.get(alert.productId)?.stockCurrent || 0) / Math.max(alert.product?.stockMinimum || productMap.get(alert.productId)?.stockMinimum || 1, 1)) * 100, 100)}%` }} /></div></div><span className="stock-value">{alert.product?.stockCurrent || productMap.get(alert.productId)?.stockCurrent || 0}/{alert.product?.stockMinimum || productMap.get(alert.productId)?.stockMinimum || 0}</span></div>)}</section>
            {showAllProducts && <div className="dashboard-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setShowAllProducts(false)}><div className="dashboard-modal" role="dialog" aria-modal="true" aria-labelledby="all-products-title"><div className="modal-heading"><div><h2 id="all-products-title">Productos vendidos este mes</h2><p>{topProducts.length} productos con ventas registradas</p></div><button type="button" className="icon-button" onClick={() => setShowAllProducts(false)} aria-label="Cerrar lista"><CircleX size={22} /></button></div><ProductRanking products={topProducts} showRevenue /></div></div>}
        </div>
    );
}

function MetricCard({ icon, tone, label, value, helper }) { return <article className="metric-card"><span className={`metric-icon ${tone}`}>{icon}</span><span className="metric-label">{label}</span><strong>{value}</strong><small>{helper}</small></article>; }

function ProductRanking({ products, showRevenue = false }) {
    if (products.length === 0) return <p className="empty-state">Aún no hay ventas en este período.</p>;
    return <div className="product-ranking">{products.map((product, index) => <div className="ranking-row" key={product.id}><span className="ranking-number">{index + 1}</span><span className="product-icon"><Package size={16} /></span><div className="product-name"><strong>{product.name}</strong><small>{product.category}</small></div><div className="product-total"><strong>{product.quantity} uds</strong><small>{showRevenue ? money(product.revenue) : `${Math.round((product.quantity / Math.max(products[0].quantity, 1)) * 100)}%`}</small></div></div>)}</div>;
}

export default Dashboard;