// Global color system for consistent styling across the application

export const colors = {
    // Status colors
    status: {
        linked: {
            bg: 'bg-blue-100',
            text: 'text-blue-800',
            badge: 'bg-blue-100 text-blue-800'
        },
        unlinked: {
            bg: 'bg-orange-100',
            text: 'text-orange-800',
            badge: 'bg-orange-100 text-orange-800'
        },
        success: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            badge: 'bg-green-100 text-green-800'
        },
        error: {
            bg: 'bg-red-50',
            text: 'text-red-800',
            textSecondary: 'text-red-700',
            border: 'border-red-200',
            badge: 'bg-red-100 text-red-800'
        }
    },

    // Financial/Delta colors
    financial: {
        positive: 'text-green-600',
        negative: 'text-red-600',
        neutral: 'text-gray-500',
        fees: 'text-red-600',
        badges: {
            paid: 'text-red-600 bg-red-50',
            received: 'text-green-600 bg-green-50',
            deltaPositive: 'text-green-600 bg-green-50',
            deltaNegative: 'text-red-600 bg-red-50'
        }
    },

    // Stats/metrics colors
    stats: {
        completed: 'text-green-600',
        paid: 'text-yellow-600',
        received: 'text-green-600',
        remaining: 'text-orange-600',
        profit: 'text-green-600',
        loss: 'text-red-600',
        // PayPal specific stats
        income: 'text-green-600',
        fees: 'text-red-600',
        netReceived: 'text-blue-600',
        transactionCount: 'text-purple-600',
        unlinkedCount: 'text-orange-600',
        unlinkedAmount: 'text-orange-600'
    },

    // Text colors
    text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        muted: 'text-gray-500',
        disabled: 'text-gray-400',
        link: 'text-blue-600',
        linkHover: 'text-blue-800',
        green: 'text-green-600',
        danger: 'text-red-600',
    },

    // Background colors
    background: {
        primary: 'bg-white',
        secondary: 'bg-gray-50',
        muted: 'bg-gray-100',
        linkedRow: 'bg-green-50',
        unlinkedRow: 'bg-orange-50'
    },

    // Card specific
    card: {
        background: 'bg-white',
        border: 'border border-gray-200',
        shadow: 'shadow-md',
        value: 'text-gray-900',
        label: 'text-gray-600'
    },

    // Buttons
    button: {
        primary: 'bg-indigo-500 hover:bg-indigo-400 text-white focus-visible:outline-indigo-500',
        primaryIcon: 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
        danger: 'text-red-600 hover:bg-red-50',
        indigo: 'bg-indigo-500 hover:bg-indigo-400 text-white focus-visible:outline-indigo-500',
        secondary: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
        dangerSolid: 'bg-red-600 hover:bg-red-400 text-white focus-visible:outline-red-500',
        close: 'text-gray-500 hover:text-gray-700'
    },

    // Form controls
    form: {
        input: {
            base: 'border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-indigo-500',
            error: 'border border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500',
            disabled: 'bg-gray-50 border border-gray-300',
            text: 'text-gray-900',
            placeholder: 'placeholder-gray-500'
        },
        label: 'text-gray-700 font-medium',
        checkbox: 'text-blue-600 focus:ring-blue-500'
    },

    // Tabs
    tabs: {
        active: 'border-blue-500 text-blue-600',
        inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
    },

    // Borders
    border: {
        default: 'border-gray-200',
        light: 'border-gray-100'
    },

    // Loading/Shimmer effects
    loading: {
        shimmer: 'bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer',
        skeleton: 'bg-gray-200'
    },

    // Menu/Dropdown specific
    menu: {
        background: 'bg-white',
        border: 'border border-gray-200',
        shadow: 'shadow-lg',
        outline: 'outline outline-1 -outline-offset-1 outline-gray-200'
    },

    // Modal specific
    modal: {
        overlay: 'bg-gray-500 bg-opacity-75',
        shadow: 'shadow-lg',
        item: {
            base: 'px-3 py-2 cursor-pointer',
            hover: 'hover:bg-gray-50',
            selected: 'bg-blue-50 border-l-4 border-blue-500',
            unselected: 'hover:bg-gray-50'
        },
        search: {
            container: 'border-b border-gray-200',
            input: 'w-full px-3 py-2 border-none focus:outline-none',
            placeholder: 'placeholder-gray-500'
        },
        danger: 'text-red-600 hover:bg-red-50',
        menuButton: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:border-blue-500',
        menuItem: 'text-gray-700 data-[focus]:bg-blue-50 data-[focus]:text-blue-700 hover:bg-blue-50 hover:text-blue-700'
    },

    // Edit modal specific
    editModal: {
        void: {
            badge: 'bg-orange-100 text-orange-800',
            button: 'bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500',
            unvoidButton: 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
        }
    },

    // Filter controls specific
    filters: {
        container: 'bg-white border-b border-gray-200',
        addProductButton: 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed',
        searchInput: 'border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        select: 'border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white',
        clearButton: 'text-gray-500 hover:text-gray-700 border border-gray-300 hover:bg-gray-50'
    },

    // Header/Navigation specific
    header: {
        background: 'bg-gradient-to-r from-blue-500 to-purple-700',
        backgroundDark: 'dark:from-blue-600 dark:to-purple-800',
        navigation: {
            link: 'text-gray-900 dark:text-white',
            linkHover: 'hover:text-gray-700 dark:hover:text-gray-300'
        },
        mobile: {
            menuButton: 'text-gray-700 dark:text-gray-400 dark:hover:text-white',
            ring: 'sm:ring-gray-900/10 dark:sm:ring-gray-100/10',
            closeButton: 'text-gray-700 dark:text-gray-400 dark:hover:text-white',
            divider: 'divide-gray-500/10 dark:divide-white/10',
            menuLink: 'text-gray-900 hover:bg-gray-50 dark:text-white dark:hover:bg-white/5'
        }
    }
} as const;

