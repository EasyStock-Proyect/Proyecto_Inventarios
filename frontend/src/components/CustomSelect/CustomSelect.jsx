import { useEffect, useRef, useState } from "react";

import "./CustomSelect.css";


function CustomSelect({
    value,
    onChange,
    options,
    placeholder = "Seleccione una opción"
}) {

    const [open, setOpen] = useState(false);

    const selectRef = useRef(null);


    const selectedOption = options.find(
        option => option.id === value
    );


    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                selectRef.current &&
                !selectRef.current.contains(event.target)
            ) {
                setOpen(false);
            }

        };


        document.addEventListener(
            "mousedown",
            handleClickOutside
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    const handleSelect = (option) => {

        onChange(option.id);

        setOpen(false);

    };


    return (

        <div
            className="custom-select"
            ref={selectRef}
        >

            <button
                type="button"
                className="custom-select-trigger"
                onClick={() => setOpen(!open)}
            >

                <span>

                    {selectedOption
                        ? selectedOption.name
                        : placeholder}

                </span>


                <span
                    className={`custom-select-arrow ${open ? "open" : ""}`}
                >
                    ▾
                </span>

            </button>


            {open && (

                <div className="custom-select-options">

                    {options.map(option => (

                        <button
                            key={option.id}
                            type="button"
                            className={
                                option.id === value
                                    ? "selected"
                                    : ""
                            }
                            onClick={() =>
                                handleSelect(option)
                            }
                        >

                            {option.name}

                        </button>

                    ))}

                </div>

            )}

        </div>

    );

}


export default CustomSelect;