"use client";
import { Navbar } from "../components/navbar";
import { signOut } from "../actions/signout";

export default function Page() {
    const userRole = "supplier";

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar
                userRole={userRole}
                onLogout={signOut}
            />
            <main className="flex-1 p-8">
                <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
                <p className="text-gray-500">welcome to the supplier dashboard</p>
            </main>
        </div >
    )
}
