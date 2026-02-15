'use client';

import { Calendar, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface EventActionButtonsProps {
    eventName: string;
    eventDate: Date;
    eventDuration: number;
}

export default function EventActionButtons({
    eventName,
    eventDate,
    eventDuration,
}: EventActionButtonsProps) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleAddToCalendar = async () => {
        if (!user?.email) {
            setErrorMessage('Please sign in to receive calendar events');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Calculate end time based on duration
            const startTime = eventDate;
            const endTime = new Date(startTime.getTime() + eventDuration * 60000);

            const response = await fetch('http://localhost:5000/add-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: eventName,
                    startTime: startTime.toISOString(),
                    endTime: endTime.toISOString(),
                    userEmail: user.email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send calendar event');
            }

            setSuccessMessage('📧 Calendar event sent to your email! Check your inbox for the .ics file.');
            
            // Clear success message after 8 seconds
            setTimeout(() => setSuccessMessage(''), 8000);
        } catch (error) {
            console.error('Error sending calendar event:', error);
            setErrorMessage(
                error instanceof Error 
                    ? error.message 
                    : 'Failed to send calendar event. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleShareEvent = () => {
        const shareText = `Check out this AstroView event: ${eventName} on ${eventDate.toLocaleDateString()}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'AstroView Event',
                text: shareText,
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareText);
            setSuccessMessage('Event link copied to clipboard! 📋');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    return (
        <div className="space-y-3">
            {/* Success Message */}
            {successMessage && (
                <div className="p-3 bg-aurora-green/10 border border-aurora-green/30 rounded-lg">
                    <p className="text-sm text-aurora-green font-medium">{successMessage}</p>
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="p-3 bg-meteor-orange/10 border border-meteor-orange/30 rounded-lg">
                    <p className="text-sm text-meteor-orange font-medium">{errorMessage}</p>
                </div>
            )}

            {/* Info Message for All Users */}
            <div className="p-3 bg-galaxy-cyan/10 border border-galaxy-cyan/30 rounded-lg">
                <p className="text-xs text-galaxy-cyan font-medium">
                    📧 Calendar event will be emailed to you with reminders included! Works with any calendar app.
                </p>
            </div>

            {/* Add to Calendar Button */}
            <button
                onClick={handleAddToCalendar}
                disabled={isLoading || !user}
                className={`w-full py-3 px-6 bg-gradient-to-r from-cosmic-purple to-nebula-pink text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    isLoading || !user
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:shadow-lg hover:shadow-cosmic-purple/50'
                }`}
            >
                <Calendar className="w-4 h-4" />
                {isLoading ? 'Sending Calendar Event...' : 'Add to Calendar & Set Reminder'}
            </button>

            {/* Sign In Prompt */}
            {!user && (
                <p className="text-sm text-space-gray-400 text-center">
                    Sign in to receive calendar events via email
                </p>
            )}

            {/* Share Event Button */}
            <button
                onClick={handleShareEvent}
                className="w-full py-3 px-6 bg-space-gray-800 hover:bg-space-gray-700 text-star-white border border-space-gray-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
                <Share2 className="w-4 h-4" />
                Share Event
            </button>
        </div>
    );
}
