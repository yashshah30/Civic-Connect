export default function OTPInput() {
  return (
    <div className="flex justify-between gap-2">
      {[1, 2, 3, 4, 5, 6].map((box) => (
        <input
          key={box}
          type="text"
          maxLength="1"
          className="w-12 h-12 text-center text-lg border rounded-lg focus:border-blue-800 focus:outline-none"
        />
      ))}
    </div>
  );
}