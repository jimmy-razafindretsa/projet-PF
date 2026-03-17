'use client';

import React, { useEffect, useState, useRef } from 'react';
import { getOrder } from '@/app/actions/getOrder';
import { updateOrder } from '@/app/actions/updateOrder';
import { deleteOrder } from '@/app/actions/deleteOrder';
import { deleteFile } from '@/app/actions/deleteFile';
import { insertFile } from '@/app/actions/insertFile';
import { getStatuses } from '@/app/actions/getStatuses';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Trash2, Archive, Edit3, Calendar, Truck, CreditCard, FileText, X, Save, AlertTriangle, ExternalLink, Hash, RotateCcw, Loader2, FileCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

interface OrderDetailViewProps {
    basePath?: string;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({
    basePath = '/client_dashboard'
}) => {
    const params = useParams();
    const id = params?.id as string;

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Update State
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
    const [statuses, setStatuses] = useState<any[]>([]);
    const [updateForm, setUpdateForm] = useState({
        price: '',
        ship_date: '',
        note: '',
        supplier_note: '',
        order_status_id: 0
    });
    // File management in update modal
    const [existingFiles, setExistingFiles] = useState<any[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [filesToDelete, setFilesToDelete] = useState<any[]>([]);
    const newFileInputRef = useRef<HTMLInputElement>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        if (!id) return;

        const fetchOrder = async () => {
            try {
                const { order, error } = await getOrder(id);
                if (error) {
                    setError(error);
                } else {
                    setOrder(order);
                }
            } catch (err: any) {
                console.error("Fetch error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const loadStatuses = async () => {
            const data = await getStatuses();
            setStatuses(data);
        };

        fetchOrder();
        loadStatuses();
    }, [id]);

    const handleOpenUpdate = () => {
        if (!order) return;
        setUpdateForm({
            price: order.price || '',
            ship_date: order.ship_date ? new Date(order.ship_date).toISOString().split('T')[0] : '',
            note: order.note || '',
            supplier_note: order.supplier_note || '',
            order_status_id: order.order_status_id || 0
        });
        setExistingFiles(order.Order_file || []);
        setNewFiles([]);
        setFilesToDelete([]);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUpdateForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (sendEmail: boolean) => {
        setIsSendingEmail(sendEmail);
        setIsConfirmOpen(true);
    };

    const handleRemoveExistingFile = (file: any) => {
        setFilesToDelete(prev => [...prev, file]);
        setExistingFiles(prev => prev.filter((f: any) => f.id !== file.id));
    };

    const handleNewFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selected = Array.from(e.target.files);
            setNewFiles(prev => {
                const combined = [...prev, ...selected];
                return combined.slice(0, 2); // max 2 total new files
            });
        }
    };

    const handleConfirmUpdate = async () => {
        if (!order) return;
        setIsUpdating(true);

        // 1. Delete removed files
        for (const f of filesToDelete) {
            await deleteFile(f.id, f.fileName);
        }

        // 2. Upload new files
        const uploadedPaths: string[] = [];
        for (const f of newFiles) {
            const fd = new FormData();
            fd.append('file', f);
            const result = await insertFile(fd);
            if (result?.data?.path) uploadedPaths.push(result.data.path);
        }

        const priceNum = parseFloat(updateForm.price as any);
        const shipDateValue = updateForm.ship_date ? `${updateForm.ship_date}T12:00:00Z` : null;

        const payload = {
            id: String(order.id),
            price: isNaN(priceNum) ? null : priceNum,
            ship_date: shipDateValue,
            note: updateForm.note || null,
            supplier_note: updateForm.supplier_note || null,
            order_status_id: Number(updateForm.order_status_id),
            newFileNames: uploadedPaths.length > 0 ? uploadedPaths : undefined,
            sendEmail: isSendingEmail,
            clientName: order.cl_name || undefined,
        };

        const res = await updateOrder(payload);

        if (res?.error) {
            alert(`Update failed: ${res.error}`);
            setIsUpdating(false);
        } else {
            setIsConfirmOpen(false);
            setIsUpdating(false);
            setIsUpdateModalOpen(false);
            window.location.reload();
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!order) return;
        const res = await deleteOrder(String(order.id));
        if (res?.error) {
            alert(`Delete failed: ${res.error}`);
            setIsDeleteConfirmOpen(false);
        } else {
            router.push(`${basePath}/production`);
        }
    };

    const handleArchiveClick = () => {
        setIsArchiveConfirmOpen(true);
    };

    const handleQuickAction = (sendEmail: boolean) => {
        if (!order) return;
        // Pre-fill form with current order values (no changes, just confirm)
        setUpdateForm({
            price: order.price || '',
            ship_date: order.ship_date ? new Date(order.ship_date).toISOString().split('T')[0] : '',
            note: order.note || '',
            supplier_note: order.supplier_note || '',
            order_status_id: order.order_status_id || 0
        });
        setExistingFiles(order.Order_file || []);
        setNewFiles([]);
        setFilesToDelete([]);
        setIsSendingEmail(sendEmail);
        setIsConfirmOpen(true);
    };

    const handleConfirmArchive = async () => {
        if (!order) return;

        const isArchiving = !order.is_archive; // Toggle logic

        // Optimistic UI update or just wait for redirect
        const res = await updateOrder({
            id: String(order.id),
            is_archive: isArchiving
        });

        if (res?.error) {
            alert(`${isArchiving ? 'Archive' : 'Restore'} failed: ${res.error}`);
            setIsArchiveConfirmOpen(false);
        } else {
            // Redirect based on action
            if (isArchiving) {
                router.push(`${basePath}/completed`);
            } else {
                router.push(`${basePath}/production`);
            }
        }
    };

    const getFileUrl = (fileName: string) => {
        return supabase.storage.from('PDF').getPublicUrl(fileName).data.publicUrl;
    };

    const fileUrl = order?.file_name ? getFileUrl(order.file_name) : null;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    };

