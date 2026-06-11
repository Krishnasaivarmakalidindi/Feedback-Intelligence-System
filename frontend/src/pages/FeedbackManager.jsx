import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { listFeedback, deleteFeedback, updateFeedback } from '../api/feedback';
import { Badge } from '../components/DesignSystem';
import { SkeletonTable } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowUpTrayIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const FeedbackManager = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search and Filter States
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sentiment, setSentiment] = useState('all');
  const [minPriority, setMinPriority] = useState('all');

  // Pagination & Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Bulk Selection States
  const [selectedIds, setSelectedIds] = useState([]);

  // Ingestion Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [ingestMode, setIngestMode] = useState('single'); // 'single' or 'csv'
  const [newFeedback, setNewFeedback] = useState({ customer_name: '', email: '', message: '' });
  const [csvText, setCsvText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim() !== '') params.search = search.trim();
      if (category !== 'all') params.category = category;
      if (sentiment !== 'all') params.sentiment = sentiment;
      if (minPriority !== 'all') params.min_priority = parseInt(minPriority);

      const data = await listFeedback(params);
      setFeedbackList(data);
      setCurrentPage(1);
      setSelectedIds([]); // Reset selection
    } catch (err) {
      setError('Could not retrieve feedback records. Check API connection.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [category, sentiment, minPriority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchFeedback();
  };

  const handleCreateFeedback = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (ingestMode === 'single') {
        await client.post('/feedback', newFeedback);
      } else {
        // Bulk CSV upload via JSON payload
        await client.post('/feedback/upload', { csv_data: csvText });
      }
      setShowAddModal(false);
      setNewFeedback({ customer_name: '', email: '', message: '' });
      setCsvText('');
      fetchFeedback();
    } catch (err) {
      alert('Error ingesting data. Ensure CSV fields are correct.');
    } finally {
      setSubmitting(false);
    }
  };

  // Bulk Action Helpers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageIds = currentItems.map(item => item.id);
      setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
    } else {
      const pageIds = currentItems.map(item => item.id);
      setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedIds(prev => [...prev, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} selected feedback records?`)) return;
    setLoading(true);
    try {
      for (const id of selectedIds) {
        await deleteFeedback(id);
      }
      setSelectedIds([]);
      fetchFeedback();
    } catch (err) {
      alert('Error during bulk deletion.');
    }
  };

  const handleBulkChangeCategory = async (cat) => {
    setLoading(true);
    try {
      for (const id of selectedIds) {
        await updateFeedback(id, { category: cat });
      }
      setSelectedIds([]);
      fetchFeedback();
    } catch (err) {
      alert('Error updating categories.');
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = "customer_name,email,message\nAlex Rivera,alex@vercel.co,The analytics dashboard loading time is slow when parsing large JSON datasets.\nClara Chen,clara@stripe.com,Please add a dark mode option to the payment success screen.\nMarcus Brody,marcus@linear.app,Bug: The keyboard shortcuts clashes with Chrome bookmark list.";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "sample_feedback_ingest.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorting
  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedFeedback = [...feedbackList].sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];

    if (sortBy === 'created_at') {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }
    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalItems = sortedFeedback.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedFeedback.slice(indexOfFirstItem, indexOfLastItem);

  const getPriorityBadgeColor = (score) => {
    if (score >= 4) return 'rose';
    if (score === 3) return 'amber';
    return 'emerald';
  };

  const getSentimentColor = (sent) => {
    if (sent === 'positive') return 'emerald';
    if (sent === 'negative') return 'rose';
    return 'zinc';
  };

  const isAllPageItemsSelected = currentItems.length > 0 && currentItems.every(item => selectedIds.includes(item.id));

  return (
    <div className="space-y-5 pb-16 relative">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-base font-bold text-zinc-100">Feedback Logs</h2>
          <p className="text-xs text-zinc-500 mt-0.5 font-sans">Search and triage reviews. Apply filters to isolate trends.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={downloadSampleCSV}
            className="inline-flex items-center px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
            title="Download sample CSV template"
          >
            <DocumentArrowDownIcon className="w-3.5 h-3.5 mr-2 text-zinc-500" />
            CSV Sample
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <PlusIcon className="w-3.5 h-3.5 mr-2" />
            Ingest Feedback
          </button>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-xs">
          <div className="relative">
            <input
              type="text"
              placeholder="Search keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-sans"
            />
            <MagnifyingGlassIcon className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-2.5" />
          </div>
        </form>

        {/* Filter Selection dropdowns */}
        <div className="flex flex-wrap gap-2 items-center w-full md:w-auto justify-end">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs px-2 py-1.5 text-zinc-300 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="bug">Bugs</option>
            <option value="feature_request">Feature Requests</option>
            <option value="complaint">Complaints</option>
            <option value="praise">Praises</option>
            <option value="general">General</option>
          </select>

          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs px-2 py-1.5 text-zinc-300 focus:outline-none"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>

          <select
            value={minPriority}
            onChange={(e) => setMinPriority(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg text-xs px-2 py-1.5 text-zinc-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="1">Priority 1+</option>
            <option value="3">Priority 3+</option>
            <option value="4">Priority 4+</option>
          </select>

          <button
            onClick={fetchFeedback}
            className="p-1.5 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 rounded-lg transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Filter Chips */}
      {(category !== 'all' || sentiment !== 'all' || minPriority !== 'all' || search !== '') && (
        <div className="flex flex-wrap gap-2 items-center select-none font-sans">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mr-1">Active filters:</span>
          {category !== 'all' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 gap-1.5">
              Category: {category}
              <button onClick={() => setCategory('all')}><XMarkIcon className="w-3 h-3 text-indigo-400/80 hover:text-indigo-300" /></button>
            </span>
          )}
          {sentiment !== 'all' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 gap-1.5">
              Sentiment: {sentiment}
              <button onClick={() => setSentiment('all')}><XMarkIcon className="w-3 h-3 text-indigo-400/80 hover:text-indigo-300" /></button>
            </span>
          )}
          {minPriority !== 'all' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 gap-1.5">
              Priority: {minPriority}+
              <button onClick={() => setMinPriority('all')}><XMarkIcon className="w-3 h-3 text-indigo-400/80 hover:text-indigo-300" /></button>
            </span>
          )}
          {search !== '' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 gap-1.5">
              Search: "{search}"
              <button onClick={() => setSearch('')}><XMarkIcon className="w-3 h-3 text-indigo-400/80 hover:text-indigo-300" /></button>
            </span>
          )}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-lg">
        {loading ? (
          <SkeletonTable rows={itemsPerPage} />
        ) : error ? (
          <div className="py-16 text-center text-rose-400 text-xs font-semibold">{error}</div>
        ) : currentItems.length > 0 ? (
          <>
            <div className="overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left border-collapse table-fixed">
                <thead className="sticky top-0 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 z-10 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
                  <tr>
                    <th className="px-6 py-3.5 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={isAllPageItemsSelected}
                        onChange={handleSelectAll}
                        className="rounded bg-zinc-950 border-zinc-800 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-6 py-3.5 w-48 cursor-pointer hover:text-zinc-300" onClick={() => toggleSort('customer_name')}>
                      Customer {sortBy === 'customer_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3.5 flex-1">Message</th>
                    <th className="px-6 py-3.5 w-32 cursor-pointer hover:text-zinc-300" onClick={() => toggleSort('category')}>
                      Category {sortBy === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3.5 w-28 cursor-pointer hover:text-zinc-300" onClick={() => toggleSort('sentiment')}>
                      Sentiment {sortBy === 'sentiment' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3.5 w-24 cursor-pointer hover:text-zinc-300 text-right" onClick={() => toggleSort('priority_score')}>
                      Priority {sortBy === 'priority_score' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 text-xs text-zinc-300 font-sans">
                  {currentItems.map((fb) => {
                    const isSelected = selectedIds.includes(fb.id);
                    return (
                      <tr
                        key={fb.id}
                        className={`hover:bg-zinc-800/25 transition-colors duration-75 cursor-pointer ${
                          isSelected ? 'bg-indigo-600/5' : ''
                        }`}
                      >
                        <td className="px-6 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectRow(fb.id)}
                            className="rounded bg-zinc-950 border-zinc-800 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <Link to={`/feedback/${fb.id}`} className="font-semibold text-zinc-200 hover:text-indigo-400 block truncate">
                            {fb.customer_name}
                          </Link>
                          <span className="text-[10px] text-zinc-500 font-mono block select-all truncate mt-0.5">
                            {fb.email}
                          </span>
                        </td>
                        <td className="px-6 py-3 truncate max-w-sm text-zinc-300">
                          <Link to={`/feedback/${fb.id}`} className="hover:text-zinc-200">
                            {fb.message}
                          </Link>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant="indigo">{fb.category}</Badge>
                        </td>
                        <td className="px-6 py-3">
                          <Badge variant={getSentimentColor(fb.sentiment)}>{fb.sentiment}</Badge>
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Badge variant={getPriorityBadgeColor(fb.priority_score)}>P{fb.priority_score}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950/20 flex items-center justify-between text-xs text-zinc-500 select-none">
                <span>
                  Showing <span className="text-zinc-400 font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="text-zinc-400 font-semibold">{Math.min(indexOfLastItem, totalItems)}</span> of{' '}
                  <span className="text-zinc-400 font-semibold">{totalItems}</span> records
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="p-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 transition-colors"
                  >
                    <ChevronLeftIcon className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-zinc-400">
                    Page <span className="font-semibold">{currentPage}</span> of {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="p-1 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 hover:bg-zinc-800 disabled:opacity-40 disabled:hover:bg-zinc-900 transition-colors"
                  >
                    <ChevronRightIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12">
            <EmptyState
              title="No records found"
              description="No feedback matches the query filters. Check search phrases or clear filter parameters."
            />
          </div>
        )}
      </div>

      {/* Floating Bulk Actions Drawer */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-zinc-900 border border-zinc-800 px-5 py-3 rounded-full flex items-center space-x-4 shadow-2xl z-40 animate-fade-in font-sans">
          <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
            {selectedIds.length} items selected
          </span>
          <div className="h-4 w-[1px] bg-zinc-800" />
          
          <select
            onChange={(e) => handleBulkChangeCategory(e.target.value)}
            defaultValue=""
            className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-[10px] text-zinc-300 focus:outline-none"
          >
            <option value="" disabled>Change Category...</option>
            <option value="bug">Bug</option>
            <option value="feature_request">Feature Request</option>
            <option value="complaint">Complaint</option>
            <option value="praise">Praise</option>
            <option value="general">General</option>
          </select>

          <button
            onClick={handleBulkDelete}
            className="flex items-center text-[10px] uppercase font-bold tracking-wider text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 px-3 py-1.5 rounded transition-all"
          >
            <TrashIcon className="w-3.5 h-3.5 mr-1" />
            Delete
          </button>

          <button
            onClick={() => setSelectedIds([])}
            className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 hover:text-zinc-400"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Ingestion Modal popup */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateFeedback}
            className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/20 select-none">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Ingest Feedbacks</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-zinc-500 hover:text-zinc-300 text-lg"
              >
                &times;
              </button>
            </div>

            {/* Ingestion Mode Toggle */}
            <div className="px-6 pt-4 flex border-b border-zinc-800/60 bg-zinc-950/10 gap-4 select-none">
              <button
                type="button"
                onClick={() => setIngestMode('single')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${
                  ingestMode === 'single' ? 'border-indigo-500 text-zinc-200' : 'border-transparent text-zinc-500'
                }`}
              >
                Single Ticket
              </button>
              <button
                type="button"
                onClick={() => setIngestMode('csv')}
                className={`pb-2.5 text-xs font-semibold border-b-2 transition-all ${
                  ingestMode === 'csv' ? 'border-indigo-500 text-zinc-200' : 'border-transparent text-zinc-500'
                }`}
              >
                Bulk CSV Logs
              </button>
            </div>

            <div className="p-6 space-y-4">
              {ingestMode === 'single' ? (
                <>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Clara Chen"
                      value={newFeedback.customer_name}
                      onChange={(e) => setNewFeedback({ ...newFeedback, customer_name: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">
                      Customer Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="clara@stripe.com"
                      value={newFeedback.email}
                      onChange={(e) => setNewFeedback({ ...newFeedback, email: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">
                      Message Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Message body..."
                      value={newFeedback.message}
                      onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-sans resize-none"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-2">
                      CSV Raw Text Data
                    </label>
                    <textarea
                      required
                      rows={6}
                      placeholder="customer_name,email,message&#10;Sarah Jenkins,sarah@framer.com,Settings page crashes.&#10;Vanya,vanya@umbrella.net,The sidebar navigation overlaps."
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-mono resize-none"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-normal leading-relaxed">
                    Make sure to include headers `customer_name`, `email`, and `message` exactly.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 flex justify-end gap-2 select-none">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Ingesting data stream...' : 'Start Ingest'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FeedbackManager;
