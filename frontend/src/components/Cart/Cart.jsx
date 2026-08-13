import {
    FiShoppingCart
} from "react-icons/fi";

import "./Cart.css";

import CartItem from "../CartItem/CartItem";

function Cart({
    cart,
    total,
    onUpdateQuantity,
    onRemove,
    onRegister,
    loading
}) {
    const isEmpty = cart.length === 0;

    return (
        <aside className="cart">

            <div className="cart-header">
                <h2>Carrito</h2>

                <span>
                    {cart.length}{" "}
                    {cart.length === 1 ? "producto" : "productos"}
                </span>
            </div>

            <div className="cart-content">

                {isEmpty ? (
                    <div className="empty-cart">

                        <FiShoppingCart
                            size={52}
                            className="empty-cart-icon"
                        />

                        <h3>
                            El carrito está vacío
                        </h3>

                        <p>
                            Agrega productos desde la búsqueda
                        </p>

                    </div>
                ) : (
                    <div className="cart-items">

                        {cart.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                onUpdateQuantity={onUpdateQuantity}
                                onRemove={onRemove}
                            />
                        ))}

                    </div>
                )}

            </div>

            <div className="cart-footer">

                <div className="cart-total">

                    <span>Total</span>

                    <strong>
                        $ {total.toLocaleString("es-CO")}
                    </strong>

                </div>

                <button
                    type="button"
                    className="register-sale-button"
                    disabled={isEmpty || loading}
                    onClick={onRegister}
                >
                    {loading
                        ? "Registrando..."
                        : "Registrar venta"
                    }
                </button>

            </div>

        </aside>
    );
}

export default Cart;