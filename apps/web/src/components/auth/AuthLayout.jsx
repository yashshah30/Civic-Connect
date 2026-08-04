export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

                <div className="text-center mb-8">

                    <h1 className="text-3xl font-bold text-blue-900">
                        Civic Connect
                    </h1>

                    <p className="text-slate-500 mt-2">
                        Connecting Citizens with Better Governance
                    </p>

                </div>

                <div className="mb-6">

                    <h2 className="text-2xl font-semibold">
                        {title}
                    </h2>

                    <p className="text-gray-500 text-sm">
                        {subtitle}
                    </p>

                </div>

                {children}

            </div>
        </div>
    );
}