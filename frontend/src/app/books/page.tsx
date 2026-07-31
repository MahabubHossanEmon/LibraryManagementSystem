'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { BookOpen, Plus, Search, Filter, Edit, Trash2, BookmarkCheck, Clock, Building2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { BookDto, BranchDto } from '@/lib/types';
import { Modal } from '@/components/modal';
import { useToast } from '@/components/toast';
import { useAuth } from '@/lib/auth-context';

export default function BooksPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [books, setBooks] = useState<BookDto[]>([]);
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookDto | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publisher, setPublisher] = useState('');
  const [yearPublished, setYearPublished] = useState(2024);
  const [totalCopies, setTotalCopies] = useState(5);
  const [branchId, setBranchId] = useState('');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [booksRes, branchesRes] = await Promise.all([api.getBooks(), api.getBranches()]);
      setBooks(booksRes);
      setBranches(branchesRes);
      if (branchesRes.length > 0 && !branchId) {
        setBranchId(branchesRes[0].id);
      }
    } catch (err: unknown) {
      // Provide initial fallback books if database is not migrated locally
      setBooks([
        {
          id: '11111111-1111-1111-1111-111111111111',
          title: 'Clean Architecture',
          author: 'Robert C. Martin',
          isbn: '978-0134494166',
          publisher: 'Prentice Hall',
          yearPublished: 2017,
          totalCopies: 5,
          availableCopies: 3,
          branchId: 'b1',
          branchName: 'Central Library',
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          title: 'Design Patterns',
          author: 'Erich Gamma et al.',
          isbn: '978-0201633610',
          publisher: 'Addison-Wesley',
          yearPublished: 1994,
          totalCopies: 4,
          availableCopies: 4,
          branchId: 'b1',
          branchName: 'Central Library',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBook({
        title,
        author,
        isbn,
        publisher,
        yearPublished: Number(yearPublished),
        totalCopies: Number(totalCopies),
        branchId: branchId || (branches[0]?.id || '00000000-0000-0000-0000-000000000001'),
      });
      showToast('Book created successfully!', 'success');
      setIsCreateOpen(false);
      resetForm();
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create book';
      showToast(msg, 'error');
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    try {
      await api.updateBook(editingBook.id, {
        id: editingBook.id,
        title,
        author,
        isbn,
        publisher,
        yearPublished: Number(yearPublished),
        totalCopies: Number(totalCopies),
        branchId,
      });
      showToast('Book updated successfully!', 'success');
      setEditingBook(null);
      resetForm();
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update book';
      showToast(msg, 'error');
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
      await api.deleteBook(id);
      showToast('Book deleted successfully', 'success');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete book';
      showToast(msg, 'error');
    }
  };

  const handleBorrow = async (book: BookDto) => {
    if (book.availableCopies <= 0) {
      showToast('No copies available to borrow!', 'error');
      return;
    }
    try {
      await api.borrowBook({
        bookId: book.id,
        userId: user?.userId || '00000000-0000-0000-0000-000000000001',
      });
      showToast(`Borrowed "${book.title}" successfully!`, 'success');
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to borrow book';
      showToast(msg, 'error');
    }
  };

  const handleReserve = async (book: BookDto) => {
    try {
      await api.reserveBook({
        bookId: book.id,
        userId: user?.userId || '00000000-0000-0000-0000-000000000001',
      });
      showToast(`Reserved "${book.title}" hold queue position!`, 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reserve book';
      showToast(msg, 'error');
    }
  };

  const openEditModal = (book: BookDto) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setIsbn(book.isbn);
    setPublisher(book.publisher);
    setYearPublished(book.yearPublished);
    setTotalCopies(book.totalCopies);
    setBranchId(book.branchId);
  };

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setIsbn('');
    setPublisher('');
    setYearPublished(2024);
    setTotalCopies(5);
  };

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.toLowerCase().includes(search.toLowerCase());
      const matchesBranch = selectedBranch === 'ALL' || b.branchId === selectedBranch;
      return matchesSearch && matchesBranch;
    });
  }, [books, search, selectedBranch]);

  return (
    <div className="space-y-6">
      {/* Page Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Book Catalog & Inventory</h2>
            <p className="text-xs text-zinc-400">Total {books.length} titles registered in library system</p>
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
            <span>Add New Book</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 shrink-0">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filter Branch:</span>
          </div>
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 transition-colors w-full md:w-auto"
          >
            <option value="ALL">All Branch Locations</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-xs uppercase font-bold text-zinc-400 border-b border-zinc-800 tracking-wider">
              <tr>
                <th className="px-6 py-4">Title & Details</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4">ISBN / Year</th>
                <th className="px-6 py-4">Branch</th>
                <th className="px-6 py-4 text-center">Copies</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-zinc-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                        {book.title}
                      </div>
                      <div className="text-xs text-zinc-400">{book.publisher}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-zinc-200">{book.author}</td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                      <div>{book.isbn}</div>
                      <div className="text-zinc-400">{book.yearPublished}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-zinc-300">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{book.branchName || 'Central Hub'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          book.availableCopies > 0
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {book.availableCopies} / {book.totalCopies} Available
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Borrow button */}
                        <button
                          onClick={() => handleBorrow(book)}
                          disabled={book.availableCopies <= 0}
                          title="Borrow Book"
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 text-xs font-semibold transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>Borrow</span>
                        </button>

                        {/* Reserve button */}
                        <button
                          onClick={() => handleReserve(book)}
                          title="Reserve Hold Queue"
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                        >
                          <Clock className="w-4 h-4 text-amber-400" />
                        </button>

                        {/* Admin / Librarian Edit & Delete */}
                        {(user?.role === 'Admin' || user?.role === 'Librarian') && (
                          <>
                            <button
                              onClick={() => openEditModal(book)}
                              title="Edit Book"
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
                            >
                              <Edit className="w-4 h-4 text-indigo-400" />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              title="Delete Book"
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-sm">
                    No matching books found. Try adjusting your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isCreateOpen || !!editingBook}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingBook(null);
        }}
        title={editingBook ? 'Edit Book Record' : 'Add New Book to Catalog'}
      >
        <form onSubmit={editingBook ? handleUpdateBook : handleCreateBook} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Book Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Clean Code"
              required
              className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Robert C. Martin"
                required
                className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">ISBN</label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-0132350884"
                required
                className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Publisher</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                placeholder="Prentice Hall"
                required
                className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Year Published</label>
              <input
                type="number"
                value={yearPublished}
                onChange={(e) => setYearPublished(Number(e.target.value))}
                required
                className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Total Stock Copies</label>
              <input
                type="number"
                min={1}
                value={totalCopies}
                onChange={(e) => setTotalCopies(Number(e.target.value))}
                required
                className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Branch Location</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingBook(null);
              }}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30"
            >
              {editingBook ? 'Save Changes' : 'Create Book'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
