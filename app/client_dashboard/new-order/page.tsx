"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, CheckCircle, AlertCircle } from 'lucide-react';
import { insertOrder } from '@/app/actions/insertOrder';
import { insertFile } from '@/app/actions/insertFile';
const products = [
    "2 piece suit",
    "3 Piece Suit",
    "Jacket",
    "Pants",
    "Waistcoat"
];

// Simple Toast Component for notifications
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
    <div className={`fixed bottom-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in-up transition-all transform hover:scale-[1.02] ${type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'} max-w-sm`}>
        {type === 'success' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
        <span className="font-medium text-sm">{message}</span>
        <button onClick={onClose} className="ml-auto p-1 hover:bg-black/5 rounded-full transition-colors">
            <X className="w-4 h-4 opacity-70" />
        </button>
    </div>
);



export default function NewOrderPage() {
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        clientName: '',
        companyName: '',
        address: '',
        email: '',
        useCase: '',
        fileName: ''
    });
    const [file, setFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, boolean>>({});
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        // Basic sanitization: prevent potentially dangerous characters for SQL injection (client-side check for UX)
        // Note: Real security happens on the server with parameterized queries.
        if (value.includes('--') || value.includes(';')) {
            return;
        }
        setFormData(prev => ({ ...prev, [id]: value }));
        // Clear error when user types
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: false }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setErrors(prev => ({ ...prev, file: false }));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setErrors(prev => ({ ...prev, file: false }));
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering file input click
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000); // Auto hide after 3 seconds
    };


    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate
        const newErrors: Record<string, boolean> = {};
        if (!selectedProduct) newErrors.product = true;
        if (!formData.clientName.trim()) newErrors.clientName = true;
        if (!file) newErrors.file = true;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showToast("Please fill in all mandatory fields (Product, Client Name, File)", 'error');
            return;
        }

        // Show Confirmation Modal instesad of submitting immediately
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        if (!selectedProduct) return;

        let uploadedFilePath = '';

        // 1. Upload File FIRST to get the correct path
        if (file) {
            const fileData = new FormData();
            fileData.append('file', file);
            const fileResult = await insertFile(fileData);

            if (fileResult?.error) {
                console.error("File upload failed:", fileResult.error);
                showToast(`File upload failed: ${fileResult.error}`, 'error');
                return;
            }

            // Supabase upload returns `data` with `path`
            if (fileResult?.data?.path) {
                uploadedFilePath = fileResult.data.path;
            }
        }

        // 2. Submit Order with the accurate file path
        const orderData = {
            ...formData,
            fileName: uploadedFilePath || formData.fileName
        };

        const orderResult = await insertOrder(orderData, selectedProduct);
        if (orderResult?.error) {
            console.error("Order submission failed:", orderResult.error);
            showToast(`Order failed: ${orderResult.error}`, 'error');
            return;
        }

        console.log("Submitting Order:", { product: selectedProduct, ...orderData });
        setShowConfirmModal(false);
        showToast("Order submitted successfully!", 'success');

        // Reset form
        setFormData({
            clientName: '',
            companyName: '',
            address: '',
            email: '',
            useCase: '',
            fileName: ''
        });
        setFile(null);
        setSelectedProduct(null);
        setErrors({});
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start max-w-7xl mx-auto relative px-4 md:px-0">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 max-w-md w-full transform transition-all scale-100 ring-1 ring-slate-900/5">
                        <div className="text-center mb-6">
                            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Order Creation</h3>
                            <p className="text-slate-500 text-sm">
                                Are you sure you want to create this order for   <span className="font-semibold text-slate-700">{formData.clientName}</span> ?
                                <br /> This will notify the supplier to start the production.
                            </p>
                        </div>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors w-1/2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSubmit}
                                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow-sm transition-colors w-1/2"
                            >
                                Confirm Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Left Column: Product Selection */}
            <div className="w-full md:w-1/4">
                <h2 className={`text-sm font-bold mb-3 md:mb-6 tracking-wider uppercase border-b-2 pb-2 inline-block ${errors.product ? 'text-red-600 border-red-600' : 'text-[#1a237e] border-indigo-900'}`}>
                    Select Products {errors.product && '*'}
                </h2>
                {/* Mobile: Horizontal Scroll, Desktop: Vertical Stack */}
                <div className="flex overflow-x-auto pb-4 md:pb-0 md:flex-col md:space-y-1 gap-3 md:gap-0 no-scrollbar snap-x">
                    {products.map(product => (
                        <button
                            key={product}
                            onClick={() => {
                                setSelectedProduct(product);
                                setErrors(prev => ({ ...prev, product: false }));
                            }}
                            className={`flex-shrink-0 snap-center px-4 py-2 md:py-3 rounded-lg transition-all duration-200 text-sm md:text-xl font-serif border md:border-none ${selectedProduct === product
                                ? 'font-bold bg-[#1a237e] text-white md:bg-transparent md:text-slate-900 border-[#1a237e]'
                                : 'font-normal bg-white text-slate-500 hover:text-slate-800 border-slate-200 md:bg-transparent'
                                } ${errors.product && !selectedProduct ? 'text-red-500 border-red-200' : ''}`}
                        >
                            {product}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Column: details form */}
            <div className="w-full md:w-3/4">
                {selectedProduct ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 sm:p-8 animate-fade-in">
                        <div className="mb-6 sm:mb-8">
                            <h2 className="text-lg font-serif font-bold text-[#1a237e]">
                                Order Details: <span className="text-indigo-600">{selectedProduct}</span>
                            </h2>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {/* Form Fields Grid */}
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="clientName" className={`block text-xs font-bold uppercase tracking-wider mb-2 ${errors.clientName ? 'text-red-500' : 'text-slate-400'}`}>Client Name *</label>
                                    <input
                                        type="text"
                                        id="clientName"
                                        value={formData.clientName}
                                        onChange={handleInputChange}
                                        className={`w-full bg-slate-50 border rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${errors.clientName ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:ring-indigo-500'}`}
                                        placeholder="Enter client name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="companyName" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company Name</label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        value={formData.companyName}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                        placeholder="Enter company name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="address" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address</label>
                                    <input
                                        type="text"
                                        id="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                        placeholder="Enter address"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="useCase" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Note</label>
                                    <textarea
                                        id="useCase"
                                        rows={3}
                                        value={formData.useCase}
                                        onChange={handleInputChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                                        placeholder="Describe the use case"
                                    />
                                </div>
                            </div>

                            {/* File Upload Area */}
                            <div className="pt-4">
                                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${errors.file ? 'text-red-500' : 'text-slate-400'}`}>Tech Pack / PDF *</label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className={`border border-dashed rounded-xl p-6 sm:p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer group relative overflow-hidden ${errors.file ? 'border-red-400 bg-red-50/30' : 'border-slate-300 hover:bg-slate-50 bg-white'}`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf,.png,.jpg,.jpeg"
                                        onChange={handleFileChange}
                                    />

                                    {file ? (
                                        <div className="animate-fade-in flex flex-col items-center z-10">
                                            <div className="bg-green-100 p-3 rounded-full mb-3 shadow-sm">
                                                <CheckCircle className="text-green-600 w-8 h-8" />
                                            </div>
                                            <h3 className="text-slate-800 font-bold text-md mb-1 max-w-[200px] truncate">
                                                {file.name}
                                            </h3>
                                            <p className="text-slate-500 text-xs mb-3">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            <button
                                                onClick={removeFile}
                                                className="text-red-500 hover:text-red-700 text-xs font-bold uppercase tracking-wider bg-white border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shadow-sm"
                                            >
                                                <X className="w-3 h-3" /> Remove File
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="bg-slate-100 p-3 rounded-xl mb-4 group-hover:bg-slate-200 transition-colors">
                                                <ImageIcon className="text-slate-400 w-8 h-8" />
                                            </div>
                                            <h3 className="text-indigo-600 font-bold text-lg mb-1">
                                                Upload a file <span className="text-slate-500 font-normal">or drag and drop</span>
                                            </h3>
                                            <p className="text-slate-400 text-sm"> PDF up to 10MB</p>
                                        </>
                                    )}
                                </div>
                                {errors.file && <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3" /> File is required</p>}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-6">
                                <button type="submit" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center justify-center gap-2">
                                    Submit Order
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="h-[300px] sm:h-[500px] flex items-center justify-center p-8 sm:p-12 text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <div className="text-center">
                            <p>Select a product to start.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
