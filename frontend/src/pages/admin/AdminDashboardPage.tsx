import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Layers,
  Search,
  Plus,
  RefreshCw,
  LogOut,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  Package,
  TrendingUp,
  AlertTriangle,
  Edit2,
  Trash2,
  Filter,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { adminService, ADMIN_DESIGNATED_EMAIL } from '../../services/adminService';
import {
  AdminMetrics,
  AdminRecentOrder,
  AdminUserSummary,
  AdminOrder,
  AdminCategory,
} from '../../types/admin';
import { Product } from '../../types';
import { UserDossierModal } from '../../components/admin/UserDossierModal';
import { OrderStatusModal } from '../../components/admin/OrderStatusModal';
import { ProductFormModal } from '../../components/admin/ProductFormModal';

export const AdminDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'orders' | 'catalogue'>(
    'overview'
  );

  // Data states
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminRecentOrder[]>([]);
  const [usersList, setUsersList] = useState<AdminUserSummary[]>([]);
  const [ordersList, setOrdersList] = useState<AdminOrder[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<AdminCategory[]>([]);

  // Search & Filter states
  const [userSearch, setUserSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');
  const [productSearch, setProductSearch] = useState('');
  const [productGenderFilter, setProductGenderFilter] = useState('all');

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal states
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<AdminOrder | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);

  // Fetch Overview Data
  const loadOverview = useCallback(async () => {
    try {
      const data = await adminService.getOverview();
      if (data.success) {
        setMetrics(data.metrics);
        setRecentOrders(data.recentOrders);
      }
    } catch (err) {
      console.error('Error fetching admin metrics:', err);
    }
  }, []);

  // Fetch Users List
  const loadUsers = useCallback(async () => {
    try {
      const data = await adminService.getUsers(userSearch);
      if (data.success) {
        setUsersList(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [userSearch]);

  // Fetch Orders List
  const loadOrders = useCallback(async () => {
    try {
      const data = await adminService.getOrders({
        status: orderStatusFilter,
        payment_status: orderPaymentFilter,
        q: orderSearch,
      });
      if (data.success) {
        setOrdersList(data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  }, [orderStatusFilter, orderPaymentFilter, orderSearch]);

  // Fetch Catalogue
  const loadCatalogue = useCallback(async () => {
    try {
      const data = await adminService.getProducts({
        q: productSearch,
        gender: productGenderFilter,
      });
      if (data.success) {
        setProductsList(data.products);
        setCategoriesList(data.categories);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  }, [productSearch, productGenderFilter]);

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadOverview(), loadUsers(), loadOrders(), loadCatalogue()]).finally(() => {
      setIsLoading(false);
    });
  }, [loadOverview, loadUsers, loadOrders, loadCatalogue]);

  // Reload triggered tab
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await Promise.all([loadOverview(), loadUsers(), loadOrders(), loadCatalogue()]);
    setIsRefreshing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteProduct = async (product: Product) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${product.name}" (${product.id}) from the active catalogue?`
    );
    if (!confirmDelete) return;

    try {
      const res = await adminService.deleteProduct(product.id);
      if (res.success) {
        loadCatalogue();
        loadOverview();
      }
    } catch (err) {
      alert('Unable to deactivate product.');
    }
  };

  const formatDate = (isoString?: string | null) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#242522] flex flex-col font-sans">
      {/* Executive Suite Top Bar */}
      <header className="bg-[#1E1F1C] text-[#FAF8F5] border-b border-[#353632] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex flex-col">
              <span className="font-serif tracking-[0.25em] text-lg uppercase font-bold text-white">
                AVELUNE
              </span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-[#D8C6AA] font-mono -mt-1">
                Atelier Director Suite
              </span>
            </Link>

            <span className="hidden sm:inline-block h-5 w-[1px] bg-[#353632]" />

            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-[#282925] border border-[#3A3B36] rounded-xs text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[#D8C6AA] font-mono text-[11px]">
                Director: {ADMIN_DESIGNATED_EMAIL}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="p-1.5 text-[#D8C6AA] hover:text-white hover:bg-[#2E2F2B] transition-colors rounded-xs flex items-center gap-1.5 text-xs font-mono"
              title="Refresh Atelier Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Sync Live</span>
            </button>

            <Link
              to="/"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs text-[#FAF8F5] bg-[#2E2F2B] hover:bg-[#3E403A] border border-[#454740] rounded-xs uppercase tracking-wider transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#D8C6AA]" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-rose-100 hover:bg-rose-950/40 border border-rose-900/50 rounded-xs transition-colors uppercase tracking-wider"
              title="Sign out of Admin Suite"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-[#2A2B27] flex space-x-1 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 text-xs uppercase tracking-widest font-medium border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'overview'
                ? 'border-[#D8C6AA] text-[#D8C6AA]'
                : 'border-transparent text-[#9E9F99] hover:text-[#FAF8F5]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Executive Overview
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3 text-xs uppercase tracking-widest font-medium border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'users'
                ? 'border-[#D8C6AA] text-[#D8C6AA]'
                : 'border-transparent text-[#9E9F99] hover:text-[#FAF8F5]'
            }`}
          >
            <Users className="w-4 h-4" />
            Client Registry & History
            {usersList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-[#2D2E2A] text-[#D8C6AA] text-[10px] rounded-full font-mono">
                {usersList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-3 text-xs uppercase tracking-widest font-medium border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'orders'
                ? 'border-[#D8C6AA] text-[#D8C6AA]'
                : 'border-transparent text-[#9E9F99] hover:text-[#FAF8F5]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Orders & Logistics
            {metrics?.pendingDispatchCount ? (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-[#1E1F1C] text-[10px] font-bold rounded-full font-mono">
                {metrics.pendingDispatchCount}
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('catalogue')}
            className={`py-3 px-3 text-xs uppercase tracking-widest font-medium border-b-2 flex items-center gap-2 transition-colors shrink-0 ${
              activeTab === 'catalogue'
                ? 'border-[#D8C6AA] text-[#D8C6AA]'
                : 'border-transparent text-[#9E9F99] hover:text-[#FAF8F5]'
            }`}
          >
            <Layers className="w-4 h-4" />
            Catalogue Architecture
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-2 border-[#242522] border-t-transparent rounded-full animate-spin" />
            <p className="font-serif text-sm tracking-widest uppercase text-[#5A5C55]">
              Synchronizing Atelier Ledger...
            </p>
          </div>
        ) : (
          <>
            {/* TAB 1: EXECUTIVE OVERVIEW */}
            {activeTab === 'overview' && metrics && (
              <div className="space-y-8">
                {/* KPI Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white border border-[#E4DED4] p-5 shadow-xs">
                    <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-semibold block mb-1">
                      Gross Atelier Revenue
                    </span>
                    <div className="font-serif text-2xl font-bold text-[#242522]">
                      ₹{metrics.totalRevenue.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-medium">
                      <TrendingUp className="w-3 h-3" />
                      {metrics.paidOrdersCount} Paid Transactions
                    </span>
                  </div>

                  <div className="bg-white border border-[#E4DED4] p-5 shadow-xs">
                    <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-semibold block mb-1">
                      Total Orders Placed
                    </span>
                    <div className="font-serif text-2xl font-bold text-[#242522]">
                      {metrics.totalOrders}
                    </div>
                    <span className="text-[11px] text-[#5A5C55] mt-1 block">
                      Across all verified clients
                    </span>
                  </div>

                  <div className="bg-white border border-[#E4DED4] p-5 shadow-xs">
                    <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-semibold block mb-1">
                      Dispatches Pending
                    </span>
                    <div className="font-serif text-2xl font-bold text-amber-700">
                      {metrics.pendingDispatchCount}
                    </div>
                    <span className="text-[11px] text-amber-800 font-medium flex items-center gap-1 mt-1">
                      <Package className="w-3 h-3" />
                      Awaiting courier handover
                    </span>
                  </div>

                  <div className="bg-white border border-[#E4DED4] p-5 shadow-xs">
                    <span className="text-[10px] uppercase tracking-wider text-[#777B63] font-semibold block mb-1">
                      Registered Clients
                    </span>
                    <div className="font-serif text-2xl font-bold text-[#242522]">
                      {metrics.totalUsers}
                    </div>
                    <span className="text-[11px] text-[#5A5C55] mt-1 block">
                      Atelier patron accounts
                    </span>
                  </div>
                </div>

                {/* Secondary Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 text-xs">
                    <span className="text-[#777B63] block text-[10px] uppercase">Active Pieces</span>
                    <span className="font-mono text-base font-semibold text-[#242522]">
                      {metrics.totalProducts} Pieces
                    </span>
                  </div>
                  <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 text-xs">
                    <span className="text-[#777B63] block text-[10px] uppercase">Low Stock Alerts</span>
                    <span className="font-mono text-base font-semibold text-amber-700 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      {metrics.lowStockCount} Items (≤10)
                    </span>
                  </div>
                  <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 text-xs">
                    <span className="text-[#777B63] block text-[10px] uppercase">Delivered Orders</span>
                    <span className="font-mono text-base font-semibold text-emerald-700">
                      {metrics.deliveredCount} Delivered
                    </span>
                  </div>
                  <div className="bg-[#FAF8F5] border border-[#E4DED4] p-4 text-xs">
                    <span className="text-[#777B63] block text-[10px] uppercase">In Transit</span>
                    <span className="font-mono text-base font-semibold text-indigo-700">
                      {metrics.shippedCount} Shipped
                    </span>
                  </div>
                </div>

                {/* Recent Orders Stream */}
                <div className="bg-white border border-[#E4DED4] p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-serif text-lg text-[#242522]">
                        Recent Client Acquisitions & Orders
                      </h3>
                      <p className="text-xs text-[#777B63]">
                        Real-time order stream from web clients
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs uppercase tracking-wider font-semibold text-[#242522] hover:text-[#777B63] transition-colors"
                    >
                      View All Orders &rarr;
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#FAF8F5] border-y border-[#E4DED4] text-[10px] uppercase tracking-wider text-[#777B63]">
                        <tr>
                          <th className="py-2.5 px-3">Order #</th>
                          <th className="py-2.5 px-3">Client</th>
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Payment</th>
                          <th className="py-2.5 px-3">Dispatch</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E4DED4]">
                        {recentOrders.map((ro) => (
                          <tr key={ro.orderNumber} className="hover:bg-[#FAF8F5] transition-colors">
                            <td className="py-3 px-3 font-mono font-semibold text-[#242522]">
                              {ro.orderNumber}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-medium text-[#242522]">{ro.customerName}</div>
                              <div className="text-[11px] text-[#777B63] font-mono">
                                {ro.customerEmail}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-[#5A5C55]">
                              {formatDate(ro.createdAt)}
                            </td>
                            <td className="py-3 px-3 font-serif font-semibold text-[#242522]">
                              ₹{ro.finalAmount.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3">
                              {ro.paymentStatus === 'Paid' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200 uppercase">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200 uppercase">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  {ro.paymentStatus}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[11px] uppercase font-mono text-[#5A5C55]">
                                {ro.orderStatus}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => setActiveTab('orders')}
                                className="px-2.5 py-1 text-[11px] bg-[#242522] text-[#F8F6F1] hover:bg-[#3A3B37] uppercase tracking-wider"
                              >
                                Audit
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CLIENT REGISTRY & USER DOSSIERS */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#E4DED4] p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg text-[#242522]">
                      Client Registry ({usersList.length})
                    </h3>
                    <p className="text-xs text-[#777B63]">
                      Click any client row to inspect their complete order history, payment records, and address.
                    </p>
                  </div>

                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-[#777B63] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search by name, email, city..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8C6AA] focus:outline-hidden focus:border-[#242522]"
                    />
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white border border-[#E4DED4] shadow-xs overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#E4DED4] text-[10px] uppercase tracking-wider text-[#777B63]">
                      <tr>
                        <th className="py-3 px-4">Client Identity</th>
                        <th className="py-3 px-4">Phone / City</th>
                        <th className="py-3 px-4">Member Since (Kab Se)</th>
                        <th className="py-3 px-4">Total Orders</th>
                        <th className="py-3 px-4">Total Paid Spend</th>
                        <th className="py-3 px-4">Last Order</th>
                        <th className="py-3 px-4 text-right">Dossier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4DED4]">
                      {usersList.map((u) => (
                        <tr
                          key={u.id}
                          onClick={() => setSelectedUserId(u.id)}
                          className="hover:bg-[#F2ECE1] transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#242522] group-hover:text-[#242522] flex items-center gap-2">
                              <span>{u.fullName}</span>
                              {u.email === ADMIN_DESIGNATED_EMAIL && (
                                <span className="px-1.5 py-0.2 bg-[#242522] text-[#D8C6AA] text-[9px] uppercase font-mono">
                                  Director
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#777B63] font-mono">{u.email}</div>
                          </td>
                          <td className="py-3.5 px-4 text-[#5A5C55]">
                            <div>{u.city ? `${u.city}${u.state ? `, ${u.state}` : ''}` : '—'}</div>
                            <div className="text-[11px] text-[#777B63]">{u.phone || '—'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#5A5C55]">
                            {formatDate(u.dateJoined)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-semibold px-2 py-0.5 bg-[#FAF8F5] border border-[#E4DED4] text-[#242522]">
                              {u.totalOrders} Orders
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-serif font-bold text-[#242522]">
                            ₹{u.totalSpent.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-[#5A5C55]">
                            {formatDate(u.lastOrderDate)}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUserId(u.id);
                              }}
                              className="px-3 py-1.5 bg-[#242522] text-[#F8F6F1] text-[11px] uppercase tracking-wider hover:bg-[#3A3B37] transition-colors"
                            >
                              View Dossier
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {usersList.length === 0 && (
                    <div className="p-8 text-center text-xs text-[#777B63]">
                      No client accounts found matching the criteria.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: ORDERS & LOGISTICS */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#E4DED4] p-5 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-lg text-[#242522]">
                        Order Fulfillment & Logistics ({ordersList.length})
                      </h3>
                      <p className="text-xs text-[#777B63]">
                        Manage customer order statuses, payment verification, and dispatch couriers.
                      </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="w-4 h-4 text-[#777B63] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Search order #, customer, city..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8C6AA] focus:outline-hidden focus:border-[#242522]"
                      />
                    </div>
                  </div>

                  {/* Filter Pills */}
                  <div className="flex items-center gap-3 pt-2 border-t border-[#E4DED4] flex-wrap text-xs">
                    <span className="text-[10px] uppercase font-semibold text-[#777B63] flex items-center gap-1">
                      <Filter className="w-3 h-3" /> Filter Dispatch:
                    </span>
                    {['all', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => setOrderStatusFilter(st)}
                          className={`px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors ${
                            orderStatusFilter === st
                              ? 'bg-[#242522] text-[#F8F6F1]'
                              : 'bg-[#FAF8F5] text-[#5A5C55] hover:bg-[#EFE9DF]'
                          }`}
                        >
                          {st === 'all' ? 'All Dispatches' : st}
                        </button>
                      )
                    )}

                    <span className="text-[10px] uppercase font-semibold text-[#777B63] ml-2">
                      Payment:
                    </span>
                    {['all', 'Paid', 'Pending', 'Failed'].map((pay) => (
                      <button
                        key={pay}
                        onClick={() => setOrderPaymentFilter(pay)}
                        className={`px-2.5 py-1 text-[11px] uppercase tracking-wider transition-colors ${
                          orderPaymentFilter === pay
                            ? 'bg-[#242522] text-[#F8F6F1]'
                            : 'bg-[#FAF8F5] text-[#5A5C55] hover:bg-[#EFE9DF]'
                        }`}
                      >
                        {pay === 'all' ? 'All Payments' : pay}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white border border-[#E4DED4] shadow-xs overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#E4DED4] text-[10px] uppercase tracking-wider text-[#777B63]">
                      <tr>
                        <th className="py-3 px-4">Order # & Date</th>
                        <th className="py-3 px-4">Customer & City</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Final Amount</th>
                        <th className="py-3 px-4">Payment</th>
                        <th className="py-3 px-4">Dispatch Status</th>
                        <th className="py-3 px-4">Logistics / Tracking</th>
                        <th className="py-3 px-4 text-right">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4DED4]">
                      {ordersList.map((o) => (
                        <tr key={o.orderNumber} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-[#242522]">{o.orderNumber}</div>
                            <div className="text-[11px] text-[#777B63]">{formatDate(o.createdAt)}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-[#242522]">{o.customerName}</div>
                            <div className="text-[11px] text-[#777B63]">
                              {o.shippingAddress.city}, {o.shippingAddress.state}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#5A5C55]">
                            {o.items.length} piece{o.items.length === 1 ? '' : 's'}
                          </td>
                          <td className="py-3.5 px-4 font-serif font-bold text-[#242522]">
                            ₹{o.finalAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4">
                            {o.paymentStatus === 'Paid' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200 uppercase">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Paid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200 uppercase">
                                <Clock className="w-3 h-3 text-amber-600" />
                                {o.paymentStatus}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {o.orderStatus === 'Shipped' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] uppercase font-medium">
                                <Truck className="w-3 h-3" /> Shipped
                              </span>
                            ) : o.orderStatus === 'Delivered' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#242522] text-[#D8C6AA] text-[10px] uppercase font-medium">
                                Delivered
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] uppercase font-medium">
                                <Package className="w-3 h-3" /> {o.orderStatus}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#5A5C55]">
                            <div>{o.logistics.carrier || 'Unassigned'}</div>
                            <div className="text-[#777B63]">
                              {o.logistics.trackingNumber || 'No tracking yet'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrderForEdit(o)}
                              className="px-3 py-1.5 bg-[#242522] text-[#F8F6F1] text-[11px] uppercase tracking-wider hover:bg-[#3A3B37] transition-colors"
                            >
                              Dispatch / Update
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {ordersList.length === 0 && (
                    <div className="p-8 text-center text-xs text-[#777B63]">
                      No orders found matching the filter criteria.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: CATALOGUE ARCHITECTURE */}
            {activeTab === 'catalogue' && (
              <div className="space-y-6">
                <div className="bg-white border border-[#E4DED4] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-lg text-[#242522]">
                      Catalogue Pieces ({productsList.length})
                    </h3>
                    <p className="text-xs text-[#777B63]">
                      Publish new garments, adjust inventory & pricing, or remove pieces from the live atelier storefront.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-56">
                      <Search className="w-4 h-4 text-[#777B63] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Search piece title, SKU..."
                        className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#D8C6AA] focus:outline-hidden focus:border-[#242522]"
                      />
                    </div>

                    <button
                      onClick={() => {
                        setProductToEdit(null);
                        setProductModalOpen(true);
                      }}
                      className="px-4 py-2 bg-[#242522] text-[#F8F6F1] text-xs uppercase tracking-widest hover:bg-[#3A3B37] transition-colors flex items-center gap-2 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#D8C6AA]" />
                      Add Piece
                    </button>
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-white border border-[#E4DED4] shadow-xs overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] border-b border-[#E4DED4] text-[10px] uppercase tracking-wider text-[#777B63]">
                      <tr>
                        <th className="py-3 px-4">Piece</th>
                        <th className="py-3 px-4">Department / Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E4DED4]">
                      {productsList.map((p) => (
                        <tr key={p.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-3.5 px-4 flex items-center gap-3">
                            <img
                              src={p.primaryImage || (p.images && p.images[0]) || 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'}
                              alt={p.name}
                              className="w-10 h-12 object-cover border border-[#E4DED4] shrink-0"
                            />
                            <div>
                              <div className="font-medium text-[#242522]">{p.name}</div>
                              <div className="text-[11px] font-mono text-[#777B63]">SKU: {p.id}</div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="capitalize font-medium text-[#242522]">
                              {p.gender || 'men'}
                            </span>
                            <div className="text-[11px] text-[#777B63]">
                              {typeof p.category === 'object' ? (p.category as any)?.name : p.category}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-serif font-bold text-[#242522]">
                            ₹{Number(p.price).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            <span
                              className={`${
                                (p.stockQuantity ?? 0) <= 10
                                  ? 'text-amber-700 font-bold'
                                  : 'text-[#242522]'
                              }`}
                            >
                              {p.stockQuantity ?? (p.inStock ? 50 : 0)} in stock
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {p.inStock ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-semibold uppercase">
                                Available
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-semibold uppercase">
                                Out of Stock
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setProductToEdit(p);
                                setProductModalOpen(true);
                              }}
                              className="p-1.5 text-[#5A5C55] hover:text-[#242522] hover:bg-[#FAF8F5] transition-colors"
                              title="Edit piece"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p)}
                              className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 transition-colors"
                              title="Remove piece from catalogue"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {productsList.length === 0 && (
                    <div className="p-8 text-center text-xs text-[#777B63]">
                      No products found matching the criteria.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {selectedUserId && (
          <UserDossierModal
            userId={selectedUserId}
            onClose={() => setSelectedUserId(null)}
            onOpenOrderUpdate={(ord) => {
              setSelectedOrderForEdit(ord);
            }}
          />
        )}

        {selectedOrderForEdit && (
          <OrderStatusModal
            order={selectedOrderForEdit}
            onClose={() => setSelectedOrderForEdit(null)}
            onSuccess={() => {
              loadOrders();
              loadOverview();
            }}
          />
        )}

        {productModalOpen && (
          <ProductFormModal
            product={productToEdit}
            categories={categoriesList}
            onClose={() => setProductModalOpen(false)}
            onSuccess={() => {
              loadCatalogue();
              loadOverview();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
