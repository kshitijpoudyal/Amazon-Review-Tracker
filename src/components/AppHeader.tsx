import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { User } from 'firebase/auth';
import { colors } from '../utils/colors';

interface AppHeaderProps {
    user: User;
    onLogout: () => void;
}

export default function AppHeader({ user, onLogout }: AppHeaderProps) {
    const navigation = [
        { name: 'Product', href: '/' },
        { name: 'PaypalTransactions', href: '/paypal' }
    ]

     const displayName = user.displayName || user.email || 'User';
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <header className={`${colors.header.background} ${colors.header.backgroundDark}`}>
            <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
                <div className="flex items-center gap-x-12">
                    <a href="#" className="-m-1.5 p-1.5">
                        <span className="sr-only">Your Company</span>
                        <img
                            alt=""
                            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                            className="h-8 w-auto dark:hidden"
                        />
                        <img
                            alt=""
                            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                            className="hidden h-8 w-auto dark:block"
                        />
                    </a>
                    <div className="hidden lg:flex lg:gap-x-12">
                        {navigation.map((item) => (
                            <a key={item.name} href={item.href} className={`text-sm/6 font-semibold ${colors.header.navigation.link}`}>
                                {item.name}
                            </a>
                        ))}
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
                <div className="hidden lg:flex">
                  <p className={`text-sm/6 font-semibold ${colors.header.navigation.link} p-4`}>Welcome {displayName}!</p>
                    <a href="#" onClick={onLogout} className={`text-sm/6 font-semibold ${colors.header.navigation.link} p-4`}>
                       Log out <span aria-hidden="true">&rarr;</span>
                    </a>
                </div>
            </nav>
            <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
                <div className="fixed inset-0 z-50" />
                <DialogPanel className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto ${colors.modal.overlay} p-6 sm:max-w-sm sm:ring-1 ${colors.header.mobile.ring}`}>
                    <div className="flex items-center justify-between">
                        <a href="/" className="-m-1.5 p-1.5">
                            <span className="sr-only">Amazon Review Tracker</span>
                            <img
                                alt=""
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                                className="h-8 w-auto dark:hidden"
                            />
                            <img
                                alt=""
                                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                                className="hidden h-8 w-auto dark:block"
                            />
                        </a>
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
                              <p className={`text-sm/6 font-semibold ${colors.header.navigation.link} py-2`}>Welcome {displayName}!</p>
                                {navigation.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        className={`-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold ${colors.header.mobile.menuLink}`}
                                    >
                                        {item.name}
                                    </a>
                                ))}
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
