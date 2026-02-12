import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function ProductionLineData() {
    const supabase = await createClient();
    const { data: dashboardData, error } = await supabase.from("instruments").select();

    if (error) {
        console.error("Supabase error:", error);
        return (
            <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                <h3 className="font-bold mb-2">Error Loading Data</h3>
                <pre className="text-xs overflow-auto">{JSON.stringify(error, null, 2)}</pre>
            </div>
        );
    }

    if (!dashboardData || dashboardData.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-100">
                <p>No instruments in production.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-serif font-medium text-gray-900">Active Production Line</h2>
            </div>
            <div className="p-0">
                <pre className="p-6 text-sm text-gray-600 overflow-auto max-h-[600px]">{JSON.stringify(dashboardData, null, 2)}</pre>
            </div>
        </div>
    );
}

export default function ProductionPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-serif italic text-gray-900">Production Line</h1>
                <p className="text-sm text-gray-500 uppercase tracking-wider mt-2">Track the progress of your instruments</p>
            </header>

            <Suspense fallback={<div className="animate-pulse bg-gray-200 h-64 rounded-lg w-full"></div>}>
                <ProductionLineData />
            </Suspense>
        </div>
    );
}
