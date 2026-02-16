import { OrderList } from "@/app/components/order_list";

export default function CompletedOrdersPage({
    searchParams,
}: {
    searchParams?: {
        search?: string;
    };
}) {
    return (
        <OrderList
            isArchive={true}
            searchParams={searchParams}
            title="Archives"
            subtitle="View completed orders"
            basePath="/client_dashboard"
        />
    );
}
