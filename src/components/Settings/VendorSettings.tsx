import React, { useState } from 'react';
import { TruckIcon, PencilIcon, TrashIcon, ArrowUturnLeftIcon, PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useVendors } from '../../hooks/useVendors';
import { typography } from '../../utils/typography';
import { colors, getBadgeClasses } from '../../utils/colors';

const inputClass = `px-3.5 py-2.5 rounded-xl text-sm ${colors.form.input.base}`;

// Cycled per row so vendor initials read as distinct at a glance — purely
// presentational, reusing the app's existing status-tint palette.
const AVATAR_TINTS = [
  'bg-[#006a68]/12 text-[#006a68]',
  'bg-[#6366f1]/12 text-[#4338ca]',
  'bg-[#2563eb]/12 text-[#1d4ed8]',
  'bg-amber-500/12 text-amber-800',
];

const initialsFor = (name: string) =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || '?';

const formatCreatedAt = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
};

export const VendorSettings: React.FC = () => {
  const { vendors, loading, error, addVendor, updateVendor, deactivateVendor } = useVendors();

  const [newVendorName, setNewVendorName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const isDuplicateName = (name: string, excludeId?: string) =>
    vendors.some(v => v.id !== excludeId && v.name.trim().toLowerCase() === name.trim().toLowerCase());

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newVendorName.trim();
    if (!name) {
      setAddError('Vendor name is required.');
      return;
    }
    if (isDuplicateName(name)) {
      setAddError('A vendor with this name already exists.');
      return;
    }
    try {
      setAdding(true);
      setAddError(null);
      await addVendor({ name, createdAt: new Date().toISOString(), isActive: true });
      setNewVendorName('');
    } catch (err) {
      setAddError('Failed to add vendor. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
    setEditError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingName('');
    setEditError(null);
  };

  const saveEditing = async (id: string) => {
    const name = editingName.trim();
    if (!name) {
      setEditError('Vendor name is required.');
      return;
    }
    if (isDuplicateName(name, id)) {
      setEditError('A vendor with this name already exists.');
      return;
    }
    try {
      setSavingId(id);
      setEditError(null);
      await updateVendor(id, { name });
      setEditingId(null);
      setEditingName('');
    } catch (err) {
      setEditError('Failed to save changes. Please try again.');
    } finally {
      setSavingId(null);
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      setTogglingId(id);
      if (isActive) {
        await deactivateVendor(id);
      } else {
        await updateVendor(id, { isActive: true });
      }
    } finally {
      setTogglingId(null);
    }
  };

  const sortedVendors = [...vendors].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <section className={`${colors.card.background} rounded-2xl ${colors.card.border} ${colors.card.shadow} overflow-hidden`}>
      <div className="p-6 md:p-8 border-b border-[rgba(196,198,207,0.15)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#022448]/8 text-[#022448] border border-[#022448]/15 flex items-center justify-center shrink-0">
            <TruckIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className={typography.sectionTitle}>Vendors</h2>
              {!loading && (
                <span className={getBadgeClasses('order-placed')}>
                  {vendors.length} {vendors.length === 1 ? 'vendor' : 'vendors'}
                </span>
              )}
            </div>
            <p className={typography.caption}>
              Manage the vendors available when adding or editing products. Removing a vendor keeps it
              on past products but hides it from new selections.
            </p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="mt-6 flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={newVendorName}
              onChange={e => {
                setNewVendorName(e.target.value);
                if (addError) setAddError(null);
              }}
              placeholder="Enter new vendor name..."
              className={`w-full ${inputClass}`}
              disabled={adding}
            />
            {addError && <p className="text-red-700 text-sm mt-1">{addError}</p>}
          </div>
          <button
            type="submit"
            disabled={adding}
            className={`${colors.button.primary} px-5 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0`}
          >
            <PlusIcon className="w-4 h-4" />
            {adding ? 'Adding...' : 'Add vendor'}
          </button>
        </form>

        {editError && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-sm">{editError}</div>
        )}
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-sm">{error}</div>
        )}
      </div>

      {loading ? (
        <p className={`${typography.caption} p-6`}>Loading vendors...</p>
      ) : sortedVendors.length === 0 ? (
        <p className={`${typography.caption} p-6`}>No vendors yet. Add one above.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className={`${colors.background.gradient}`}>
              <tr>
                <th className={`py-3 px-6 ${typography.tableHeader}`} scope="col">Vendor</th>
                <th className={`py-3 px-6 ${typography.tableHeader}`} scope="col">Status</th>
                <th className={`py-3 px-6 text-right ${typography.tableHeader}`} scope="col">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(196,198,207,0.15)]">
              {sortedVendors.map((vendor, index) => {
                const createdLabel = formatCreatedAt(vendor.createdAt);
                const isEditing = editingId === vendor.id;

                return (
                  <tr key={vendor.id} className="hover:bg-[#eae8e2]/40 transition-colors">
                    <td className="py-4 px-6">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={e => setEditingName(e.target.value)}
                            className={inputClass}
                            autoFocus
                            disabled={savingId === vendor.id}
                          />
                          <button
                            onClick={() => saveEditing(vendor.id)}
                            disabled={savingId === vendor.id}
                            aria-label="Save"
                            className={`${colors.button.secondary} p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={savingId === vendor.id}
                            aria-label="Cancel"
                            className={`${colors.button.secondary} p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed shrink-0`}
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${AVATAR_TINTS[index % AVATAR_TINTS.length]}`}>
                            {initialsFor(vendor.name)}
                          </div>
                          <div>
                            <span className={`font-semibold ${vendor.isActive ? 'text-[#1b1c19]' : `${colors.text.muted} line-through`}`}>
                              {vendor.name}
                            </span>
                            {createdLabel && (
                              <div className={typography.caption}>Created {createdLabel}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={getBadgeClasses(vendor.isActive ? 'complete' : 'void')}>
                        {vendor.isActive ? 'Active' : 'Removed'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEditing(vendor.id, vendor.name)}
                          aria-label={`Edit ${vendor.name}`}
                          className={`${colors.button.secondary} p-2 rounded-full`}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(vendor.id, vendor.isActive)}
                          disabled={togglingId === vendor.id}
                          aria-label={vendor.isActive ? `Remove ${vendor.name}` : `Restore ${vendor.name}`}
                          title={vendor.isActive ? 'Remove vendor' : 'Restore vendor'}
                          className={`${vendor.isActive ? colors.button.danger : colors.button.secondary} p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {vendor.isActive ? <TrashIcon className="w-4 h-4" /> : <ArrowUturnLeftIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
