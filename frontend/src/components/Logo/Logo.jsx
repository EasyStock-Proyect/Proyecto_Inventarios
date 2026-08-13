import logoFull from "../../assets/logo/logo_full.webp";
import logoIcon from "../../assets/logo/logo_3.webp";

function Logo({ compact = false }) {

    return (
        <div className="logo">

            <img
                src={compact ? logoIcon : logoFull}
                alt="EasyStock"
                className={compact ? "logo-image-compact" : "logo-image-full"}
            />

            {!compact && (
                <p className="logo-subtitle">
                    Gestión inteligente para tu negocio
                </p>
            )}

        </div>
    );
}

export default Logo;