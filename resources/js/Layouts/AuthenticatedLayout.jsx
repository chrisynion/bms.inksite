import AiChatWidget from '@/Components/AiChatWidget';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { getSidebarGroups, getTopBarLinks } from '@/config/navigation';
import {
    Dialog,
    DialogPanel,
    Transition,
    TransitionChild,
} from '@headlessui/react';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const SIDEBAR_STORAGE_KEY = 'bms_sidebar_collapsed';

function getInitials(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join('');
}

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const isAdmin = user.role === 'admin';

    const topBarLinks = getTopBarLinks(isAdmin);
    const sidebarGroups = getSidebarGroups(isAdmin);

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(
                SIDEBAR_STORAGE_KEY,
                String(sidebarCollapsed),
            );
        } catch {
            // Ignore storage errors in restricted environments
        }
    }, [sidebarCollapsed]);

    const toggleSidebar = () => {
        setSidebarCollapsed((prev) => !prev);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 backdrop-blur dark:border-gray-700/80 dark:bg-gray-800/95">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex h-full items-center">
                            {/* Mobile / Tablet Drawer Trigger */}
                            <button
                                type="button"
                                onClick={() => setMobileDrawerOpen(true)}
                                aria-label="Open navigation menu"
                                className="-ms-2 me-2 inline-flex items-center justify-center rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>

                            {/* Desktop Sidebar Collapse Toggle */}
                            <button
                                type="button"
                                onClick={toggleSidebar}
                                aria-label={
                                    sidebarCollapsed
                                        ? 'Expand sidebar'
                                        : 'Collapse sidebar'
                                }
                                aria-expanded={!sidebarCollapsed}
                                title={
                                    sidebarCollapsed
                                        ? 'Expand sidebar'
                                        : 'Collapse sidebar'
                                }
                                className="-ms-2 me-3 hidden items-center justify-center rounded-md p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:inline-flex dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                            >
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.75"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
                                    />
                                </svg>
                            </button>

                            {/* Brand Logo */}
                            <Link href="/" className="flex shrink-0 items-center">
                                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                            </Link>

                            {/* Desktop Primary Quick-Access Links */}
                            <div className="hidden lg:ms-8 lg:flex lg:h-full lg:items-stretch lg:space-x-6">
                                {topBarLinks.map((item) => (
                                    <NavLink
                                        key={item.key}
                                        href={route(item.routeName)}
                                        active={route().current(
                                            item.activePattern,
                                        )}
                                        className="whitespace-nowrap"
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="flex items-center">
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-lg border border-transparent bg-white px-2.5 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
                                        >
                                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/70 dark:text-indigo-200">
                                                {getInitials(user.name)}
                                            </span>
                                            <span className="hidden max-w-[140px] truncate sm:inline">
                                                {user.name}
                                            </span>
                                            <svg
                                                className="h-4 w-4 text-gray-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-600">
                                            <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">
                                                {user.name}
                                            </p>
                                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </p>
                                        </div>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile / Tablet Slide-Over Drawer */}
            <Transition show={mobileDrawerOpen}>
                <Dialog
                    as="div"
                    className="relative z-50 lg:hidden"
                    onClose={setMobileDrawerOpen}
                >
                    <TransitionChild
                        enter="transition-opacity ease-linear duration-200"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs" />
                    </TransitionChild>

                    <div className="fixed inset-0 flex">
                        <TransitionChild
                            enter="transition ease-in-out duration-200 transform"
                            enterFrom="-translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-200 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="-translate-x-full"
                        >
                            <DialogPanel className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-xl dark:bg-gray-800">
                                <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-700">
                                    <Link
                                        href="/"
                                        onClick={() =>
                                            setMobileDrawerOpen(false)
                                        }
                                        className="flex items-center"
                                    >
                                        <ApplicationLogo className="block h-8 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setMobileDrawerOpen(false)
                                        }
                                        aria-label="Close navigation menu"
                                        className="rounded-md p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none dark:hover:bg-gray-700 dark:hover:text-gray-200"
                                    >
                                        <svg
                                            className="h-5 w-5"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth="2"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto py-4">
                                    {/* Quick Access Group */}
                                    <div className="mb-5">
                                        <p className="mb-1.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            Quick Access
                                        </p>
                                        <div className="space-y-0.5">
                                            {topBarLinks.map((item) => (
                                                <ResponsiveNavLink
                                                    key={item.key}
                                                    href={route(item.routeName)}
                                                    active={route().current(
                                                        item.activePattern,
                                                    )}
                                                    icon={item.icon}
                                                    onClick={() =>
                                                        setMobileDrawerOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    {item.label}
                                                </ResponsiveNavLink>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Secondary / Admin Groups */}
                                    {sidebarGroups.map((group) => (
                                        <div key={group.key} className="mb-5">
                                            <p className="mb-1.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                                {group.label}
                                            </p>
                                            <div className="space-y-0.5">
                                                {group.items.map((item) => (
                                                    <ResponsiveNavLink
                                                        key={item.key}
                                                        href={route(
                                                            item.routeName,
                                                        )}
                                                        active={route().current(
                                                            item.activePattern,
                                                        )}
                                                        icon={item.icon}
                                                        onClick={() =>
                                                            setMobileDrawerOpen(
                                                                false,
                                                            )
                                                        }
                                                    >
                                                        {item.label}
                                                    </ResponsiveNavLink>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Drawer Account Footer */}
                                <div className="border-t border-gray-200 pb-3 pt-3 dark:border-gray-700">
                                    <div className="mb-2 flex items-center gap-3 px-4">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/70 dark:text-indigo-200">
                                            {getInitials(user.name)}
                                        </span>
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                                                {user.name}
                                            </div>
                                            <div className="truncate text-xs text-gray-500 dark:text-gray-400">
                                                {user.email}
                                            </div>
                                        </div>
                                    </div>
                                    <ResponsiveNavLink
                                        href={route('profile.edit')}
                                        onClick={() =>
                                            setMobileDrawerOpen(false)
                                        }
                                    >
                                        Profile
                                    </ResponsiveNavLink>
                                    <ResponsiveNavLink
                                        method="post"
                                        href={route('logout')}
                                        as="button"
                                    >
                                        Log Out
                                    </ResponsiveNavLink>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </Dialog>
            </Transition>

            {/* Desktop Sidebar + Main Content */}
            <div className="flex min-h-[calc(100vh-4rem)]">
                <aside
                    aria-label="Secondary navigation"
                    className={`hidden shrink-0 border-r border-gray-200/80 bg-white transition-[width] duration-200 lg:flex lg:flex-col dark:border-gray-700/80 dark:bg-gray-800 ${
                        sidebarCollapsed ? 'w-16' : 'w-60'
                    }`}
                >
                    <div className="sticky top-16 flex h-[calc(100vh-4rem)] flex-col justify-between overflow-y-auto px-2.5 py-4">
                        <div className="space-y-5">
                            {sidebarGroups.map((group, groupIndex) => (
                                <div key={group.key}>
                                    {sidebarCollapsed ? (
                                        groupIndex > 0 && (
                                            <div className="mx-2 mb-3 border-t border-gray-200 dark:border-gray-700" />
                                        )
                                    ) : (
                                        <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                            {group.label}
                                        </p>
                                    )}

                                    <div className="space-y-1">
                                        {group.items.map((item) => {
                                            const active = route().current(
                                                item.activePattern,
                                            );
                                            return (
                                                <Link
                                                    key={item.key}
                                                    href={route(item.routeName)}
                                                    title={
                                                        sidebarCollapsed
                                                            ? item.label
                                                            : undefined
                                                    }
                                                    className={`flex items-center rounded-lg text-sm font-medium transition ${
                                                        sidebarCollapsed
                                                            ? 'justify-center px-2 py-2.5'
                                                            : 'gap-3 px-2.5 py-2'
                                                    } ${
                                                        active
                                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700/60 dark:hover:text-gray-100'
                                                    }`}
                                                >
                                                    {item.icon}
                                                    {!sidebarCollapsed && (
                                                        <span className="truncate">
                                                            {item.label}
                                                        </span>
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    {header && (
                        <header className="bg-white shadow-sm dark:bg-gray-800">
                            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                                {header}
                            </div>
                        </header>
                    )}

                    <main className="flex-1">{children}</main>
                </div>
            </div>

            {isAdmin && <AiChatWidget />}
        </div>
    );
}
