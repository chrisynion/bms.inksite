import ApplicationLogo from '@/Components/ApplicationLogo';
import AiChatWidget from '@/Components/AiChatWidget';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="border-b border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink href={route('dashboard')} active={route().current('dashboard')}>
                                    Dashboard
                                </NavLink>
                                <NavLink href={route('orders.index')} active={route().current('orders.*')}>
                                    Orders
                                </NavLink>
                                <NavLink href={route('customers.index')} active={route().current('customers.*')}>
                                    Customers
                                </NavLink>
                                <NavLink href={route('invoices.index')} active={route().current('invoices.*')}>
                                    Invoices
                                </NavLink>
                                {user.role === 'admin' && (
                                    <>
                                        <NavLink href={route('transactions.index')} active={route().current('transactions.*')}>
                                            Cashbook
                                        </NavLink>
                                        <NavLink href={route('reports.index')} active={route().current('reports.*')}>
                                            AI Reports
                                        </NavLink>
                                    </>
                                )}
                                <NavLink href={route('quotation.index')} active={route().current('quotation.*')}>
                                    Quotation
                                </NavLink>

                                {/* Operations Dropdown */}
                                <div className="hidden sm:flex sm:items-center">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button type="button" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${route().current('inventory.*') || route().current('services.*') || route().current('equipment.*') ? 'border-indigo-400 text-gray-900 dark:border-indigo-600 dark:text-gray-100' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'} h-[calc(100%+2px)] mt-[-1px] mb-[-1px]`}>
                                                Operations
                                                <svg className="ml-1 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('services.index')}>Services</Dropdown.Link>
                                            <Dropdown.Link href={route('inventory.index')}>Inventory</Dropdown.Link>
                                            {user.role === 'admin' && <Dropdown.Link href={route('equipment.index')}>Equipment</Dropdown.Link>}
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                {/* Admin Dropdown */}
                                {user.role === 'admin' && (
                                    <div className="hidden sm:flex sm:items-center">
                                        <Dropdown>
                                            <Dropdown.Trigger>
                                                <button type="button" className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${route().current('employees.*') || route().current('suppliers.*') || route().current('contractors.*') || route().current('users.*') || route().current('settings.*') ? 'border-indigo-400 text-gray-900 dark:border-indigo-600 dark:text-gray-100' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-700'} h-[calc(100%+2px)] mt-[-1px] mb-[-1px]`}>
                                                    Admin
                                                    <svg className="ml-1 -mr-0.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </Dropdown.Trigger>
                                            <Dropdown.Content>
                                                <Dropdown.Link href={route('employees.index')}>Employees</Dropdown.Link>
                                                <Dropdown.Link href={route('suppliers.index')}>Suppliers</Dropdown.Link>
                                                <Dropdown.Link href={route('contractors.index')}>Contractors</Dropdown.Link>
                                                <Dropdown.Link href={route('users.index')}>Users</Dropdown.Link>
                                                <Dropdown.Link href={route('settings.index')}>System Settings</Dropdown.Link>
                                            </Dropdown.Content>
                                        </Dropdown>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
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
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
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

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-900 dark:hover:text-gray-400 dark:focus:bg-gray-900 dark:focus:text-gray-400"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('inventory.index')}
                            active={route().current('inventory.*')}
                        >
                            Inventory
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('services.index')}
                            active={route().current('services.*')}
                        >
                            Services
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('quotation.index')}
                            active={route().current('quotation.*')}
                        >
                            Quotation Generator
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('orders.index')}
                            active={route().current('orders.*')}
                        >
                            Orders
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('invoices.index')}
                            active={route().current('invoices.*')}
                        >
                            Invoices
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('customers.index')}
                            active={route().current('customers.*')}
                        >
                            Customers
                        </ResponsiveNavLink>
                        {user.role === 'admin' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('transactions.index')}
                                    active={route().current('transactions.*')}
                                >
                                    Cashbook
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('reports.index')}
                                    active={route().current('reports.*')}
                                >
                                    AI Reports
                                </ResponsiveNavLink>
                            </>
                        )}
                        {user.role === 'admin' && (
                            <>
                                <ResponsiveNavLink
                                    href={route('settings.index')}
                                    active={route().current('settings.*')}
                                >
                                    Settings
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('employees.index')}
                                    active={route().current('employees.*')}
                                >
                                    Employees
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('equipment.index')}
                                    active={route().current('equipment.*')}
                                >
                                    Equipment
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('suppliers.index')}
                                    active={route().current('suppliers.*')}
                                >
                                    Suppliers
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('contractors.index')}
                                    active={route().current('contractors.*')}
                                >
                                    Contractors
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('users.index')}
                                    active={route().current('users.*')}
                                >
                                    System Users
                                </ResponsiveNavLink>
                            </>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
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
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow dark:bg-gray-800">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
            {user.role === 'admin' && <AiChatWidget />}
        </div>
    );
}