    if (loading) return <div className="flex items-center justify-center min-h-screen text-slate-400">Loading order...</div>;
    if (error || !order) return <div className="flex flex-col items-center justify-center min-h-screen text-red-500">Error: {error || 'Order not found'}</div>;

    return (
        <div className="max-w-5xl mx-auto pb-48 relative px-4 sm:px-6 lg:px-8">
            {/* --- Modals are unchanged essentially, just kept minimal for brevity in thought but included in write --- */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold text-[#1a237e] mb-5">Update Order</h3>
                        <div className="space-y-4">
                            {/* Derive role from basePath */}
                            {(() => {
                                const isSupplier = basePath.includes('supplier');
                                const clientStatuses = [1, 2, 7]; // To be submitted, Submitted, Review completed
                                const supplierStatuses = [3, 4, 5, 6]; // Checking, Review Needed, In production, Shipped
                                const allowedStatusIds = isSupplier ? supplierStatuses : clientStatuses;
                                const filteredStatuses = statuses.filter(s => allowedStatusIds.includes(s.id));
                                return (
                                    <>
                                        {/* Price - supplier editable, client read-only */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (€)</label>
                                            <input
                                                type="number"
                                                name="price"
                                                value={updateForm.price}
                                                onChange={handleUpdateChange}
                                                disabled={!isSupplier}
                                                className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 ${!isSupplier ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                        {/* Shipping Date - supplier editable, client read-only */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expected Shipping Date</label>
                                            <input
                                                type="date"
                                                name="ship_date"
                                                value={updateForm.ship_date}
                                                onChange={handleUpdateChange}
                                                disabled={!isSupplier}
                                                className={`w-full bg-slate-50 border border-slate-200 rounded-lg p-3 ${!isSupplier ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                        {/* Status - filtered per role */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
                                            <select name="order_status_id" value={updateForm.order_status_id} onChange={handleUpdateChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3">
                                                {filteredStatuses.map(s => <option key={s.id} value={s.id}>{s.order_status_name}</option>)}
                                            </select>
                                        </div>
                                        {/* Supplier Notes - supplier editable, client read-only */}
                                        <div className="border border-purple-200 rounded-xl p-3 bg-purple-50/40">
                                            <label className="block text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Supplier Notes</label>
                                            <textarea
                                                name="supplier_note"
                                                rows={3}
                                                value={updateForm.supplier_note}
                                                onChange={handleUpdateChange}
                                                disabled={!isSupplier}
                                                placeholder="Internal notes from supplier..."
                                                className={`w-full bg-white border border-purple-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 ${!isSupplier ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                        {/* FB Notes (Client) - client editable, supplier read-only */}
                                        <div className="border border-indigo-200 rounded-xl p-3 bg-indigo-50/40">
                                            <label className="block text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">FB Notes (Client)</label>
                                            <textarea
                                                name="note"
                                                rows={3}
                                                value={updateForm.note}
                                                onChange={handleUpdateChange}
                                                disabled={isSupplier}
                                                placeholder="Notes from François Bertho..."
                                                className={`w-full bg-white border border-indigo-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${isSupplier ? 'opacity-60 cursor-not-allowed' : ''}`}
                                            />
                                        </div>
                                    </>
                                );
                            })()}
                            {/* File Management */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Update Files</label>
                                {/* Existing files */}
                                {existingFiles.length > 0 && (
                                    <div className="space-y-2 mb-3">
                                        {existingFiles.map((f: any) => (
                                            <div key={f.id} className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileCheck className="w-4 h-4 text-indigo-500 shrink-0" />
                                                    <span className="text-xs text-slate-700 truncate">{f.fileName?.split('/').pop()}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveExistingFile(f)}
                                                    className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-full transition-colors shrink-0 ml-2"
                                                >
                                                    <X className="w-3 h-3" /> Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* New file picker */}
                                {(existingFiles.length + newFiles.length) < 2 && (
                                    <div
                                        onClick={() => newFileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            multiple
                                            ref={newFileInputRef}
                                            className="hidden"
                                            onChange={handleNewFileChange}
                                        />
                                        <span className="text-xs text-indigo-500 font-semibold">+ Add file (PDF)</span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">Max 2 total files</span>
                                    </div>
                                )}
                                {/* Newly selected files preview */}
                                {newFiles.map((f, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-green-50 border border-green-100 rounded-lg px-3 py-2 mt-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <FileCheck className="w-4 h-4 text-green-500 shrink-0" />
                                            <span className="text-xs text-slate-700 truncate">{f.name}</span>
                                        </div>
                                        <button
                                            onClick={() => setNewFiles(prev => prev.filter((_, i) => i !== idx))}
                                            className="flex items-center gap-1 text-[10px] font-bold uppercase text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 px-2 py-1 rounded-full transition-colors shrink-0 ml-2"
                                        >
                                            <X className="w-3 h-3" /> Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsUpdateModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
                            <button onClick={() => handleSave(false)} className="flex-1 py-3 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors">Save</button>
                            <button onClick={() => handleSave(true)} className="flex-1 py-3 rounded-xl bg-[#2e7d32] text-white font-semibold hover:bg-green-800 transition-colors">Send</button>
                        </div>
                    </div>
                </div>
            )}
            {isConfirmOpen && (
                <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <AlertTriangle className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2">
                            {isSendingEmail ? "Confirm & Send?" : "Confirm Save?"}
                        </h3>
                        <p className="text-sm text-slate-500 mb-2">
                            {isSendingEmail
                                ? "This will save changes and notify the other party by email."
                                : "This will silently save your changes — no email will be sent."}
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => setIsConfirmOpen(false)} 
                                disabled={isUpdating}
                                className="flex-1 py-2 rounded-lg border disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmUpdate} 
                                disabled={isUpdating}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-white font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed ${isSendingEmail ? 'bg-[#2e7d32]' : 'bg-purple-600'}`}
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    isSendingEmail ? "Send" : "Save"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {isDeleteConfirmOpen && (
                <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
                        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-bold mb-2 text-red-600">Delete Order?</h3>
                        <p className="text-sm text-gray-500">This action cannot be undone.</p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
                            <button onClick={handleConfirmDelete} className="flex-1 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Delete</button>
                        </div>
                    </div>
                </div>
            )}
            {isArchiveConfirmOpen && (
                <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
                        {order?.is_archive ? (
                            <RotateCcw className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                        ) : (
                            <Archive className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                        )}
                        <h3 className={`text-lg font-bold mb-2 ${order?.is_archive ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {order?.is_archive ? 'Restore Order?' : 'Archive Order?'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {order?.is_archive
                                ? 'This order will be moved back to the production line.'
                                : 'This order will be moved to the archives.'}
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setIsArchiveConfirmOpen(false)} className="flex-1 py-2 rounded-lg border hover:bg-gray-50">Cancel</button>
                            <button onClick={handleConfirmArchive} className={`flex-1 py-2 rounded-lg text-white ${order?.is_archive ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {order?.is_archive ? 'Restore' : 'Archive'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- New Robust Layout --- */}

            {/* Top Bar */}
            <div className="pt-8 mb-8">
                <Link href={`${basePath}/production`} className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Link>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 text-slate-400 mb-2 font-mono text-sm">
                            <Hash className="w-4 h-4" />
                            <span>Order ID: {order.id}</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-[#1a237e] text-slate-900 leading-tight break-words">
                            {order.cl_name}
                        </h1>
                        <p className="text-xl text-slate-500 mt-2 font-light flex items-center gap-2">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-sm font-medium uppercase tracking-wide">
                                {order.product_type?.product_type_name || 'Product'}
                            </span>
                        </p>
                    </div>

                    <span className={`px-4 py-1.5 md:px-6 md:py-2 rounded-full text-sm md:text-lg font-medium self-start whitespace-nowrap
                        ${order.order_status_id === 1 ? 'bg-blue-100 text-blue-800' :
                            order.order_status_id === 2 ? 'bg-yellow-100 text-yellow-800' :
                                order.order_status_id === 3 ? 'bg-purple-100 text-purple-800' :
                                    'bg-green-100 text-green-800'}`}>
                        {order.order_status?.order_status_name || 'Status Unknown'}
                    </span>
                </div>
            </div>

            {/* Metrics Grid - 1 Col Mobile, 2 Col Tablet, 3 Col Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CreditCard className="w-16 h-16 text-emerald-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Price</p>
                    <p className="text-3xl md:text-4xl font-bold text-emerald-600">
                        {order.price ? `$${order.price.toFixed(2)}` : 'Quoting...'}
                    </p>
                </div>

                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" /> Ordered
                    </p>
                    <p className="text-xl md:text-2xl text-slate-800">{formatDate(order.ord_time)}</p>
                </div>

                {/* Spans 2 cols on tablet to look better, or just 1. Let's keep 1 for simplicity or use col-span-full sm:col-span-2 md:col-span-1 for last item? No, specific span is messy. 2 cols is fine, last one will just handle itself. */}
                <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm sm:col-span-2 md:col-span-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Shipping
                    </p>
                    <p className={`text-xl md:text-2xl ${order.ship_date ? 'text-slate-800' : 'text-slate-400 italic'}`}>
                        {formatDate(order.ship_date)}
                    </p>
                </div>
            </div>

            {/* Notes Section - Two separate boxes */}
            <div className="space-y-4 mb-8">
                {/* Supplier Notes */}
                <div className="bg-purple-50 p-5 md:p-6 rounded-2xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-3 text-purple-500">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Supplier Notes</span>
                    </div>
                    <div className="text-base text-purple-900 leading-relaxed font-serif whitespace-pre-wrap">
                        {order.supplier_note || <span className="text-purple-300 italic text-sm">No supplier notes yet.</span>}
                    </div>
                </div>
                {/* FB Notes (Client) */}
                <div className="bg-red-50 p-5 md:p-6 rounded-2xl border border-red-200">
                    <div className="flex items-center gap-2 mb-3 text-red-400">
                        <FileText className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">FB Notes (Client)</span>
                    </div>
                    <div className="text-base text-red-900 leading-relaxed font-serif whitespace-pre-wrap">
                        {order.note || <span className="text-red-300 italic text-sm">No client notes yet.</span>}
                    </div>
                </div>
            </div>

            {/* File Section - from Order_file junction table */}
            {order.Order_file && order.Order_file.length > 0 && (
                <div className="mb-32">
                    <div className="flex items-center gap-2 mb-4 text-slate-400">
                        <Save className="w-5 h-5" />
                        <span className="text-sm font-bold uppercase tracking-wider">Attached Files</span>
                    </div>
                    <div className="space-y-3">
                        {order.Order_file.map((f: any) => {
                            const url = supabase.storage.from('PDF').getPublicUrl(f.fileName).data.publicUrl;
                            return (
                                <a key={f.id} href={url} target="_blank" rel="noopener noreferrer" className="block group">
                                    <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center sm:justify-start gap-4 hover:bg-indigo-50/50 hover:border-indigo-400 transition-all cursor-pointer">
                                        <div className="bg-indigo-100 p-3 rounded-full group-hover:scale-110 transition-transform shrink-0">
                                            <FileText className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div className="min-w-0 text-center sm:text-left">
                                            <span className="block text-base font-bold text-indigo-900 mb-0.5 break-all">{f.fileName?.split('/').pop()}</span>
                                            <span className="text-indigo-500 text-xs flex items-center justify-center sm:justify-start gap-1">Open in new tab <ExternalLink className="w-3 h-3" /></span>
                                        </div>
                                    </div>
                                </a>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Floating Action Bar */}
            <div className="fixed bottom-6 left-0 right-0 px-4 md:px-6 z-50 pointer-events-none">
                <div className="max-w-3xl mx-auto pointer-events-auto">
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-2xl p-2 md:p-3 flex items-center gap-1.5">
                        {/* Left group: secondary actions */}
                        <button onClick={handleArchiveClick} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 text-sm font-medium">
                            {order?.is_archive ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                            <span>{order?.is_archive ? 'Restore' : 'Archive'}</span>
                        </button>
                        <button onClick={handleOpenUpdate} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl hover:bg-slate-100 transition-colors text-slate-500 text-sm font-medium">
                            <Edit3 className="w-4 h-4" />
                            <span>Modify</span>
                        </button>
                        <button onClick={handleDeleteClick} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-red-500 text-sm font-medium">
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                        </button>

                        {/* Spacer */}
                        <div className="flex-1" />
                        <div className="w-px h-6 bg-slate-200" />

                        {/* Right group: primary actions */}
                        <button onClick={() => handleQuickAction(false)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors text-sm font-semibold">
                            <Save className="w-4 h-4" />
                            Save
                        </button>
                        <button onClick={() => handleQuickAction(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2e7d32] text-white hover:bg-green-800 transition-colors text-sm font-semibold">
                            <ExternalLink className="w-4 h-4" />
                            Send update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
