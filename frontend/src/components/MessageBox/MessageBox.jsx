import "./MessageBox.css";

function MessageBox({
    title,
    message,
    buttonLabel,
    onClick,
    variant = "warning",
}) {
    return (
        <div className={`message-box message-box--${variant}`} role="alert">
            <div className="message-box__content">
                <div className="message-box__icon" aria-hidden="true">!</div>
                <div className="message-box__copy">
                    <h3>{title}</h3>
                    <p>{message}</p>
                </div>
            </div>

            {buttonLabel && (
                <button
                    type="button"
                    className="message-box__button"
                    onClick={onClick}
                >
                    {buttonLabel}
                </button>
            )}
        </div>
    );
}

export default MessageBox;
