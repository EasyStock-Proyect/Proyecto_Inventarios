import "./Button.css";

function Button({ children, disabled, onClick, type = "button" }) {
    return (
        <button
            className="button"
            type={type}
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

export default Button;