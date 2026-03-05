import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/common';

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <MainLayout>
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
                <div className="text-center max-w-lg w-full">
                    {/* Animated 404 Text */}
                    <h1 className="text-9xl font-black bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent mb-4 animate-in fade-in zoom-in duration-500">
                        404
                    </h1>

                    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                        Page Not Found
                    </h2>

                    <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
                        Oops! The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            size="lg"
                            icon={Home}
                            onClick={() => navigate('/')}
                        >
                            Go Home
                        </Button>

                        <Button
                            size="lg"
                            variant="outline"
                            icon={ArrowLeft}
                            onClick={() => navigate(-1)}
                        >
                            Go Back
                        </Button>
                    </div>

                    {/* Decorative element */}
                    <div className="mt-12 flex justify-center gap-2 opacity-20">
                        <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-gray-400 animate-bounce delay-0"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-gray-400 animate-bounce delay-100"></div>
                        <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-gray-400 animate-bounce delay-200"></div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
