import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from './index';

export const ImageUpload = ({ label, onUpload, value, error, className = '' }) => {
    const [preview, setPreview] = useState(value || null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
            onUpload(file);
        }
    };

    const clearImage = () => {
        setPreview(null);
        onUpload(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}

            <div className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${preview ? 'border-brand-500' : 'border-gray-300 hover:border-brand-400'
                } ${error ? 'border-red-500 bg-red-50' : ''}`}>

                {preview ? (
                    <div className="relative group p-2">
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-lg shadow-sm"
                        />
                        <button
                            onClick={clearImage}
                            className="absolute top-4 right-4 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div
                        className="flex flex-col items-center justify-center py-10 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="p-3 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-full mb-3">
                            <Camera size={24} />
                        </div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click to capture or upload photo</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                )}

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};
