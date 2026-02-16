import { Navbar } from "../components/navbar";
import { signOut } from "../actions/signout";

export default function ClientDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar
                userRole="client"
                onLogout={signOut}
            />
            <main className="flex-1 p-8 max-w-[95%] mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
