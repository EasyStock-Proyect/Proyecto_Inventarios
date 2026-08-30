import { useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FiCamera, FiLock, FiUnlock } from "react-icons/fi";
import api from "../../api/api";

import "./Settings.css";

const DEFAULT_FORM = {
    fullName: "",
    email: "",
    businessName: "",
    businessType: "Tienda",
    address: "",
    profileImage: "",
    password: "",
    confirmPassword: "",
    notificationEmail: "",
};

function Settings() {
    const { user, setUser } = useOutletContext();
    const fileInputRef = useRef(null);
    const [form, setForm] = useState(() => ({
        ...DEFAULT_FORM,
        fullName: user?.fullName || "",
        email: user?.email || "",
        businessName: user?.businessName || "",
        businessType: user?.businessType || "Tienda",
        address: user?.address || "",
        profileImage: user?.profileImage || "",
        notificationEmail: user?.notificationEmail || user?.email || "",
    }));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [imageError, setImageError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const initials = useMemo(() => {
        const baseName = form.fullName || form.businessName || "MG";
        const words = baseName.trim().split(/\s+/).filter(Boolean);

        if (words.length >= 2) {
            return `${words[0][0]}${words[1][0]}`.toUpperCase();
        }

        return baseName.slice(0, 2).toUpperCase() || "MG";
    }, [form.fullName, form.businessName]);

    const updateField = (field, value) => {
        setForm((previousForm) => ({
            ...previousForm,
            [field]: value,
        }));
    };

    const handleImageUpload = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setImageError("La imagen debe pesar máximo 2 MB.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setForm((previousForm) => ({
                ...previousForm,
                profileImage: String(reader.result || ""),
            }));
            setImageError("");
        };

        reader.onerror = () => {
            setImageError("No se pudo cargar la imagen. Inténtalo de nuevo.");
        };

        reader.readAsDataURL(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (form.password && form.password !== form.confirmPassword) {
            setError("Las contraseñas no coinciden.");
            return;
        }

        if (form.password && form.password.length < 8) {
            setError("La contraseña debe tener mínimo 8 caracteres.");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                fullName: form.fullName,
                businessName: form.businessName,
                businessType: form.businessType,
                address: form.address,
                profileImage: form.profileImage,
                email: form.email,
                notificationEmail: form.notificationEmail || form.email,
                ...(form.password ? { password: form.password } : {}),
            };

            const response = await api.put("/auth/me", payload);

            setUser((previousUser) => ({
                ...previousUser,
                ...response.data,
                businessName: response.data.businessName || previousUser?.businessName,
            }));

            setSuccess("Los cambios se han guardado con éxito.");
            setForm((previousForm) => ({
                ...previousForm,
                password: "",
                confirmPassword: "",
            }));
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                "No se pudo guardar la información."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="settings-container">
            <div className="settings-page">
                <header className="settings-header">
                    <h1>Ajustes</h1>
                    <p>Gestiona tu perfil y datos del negocio</p>
                </header>

                <form className="settings-form" onSubmit={handleSubmit}>
                    <section className="settings-card profile-card">
                        <div className="section-label">PERFIL DEL COMERCIANTE</div>

                        <div className="profile-summary">
                            <div className="avatar-wrapper">
                                {form.profileImage ? (
                                    <img
                                        src={form.profileImage}
                                        alt="Foto de perfil"
                                        className="profile-avatar-image"
                                    />
                                ) : (
                                    <div className="profile-avatar-letter">{initials}</div>
                                )}
                                <button
                                    type="button"
                                    className="avatar-upload-button"
                                    onClick={() => fileInputRef.current?.click()}
                                    aria-label="Subir imagen de perfil"
                                >
                                    <FiCamera className="camera-icon" />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="sr-only"
                                />
                            </div>

                            <div className="profile-name-block">
                                <div className="profile-avatar-text">{initials}</div>
                                <div className="profile-upload-link" onClick={() => fileInputRef.current?.click()}>
                                    Subir imagen
                                </div>
                            </div>
                        </div>

                        <div className="field-group">
                            <label htmlFor="fullName">Nombre del comerciante</label>
                            <input
                                id="fullName"
                                type="text"
                                value={form.fullName}
                                onChange={(event) => updateField("fullName", event.target.value)}
                            />
                        </div>

                        <div className="field-group">
                            <label htmlFor="email">Correo electrónico</label>
                            <input
                                id="email"
                                type="email"
                                value={form.email}
                                onChange={(event) => updateField("email", event.target.value)}
                            />
                        </div>

                        <div className="field-group password-field">
                            <label htmlFor="password">Nueva contraseña</label>
                            <div className="password-wrapper">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    placeholder="Deja en blanco para mantener la actual"
                                    onChange={(event) => updateField("password", event.target.value)}
                                />
                                <button
                                    type="button"
                                    className="toggle-password-button"
                                    onClick={() => setShowPassword((previous) => !previous)}
                                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                                >
                                    {showPassword ? <FiUnlock /> : <FiLock />}
                                </button>
                            </div>
                        </div>

                        <div className="field-group password-field">
                            <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
                            <div className="password-wrapper">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={form.confirmPassword}
                                    onChange={(event) => updateField("confirmPassword", event.target.value)}
                                />
                                <button
                                    type="button"
                                    className="toggle-password-button"
                                    onClick={() => setShowConfirmPassword((previous) => !previous)}
                                    aria-label={showConfirmPassword ? "Ocultar confirmación" : "Mostrar confirmación"}
                                >
                                    {showConfirmPassword ? <FiUnlock /> : <FiLock />}
                                </button>
                            </div>
                        </div>
                    </section>

                    <section className="settings-card business-card">
                        <div className="section-label">DATOS DEL NEGOCIO</div>

                        <div className="field-group">
                            <label htmlFor="businessName">Nombre del negocio</label>
                            <input
                                id="businessName"
                                type="text"
                                value={form.businessName}
                                onChange={(event) => updateField("businessName", event.target.value)}
                            />
                        </div>

                        <div className="field-group">
                            <label htmlFor="businessType">Tipo de comercio</label>
                            <input
                                id="businessType"
                                type="text"
                                value={form.businessType}
                                placeholder="Ej. Tienda, Papelería, Ferretería"
                                onChange={(event) => updateField("businessType", event.target.value)}
                            />
                        </div>

                        <div className="field-group">
                            <label htmlFor="address">Dirección</label>
                            <input
                                id="address"
                                type="text"
                                value={form.address}
                                placeholder="Calle, número, ciudad y departamento"
                                onChange={(event) => updateField("address", event.target.value)}
                            />
                        </div>
                    </section>

                    <section className="settings-card notifications-card">
                        <div className="section-label">NOTIFICACIONES</div>

                        <div className="field-group">
                            <label htmlFor="notificationEmail">Correo para alertas</label>
                            <input
                                id="notificationEmail"
                                type="email"
                                value={form.notificationEmail}
                                onChange={(event) => updateField("notificationEmail", event.target.value)}
                            />
                        </div>

                        <button type="button" className="secondary-button">
                            Configurar notificaciones
                        </button>
                    </section>

                    {imageError && <p className="settings-message error-message">{imageError}</p>}
                    {error && <p className="settings-message error-message">{error}</p>}
                    {success && <p className="settings-message success-message">{success}</p>}

                    <button type="submit" className="save-button" disabled={saving}>
                        {saving ? "Guardando..." : "GUARDAR CAMBIOS"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Settings;