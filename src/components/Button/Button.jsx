import './Button.css'

function Button({ children, variant = 'primary', type = 'button', onClick, className = '', ...props }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`button button-${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
