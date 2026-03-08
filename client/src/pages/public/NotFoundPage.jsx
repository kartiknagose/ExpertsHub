import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, SearchX } from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Button } from '../../components/common';
import { usePageTitle } from '../../hooks/usePageTitle';

export function NotFoundPage() {
    usePageTitle('Page Not Found');
    const navigate = useNavigate();

    return (
        <MainLayout>
            <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
                <div className="text-center max-w-lg w-full">
                    {/* Illustration */}
                    <div className="relative mx-auto mb-8 w-48 h-48">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-brand-100 to-accent-100 dark:from-brand-900/30 dark:to-accent-900/30 animate-pulse" />
                        <div className="relative flex items-center justify-center h-full">
                            <SearchX className="w-24 h-24 text-brand-400 dark:text-brand-500" strokeWidth={1.2} />
                        </div>
                    </div>

                    {/* Animated 404 Text */}
                    <h1 className="text-9xl font-black bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent mb-4 animate-in fade-in zoom-in duration-500">
                        404
                    </h1>

                    <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                        Page Not Found
                    </h2>

                    <p className="text-lg mb-8 text-gray-600 dark:text-gray-400">
                        Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
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
                </div>
            </div>
        </MainLayout>
    );
}
