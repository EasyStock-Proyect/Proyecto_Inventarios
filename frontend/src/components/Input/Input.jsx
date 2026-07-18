import "./input.css"

function Input(props){
    return(
        <input
            className="input"
            type={props.type}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            name={props.name}
        />
    )
}

export default Input;