// Helper functions for common color patterns
export const getFinancialColor = (amount: number | null): string => {
    if (amount === null) return colors.financial.neutral;
    if (amount > 0) return colors.financial.positive;
    if (amount < 0) return colors.financial.negative;
    return colors.financial.neutral;
};

export const getDeltaColor = (delta: number | null): string => {
    return getFinancialColor(delta);
};

export const getStatusBadgeColors = (isLinked: boolean) => {
    return isLinked ? colors.status.linked.badge : colors.status.unlinked.badge;
};

export const getRowBackgroundColor = (isLinked: boolean) => {
    return isLinked ? colors.background.linkedRow : colors.background.unlinkedRow;
};

// Badge component utility
export const getBadgeClasses = (type: 'linked' | 'unlinked' | 'success') => {
    const baseClasses = 'inline-block px-2 py-1 rounded-full text-center text-xs font-semibold tracking-wider';
    const colorClasses = colors.status[type].badge;
    return `${baseClasses} ${colorClasses}`;
};

// Action button utility
export const getActionButtonClasses = () => {
    return `flex items-center justify-center w-8 h-8 ${colors.button.primary} rounded-full shadow-md transition focus:outline-none focus:ring-2 focus:ring-gray-400`;
};

// Stats color utility
export const getStatsColor = (type: 'completed' | 'paid' | 'received' | 'remaining' | 'netDelta' | 'income' | 'fees' | 'netReceived' | 'transactionCount' | 'unlinkedCount' | 'unlinkedAmount', value?: number): string => {
    switch (type) {
        case 'completed':
            return colors.stats.completed;
        case 'paid':
            return colors.stats.paid;
        case 'received':
            return colors.stats.received;
        case 'remaining':
            return colors.stats.remaining;
        case 'netDelta':
            return value !== undefined && value >= 0 ? colors.stats.profit : colors.stats.loss;
        case 'income':
            return colors.stats.income;
        case 'fees':
            return colors.stats.fees;
        case 'netReceived':
            return colors.stats.netReceived;
        case 'transactionCount':
            return colors.stats.transactionCount;
        case 'unlinkedCount':
            return colors.stats.unlinkedCount;
        case 'unlinkedAmount':
            return colors.stats.unlinkedAmount;
        default:
            return colors.text.primary;
    }
};