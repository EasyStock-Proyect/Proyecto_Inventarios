import { useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

import "./ProductSearch.css";

function ProductSearch({ onSearch }) {
    const [search, setSearch] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            onSearch(search.trim());
        }, 200);

        return () => {
            clearTimeout(timeout);
        };
    }, [search, onSearch]);

    const handleClear = () => {
        setSearch("");
        inputRef.current?.focus();
    };

    return (
        <div className="product-search">

            <FiSearch
                className="product-search-icon"
                size={20}
            />

            <input
                type="text"
                ref={inputRef}
                value={search}
                onChange={(event) =>
                    setSearch(event.target.value)
                }
                placeholder="Buscar producto por nombre o SKU..."
                aria-label="Buscar producto por nombre o SKU"
            />

            {search && (
                <button
                    type="button"
                    className="clear-search-button"
                    aria-label="Limpiar búsqueda"
                    onClick={handleClear}
                >
                    <FiX size={19} />
                </button>
            )}

        </div>
    );
}

export default ProductSearch;