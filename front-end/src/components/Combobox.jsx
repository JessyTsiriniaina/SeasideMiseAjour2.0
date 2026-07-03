import React, { useId } from "react";

const Combobox = ({
  label,
  name,
  value,
  options = [],
  onChange,
  placeholder = "Sélectionner",
  loading = false,
  disabled = false,
  emptyText = "Aucune option disponible",
  required = false,
  error = "",
}) => {
  const id = useId();
  const isDisabled = disabled || loading;

  return (
    <div className="modal-field">
      {label && <label className="modal-label" htmlFor={id}>{label}</label>}
      <select
        id={id}
        className="modal-input"
        name={name}
        value={value}
        onChange={onChange}
        disabled={isDisabled}
        required={required}
      >
        <option value="">{loading ? "Chargement..." : placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {!loading && options.length === 0 && <p className="modal-hint">{emptyText}</p>}
      {error && <p className="modal-error">{error}</p>}
    </div>
  );
};

export default Combobox;
