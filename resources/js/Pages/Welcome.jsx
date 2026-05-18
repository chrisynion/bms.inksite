import { Head, Link } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="relative flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 selection:bg-blue-600 selection:text-white overflow-hidden">
                {/* Subtle Background Accent */}
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                     <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
                     <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[120px]"></div>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-12 animate-fade-in">
                    {/* Centered System Logo */}
                    <div className="transform hover:scale-105 transition-transform duration-500">
                        <ApplicationLogo className="w-64 h-auto md:w-96 text-blue-600 fill-current" />
                    </div>
                    
                    {/* Navigation Links */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all duration-300 min-w-[140px] text-center"
                            >
                                Enter Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="px-10 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all duration-300 min-w-[140px] text-center"
                                >
                                    Login
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-10 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 min-w-[140px] text-center"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                        <Link
                            href={route('portfolio')}
                            className="px-10 py-3 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all duration-300 min-w-[140px] text-center"
                        >
                            Developer Portfolio
                        </Link>
                    </div>
                </div>

                {/* Minimal Footer */}
                <div className="absolute bottom-8 text-xs text-gray-400 dark:text-gray-600 uppercase tracking-widest">
                    Print Shop Management System
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-out forwards;
                }
            ` }} />
        </>
    );
}
