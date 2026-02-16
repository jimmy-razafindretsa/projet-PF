import { OrderList } from "@/app/components/order_list";

export default async function ProductionPage({
    searchParams,
}: {
    searchParams?: Promise<{
        search?: string;
    }>;
}) {
    const resolvedSearchParams = await searchParams;
    return (
        <OrderList
            isArchive={false}
            searchParams={resolvedSearchParams}
            title="Production Line"
            subtitle="Track the progress of your orders"
            basePath="/client_dashboard"
        />
    );
}
