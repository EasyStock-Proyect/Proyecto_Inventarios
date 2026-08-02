import ProductTable from "../../components/ProductTable/ProductTable";

import "./Inventory.css";

function Inventory() {

    return (
        <div className="inventory-container">

            <div className="inventory-card">

                <ProductTable />

            </div>

        </div>
    );

}

export default Inventory;