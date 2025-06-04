import React, { useState, useRef } from 'react';
import axios from 'axios';

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState<string>('');
    const [speed, setSpeed] = useState<number>(1.0);
    const [language, setLanguage] = useState<string>('en');
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [success, setSuccess] = useState<string>('');
    const dragCounter = useRef(0);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file && !text.trim()) {
            setError('Please provide either an audio file or text input');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();

            formData.append('text', text);
            formData.append('speed', speed.toString());
            formData.append('language', language);

            if (file) {
                formData.append('audio', file);
            }

            const response = await axios.post('http://localhost:8000/api/clone/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('Request processed successfully!');
            console.log('Response:', response.data);

        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred while processing your request';
            setError(errorMessage);
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setDragActive(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setDragActive(false);
        }
    };

    const validateFile = (file: File): string | null => {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const allowedTypes = [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/wave',
            'audio/x-wav',
            'audio/mp4',
            'audio/m4a',
            'audio/aac',
            'audio/ogg',
            'audio/webm',
            'audio/flac',
            'audio/x-flac',
            'audio/aiff',
            'audio/x-aiff',
            'audio/wma',
            'audio/x-ms-wma',
            'audio/amr',
            'audio/3gpp'
        ];

        if (!file.type.startsWith('audio/')) {
            return 'Please select an audio file';
        }

        if (!allowedTypes.includes(file.type)) {
            return `Unsupported audio format: ${file.type}. Please use MP3, WAV, M4A, AAC, OGG, FLAC, AIFF, WMA, or AMR format`;
        }

        if (file.size > maxSize) {
            return 'File size must be less than 50MB';
        }

        return null;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setSuccess('');
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const validationError = validateFile(selectedFile);

            if (validationError) {
                setError(validationError);
                return;
            }

            setFile(selectedFile);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        dragCounter.current = 0;
        setError('');
        setSuccess('');

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            const validationError = validateFile(droppedFile);

            if (validationError) {
                setError(validationError);
                return;
            }

            setFile(droppedFile);
        }
    };

    const removeFile = () => {
        setFile(null);
        setError('');
        setSuccess('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-3">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
                        Audio & Text Processor
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600">
                        Upload your audio file or enter text to get started
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Audio File Upload Section */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            Audio File Upload
                        </h2>

                        <div
                            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${dragActive
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
                                }`}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.aiff,.wma,.amr"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                id="audio-upload"
                                disabled={loading}
                            />

                            {!file ? (
                                <div className="space-y-3">
                                    <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center ++justify-center">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-base font-medium text-gray-700">
                                            <span className="hidden sm:inline">Drop your audio file here, or </span>
                                            <label htmlFor="audio-upload" className="text-indigo-600 hover:text-indigo-500 cursor-pointer underline">
                                                <span className="sm:hidden">Tap to select audio file</span>
                                                <span className="hidden sm:inline">browse</span>
                                            </label>
                                        </p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Supports MP3, WAV, M4A, AAC, OGG, FLAC and more
                                        </p>
                                        <div className="mt-3 inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Multiple audio formats supported
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3 space-y-3 sm:space-y-0">
                                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                            <p className="font-medium text-gray-800 truncate text-sm">{file.name}</p>
                                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                                                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                <span>•</span>
                                                <span className="text-green-600 font-medium">
                                                    {file.type.split('/')[1]?.toUpperCase() || 'AUDIO'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        disabled={loading}
                                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50 flex-shrink-0 self-center sm:self-auto disabled:opacity-50"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text Input Section */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Text Input
                        </h2>

                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter your text here..."
                            rows={4}
                            disabled={loading}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-gray-700 placeholder-gray-400 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            {text.length} characters
                        </p>
                    </div>

                    {/* Settings Section */}
                    <div className="bg-white rounded-lg shadow-md p-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Speed Control */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Speed: {speed}x
                                </label>
                                <input
                                    type="range"
                                    min="0.5"
                                    max="2.0"
                                    step="0.1"
                                    value={speed}
                                    onChange={(e) => setSpeed(parseFloat(e.target.value))}
                                    disabled={loading}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0.5x</span>
                                    <span>2.0x</span>
                                </div>
                            </div>

                            {/* Language Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Language
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <option value="en">English</option>
                                    <option value="es">Spanish</option>
                                    <option value="fr">French</option>
                                    <option value="de">German</option>
                                    <option value="it">Italian</option>
                                    <option value="pt">Portuguese</option>
                                    <option value="ru">Russian</option>
                                    <option value="zh">Chinese</option>
                                    <option value="ja">Japanese</option>
                                    <option value="ko">Korean</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Status Messages */}
                    {(error || success) && (
                        <div className="space-y-3">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 text-red-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-red-600">{error}</p>
                                    </div>
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 text-green-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-green-600">{success}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={(!file && !text.trim()) || loading}
                            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 focus:outline-none text-base"
                        >
                            <span className="flex items-center justify-center space-x-2">
                                {loading ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>Process</span>
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default App;