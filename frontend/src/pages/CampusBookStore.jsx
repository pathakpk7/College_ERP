import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  getBookStoreCatalog, placeBookOrder, getMyBookOrders
} from '../services/erpService';
import {
  BookOpen, ShoppingCart, Search, Star, Clock, CheckCircle2,
  PackageCheck, Library, Sparkles, X, Trash2, ArrowRight,
  ShieldAlert, BookMarked, AlertCircle, Info, Building2
} from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All Catalog' },
  { id: 'COMPUTER_SCIENCE', label: 'Computer Science & IT' },
  { id: 'ELECTRONICS', label: 'Electronics & Hardware' },
  { id: 'MATHEMATICS', label: 'Engineering Mathematics' },
  { id: 'COMPETITIVE_EXAM', label: 'Coding & Placements' },
  { id: 'LITERATURE', label: 'Literary Haven & Novels' },
];

export default function CampusBookStore() {
  const [activeTab, setActiveTab] = useState('CATALOG'); // 'CATALOG' | 'MY_ORDERS'
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State (stored locally)
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('erp_bookstore_cart')) || [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    localStorage.setItem('erp_bookstore_cart', JSON.stringify(cart));
  }, [cart]);

  const loadBooks = () => {
    setLoading(true);
    const params = {};
    if (category) params.category = category;
    if (searchQuery) params.search = searchQuery;

    getBookStoreCatalog(params)
      .then(setBooks)
      .catch(() => alert('Failed to load bookstore catalog'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBooks();
  }, [category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadBooks();
  };

  const loadMyOrders = () => {
    setLoadingOrders(true);
    getMyBookOrders()
      .then(setMyOrders)
      .catch(() => alert('Failed to load book orders'))
      .finally(() => setLoadingOrders(false));
  };

  useEffect(() => {
    if (activeTab === 'MY_ORDERS') {
      loadMyOrders();
    }
  }, [activeTab]);

  // Cart Handlers
  const addToCart = (book, orderType = 'BORROW') => {
    if (book.stock_quantity <= 0 || !book.is_available) {
      showNotification(`"${book.title}" is currently out of stock. Restock expected by ${book.expected_restock_date || 'next week'}.`, 'info');
      return;
    }

    const existingIndex = cart.findIndex(item => item.id === book.id && item.orderType === orderType);
    if (existingIndex >= 0) {
      showNotification(`"${book.title}" is already in your cart!`, 'info');
      setIsCartOpen(true);
      return;
    }

    const issueDate = new Date();
    const returnDate = new Date();
    // 1-month borrow limit = 30 days
    returnDate.setDate(issueDate.getDate() + 30);

    const newItem = {
      ...book,
      orderType,
      issueDate: issueDate.toISOString().split('T')[0],
      returnDate: returnDate.toISOString().split('T')[0],
      payableAmount: orderType === 'BORROW' ? (book.borrow_fee || 50.0) : book.price
    };

    setCart(prev => [...prev, newItem]);
    showNotification(
      `Added "${book.title}" to cart (${orderType === 'BORROW' ? '1-Month Borrow (₹50 fee)' : 'Offline Buy (₹' + book.price.toFixed(0) + ')'})!`,
      'success'
    );
    setIsCartOpen(true);
  };

  const removeFromCart = (bookId, orderType) => {
    setCart(prev => prev.filter(item => !(item.id === bookId && item.orderType === orderType)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setOrderSubmitting(true);
    try {
      for (const item of cart) {
        await placeBookOrder({
          book_id: item.id,
          order_type: item.orderType,
          remarks: item.orderType === 'BORROW'
            ? '1-Month Borrowing Limit (₹20/day overdue fine applies after 30 days)'
            : 'Offline Library Counter Settlement & Physical Book Pickup'
        });
      }
      setCart([]);
      showNotification('Book orders confirmed! Please visit the college library counter for physical fulfillment.', 'success');
      setIsCartOpen(false);
      loadBooks();
      if (activeTab === 'MY_ORDERS') loadMyOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to place book orders.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  const cartTotalPayable = cart.reduce((acc, item) => acc + (item.payableAmount || 0), 0);

  return (
    <PageContainer>
      {/* Top Notification Toast */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border text-xs font-bold flex items-center space-x-2.5 transition animate-bounce ${
          notification.type === 'success'
            ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
            : 'bg-amber-900 text-amber-100 border-amber-700'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Hero Showcase Banner */}
      <div className="mb-6 p-6 sm:p-8 bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <BookOpen className="w-96 h-96 text-amber-200" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 backdrop-blur-md rounded-full text-xs font-bold text-amber-300 mb-3 border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Literary Haven &bull; Campus Book Store & Library System</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 font-serif">
            Opening the Gates of Knowledge
          </h1>
          <p className="text-xs text-amber-100/90 leading-relaxed max-w-2xl">
            Borrow reference books for a <b>1-month duration</b> with nominal processing fees, or reserve permanent technical and literary textbooks for <b>offline purchase and collection at the college library counter</b>.
          </p>

          <div className="flex flex-wrap gap-3 mt-5 text-xs font-bold">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500/10 rounded-xl backdrop-blur-sm border border-amber-500/20 text-amber-300">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>1-Month Borrow Limit</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-rose-500/10 rounded-xl backdrop-blur-sm border border-rose-500/20 text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Late Fine: ₹20.00 / Day Overdue</span>
            </div>
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-500/10 rounded-xl backdrop-blur-sm border border-indigo-500/20 text-indigo-300">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Offline Counter Purchase</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Controller & Floating Cart Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex space-x-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('CATALOG')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'CATALOG'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>Bookstore Catalog</span>
          </button>

          <button
            onClick={() => setActiveTab('MY_ORDERS')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl transition ${
              activeTab === 'MY_ORDERS'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PackageCheck className="w-4 h-4 text-emerald-600" />
            <span>My Borrowings & Orders</span>
          </button>
        </div>

        {/* View Cart Button */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-700/20 text-xs transition"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>View Cart</span>
          {cart.length > 0 && (
            <span className="ml-1 px-2 py-0.5 bg-white text-amber-900 rounded-full font-black text-[10px]">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: BOOK CATALOG */}
      {activeTab === 'CATALOG' && (
        <Card
          title="Literary Haven Book Catalog"
          icon={Library}
          subtitle="All prices in Indian Rupees (₹). Borrow with 1-month duration limit or buy offline at library counter."
        >
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative mb-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by book title, author, publisher, or subject keyword..."
              className="w-full pl-10 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:bg-white focus:border-amber-600 focus:outline-none transition"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition"
            >
              Search
            </button>
          </form>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 text-xs font-bold">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl transition ${
                  category === cat.id
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Book Cards Grid */}
          {loading ? (
            <LoadingSpinner message="Fetching campus bookstore catalog..." />
          ) : books.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No books found matching your criteria.</p>
              <p className="text-xs text-slate-400 mt-1">Try a different search term or choose another category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {books.map(book => {
                const isOutOfStock = book.stock_quantity <= 0 || !book.is_available;
                return (
                  <div
                    key={book.id}
                    className={`bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                      isOutOfStock ? 'border-slate-200 opacity-90' : 'border-slate-200 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-100/50'
                    }`}
                  >
                    {/* Image & Header */}
                    <div>
                      <div className="relative h-44 bg-slate-100 overflow-hidden">
                        <img
                          src={book.cover_image || 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=400&q=80'}
                          alt={book.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        
                        {/* Category Badge */}
                        <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-lg text-[10px] font-bold tracking-wider uppercase border border-white/20">
                          {book.category.replace('_', ' ')}
                        </span>

                        {/* Stock Status Badge */}
                        {isOutOfStock ? (
                          <div className="absolute top-3 right-3 px-2 py-0.5 bg-rose-600 text-white rounded-md text-[10px] font-black shadow-sm flex items-center space-x-1">
                            <span>OUT OF STOCK</span>
                          </div>
                        ) : (
                          <span className="absolute top-3 right-3 px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold shadow-sm">
                            {book.stock_quantity} available
                          </span>
                        )}

                        {/* Rating in Image Overlay */}
                        <div className="absolute bottom-3 left-3 right-3 text-white flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-amber-300 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-300" />
                            <span>{book.rating.toFixed(1)} / 5.0</span>
                          </div>
                          {book.publisher && (
                            <span className="text-[10px] text-slate-300 font-medium">
                              {book.publisher}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Book Information Body */}
                      <div className="p-4">
                        <h3 className="text-sm font-black text-slate-900 leading-snug mb-1 group-hover:text-amber-800 transition">
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-600 font-semibold mb-2">
                          By <span className="text-slate-800">{book.author}</span> {book.edition && <span>&bull; <span className="text-slate-400 font-normal">{book.edition}</span></span>}
                        </p>

                        {/* Out of stock expected restock notice */}
                        {isOutOfStock && (
                          <div className="mb-2.5 p-2 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start space-x-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <span>
                              <b>Expected Restock:</b> {book.expected_restock_date ? String(book.expected_restock_date) : 'Within 7 Business Days'}
                            </span>
                          </div>
                        )}

                        {book.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-2">
                            {book.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Order Actions */}
                    <div className="p-4 pt-0 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between pt-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Offline Buy</span>
                          <span className="text-sm font-black text-slate-900">
                            ₹ {book.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold uppercase text-indigo-600 block">1-Month Borrow Fee</span>
                          <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            ₹ {(book.borrow_fee || 50.0).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Overdue Fine Notice */}
                      <div className="text-[10px] text-slate-500 font-medium flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        <span>Borrow Limit: 30 Days</span>
                        <span className="text-rose-600 font-bold">Fine: ₹20 / day late</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                          onClick={() => addToCart(book, 'BORROW')}
                          disabled={isOutOfStock}
                          className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs transition border border-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Borrow (1 Mo)
                        </button>

                        <button
                          onClick={() => addToCart(book, 'BUY')}
                          disabled={isOutOfStock}
                          className="w-full py-2 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs transition shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Offline Buy
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* TAB 2: MY BORROWINGS & ORDERS */}
      {activeTab === 'MY_ORDERS' && (
        <Card
          title="My Borrowed Books & Orders"
          icon={PackageCheck}
          subtitle="Track 1-month borrowing return due dates, overdue fine alerts (₹20/day), and offline counter pickup statuses."
        >
          {loadingOrders ? (
            <LoadingSpinner message="Loading your book orders..." />
          ) : myOrders.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
              <Library className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">You haven't borrowed or reserved any books yet.</p>
              <button
                onClick={() => setActiveTab('CATALOG')}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs"
              >
                Browse Bookstore Catalog
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Book Details</th>
                    <th className="py-3 px-4">Order Mode</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Return Due Date</th>
                    <th className="py-3 px-4">Fee / Price</th>
                    <th className="py-3 px-4">Counter Note</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {myOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{order.book_title}</p>
                        <p className="text-[11px] text-slate-500 font-normal">By {order.book_author}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.order_type === 'BORROW'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.order_type === 'BORROW' ? '1-Month Borrow' : 'Offline Buy'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{order.order_date}</td>
                      <td className="py-3 px-4 text-slate-600 font-semibold">
                        {order.due_date ? (
                          <div>
                            <span className="text-indigo-600 font-bold">{order.due_date}</span>
                            <span className="block text-[10px] text-rose-500 font-medium">(₹20/day after this)</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A (Purchased)</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹ {order.price_paid.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px] max-w-xs">
                        {order.remarks || 'Collect at College Library Counter'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-md font-bold text-[11px] bg-emerald-100 text-emerald-800">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col justify-between p-6">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center space-x-2 text-slate-900 font-black text-base">
                  <ShoppingCart className="w-5 h-5 text-amber-700" />
                  <span>Your Book Cart ({cart.length})</span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              {cart.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-2" />
                  <p className="font-semibold">Your cart is currently empty.</p>
                  <p className="text-[11px] mt-1">Browse the catalog to add borrow or purchase items.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  {cart.map(item => (
                    <div
                      key={`${item.id}-${item.orderType}`}
                      className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start justify-between gap-3 text-xs"
                    >
                      <div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.orderType === 'BORROW' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.orderType === 'BORROW' ? '1-Month Borrow' : 'Offline Buy (Library Counter)'}
                        </span>
                        <h4 className="font-bold text-slate-900 mt-1">{item.title}</h4>
                        <p className="text-[11px] text-slate-500 font-semibold">{item.author}</p>

                        {item.orderType === 'BORROW' ? (
                          <div className="mt-1.5 space-y-0.5">
                            <p className="text-[10px] text-indigo-700 font-medium flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>Due date: <b>{item.returnDate} (30 days)</b></span>
                            </p>
                            <p className="text-[10px] text-rose-600 font-bold">
                              Late return fine: ₹20.00 / day
                            </p>
                            <p className="text-[11px] font-black text-slate-900 pt-0.5">
                              Borrow Fee: ₹ {(item.borrow_fee || 50.0).toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] font-bold text-slate-900 mt-1.5">
                            Offline Counter Price: ₹ {item.price.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.orderType)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Summary & Action */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Total Amount Payable (INR):</span>
                  <span className="text-base font-black text-slate-900">
                    ₹ {cartTotalPayable.toFixed(2)}
                  </span>
                </div>

                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-900 font-medium">
                  <p><b>Note:</b> Offline purchases & borrowings must be settled and picked up at the College Library Counter.</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={clearCart}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Clear Cart
                  </button>

                  <button
                    onClick={handleCheckout}
                    disabled={orderSubmitting}
                    className="flex-1 py-2.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-xl text-xs transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <span>{orderSubmitting ? 'Submitting...' : 'Confirm Reservation / Order'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageContainer>
  );
}

