import "./SalesTabs.css";

function SalesTabs({ activeTab, onChange }) {
    return (
        <div className="sales-tabs">

            <button
                type="button"
                className={`sales-tab ${
                    activeTab === "new" ? "active" : ""
                }`}
                onClick={() => onChange("new")}
            >
                Nueva venta
            </button>

            <button
                type="button"
                className={`sales-tab ${
                    activeTab === "history" ? "active" : ""
                }`}
                onClick={() => onChange("history")}
            >
                Historial
            </button>

        </div>
    );
}

export default SalesTabs;