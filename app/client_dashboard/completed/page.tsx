import { OrderList } from "@/app/components/order_list";

export default async function CompletedOrdersPage({
    searchParams,
}: {
    searchParams?: Promise<{
        search?: string;
        status?: string;
    }>;
}) {
    const resolvedSearchParams = await searchParams;
    return (
        <OrderList
            isArchive={true}
            searchParams={resolvedSearchParams}
            title="Archives"
            subtitle="View completed orders"
            basePath="/client_dashboard"
        />
    );
}
