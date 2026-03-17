"use client";

import { Search, Loader2 } from "lucide-react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useTransition } from "react";

export const SearchBar = () => {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
            params.set("search", term);
        } else {
            params.delete("search");
        }
        startTransition(() => {
            replace(`${pathname}?${params.toString()}`);
        });
    }, 300);

    return (
        <div className="w-full max-w-md">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors duration-200">
                    {isPending ? (
                        <Loader2 size={20} className="animate-spin text-indigo-500" />
                    ) : (
                        <Search size={20} />
                    )}
                </div>
                <input
                    type="search"
                    id="search"
                    className="block w-full p-3 pl-12 text-base text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all duration-200 shadow-sm hover:border-indigo-300 placeholder-gray-400"
                    placeholder="Search orders by client..."
                    onChange={(e) => handleSearch(e.target.value)}
                    defaultValue={searchParams.get("search")?.toString()}
                />
            </div>
        </div>
    );
};

export default SearchBar;