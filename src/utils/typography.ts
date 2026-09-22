/**
 * Centralized typography utilities for ReviewClub.
 * Use these semantic class strings instead of ad-hoc font sizes/weights.
 */

const tabular = 'tabular-nums';

export const typography = {
  pageTitle: 'text-page-title font-semibold tracking-tight text-[#1b1c19]',
  modalTitle: 'text-modal-title font-semibold text-[#1b1c19]',
  sectionTitle: 'text-section-title font-semibold text-[#1b1c19]',
  body: 'text-body font-normal text-[#1b1c19]',
  bodyStrong: 'text-body font-medium text-[#1b1c19]',
  label: 'text-label font-medium text-[#43474e]',
  caption: 'text-caption font-normal text-[#74777f]',
  captionStrong: 'text-caption font-medium text-[#74777f]',
  button: 'text-body font-medium',
  tableHeader: 'text-table-header font-medium text-white/90',
  tableCell: 'text-body font-normal text-[#43474e]',
  tableCellStrong: 'text-body font-medium text-[#1b1c19]',
  statLabel: 'text-stat-label font-medium text-[#74777f]',
  statValue: `text-stat-value font-semibold ${tabular} text-[#1b1c19]`,
  numeric: `text-body font-medium ${tabular}`,
  numericStrong: `text-body font-semibold ${tabular}`,
  overline: 'text-caption font-medium uppercase tracking-wide text-[#74777f]',
} as const;

export type TypographyToken = keyof typeof typography;
