import { useEffect, useState } from "react";
import { FiMic, FiSearch } from "react-icons/fi";

import "./ProductSearch.css";

function ProductSearch({ onSearch }) {
    const [search, setSearch] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => {
            onSearch(search.trim());
        }, 200);

        return () => {
            clearTimeout(timeout);
        };
    }, [search, onSearch]);

    return (
        <div className="product-search">

            <FiSearch
                className="product-search-icon"
                size={20}
            />

            <input
                type="text"
                value={search}
                onChange={(event) =>
                    setSearch(event.target.value)
                }
                placeholder="Buscar producto por nombre o SKU..."
                aria-label="Buscar producto por nombre o SKU"
            />

            <button
                type="button"
                className="voice-button"
                aria-label="Búsqueda por voz"
            >
                <FiMic size={19} />
            </button>

        </div>
    );
}

export default ProductSearch;