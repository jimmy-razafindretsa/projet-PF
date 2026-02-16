
import { Navbar } from "../../components/navbar";
import { signOut } from "../../actions/signout";
import { OrderList } from "@/app/components/order_list";

export default async function Page2({
    searchParams,
}: {
    searchParams?: Promise<{
        search?: string;
    }>;
}) {
    const userRole = "supplier";
    const resolvedSearchParams = await searchParams;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar
                userRole={userRole}
                onLogout={signOut}
            />
            <main className="flex-1 p-8">
                <OrderList
                    isArchive={false}
                    searchParams={resolvedSearchParams}
                    title="Supplier Dashboard"
                    subtitle="Production Line"
                    basePath="/supplier_dashboard"
                />
            </main>
        </div >
    )
}
