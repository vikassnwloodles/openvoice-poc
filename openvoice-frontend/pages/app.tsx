
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

        // Validate that we have either a file or text
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

            const response = await axios.post('http://localhost:8080/api/clone', formData, {
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

    // Fixed drag handling
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

    // File validation function - WAV only
    const validateFile = (file: File): string | null => {
        const maxSize = 50 * 1024 * 1024; // 50MB

        if (file.type !== 'audio/wav' && file.type !== 'audio/wave') {
            return 'Please select a WAV audio file';
        }

        if (file.size > maxSize) {
            return 'File size must be less than 50MB';
        }

        return null;
    };

    // Fixed file change handler
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

    // Fixed drop handler
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
            <div className="w-full">
                <div className="text-center mb-8 sm:mb-12">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-800 mb-4 sm:mb-6">
                        Audio & Text Processor
                    </h1>
                    <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
                        Upload your WAV audio file or enter text to get started
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 lg:space-y-10">
                    {/* Audio File Upload Section */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 lg:p-12">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6 sm:mb-8 flex items-center justify-center sm:justify-start">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            <span className="break-words">WAV Audio File Upload</span>
                        </h2>

                        <div
                            className={`relative border-2 border-dashed rounded-xl lg:rounded-2xl p-8 sm:p-12 lg:p-16 text-center transition-all duration-300 ${
                                dragActive
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
                                accept=".wav,audio/wav,audio/wave"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                id="audio-upload"
                                disabled={loading}
                            />

                            {!file ? (
                                <div className="space-y-6 sm:space-y-8">
                                    <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                                        <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-lg sm:text-xl lg:text-2xl font-medium text-gray-700">
                                            <span className="hidden sm:inline">Drop your WAV file here, or </span>
                                            <label htmlFor="audio-upload" className="text-indigo-600 hover:text-indigo-500 cursor-pointer underline">
                                                <span className="sm:hidden">Tap to select WAV file</span>
                                                <span className="hidden sm:inline">browse</span>
                                            </label>
                                        </p>
                                        <p className="text-sm sm:text-base lg:text-lg text-gray-500 mt-3 sm:mt-4">
                                            Only WAV audio format is supported
                                        </p>
                                        <div className="mt-4 sm:mt-6 inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm bg-blue-100 text-blue-800">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            File format: .wav files only
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-green-50 border border-green-200 rounded-lg lg:rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-0">
                                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                            </svg>
                                        </div>
                                        <div className="text-left min-w-0 flex-1">
                                            <p className="font-medium text-gray-800 truncate text-base sm:text-lg">{file.name}</p>
                                            <div className="flex items-center space-x-2 text-sm sm:text-base text-gray-500">
                                                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                                <span>•</span>
                                                <span className="text-green-600 font-medium">WAV</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        disabled={loading}
                                        className="text-red-500 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 flex-shrink-0 self-center sm:self-auto disabled:opacity-50"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text Input Section */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 lg:p-12">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6 sm:mb-8 flex items-center justify-center sm:justify-start">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Text Input
                        </h2>

                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter your text here..."
                            rows={6}
                            disabled={loading}
                            className="w-full px-4 sm:px-6 py-4 sm:py-6 border border-gray-300 rounded-lg sm:rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-gray-700 placeholder-gray-400 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <p className="text-sm sm:text-base text-gray-500 mt-3 sm:mt-4">
                            {text.length} characters
                        </p>
                    </div>

                    {/* Settings Section */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-6 sm:p-8 lg:p-12">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-800 mb-6 sm:mb-8 flex items-center justify-center sm:justify-start">
                            <svg className="w-6 h-6 sm:w-8 sm:h-8 mr-3 sm:mr-4 text-indigo-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </h2>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
                            {/* Speed Control */}
                            <div>
                                <label className="block text-base sm:text-lg font-medium text-gray-700 mb-4 sm:mb-6">
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
                                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div className="flex justify-between text-sm sm:text-base text-gray-500 mt-2">
                                    <span>0.5x</span>
                                    <span>2.0x</span>
                                </div>
                            </div>

                            {/* Language Selection */}
                            <div>
                                <label className="block text-base sm:text-lg font-medium text-gray-700 mb-4 sm:mb-6">
                                    Language
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    disabled={loading}
                                    className="w-full px-4 sm:px-6 py-4 sm:py-6 border border-gray-300 rounded-lg sm:rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700 bg-white text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <div className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg lg:rounded-xl p-4 sm:p-6">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm sm:text-base text-red-600">{error}</p>
                                    </div>
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-50 border border-green-200 rounded-lg lg:rounded-xl p-4 sm:p-6">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm sm:text-base text-green-600">{success}</p>
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
                            className="w-full sm:w-auto px-8 sm:px-12 lg:px-16 py-4 sm:py-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl sm:rounded-2xl shadow-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 focus:outline-none text-lg sm:text-xl"
                        >
                            <span className="flex items-center justify-center space-x-3">
                                {loading ? (
                                    <>
                                        <svg className="w-6 h-6 sm:w-7 sm:h-7 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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