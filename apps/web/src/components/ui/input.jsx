

const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  className = "",
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`rounded-xl border border-slate-300 p-3 outline-none focus:border-blue-800 focus:ring-2 focus:ring-blue-200 ${className}`}
      />
    </div>
  );
};

export default Input;