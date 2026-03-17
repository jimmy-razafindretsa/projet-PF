import React from 'react';
import Link from 'next/link';
import { FileText, ChevronDown } from 'lucide-react';
import { OrderStatusId } from '../types';
import { OrderStatusLabels } from '../types';
import { stat } from 'fs';

export interface OrderCardProps {
    id: string;
    clientName: string;
    productTypeName: string;
    price: number;
    order_date: string;
    shippingDate: string;
    statusName: string;
    note?: string;
    supplier_note?: string;
    statusId: number;
    orderFiles?: { id: number, fileName: string }[];
    basePath?: string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
    id,
    clientName,
    productTypeName,
    price,
    order_date,
    shippingDate,
    statusName,
    note,
    supplier_note,
    statusId,
    orderFiles = [],
    basePath = "/client_dashboard",
}) => {
    // Status badge styling
    const getStatusStyles = (statusId: number): string => {
        switch (statusId) {
            case OrderStatusId.TO_BE_SUBMITTED:
                return "bg-gray-100 text-gray-700 border-gray-200";
            case OrderStatusId.SUBMITTED:
                return "bg-blue-100 text-blue-700 border-blue-200";
            case OrderStatusId.CHECKING:
                return "bg-indigo-100 text-indigo-700 border-indigo-200";
            case OrderStatusId.REVIEW_NEEDED:
                return "bg-red-100 text-red-700 border-red-200";
            case OrderStatusId.IN_PRODUCTION:
                return "bg-amber-100 text-amber-700 border-amber-200";
            case OrderStatusId.SHIPPED:
                return "bg-green-100 text-green-700 border-green-200";
            case OrderStatusId.REVIEW_COMPLETED:
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default:
                return "bg-gray-50 text-gray-500 border-gray-100";
        }
    };
    const statusLabel = OrderStatusLabels[statusId] || "Unknown";

    return (
        <Link href={`${basePath}/order_detail/${id}`} className="block group">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 sm:p-6 group-hover:shadow-md transition-all duration-200 active:scale-[0.99]">
                {/* Header Row: ID, Name, Product, Price */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-slate-400">#{id}</span>
                            <span className="sr-only">Order ID</span>
                        </div>
                        <h3 className="text-lg font-bold text-[#1a237e] tracking-tight truncate w-full sm:w-auto">
                            {clientName}
                        </h3>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-1 sm:mt-0">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide">
                            {productTypeName}
                        </span>
                        <span className="text-slate-900 font-bold whitespace-nowrap text-lg">
                            € {price}
                        </span>
                    </div>
                </div>

                {/* Meta Information Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-5 gap-x-4 items-center mb-5">
                    <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Ordered</span>
                        <span className="text-slate-700 font-medium text-sm">{order_date}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Ships</span>
                        <span className="text-slate-700 font-medium text-sm">{shippingDate || 'TBD'}</span>
                    </div>

                    {/* Status - Spans 2 cols on mobile if needed, or just 1 */}
                    <div className="flex flex-col col-span-2 sm:col-span-1">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider font-bold mb-1">Status</span>
                        <div className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border w-fit ${getStatusStyles(statusId)}`}>
                            {statusName}
                        </div>
                    </div>

                    <div className="flex justify-end col-span-2 sm:col-span-1 mt-1 sm:mt-0">
                        {orderFiles.length > 0 && (
                            <span className="flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold transition-colors uppercase tracking-wide cursor-pointer">
                                <FileText size={16} />
                                <span>{orderFiles.length > 1 ? `${orderFiles.length} PDFs` : 'PDF'}</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Note Section */}
                <div className="mt-4 flex flex-col gap-2">
                    {supplier_note && (
                        <div className="bg-purple-50/50 rounded-lg p-3 border border-purple-100 flex gap-3 items-start">
                            <span className="text-purple-500 text-[10px] font-bold uppercase tracking-wider mt-0.5 shrink-0 w-[4.5rem]">Supplier Note</span>
                            <p className="text-sm text-purple-900 leading-snug break-words line-clamp-2 w-full">
                                {supplier_note}
                            </p>
                        </div>
                    )}
                    {(note || !supplier_note) && (
                        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100 flex gap-3 items-start">
                            <span className="text-blue-500 text-[10px] font-bold uppercase tracking-wider mt-0.5 shrink-0 w-[4.5rem]">Client Note</span>
                            <p className="text-sm text-blue-900 leading-snug break-words line-clamp-2 w-full">
                                {note || "No note"}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
};

