import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { User } from 'firebase/auth';
import { colors } from '../../utils/colors';

interface AppHeaderProps {
    user: User;
    onLogout: () => void;
}

export default function AppHeader({ user, onLogout }: AppHeaderProps) {
    const location = useLocation();
    const navigation = [
        { name: 'Products', href: '/' },
        { name: 'PayPal', href: '/paypal' }
    ]

    // Safety check - should never be null due to ProtectedRoute, but defensive programming
    if (!user) {
        return null;
    }

    const displayName = user.displayName || user.email || 'User';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className={`${colors.header.background}`}>
            <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
                {/* Brand + Nav */}
                <div className="flex items-center gap-x-6">
                    <span className="text-white font-bold text-sm tracking-tight select-none">
                        📦 Review Tracker
                    </span>
                    <div className="hidden lg:flex lg:gap-x-1">
                        {navigation.map((item) => {
                            const isActive = item.href === '/' 
                                ? location.pathname === '/' 
                                : location.pathname.startsWith(item.href);
                            return (
                                <a
                                    key={item.name}
                                    href={item.href}
                                    className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-all ${
                                        isActive 
                                            ? 'text-white bg-white/20' 
                                            : 'text-white/70 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {item.name}
                                </a>
                            );
                        })}
                    </div>
                </div>
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 ${colors.header.mobile.menuButton}`}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon aria-hidden="true" className="size-6" />
                    </button>
                </div>
                <div className="hidden lg:flex items-center gap-3">
                  <span className={`text-sm ${colors.header.navigation.link}`}>{displayName}</span>
                  <a href="#" onClick={onLogout} className="text-sm font-semibold text-white/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/10 transition-all">
                    Log out →
                  </a>
                </div>
            </nav>
            <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
                <div className="fixed inset-0 z-50" />
                <DialogPanel className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto ${colors.header.background} p-4 sm:max-w-sm sm:ring-1 ${colors.header.mobile.ring}`}>
                    <div className="flex items-center justify-between">
                        <p className={`text-sm/6 font-semibold ${colors.header.navigation.link} py-2`}>Welcome {displayName}!</p>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            className={`-m-2.5 rounded-md p-2.5 ${colors.header.mobile.closeButton}`}
                        >
                            <span className="sr-only">Close menu</span>
                            <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className={`-my-6 divide-y ${colors.header.mobile.divider}`}>
                            <div className="space-y-2 py-6">
                                {navigation.map((item) => {
                                    const isActive = item.href === '/' 
                                        ? location.pathname === '/' 
                                        : location.pathname.startsWith(item.href);
                                    return (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            className={`-mx-3 block rounded-xl px-3 py-2 text-base/7 font-semibold ${
                                                isActive
                                                    ? 'text-white bg-white/20'
                                                    : `${colors.header.mobile.menuLink}`
                                            }`}
                                        >
                                            {item.name}
                                        </a>
                                    );
                                })}
                            </div>
                            <div className="py-6">
                                <a
                                    href="#"
                                    onClick={onLogout}
                                    className={`-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold ${colors.header.mobile.menuLink}`}
                                >
                                    Log out
                                </a>
                            </div>
                        </div>
                    </div>
                </DialogPanel>
            </Dialog>
        </header>
    )
}
