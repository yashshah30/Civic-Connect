

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
}) => {
  const variants = {
    primary:
      "bg-blue-900 text-white hover:bg-blue-800",

    secondary:
      "bg-teal-700 text-white hover:bg-teal-600",

    outline:
      "border border-blue-900 text-blue-900 bg-white hover:bg-blue-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full rounded-xl px-4 py-3 font-medium transition ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;