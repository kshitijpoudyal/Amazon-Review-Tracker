// Global color system — Synthetic Naturalist theme (inspired by HustleBooks)
// Core palette: Navy #022448 · Teal #006a68 · Amber (warning) · Red #ba1a1a · Parchment surfaces

// Product status types
export type StatusType =
    | 'void'
    | 'complete'
    | 'refund-pending'
    | 'send-screenshot'
    | 'review-pending'
    | 'add-review'
    | 'order-placed'
    | 'unknown'
    | 'linked'
    | 'unlinked'
    | 'unknown';

export const colors = {
    // Status badge colors — 4-stage pipeline: amber → navy → teal → gray
    status: {
        linked: {
            bg: 'bg-[#006a68]',
            border: 'border-[#006a68]',
            text: 'text-white'
        },
        unlinked: {
            bg: 'bg-amber-500',
            border: 'border-amber-500',
            text: 'text-white'
        },
        error: {
            bg: 'bg-[#ffdad6]',
            text: 'text-[#ba1a1a]',
            textSecondary: 'text-[#ba1a1a]',
            border: 'border-[rgba(186,26,26,0.2)]'
        },
        void: {
            bg: 'bg-[#9e9e9e]',
            border: 'border-[#9e9e9e]',
            text: 'text-white'
        },
        complete: {
            bg: 'bg-[#006a68]',
            border: 'border-[#006a68]',
            text: 'text-white'
        },
        'refund-pending': {
            bg: 'bg-[#022448]',
            text: 'text-white',
            border: 'border-[#022448]'
        },
        'send-screenshot': {
            bg: 'bg-[#022448]',
            text: 'text-white',
            border: 'border-[#022448]'
        },
        'review-pending': {
            bg: 'bg-amber-500',
            text: 'text-white',
            border: 'border-amber-500'
        },
        'add-review': {
            bg: 'bg-amber-500',
            text: 'text-white',
            border: 'border-amber-500'
        },
        'order-placed': {
            bg: 'bg-amber-500',
            text: 'text-white',
            border: 'border-amber-500'
        },
        unknown: {
            bg: 'bg-[#9e9e9e]',
            text: 'text-white',
            border: 'border-[#9e9e9e]'
        }
    },

    // Financial/Delta colors
    financial: {
        positive: 'text-[#006a68]',
        positiveLight: 'text-[#006a68]',
        neutral: 'text-[#43474e]',
        neutral2: 'text-[#43474e]',
        negativeLight: 'text-[#ba1a1a]/70',
        negative: 'text-[#ba1a1a]',
        badges: {
            paid: 'text-[#ba1a1a] bg-[#ffdad6]',
            received: 'text-[#006a68] bg-[#006a68]/10',
            deltaPositive: 'text-[#006a68] bg-[#006a68]/10',
            deltaNegative: 'text-[#ba1a1a] bg-[#ffdad6]'
        }
    },

    // Text colors — on-surface hierarchy
    text: {
        primary: 'text-[#1b1c19]',
        secondary: 'text-[#43474e]',
        muted: 'text-[#74777f]',
        disabled: 'text-[#9e9e9e]',
        link: 'text-[#006a68]',
        linkHover: 'text-[#022448]',
        white: 'text-white',
        green: 'text-[#006a68]',
        danger: 'text-[#ba1a1a]',
    },

    // Background surfaces — 3-level parchment system
    background: {
        gradient: 'bg-gradient-to-br from-[#022448] to-[#1e3a5f]',
        primary: 'bg-[#fbf9f3]',
        secondary: 'bg-[#eae8e2]',
        dark: 'bg-[#022448]',
        muted: 'bg-[#eae8e2]',
        linkedRow: 'bg-[#006a68]/8',
        unlinkedRow: 'bg-amber-50'
    },

    // Card
    card: {
        background: 'bg-[#ffffff]',
        border: 'border border-[rgba(196,198,207,0.15)]',
        shadow: 'shadow-[0_12px_32px_rgba(2,36,72,0.06)]',
        value: 'text-[#1b1c19]',
        label: 'text-[#43474e]'
    },

    // Buttons — rounded-full; primary uses navy gradient
    button: {
        primary: 'bg-gradient-to-br from-[#022448] to-[#1e3a5f] hover:from-[#1e3a5f] hover:to-[#022448] text-white focus-visible:outline-[#022448]',
        primaryIcon: 'bg-gradient-to-br from-[#022448] to-[#1e3a5f] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#022448] disabled:opacity-50 disabled:cursor-not-allowed',
        danger: 'text-[#ba1a1a] hover:bg-[#ffdad6]',
        indigo: 'bg-gradient-to-br from-[#022448] to-[#1e3a5f] hover:opacity-90 text-white focus-visible:outline-[#022448]',
        secondary: 'bg-[#eae8e2] text-[#022448] hover:bg-[#e4e2dd]',
        dangerSolid: 'bg-[#ba1a1a] hover:bg-[#ba1a1a]/80 text-white focus-visible:outline-[#ba1a1a]',
        close: 'text-[#74777f] hover:text-[#1b1c19]'
    },

    // Form controls
    form: {
        input: {
            base: 'border-0 bg-[#e4e2dd] focus:outline-none focus:ring-2 focus:ring-[#022448] focus:ring-offset-0',
            error: 'border-0 bg-[#ffdad6] focus:ring-2 focus:ring-[#ba1a1a]',
            disabled: 'bg-[#eae8e2] border-0 opacity-60',
            text: 'text-[#1b1c19]',
            placeholder: 'placeholder-[#74777f]'
        },
        label: 'font-label text-[#43474e] font-medium uppercase tracking-wider text-xs',
        checkbox: 'text-[#006a68] focus:ring-[#006a68]'
    },

    // Tabs
    tabs: {
        active: 'border-[#022448] text-[#022448]',
        inactive: 'border-transparent text-[#74777f] hover:text-[#43474e] hover:border-[#c4c6cf]'
    },

    // Borders
    border: {
        default: 'border-[rgba(196,198,207,0.15)]',
        light: 'border-[rgba(196,198,207,0.10)]'
    },

    // Loading/shimmer
    loading: {
        shimmer: 'bg-gradient-to-r from-[#eae8e2] via-[#fbf9f3] to-[#eae8e2] bg-[length:200%_100%] animate-shimmer',
        skeleton: 'bg-[#e4e2dd]'
    },

    // Menu/Dropdown
    menu: {
        background: 'bg-[#fbf9f3]',
        border: 'border border-[rgba(196,198,207,0.15)]',
        shadow: 'shadow-[0_12px_32px_rgba(2,36,72,0.08)]',
        outline: 'outline outline-1 -outline-offset-1 outline-[rgba(196,198,207,0.2)]'
    },

    // Modal
    modal: {
        overlay: 'bg-[#022448]/30 backdrop-blur-sm',
        overlaySolid: 'bg-[#022448]/40',
        shadow: 'shadow-[0_24px_64px_rgba(2,36,72,0.12)]',
        item: {
            base: 'px-3 py-2 cursor-pointer',
            hover: 'hover:bg-[#eae8e2]',
            selected: 'bg-[#006a68]/10 border-l-4 border-[#006a68]',
            unselected: 'hover:bg-[#eae8e2]'
        },
        search: {
            container: 'border-b border-[rgba(196,198,207,0.15)]',
            input: 'w-full px-3 py-2 border-none focus:outline-none bg-transparent',
            placeholder: 'placeholder-[#74777f]'
        },
        void: {
            badge: 'bg-[#eae8e2] text-[#43474e]',
            button: 'bg-amber-500 text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500',
            unvoidButton: 'bg-gradient-to-br from-[#022448] to-[#1e3a5f] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#022448]'
        },
        danger: 'text-[#ba1a1a] hover:bg-[#ffdad6]',
        menuButton: 'bg-[#fbf9f3] text-[#1b1c19] border border-[rgba(196,198,207,0.2)] hover:bg-[#eae8e2] focus:border-[#022448]',
        menuItem: 'text-[#1b1c19] data-[focus]:bg-[#006a68]/10 data-[focus]:text-[#022448] hover:bg-[#006a68]/10 hover:text-[#022448]'
    },

    // Toolbar filter controls
    filters: {
        container: 'bg-[#eae8e2]',
        addProductButton: 'bg-gradient-to-br from-[#022448] to-[#1e3a5f] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#022448] disabled:opacity-50 disabled:cursor-not-allowed',
        searchInput: 'bg-[#e4e2dd] border-0 focus:outline-none focus:ring-2 focus:ring-[#022448]',
        select: 'bg-[#e4e2dd] border-0 focus:outline-none focus:ring-2 focus:ring-[#022448]',
        clearButton: 'text-[#74777f] hover:text-[#1b1c19] bg-[#eae8e2] hover:bg-[#e4e2dd]'
    },

    // Header — deep navy
    header: {
        background: 'bg-[#022448]',
        backgroundDark: '',
        navigation: {
            link: 'text-white/90 hover:text-white',
            linkHover: 'hover:text-white'
        },
        mobile: {
            menuButton: 'text-white/70 hover:text-white',
            ring: 'sm:ring-white/10',
            closeButton: 'text-white/70 hover:text-white',
            divider: 'divide-white/10',
            menuLink: 'text-white/90 hover:bg-white/10'
        }
    }
} as const;

// Helper functions

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

export const getBadgeClasses = (type: StatusType) => {
    const baseClasses = 'inline-block px-2.5 py-1 rounded-full text-center text-xs font-semibold tracking-wider font-label uppercase';
    return `${baseClasses} ${colors.status[type].bg} ${colors.status[type].text}`;
};

export const getActionButtonClasses = () => {
    return `flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#022448] to-[#1e3a5f] text-white rounded-full shadow-[0_4px_12px_rgba(2,36,72,0.15)] transition focus:outline-none focus:ring-2 focus:ring-[#022448]`;
};

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
