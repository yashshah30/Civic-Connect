import NotificationPanel from "../../components/notifications/NotificationPanel";

const Notifications = () => {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="bg-blue-800 px-6 py-4">
                <h1 className="text-2xl font-bold text-white">
                    Civic Connect
                </h1>
            </header>

            <NotificationPanel />
        </div>
    );
};

export default Notifications;