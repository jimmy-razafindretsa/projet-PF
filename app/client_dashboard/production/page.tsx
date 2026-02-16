import { OrderList } from "@/app/components/order_list";

export default function ProductionPage({
    searchParams,
}: {
    searchParams?: {
        search?: string;
    };
}) {
    return (
        <OrderList
            isArchive={false}
            searchParams={searchParams}
            title="Production Line"
            subtitle="Track the progress of your orders"
            basePath="/client_dashboard"
        />
    );
}
