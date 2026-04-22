import './Input.css'

function Input({ label, icon, type = 'text', placeholder, id, name, required, className = '', ...props }) {
  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <div className="input-wrapper">
        {icon && (
          <div className="input-icon">
            <span className="material-symbols-outlined">{icon}</span>
          </div>
        )}
        <input
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          required={required}
          className={`input ${icon ? 'input-with-icon' : ''}`}
          {...props}
        />
      </div>
    </div>
  )
}

export default Input
