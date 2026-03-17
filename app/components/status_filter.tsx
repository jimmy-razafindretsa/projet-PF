"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

interface Status {
    id: number;
    order_status_name: string;
}

export const StatusFilter = ({ statuses }: { statuses: Status[] }) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const term = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
            params.set("status", term);
        } else {
            params.delete("status");
        }
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="relative w-full md:w-auto">
            <select
                disabled={isPending}
                className={`block w-full p-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:border-indigo-300 cursor-pointer appearance-none ${isPending ? 'opacity-70 pr-12' : 'pr-10'}`}
            style={{ 
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1em'
            }}
            onChange={handleChange}
            defaultValue={searchParams.get("status")?.toString() || ""}
        >
            <option value="">All orders</option>
            {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                    {status.order_status_name}
                </option>
            ))}
            </select>
            {isPending && (
                <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none">
                     <Loader2 size={16} className="animate-spin text-indigo-500" />
                </div>
            )}
        </div>
    );
};

export default StatusFilter;
