import "./Button.css"

function Button(props){
    return(
        <button className="button"
        disabled={props.disabled}
        onClick={props.onClick}>
            {props.children}
        </button>
    )
}

export default Button;