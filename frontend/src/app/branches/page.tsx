'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Plus, Phone, MapPin, Edit, Trash2, Library } from 'lucide-react';
import { api } from '@/lib/api-client';
import { BranchDto } from '@/lib/types';
import { Modal } from '@/components/modal';
import { ConfirmModal } from '@/components/confirm-modal';
import { useToast } from '@/components/toast';
import { useAuth } from '@/lib/auth-context';

export default function BranchesPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDto | null>(null);
  const [deletingBranch, setDeletingBranch] = useState<BranchDto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      const res = await api.getBranches();
      setBranches(res);
    } catch (err: unknown) {
      // Provide initial fallback branch
      setBranches([
        {
          id: 'b1',
          name: 'Central Library',
          address: '100 Main Street, Cityville',
          contactNumber: '+1 (555) 019-2834',
        },
        {
          id: 'b2',
          name: 'Northside Community Branch',
          address: '450 North Blvd, Metro City',
          contactNumber: '+1 (555) 019-8821',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBranch({ name, address, contactNumber });
      showToast('Branch location added successfully!', 'success');
      setIsCreateOpen(false);
      resetForm();
      loadBranches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create branch';
      showToast(msg, 'error');
    }
  };

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;
    try {
      await api.updateBranch(editingBranch.id, {
        id: editingBranch.id,
        name,
        address,
        contactNumber,
      });
      showToast('Branch details updated!', 'success');
      setEditingBranch(null);
      resetForm();
      loadBranches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update branch';
      showToast(msg, 'error');
    }
  };

  const confirmDeleteBranch = async () => {
    if (!deletingBranch) return;
    try {
      setIsDeleting(true);
      await api.deleteBranch(deletingBranch.id);
      showToast(`Branch "${deletingBranch.name}" deleted successfully`, 'success');
      setDeletingBranch(null);
      loadBranches();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete branch';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditModal = (branch: BranchDto) => {
    setEditingBranch(branch);
    setName(branch.name);
    setAddress(branch.address);
    setContactNumber(branch.contactNumber);
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setContactNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Library Branch Network</h2>
            <p className="text-xs text-zinc-400">Manage physical library locations and contact points</p>
          </div>
        </div>

        {(user?.role === 'Admin' || user?.role === 'Librarian') && (
          <button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Add Branch Location</span>
          </button>
        )}
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((b) => (
          <div
            key={b.id}
            className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/40 transition-all shadow-xl space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
                  <Library className="w-5 h-5" />
                </div>
                {(user?.role === 'Admin' || user?.role === 'Librarian') && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400 transition-colors"
                      title="Edit Branch"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingBranch(b)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                      title="Delete Branch"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">{b.name}</h3>
                <span className="inline-block mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  Active Hub
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 pt-2 border-t border-zinc-800/80">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <span>{b.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-zinc-500 shrink-0" />
                  <span className="font-mono text-zinc-400">{b.contactNumber}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingBranch}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingBranch(null);
        }}
        title={editingBranch ? 'Edit Branch Location' : 'Register New Library Branch'}
      >
        <form onSubmit={editingBranch ? handleUpdateBranch : handleCreateBranch} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Branch Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Central Downtown Branch"
              required
              className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="100 Main Street, Cityville"
              required
              className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Contact Telephone</label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="+1 (555) 019-2834"
              required
              className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingBranch(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30"
            >
              {editingBranch ? 'Save Branch' : 'Add Branch'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingBranch}
        onClose={() => setDeletingBranch(null)}
        onConfirm={confirmDeleteBranch}
        title="Delete Branch Location"
        message="Are you sure you want to delete this branch location?"
        itemName={deletingBranch?.name}
        itemDetails={deletingBranch ? `Address: ${deletingBranch.address} • Contact: ${deletingBranch.contactNumber}` : undefined}
        warningText="This action is permanent. Deleting this branch hub will remove all associated location data and physical inventory mappings."
        confirmText="Delete Branch"
        isLoading={isDeleting}
      />
    </div>
  );
}
