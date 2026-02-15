import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Button, Modal } from '../common';
import { triggerSOS } from '../../api/safety';
import { toast } from 'sonner';

export const SOSButton = ({ bookingId, className = '' }) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleTrigger = async () => {
        setIsLoading(true);
        try {
            // Get current location if browser supports it
            let location = null;
            if (navigator.geolocation) {
                try {
                    const position = await new Promise((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
                    });
                    location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                } catch (e) {
                    console.warn('Geolocation failed, triggering SOS without coordinates');
                }
            }

            await triggerSOS({ bookingId, location });
            toast.error('SOS Alert Triggered! Emergency contacts and support have been notified.', {
                duration: 10000,
                position: 'top-center',
                icon: <ShieldAlert className="text-red-500" />,
            });
            setIsConfirmOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to trigger SOS. Please call emergency services directly.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Button
                variant="danger"
                size="sm"
                className={`bg-red-600 hover:bg-red-700 text-white animate-pulse shadow-lg ${className}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsConfirmOpen(true);
                }}
            >
                <AlertTriangle size={18} className="mr-2" />
                EMERGENCY SOS
            </Button>

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Trigger Emergency SOS?"
            >
                <div className="space-y-4">
                    <div className="flex items-center justify-center p-4 bg-red-50 rounded-full w-20 h-20 mx-auto">
                        <ShieldAlert size={40} className="text-red-600" />
                    </div>

                    <div className="text-center">
                        <p className="text-lg font-bold text-red-700">Are you in immediate danger?</p>
                        <p className="text-gray-600 mt-2">
                            This will notify your emergency contacts and our rapid response team with your current location.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 mt-6">
                        <Button
                            variant="danger"
                            className="w-full h-12 text-lg font-bold"
                            onClick={handleTrigger}
                            loading={isLoading}
                        >
                            YES, SEND ALERT NOW
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setIsConfirmOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </div>

                    <p className="text-xs text-center text-gray-400">
                        Misuse of this button may lead to account suspension.
                    </p>
                </div>
            </Modal>
        </>
    );
};
