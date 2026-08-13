import {
    FiMinus,
    FiPlus,
    FiTrash2
} from "react-icons/fi";

import "./CartItem.css";

function CartItem({
    item,
    onUpdateQuantity,
    onRemove
}) {
    const price = Number(item.price ?? 0);

    const quantity = Number(item.quantity ?? 1);

    const stock = Number(
        item.stockCurrent ?? item.stock ?? 0
    );

    const subtotal = price * quantity;

    const decreaseQuantity = () => {
        if (quantity <= 1) {
            onRemove(item.id);
            return;
        }

        onUpdateQuantity(
            item.id,
            quantity - 1
        );
    };

    const increaseQuantity = () => {
        if (quantity >= stock) {
            return;
        }

        onUpdateQuantity(
            item.id,
            quantity + 1
        );
    };

    return (
        <div className="cart-item">

            <div className="cart-item-info">

                <h3>
                    {item.name}
                </h3>

                <span>
                    $ {price.toLocaleString("es-CO")}
                </span>

            </div>

            <div className="cart-item-actions">

                <div className="quantity-control">

                    <button
                        type="button"
                        onClick={decreaseQuantity}
                        aria-label="Disminuir cantidad"
                    >
                        <FiMinus size={14} />
                    </button>

                    <span>
                        {quantity}
                    </span>

                    <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={quantity >= stock}
                        aria-label="Aumentar cantidad"
                    >
                        <FiPlus size={14} />
                    </button>

                </div>

                <strong>
                    $ {subtotal.toLocaleString("es-CO")}
                </strong>

                <button
                    type="button"
                    className="remove-cart-item"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Eliminar ${item.name}`}
                >
                    <FiTrash2 size={16} />
                </button>

            </div>

        </div>
    );
}

export default CartItem;