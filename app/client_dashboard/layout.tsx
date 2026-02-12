import { Navbar } from "../components/navbar";

export default function ClientDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar
                userRole="client"
            // onLogout prop can be handled here if we have a server action or client logic
            // For now, Navbar has a default empty handler or we can implement it later
            />
            <main className="flex-1 p-8 max-w-[95%] mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
