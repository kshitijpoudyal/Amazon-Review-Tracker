// Global color system for consistent styling across the application

// Product status types
export type StatusType =
    | 'void'
    | 'complete'
    | 'refundPending'
    | 'sendScreenshot'
    | 'reviewPending'
    | 'addReview'
    | 'orderPlaced'
    | 'unknown'
    | 'linked'
    | 'unlinked'
    | 'unknown';
export interface StatusTypeDisplay {
    label: string;
    color: string;
}

export const colors = {
    // Status colors
    status: {
        linked: {
            bg: 'bg-green-500',
            border: 'border-green-500',
            text: 'text-white'
        },
        unlinked: {
            bg: 'bg-yellow-500',
            border: 'border-yellow-500',
            text: 'text-white'
        },
        error: {
            bg: 'bg-red-50',
            text: 'text-red-800',
            textSecondary: 'text-red-700',
            border: 'border-red-200'
        },
        void: {
            bg: 'bg-gray-500',
            border: 'border-gray-500',
            text: 'text-white'
        },
        complete: {
            bg: 'bg-green-500',
            border: 'border-green-500',
            text: 'text-white'
        },
        refundPending: {
            bg: 'bg-blue-500',
            text: 'text-white',
            border: 'border-blue-500'
        },
        sendScreenshot: {
            bg: 'bg-indigo-500',
            text: 'text-white',
            border: 'border-indigo-500'
        },
        reviewPending: {
            bg: 'bg-yellow-500',
            text: 'text-white',
            border: 'border-yellow-500'
        },
        addReview: {
            bg: 'bg-orange-500',
            text: 'text-white',
            border: 'border-orange-500'
        },
        orderPlaced: {
            bg: 'bg-purple-500',
            text: 'text-white',
            border: 'border-purple-500'
        },
        unknown: {
            bg: 'bg-gray-500',
            text: 'text-white',
            border: 'border-gray-500'
        }
    },

    // Financial/Delta colors
    financial: {
        positive: 'text-green-500',
        positiveLight: 'text-green-400',
        neutral: 'text-gray-500',
        neutral2: 'text-yellow-500',
        negativeLight: 'text-red-400',
        negative: 'text-red-500',
        badges: {
            paid: 'text-red-500 bg-red-50',
            received: 'text-green-500 bg-green-50',
            deltaPositive: 'text-green-500 bg-green-50',
            deltaNegative: 'text-red-500 bg-red-50'
        }
    },

    // Text colors
    text: {
        primary: 'text-gray-900',
        secondary: 'text-gray-600',
        muted: 'text-gray-500',
        disabled: 'text-gray-400',
        link: 'text-blue-600',
        linkHover: 'text-blue-800',
        white: 'text-white',
        green: 'text-green-600',
        danger: 'text-red-600',
    },

    // Background colors
    background: {
        gradient: 'bg-gradient-to-r from-blue-500 to-purple-700',
        primary: 'bg-white',
        secondary: 'bg-gray-100',
        dark: 'bg-gray-800',
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
        overlaySolid: 'bg-gray-600',
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
        void: {
            badge: 'bg-orange-100 text-orange-800',
            button: 'bg-orange-500 text-white hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500',
            unvoidButton: 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
        },
        danger: 'text-red-600 hover:bg-red-50',
        menuButton: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:border-blue-500',
        menuItem: 'text-gray-700 data-[focus]:bg-blue-50 data-[focus]:text-blue-700 hover:bg-blue-50 hover:text-blue-700'
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
            link: 'text-white',
            linkHover: 'hover:text-gray-300'
        },
        mobile: {
            menuButton: 'text-gray-400 hover:text-white',
            ring: 'sm:ring-gray-900/10 dark:sm:ring-gray-100/10',
            closeButton: 'text-gray-400 hover:text-white',
            divider: 'divide-white/10',
            menuLink: 'text-white hover:bg-white/5'
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

export const getRowBackgroundColor = (isLinked: boolean) => {
    return isLinked ? colors.background.linkedRow : colors.background.unlinkedRow;
};

// Badge component utility
export const getBadgeClasses = (type: StatusType) => {
    const baseClasses = 'inline-block px-2 py-1 rounded-full text-center text-xs font-semibold tracking-wider';
    return `${baseClasses} ${colors.status[type].bg} ${colors.status[type].text}`;
};

// Action button utility
export const getActionButtonClasses = () => {
    return `flex items-center justify-center w-8 h-8 ${colors.button.primary} rounded-full shadow-md transition focus:outline-none focus:ring-2 focus:ring-gray-400`;
};

// Stats color utility
export const getStatsColor = (type: string, value?: number): string => {
    switch (type) {
        case 'completed':
            return colors.financial.positive;
        case 'paid':
            return colors.financial.neutral;
        case 'received':
            return colors.financial.positive;
        case 'remaining':
            return colors.financial.neutral2;
        case 'netDelta':
            return value !== undefined && value >= 0 ? colors.financial.positive : colors.financial.negative;
        case 'income':
            return colors.financial.neutral;
        case 'fees':
            return colors.financial.negative;
        case 'netReceived':
            return colors.financial.positive;
        case 'transactionCount':
            return colors.financial.neutral;
        case 'unlinkedCount':
            return colors.financial.neutral2;
        default:
            return colors.text.primary;
    }
};

// Product status border color utility
export const getStatusBorderColor = (statusType: string): string => {
    switch (statusType) {
        case 'void':
            return colors.status.void.border.replace('border-', 'border-l-');
        case 'complete':
            return colors.status.complete.border.replace('border-', 'border-l-');
        case 'refund-pending':
        case 'refundPending':
            return colors.status.refundPending.border.replace('border-', 'border-l-');
        case 'send-screenshot':
        case 'sendScreenshot':
            return colors.status.sendScreenshot.border.replace('border-', 'border-l-');
        case 'review-pending':
        case 'reviewPending':
            return colors.status.reviewPending.border.replace('border-', 'border-l-');
        case 'add-review':
        case 'addReview':
            return colors.status.addReview.border.replace('border-', 'border-l-');
        case 'order-placed':
        case 'orderPlaced':
            return colors.status.orderPlaced.border.replace('border-', 'border-l-');
        case 'linked':
            return colors.status.linked.border.replace('border-', 'border-l-');
        case 'unlinked':
            return colors.status.unlinked.border.replace('border-', 'border-l-');
        case 'unknown':
        default:
            return colors.status.unknown.border.replace('border-', 'border-l-');
    }
};