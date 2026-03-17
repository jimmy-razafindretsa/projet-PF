import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { OrderCard } from "@/app/components/order_card";
import SearchBar from "@/app/components/search_bar";
import StatusFilter from "@/app/components/status_filter";
import { getStatuses } from "@/app/actions/getStatuses";

interface OrderListProps {
    isArchive?: boolean;
    searchParams?: { search?: string, status?: string };
    title: string;
    subtitle: string;
    basePath?: string;
}

export async function OrderList({
    isArchive = false,
    searchParams,
    title,
    subtitle,
    basePath = "/client_dashboard"
}: OrderListProps) {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Use the search and status term if present
    const query = searchParams?.search || '';
    const statusFilterId = searchParams?.status || '';

    // Fetch order statuses for the filter dropdown
    const statuses = await getStatuses();

    // Start building the query
    let dataQuery = supabase
        .from("Order")
        .select(`
            *,
            order_status(order_status_name),
            product_type(product_type_name),
            Order_file(id, "fileName")
        `)
        .eq('is_archive', isArchive)
        .order('ord_time', { ascending: false });

    // Apply filter if search term exists
    if (query) {
        dataQuery = dataQuery.ilike('cl_name', `%${query}%`);
    }

    if (statusFilterId) {
        dataQuery = dataQuery.eq('order_status_id', parseInt(statusFilterId, 10));
    }

    const { data: orders, error } = await dataQuery;

    if (error) return <div>Error loading orders</div>;

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-serif italic text-gray-900">{title}</h1>
                    <p className="text-sm text-gray-500 uppercase tracking-wider mt-2">{subtitle}</p>
                </div>
                <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
                    <StatusFilter statuses={statuses} />
                    <SearchBar />
                </div>
            </header>

            <Suspense fallback={<div className="animate-pulse bg-gray-100 h-64 rounded-lg w-full"></div>}>
                <div className="flex flex-col gap-4">
                    {orders?.map((order) => (
                        <OrderCard
                            key={order.id}
                            id={order.id}
                            clientName={order.cl_name}
                            order_date={order.ord_time}
                            shippingDate={order.ship_date}
                            note={order.note}
                            supplier_note={order.supplier_note}
                            statusId={order.order_status_id}
                            statusName={order.order_status?.order_status_name}
                            productTypeName={order.product_type?.product_type_name}
                            price={order.price}
                            orderFiles={order.Order_file}
                            basePath={basePath}
                        />
                    ))}

                    {orders?.length === 0 && (
                        <div className="col-span-full bg-white p-8 rounded-lg shadow-sm border border-gray-100 min-h-[400px] flex items-center justify-center text-gray-400">
                            {isArchive ? "No archived orders found." : "No active orders found."}
                        </div>
                    )}
                </div>
            </Suspense>
        </div>
    );
}
