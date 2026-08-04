const Card = ({ children }) => {
  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      {children}
    </div>
  );
};

export default Card;