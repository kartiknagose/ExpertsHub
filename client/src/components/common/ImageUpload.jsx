import React, { useState, useRef } from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';

export const ImageUpload = ({ label, onUpload, value, error, className = '' }) => {
    const [preview, setPreview] = useState(value || null);
    const fileInputRef = useRef(null);

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const [sizeError, setSizeError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSizeError(null);

            if (!ALLOWED_TYPES.includes(file.type)) {
                setSizeError('Only JPG, PNG, and WebP images are allowed');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                setSizeError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 5MB limit`);
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }

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
        setSizeError(null);
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
                            src={preview && preview.startsWith('https://res.cloudinary.com') ? preview.replace('/upload/', '/upload/f_auto,q_auto/') : preview}
                            alt="Preview"
                            className="w-full h-40 object-cover rounded-lg shadow-sm"
                            loading="lazy"
                            srcSet={preview && preview.startsWith('https://res.cloudinary.com') ? `
                                ${preview.replace('/upload/', '/upload/f_auto,q_auto,w_300/')} 300w,
                                ${preview.replace('/upload/', '/upload/f_auto,q_auto,w_600/')} 600w
                            ` : undefined}
                            sizes="(max-width: 600px) 300px, 600px"
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
                    capture="environment"
                    onChange={handleFileChange}
                />
            </div>

            {(error || sizeError) && <p className="text-xs text-red-500 mt-1">{sizeError || error}</p>}
        </div>
    );
};
