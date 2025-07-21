'use client';

import React, { useEffect } from 'react';
import { useVoiceInput } from '../hooks/useVoiceInput';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: string;
  placeholder?: string;
  className?: string;
  fieldName?: string;
}

export default function VoiceInput({
  onTranscript,
  language = 'en-US',
  placeholder = 'Click microphone to speak',
  className = '',
  fieldName = ''
}: VoiceInputProps) {
  const {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput({
    language,
    continuous: false,
    interimResults: true,
  });

  // Send transcript to parent when it changes
  useEffect(() => {
    if (transcript && transcript.trim()) {
      onTranscript(transcript.trim());
    }
  }, [transcript, onTranscript]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center text-gray-400 text-sm">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
        </svg>
        Voice input not supported
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={handleMicClick}
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-200 ${
          isListening
            ? 'bg-red-500 text-white animate-pulse shadow-lg'
            : 'bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300'
        }`}
        title={isListening ? 'Stop recording' : 'Start voice input'}
      >
        {isListening ? (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>

      {/* Voice feedback */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-md text-sm">
          <div className="flex items-center text-blue-600 dark:text-blue-300">
            <div className="flex space-x-1 mr-2">
              <div className="w-1 h-3 bg-blue-500 rounded animate-pulse"></div>
              <div className="w-1 h-4 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-2 bg-blue-500 rounded animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            </div>
            Listening... Speak now
          </div>
          {transcript && (
            <div className="mt-1 text-gray-600 dark:text-gray-300 italic">
              &ldquo;{transcript}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md text-sm text-red-600 dark:text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
