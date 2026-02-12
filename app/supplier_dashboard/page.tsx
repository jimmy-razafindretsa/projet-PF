"use client";
import { Navbar } from "../components/navbar";
import { UserRole } from "../types";

export default function Page() {
    const userRole = "supplier";

    const onLogout = () => {
        console.log("logout");
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar
                userRole={userRole}
                onLogout={onLogout}
            />
            <main className="flex-1 p-8">
                <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
                <p className="text-gray-500">Work in progress...</p>
            </main>
        </div>
    )
}
