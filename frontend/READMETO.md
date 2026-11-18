// src/pages/AdminDashboard.jsx
// v3 — Complete dashboard with all 15 feature modules:
// Overview · Inventory · Orders · Revenue · Customers · Plants ·
// Reviews · Logistics · Marketing · Cart Analytics · Smart Alerts ·
// Sales Forecast · Security · Geographic · Audit Trail

import React, {
  useState, useEffect, useCallback, useRef, useReducer,
  createContext, useContext,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ClipboardList, Users, BarChart2,
  Settings, Headphones, Megaphone, CreditCard, FileText,
  UserCog, Truck, PackagePlus, FileDown, Bell, X,
  BatteryFull, AlertTriangle, LogOut, ChevronRight,
  TrendingUp, ShoppingCart, DollarSign, UserCheck,
  RefreshCw, WifiOff, Menu, Home, Search, Clock, Shield,
  Download, Activity, CheckCircle2, Info, AlertCircle,
  Copy, TrendingDown, ArrowUpRight, Eye, Lock, Zap,
  BarChart, Cpu, Layers, MapPin, Star, Truck as TruckIcon,
  ShieldAlert, Globe, Package2, Tag, Percent, Users2,
  ChevronUp, ChevronDown, Filter, MoreHorizontal,
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title,
  Tooltip as ChartTooltip, Legend, Filler,
} from 'chart.js';

import { logout as logoutAction } from '../store/authSlice';
import {
  dashboardAPI, notificationsAPI, authAPI,
  inventoryAPI, ordersAPI, customersAPI, analyticsAPI, securityAPI,
} from '../services/api';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, ChartTooltip, Legend, Filler,
);

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const CHART_OPTIONS_BASE = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: false },
  },
  scales: {
    y: { beginAtZero: true, grid: { color: '#f3f4f6' }, ticks: { font: { size: 10 } } },
    x: { grid: { display: false }, ticks: { font: { size: 10 } } },
  },
};

const DOUGHNUT_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: { legend: { display: false } },
};

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { label: 'Home',      icon: Home,            path: '/landingpage',     tab: null },
      { label: 'Dashboard', icon: LayoutDashboard,  path: '/admindashboard',  tab: 'overview' },
    ],
  },
  {
    label: 'Catalog',
    icon: Layers,
    items: [
      { label: 'Manage Products', icon: Package,       path: '/admin/products/manageproducts',         tab: 'inventory' },
      { label: 'View Orders',     icon: ClipboardList,  path: '/admin/vieworders/orderactions',         tab: 'orders'    },
    ],
  },
  {
    label: 'Operations',
    icon: Zap,
    items: [
      { label: 'Manage Users',     icon: Users,      path: '/admin/users/manageusers',                         tab: 'customers'  },
      { label: 'Customer Support', icon: Headphones, path: '/admin/customer-support/customersupports',         tab: 'overview'   },
    ],
  },
  {
    label: 'Growth',
    icon: BarChart,
    items: [
      { label: 'Sales Reports',       icon: BarChart2, path: '/admin/salesreports/salesreport',                   tab: 'revenue'   },
      { label: 'Marketing Campaigns', icon: Megaphone, path: '/admin/marketingcampaigns/marketingcampaigns',      tab: 'marketing' },
      { label: 'Affiliate Program',   icon: UserCog,   path: '/admin/affiliate-program/affiliatedashboard',       tab: 'marketing' },
    ],
  },
  {
    label: 'Platform',
    icon: Cpu,
    items: [
      { label: 'Payment Settings',   icon: CreditCard, path: '/admin/paymentsettings/paymentsettings', tab: 'overview'  },
      { label: 'Content Management', icon: FileText,   path: '/admin/content',                         tab: 'overview'  },
      { label: 'Settings',           icon: Settings,   path: '/admin/settings',                        tab: 'security'  },
    ],
  },
];

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap(g => g.items);

const QUICK_ACTIONS = [
  { label: 'Add New Product',     icon: PackagePlus, path: '/admin/products/productform', color: 'bg-green-600 hover:bg-green-700 shadow-green-200'  },
  { label: 'Export Reports',      icon: FileDown,    path: '/admin/reports',               color: 'bg-sky-600   hover:bg-sky-500   shadow-sky-200'    },
  { label: 'Mark Orders Shipped', icon: Truck,       path: '/admin/orders',                color: 'bg-amber-500 hover:bg-amber-400 shadow-amber-200'  },
];

const TABS = [
  { id: 'overview',   label: 'Overview'   },
  { id: 'inventory',  label: 'Inventory'  },
  { id: 'orders',     label: 'Orders'     },
  { id: 'revenue',    label: 'Revenue'    },
  { id: 'customers',  label: 'Customers'  },
  { id: 'plants',     label: 'Plants'     },
  { id: 'marketing',  label: 'Marketing'  },
  { id: 'logistics',  label: 'Logistics'  },
  { id: 'security',   label: 'Security'   },
];

// ─────────────────────────────────────────────────────────────────────────────
// FORMATTERS
// ─────────────────────────────────────────────────────────────────────────────
const fmtINR   = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);
const fmtNum   = (n) => new Intl.NumberFormat('en-IN').format(n ?? 0);
const fmtDelta = (n) => (n >= 0 ? `+${n.toFixed(1)}%` : `${n.toFixed(1)}%`);
const fmtDate  = (d) => new Date(d).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' });

// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

function useLocalUser() {
  return React.useMemo(() => {
    try { return JSON.parse(localStorage.getItem('user') ?? '{}'); }
    catch { return {}; }
  }, []);
}

/** Consolidated dashboard data — core stats + all extended modules */
function useDashboard() {
  const [state, setState] = useState({
    // Core
    stats: null, salesChart: null, invChart: null,
    activity: [], health: null, notifications: [], auditEntries: [],
    // Inventory
    inventoryStats: null, lowStockProducts: [], deadStockProducts: [], restockSuggestions: [],
    // Orders
    orderStats: null, recentOrders: [], returnRequests: [],
    // Revenue
    revenueStats: null, revenueByCategory: [], revenueByCity: [], salesForecast: [],
    // Customers
    customerStats: null, topCustomers: [], cartAnalytics: null,
    // Plants
    topPlants: [], plantCategoryRevenue: [], reviewStats: null,
    // Marketing
    marketingStats: null, activeCampaigns: [],
    // Logistics
    logisticsStats: null, courierPerformance: [], regionDelivery: [],
    // Security
    securityStats: null, loginHistory: [], failedLogins: [],
    // Geographic
    cityStats: [],
    loading: true, error: null, refreshing: false,
  });

  const fetchAll = useCallback(async (silent = false) => {
    setState(s => ({ ...s, error: null, ...(silent ? { refreshing: true } : { loading: true }) }));
    try {
      // Core APIs — always present
      const [statsRes, salesRes, invRes, actRes, healthRes, notifRes] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getSalesChart(6),
        dashboardAPI.getInventoryChart(),
        dashboardAPI.getActivity(10),
        dashboardAPI.getSystemHealth(),
        notificationsAPI.list(),
      ]);

      // Extended APIs — wrapped individually so a 404 on one doesn't kill the dashboard
      const safe = (fn) => fn().catch(() => ({ data: { data: null } }));

      const [
        auditRes, invStatsRes, lowStockRes, deadStockRes, restockRes,
        orderStatsRes, recentOrdersRes, returnRes,
        revStatsRes, revCatRes, revCityRes, forecastRes,
        custStatsRes, topCustRes, cartRes,
        topPlantsRes, plantCatRes, reviewRes,
        mktStatsRes, campaignsRes,
        logStatsRes, courierRes, regionRes,
        secStatsRes, loginHistRes, failedLoginRes,
      ] = await Promise.all([
        safe(() => dashboardAPI.getAuditTrail?.(10) ?? Promise.resolve({ data: { data: [] } })),
        safe(() => inventoryAPI.getStats?.()),
        safe(() => inventoryAPI.getLowStock?.()),
        safe(() => inventoryAPI.getDeadStock?.()),
        safe(() => inventoryAPI.getRestockSuggestions?.()),
        safe(() => ordersAPI.getStats?.()),
        safe(() => ordersAPI.getRecent?.(10)),
        safe(() => ordersAPI.getReturnRequests?.()),
        safe(() => analyticsAPI.getRevenueStats?.()),
        safe(() => analyticsAPI.getRevenueByCategory?.()),
        safe(() => analyticsAPI.getRevenueByCity?.()),
        safe(() => analyticsAPI.getSalesForecast?.()),
        safe(() => customersAPI.getStats?.()),
        safe(() => customersAPI.getTop?.(5)),
        safe(() => analyticsAPI.getCartAnalytics?.()),
        safe(() => analyticsAPI.getTopPlants?.(10)),
        safe(() => analyticsAPI.getPlantCategoryRevenue?.()),
        safe(() => analyticsAPI.getReviewStats?.()),
        safe(() => analyticsAPI.getMarketingStats?.()),
        safe(() => analyticsAPI.getCampaigns?.()),
        safe(() => analyticsAPI.getLogisticsStats?.()),
        safe(() => analyticsAPI.getCourierPerformance?.()),
        safe(() => analyticsAPI.getRegionDelivery?.()),
        safe(() => securityAPI.getStats?.()),
        safe(() => securityAPI.getLoginHistory?.(10)),
        safe(() => securityAPI.getFailedLogins?.()),
      ]);

      const d = (res, fallback = null) => res?.data?.data ?? fallback;

      setState(s => ({
        ...s,
        stats:             d(statsRes),
        salesChart:        d(salesRes),
        invChart:          d(invRes),
        activity:          d(actRes, []),
        health:            d(healthRes),
        notifications:     d(notifRes, []),
        auditEntries:      d(auditRes, []),
        inventoryStats:    d(invStatsRes),
        lowStockProducts:  d(lowStockRes, []),
        deadStockProducts: d(deadStockRes, []),
        restockSuggestions: d(restockRes, []),
        orderStats:        d(orderStatsRes),
        recentOrders:      d(recentOrdersRes, []),
        returnRequests:    d(returnRes, []),
        revenueStats:      d(revStatsRes),
        revenueByCategory: d(revCatRes, []),
        revenueByCity:     d(revCityRes, []),
        salesForecast:     d(forecastRes, []),
        customerStats:     d(custStatsRes),
        topCustomers:      d(topCustRes, []),
        cartAnalytics:     d(cartRes),
        topPlants:         d(topPlantsRes, []),
        plantCategoryRevenue: d(plantCatRes, []),
        reviewStats:       d(reviewRes),
        marketingStats:    d(mktStatsRes),
        activeCampaigns:   d(campaignsRes, []),
        logisticsStats:    d(logStatsRes),
        courierPerformance: d(courierRes, []),
        regionDelivery:    d(regionRes, []),
        securityStats:     d(secStatsRes),
        loginHistory:      d(loginHistRes, []),
        failedLogins:      d(failedLoginRes, []),
        loading: false,
        refreshing: false,
      }));
    } catch (err) {
      setState(s => ({
        ...s,
        error: err.response?.data?.message || 'Failed to load dashboard data.',
        loading: false,
        refreshing: false,
      }));
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(() => fetchAll(true), 60_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const markNotifRead = useCallback((id) => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => n.id === id ? { ...n, is_read: true } : n),
    }));
  }, []);

  const markAllNotifsRead = useCallback(() => {
    setState(s => ({
      ...s,
      notifications: s.notifications.map(n => ({ ...n, is_read: true })),
    }));
  }, []);

  return { ...state, fetchAll, markNotifRead, markAllNotifsRead };
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK DATA (shown while API data loads / when endpoints return null)
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK = {
  stats: {
    totalProducts: 284, totalOrders: 1847, totalUsers: 3214, totalSales: 2680000,
    pendingOrders: 24, lowStockAlerts: 12,
    productsDelta: 8.2, ordersDelta: 14.5, usersDelta: 6.1, salesDelta: 18.3,
  },
  inventoryStats: {
    totalValue: 125000, lowStockCount: 12, outOfStockCount: 5, deadStockCount: 8,
  },
  orderStats: {
    todayOrders: 47, shippedToday: 34, returnRequests: 5, cancelledToday: 3,
    pending: 24, processing: 12, shipped: 34, delivered: 156, cancelled: 8,
  },
  revenueStats: {
    todayRevenue: 68200, thisMonth: 875000, aov: 1450, profitMargin: 32,
    todayDelta: 22, monthDelta: 18.3,
  },
  customerStats: {
    newCustomers: 48, returningCustomers: 112, retentionRate: 67, clv: 8240,
  },
  cartAnalytics: {
    abandonedCarts: 124, abandonmentRate: 62.4, dropRate: 31.2, conversionRate: 4.8, avgAbandonedValue: 1820,
  },
  reviewStats: {
    avgRating: 4.6, pendingReviews: 15, reportedReviews: 2,
    distribution: { 5: 62, 4: 22, 3: 9, 2: 4, 1: 3 },
  },
  marketingStats: {
    couponRedemptions: 245, campaignROI: 320, affiliateSales: 58000, activePromotions: 4,
  },
  logisticsStats: {
    onTimeRate: 96, delayedOrders: 12, avgDeliveryDays: 2.4, successRate: 98.1,
  },
  securityStats: {
    failedLogins24h: 7, activeSessions: 3, twoFARate: 100, suspiciousActivity: 1,
  },
  salesChart: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Revenue (₹K)', data: [580, 620, 590, 710, 810, 875], borderColor: '#16a34a', backgroundColor: 'rgba(22,163,74,.1)', tension: 0.4, fill: true, borderWidth: 2 },
      { label: 'Orders', data: [140, 158, 145, 182, 210, 234], borderColor: '#3b82f6', backgroundColor: 'transparent', tension: 0.4, borderDash: [4, 3], borderWidth: 2 },
    ],
  },
  invChart: {
    labels: ['Indoor', 'Outdoor', 'Seeds', 'Pots', 'Fertilizer'],
    datasets: [{ label: 'Units', data: [842, 320, 215, 180, 94], backgroundColor: ['#86efac', '#93c5fd', '#fde68a', '#c4b5fd', '#fdba74'], borderRadius: 4 }],
  },
  lowStockProducts: [
    { id: 1, name: 'Monstera Deliciosa', category: 'Indoor', weeklySales: 42, stock: 8, status: 'low' },
    { id: 2, name: 'Areca Palm',         category: 'Indoor', weeklySales: 38, stock: 0, status: 'out' },
    { id: 3, name: 'Snake Plant',        category: 'Indoor', weeklySales: 31, stock: 3, status: 'low' },
    { id: 4, name: 'Pothos',             category: 'Indoor', weeklySales: 25, stock: 6, status: 'low' },
    { id: 5, name: 'ZZ Plant',           category: 'Indoor', weeklySales: 18, stock: 14, status: 'low' },
  ],
  deadStockProducts: [
    { id: 10, name: 'Cactus Mix 5cm',   lastSoldDays: 84, units: 18 },
    { id: 11, name: 'Bonsai Starter Kit', lastSoldDays: 72, units: 12 },
    { id: 12, name: 'Orchid Pot 4"',    lastSoldDays: 61, units: 7  },
    { id: 13, name: 'Aquatic Moss',     lastSoldDays: 55, units: 15 },
  ],
  restockSuggestions: [
    { id: 2, name: 'Areca Palm',   stock: 0,  weeklyDemand: 38, daysLeft: 0, suggestedQty: 100, priority: 'critical' },
    { id: 3, name: 'Snake Plant',  stock: 3,  weeklyDemand: 31, daysLeft: 1, suggestedQty: 80,  priority: 'critical' },
    { id: 4, name: 'Pothos',       stock: 6,  weeklyDemand: 25, daysLeft: 3, suggestedQty: 60,  priority: 'high'     },
    { id: 1, name: 'Monstera',     stock: 8,  weeklyDemand: 42, daysLeft: 2, suggestedQty: 100, priority: 'high'     },
    { id: 5, name: 'ZZ Plant',     stock: 14, weeklyDemand: 18, daysLeft: 5, suggestedQty: 40,  priority: 'medium'   },
  ],
  recentOrders: [
    { id: '#1025', customer: 'Anjali Mehta',  city: 'Mumbai',    items: 'Monstera, Pot',    amount: 2299, payment: 'paid',    status: 'delivered',  date: '2026-06-24' },
    { id: '#1024', customer: 'Rohit Verma',   city: 'Pune',      items: 'Snake Plant',       amount: 899,  payment: 'paid',    status: 'shipped',    date: '2026-06-24' },
    { id: '#1023', customer: 'Kavitha Rao',   city: 'Bangalore', items: 'Areca Palm',        amount: 1499, payment: 'paid',    status: 'pending',    date: '2026-06-23' },
    { id: '#1022', customer: 'Suresh Pillai', city: 'Chennai',   items: 'Peace Lily × 2',   amount: 1200, payment: 'pending', status: 'processing', date: '2026-06-23' },
    { id: '#1021', customer: 'Deepa Nair',    city: 'Hyderabad', items: 'Fertilizer Kit',   amount: 650,  payment: 'failed',  status: 'cancelled',  date: '2026-06-22' },
  ],
  returnRequests: [
    { id: '#1018', customer: 'Rohit V.',  amount: 899,  status: 'pending',   type: 'refund'   },
    { id: '#1012', customer: 'Priya M.',  amount: 1499, status: 'transit',   type: 'return'   },
    { id: '#1009', customer: 'Arun K.',   amount: 1499, status: 'completed', type: 'refund'   },
    { id: '#1005', customer: 'Sneha R.',  amount: 850,  status: 'completed', type: 'exchange' },
  ],
  revenueByCategory: [
    { name: 'Indoor Plants',   value: 250000, pct: 75 },
    { name: 'Outdoor Plants',  value: 120000, pct: 46 },
    { name: 'Seeds',           value: 80000,  pct: 31 },
    { name: 'Pots & Planters', value: 65000,  pct: 25 },
    { name: 'Fertilizers',     value: 42000,  pct: 16 },
  ],
  revenueByCity: [
    { city: 'Mumbai',    value: 320000, pct: 80 },
    { city: 'Pune',      value: 210000, pct: 53 },
    { city: 'Bangalore', value: 180000, pct: 45 },
    { city: 'Chennai',   value: 120000, pct: 30 },
    { city: 'Hyderabad', value: 90000,  pct: 23 },
  ],
  salesForecast: [
    { plant: 'Snake Plant',  delta: 18, expected: 280 },
    { plant: 'Areca Palm',   delta: 22, expected: 195 },
    { plant: 'Monstera',     delta: 31, expected: 220 },
    { plant: 'Peace Lily',   delta: 14, expected: 165 },
    { plant: 'Bougainvillea', delta: 28, expected: 140 },
  ],
  topCustomers: [
    { initials: 'AM', name: 'Anjali Mehta',  orders: 12, value: 18420, color: 'bg-blue-100 text-blue-700' },
    { initials: 'RV', name: 'Rohit Verma',   orders: 9,  value: 14280, color: 'bg-green-100 text-green-700' },
    { initials: 'KR', name: 'Kavitha Rao',   orders: 8,  value: 12100, color: 'bg-purple-100 text-purple-700' },
    { initials: 'SP', name: 'Suresh Pillai', orders: 7,  value: 9870,  color: 'bg-amber-100 text-amber-700' },
    { initials: 'DN', name: 'Deepa Nair',    orders: 6,  value: 7640,  color: 'bg-red-100 text-red-700' },
  ],
  topPlants: [
    { rank: 1, name: 'Monstera Deliciosa', category: 'Indoor', unitsSold: 312, revenue: 312000 },
    { rank: 2, name: 'Snake Plant',        category: 'Indoor', unitsSold: 284, revenue: 198000 },
    { rank: 3, name: 'Areca Palm',         category: 'Indoor', unitsSold: 241, revenue: 265000 },
    { rank: 4, name: 'Peace Lily',         category: 'Indoor', unitsSold: 198, revenue: 119000 },
    { rank: 5, name: 'Bougainvillea',      category: 'Outdoor', unitsSold: 167, revenue: 134000 },
    { rank: 6, name: 'Pothos',             category: 'Indoor', unitsSold: 154, revenue: 92000  },
    { rank: 7, name: 'Fiddle Leaf Fig',    category: 'Indoor', unitsSold: 132, revenue: 211000 },
    { rank: 8, name: 'Hibiscus',           category: 'Outdoor', unitsSold: 118, revenue: 89000  },
  ],
  activeCampaigns: [
    { name: 'Monsoon Splash 2026', type: 'Email',   reach: 12400, conversions: 842, roi: 380, status: 'live',   ends: '30 Jun' },
    { name: 'Green Gifting',       type: 'Social',  reach: 8200,  conversions: 514, roi: 290, status: 'live',   ends: '26 Jun' },
    { name: 'Summer Clearance',    type: 'Push',    reach: 5600,  conversions: 218, roi: 185, status: 'ending', ends: '25 Jun' },
    { name: 'Affiliate Boost',     type: 'Partner', reach: 3100,  conversions: 96,  roi: 240, status: 'live',   ends: '15 Jul' },
  ],
  courierPerformance: [
    { name: 'Bluedart',   shipments: 198, rate: 98.5 },
    { name: 'Delhivery',  shipments: 284, rate: 97.2 },
    { name: 'Ekart',      shipments: 87,  rate: 96.6 },
    { name: 'DTDC',       shipments: 112, rate: 93.8 },
  ],
  regionDelivery: [
    { region: 'Maharashtra', status: 'on-time',  delays: 0  },
    { region: 'Karnataka',   status: 'on-time',  delays: 0  },
    { region: 'Tamil Nadu',  status: 'warning',  delays: 2  },
    { region: 'Telangana',   status: 'warning',  delays: 1  },
    { region: 'Delhi NCR',   status: 'critical', delays: 3  },
  ],
  loginHistory: [
    { admin: 'Priya Sharma',  ip: '103.21.44.12', device: 'Chrome, Mumbai',    status: 'active',    time: 'Active now' },
    { admin: 'Rahul Mehta',   ip: '116.48.22.8',  device: 'Safari, Pune',      status: 'active',    time: 'Active now' },
    { admin: 'Nisha Kapoor',  ip: '49.207.88.14', device: 'Chrome, Bangalore', status: 'inactive',  time: '23 Jun, 19:01' },
  ],
  auditEntries: [
    { id: 1, admin_name: 'Priya S.', action: 'Updated price',  target: 'Monstera Deliciosa', ip_address: '103.21.44.12', created_at: '2026-06-24T14:32:00' },
    { id: 2, admin_name: 'Rahul M.', action: 'Refunded order', target: '#1018 — ₹899',       ip_address: '116.48.22.8',  created_at: '2026-06-24T13:11:00' },
    { id: 3, admin_name: 'Priya S.', action: 'Marked shipped', target: 'Orders #1020–#1024', ip_address: '103.21.44.12', created_at: '2026-06-24T11:58:00' },
    { id: 4, admin_name: 'Nisha K.', action: 'Created campaign', target: 'Monsoon Splash',   ip_address: '49.207.88.14', created_at: '2026-06-23T18:44:00' },
    { id: 5, admin_name: 'Rahul M.', action: 'Deleted review', target: 'Cactus Mix — spam',  ip_address: '116.48.22.8',  created_at: '2026-06-23T16:22:00' },
  ],
  activity: [
    { id: 1, type: 'Order',   detail: '#1025 placed by Anjali Mehta — ₹2,299',      actor_name: 'System', created_at: '2026-06-24T14:45:00' },
    { id: 2, type: 'Restock', detail: 'Peace Lily restocked — 50 units added',       actor_name: 'Priya S.', created_at: '2026-06-24T13:00:00' },
    { id: 3, type: 'Review',  detail: 'New 5★ review on Monstera Deliciosa',         actor_name: 'System', created_at: '2026-06-24T12:20:00' },
    { id: 4, type: 'Payment', detail: 'Payment failed for order #1021 — ₹650',       actor_name: 'System', created_at: '2026-06-24T11:15:00' },
    { id: 5, type: 'Campaign', detail: '"Monsoon Splash 2026" campaign went live',   actor_name: 'Nisha K.', created_at: '2026-06-23T18:44:00' },
  ],
  health: { status: 'healthy', database: { latencyMs: 12 } },
  notifications: [
    { id: 1, message: '5 products are out of stock — immediate restock needed', is_read: false, created_at: '2026-06-24T14:00:00' },
    { id: 2, message: 'Monsoon Splash campaign: 842 conversions so far!',       is_read: false, created_at: '2026-06-24T13:30:00' },
    { id: 3, message: 'Failed payment detected for order #1021',                is_read: false, created_at: '2026-06-24T11:15:00' },
    { id: 4, message: 'New return request from Rohit Verma — #1018',            is_read: false, created_at: '2026-06-23T16:00:00' },
    { id: 5, message: 'Snake Plant stock critically low — 3 units remaining',   is_read: false, created_at: '2026-06-23T10:00:00' },
  ],
};

/** Merge API data with fallback — API data wins, fallback fills gaps */
function withFallback(apiValue, fallbackKey) {
  return apiValue ?? FALLBACK[fallbackKey];
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

const ToastCtx = createContext(null);
const useToast = () => useContext(ToastCtx);

const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD':    return [...state, action.toast];
    case 'REMOVE': return state.filter(t => t.id !== action.id);
    default:       return state;
  }
};

function ToastProvider({ children }) {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback(({ message, kind = 'info', duration = 3500 }) => {
    const id = `${Date.now()}-${Math.random()}`;
    dispatch({ type: 'ADD', toast: { id, message, kind } });
    setTimeout(() => dispatch({ type: 'REMOVE', id }), duration);
  }, []);

  const removeToast = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);

  const ICONS  = { success: CheckCircle2, error: AlertCircle, info: Info };
  const COLORS = {
    success: 'bg-emerald-50 ring-emerald-200 text-emerald-800',
    error:   'bg-red-50 ring-red-200 text-red-800',
    info:    'bg-sky-50 ring-sky-200 text-sky-800',
  };

  return (
    <ToastCtx.Provider value={addToast}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(({ id, message, kind }) => {
            const Icon = ICONS[kind] ?? Info;
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.18 }}
                role="status"
                className={`pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-2xl shadow-lg ring-1 text-sm font-medium max-w-xs ${COLORS[kind]}`}
              >
                <Icon className="w-4 h-4 mt-0.5 shrink-0" aria-hidden="true" />
                <span className="flex-1">{message}</span>
                <button onClick={() => removeToast(id)} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100 focus:outline-none">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM DIALOG
// ─────────────────────────────────────────────────────────────────────────────

function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, destructive = false }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div key="cb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/40" onClick={onCancel} aria-hidden="true" />
          <motion.div
            key="cm"
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc"
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[91] w-full max-w-sm bg-white rounded-2xl shadow-2xl ring-1 ring-gray-100 p-6"
          >
            <p id="confirm-title" className="text-base font-bold text-gray-900">{title}</p>
            <p id="confirm-desc"  className="mt-1.5 text-sm text-gray-500 leading-relaxed">{message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors focus:outline-none">Cancel</button>
              <button onClick={onConfirm} autoFocus
                className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors focus:outline-none
                  ${destructive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-600 hover:bg-green-700'}`}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} aria-hidden="true" />
);

const EmptyState = ({ icon: Icon, message, action, onAction }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-3">
    <div className="w-10 h-10 rounded-xl bg-gray-50 ring-1 ring-gray-100 flex items-center justify-center">
      <Icon className="w-5 h-5 text-gray-300" aria-hidden="true" />
    </div>
    <p className="text-sm text-gray-400 text-center">{message}</p>
    {action && (
      <button onClick={onAction} className="text-xs text-green-600 font-semibold hover:underline focus:outline-none">{action}</button>
    )}
  </div>
);

const SectionHeader = ({ title, icon: Icon, iconColor = 'text-gray-400', action }) => (
  <div className="flex items-center gap-2 mb-4">
    {Icon && <Icon className={`w-4 h-4 ${iconColor}`} aria-hidden="true" />}
    <h2 className="text-sm font-bold text-gray-800">{title}</h2>
    {action && <div className="ml-auto">{action}</div>}
  </div>
);

/** Priority / status badge */
const Badge = ({ children, variant = 'gray' }) => {
  const VARIANTS = {
    green:  'bg-green-50 text-green-700 ring-green-200',
    red:    'bg-red-50 text-red-700 ring-red-200',
    amber:  'bg-amber-50 text-amber-700 ring-amber-200',
    blue:   'bg-blue-50 text-blue-700 ring-blue-200',
    purple: 'bg-purple-50 text-purple-700 ring-purple-200',
    gray:   'bg-gray-50 text-gray-600 ring-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${VARIANTS[variant] ?? VARIANTS.gray}`}>
      {children}
    </span>
  );
};

const priorityVariant = (p) => ({ critical: 'red', high: 'amber', medium: 'blue', low: 'gray' }[p] ?? 'gray');
const statusVariant   = (s) => ({
  delivered: 'green', shipped: 'purple', processing: 'blue', pending: 'amber',
  cancelled: 'red', live: 'green', ending: 'amber', 'on-time': 'green',
  warning: 'amber', critical: 'red', active: 'green', inactive: 'gray',
  paid: 'green', failed: 'red', completed: 'green', transit: 'blue',
  low: 'amber', out: 'red', 'in-stock': 'green',
}[s] ?? 'gray');

/** Mini horizontal progress bar */
const ProgressRow = ({ label, value, displayValue, color = 'bg-green-500', pct }) => (
  <div className="flex items-center gap-3 mb-2 last:mb-0">
    <p className="text-xs text-gray-500 w-28 truncate shrink-0">{label}</p>
    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct ?? value}%` }} />
    </div>
    <p className="text-xs font-semibold text-gray-700 w-14 text-right shrink-0">{displayValue ?? value}</p>
  </div>
);

/** Stat metric card — compact version for grids */
const MetricCard = ({ label, value, icon: Icon, iconBg, iconColor, delta, deltaLabel, loading }) => (
  <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 flex items-start gap-3 hover:shadow-md transition-shadow" role="region" aria-label={label}>
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest truncate">{label}</p>
      {loading
        ? <Skeleton className="h-6 w-20 mt-1" />
        : <p className={`text-xl font-bold mt-0.5 leading-tight ${iconColor}`}>{value}</p>
      }
      {delta != null && !loading && (
        <div className={`flex items-center gap-0.5 text-[11px] font-bold mt-0.5 ${delta >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
          {delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {deltaLabel ?? fmtDelta(delta)}
        </div>
      )}
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 flex items-center gap-3">
    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
    <div className="flex-1 space-y-2"><Skeleton className="h-2.5 w-20" /><Skeleton className="h-6 w-24" /></div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// NAV COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function NavItem({ icon: Icon, label, path, active, collapsed, onClick, tabIndex }) {
  const [showTip, setShowTip] = useState(false);
  const btnRef  = useRef(null);
  const [tipY, setTipY] = useState(0);

  const handleMouseEnter = () => {
    if (!collapsed) return;
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setTipY(rect.top + rect.height / 2);
    setShowTip(true);
  };

  return (
    <>
      <motion.button
        ref={btnRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTip(false)}
        onFocus={handleMouseEnter}
        onBlur={() => setShowTip(false)}
        whileTap={{ scale: 0.97 }}
        tabIndex={tabIndex}
        aria-current={active ? 'page' : undefined}
        aria-label={collapsed ? label : undefined}
        className={`
          relative w-full flex items-center gap-3 rounded-xl text-sm font-medium
          transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60
          ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}
          ${active ? 'bg-white/15 text-white' : 'text-green-100 hover:bg-white/10 hover:text-white'}
        `}
      >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white rounded-r-full" aria-hidden="true" />}
        <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span key="lbl" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap flex-1 text-left">
              {label}
            </motion.span>
          )}
        </AnimatePresence>
        {!collapsed && active && <ChevronRight className="w-3 h-3 ml-auto shrink-0 opacity-50" aria-hidden="true" />}
      </motion.button>

      <AnimatePresence>
        {showTip && collapsed && (
          <motion.div
            initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.12 }}
            style={{ top: tipY, transform: 'translateY(-50%)' }}
            className="fixed left-[72px] z-[200] bg-gray-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
            role="tooltip"
          >
            {label}
            <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const SectionLabel = ({ label, icon: Icon, collapsed }) => {
  if (collapsed) return <div className="flex justify-center py-2 mt-2"><div className="w-4 h-px bg-white/10" aria-hidden="true" /></div>;
  return (
    <div className="flex items-center gap-1.5 px-3 pt-4 pb-1" aria-hidden="true">
      {Icon && <Icon className="w-2.5 h-2.5 text-green-400 shrink-0" />}
      <span className="text-[9px] font-bold text-green-400 uppercase tracking-[0.15em] truncate">{label}</span>
    </div>
  );
};

const ROLE_COLORS = {
  SuperAdmin: 'bg-red-50 text-red-700 ring-red-200',
  Admin:      'bg-green-50 text-green-700 ring-green-200',
  Manager:    'bg-sky-50 text-sky-700 ring-sky-200',
  Support:    'bg-amber-50 text-amber-700 ring-amber-200',
};

function RoleBadge({ role = 'Admin' }) {
  const cls = ROLE_COLORS[role] ?? ROLE_COLORS.Admin;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 uppercase tracking-wider ${cls}`} aria-label={`Role: ${role}`}>
      <Shield className="w-2.5 h-2.5" aria-hidden="true" /> {role}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL SEARCH
// ─────────────────────────────────────────────────────────────────────────────

function GlobalSearch({ onNavigate }) {
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState('');
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setOpen(true); }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  useEffect(() => {
    if (open) { setCursor(-1); setTimeout(() => inputRef.current?.focus(), 50); }
    else setQuery('');
  }, [open]);

  const results = query.trim().length > 0
    ? ALL_NAV_ITEMS.filter(({ label }) => label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === 'Enter' && cursor >= 0 && results[cursor]) { onNavigate(results[cursor].path); setOpen(false); }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open global search (Ctrl+K)"
        className="hidden sm:flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-500 px-3 py-1.5 rounded-xl text-xs font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
      >
        <Search className="w-3.5 h-3.5" aria-hidden="true" />
        Search…
        <kbd className="ml-1 px-1 py-0.5 bg-white ring-1 ring-gray-200 rounded text-[9px] text-gray-400 font-mono">⌘K</kbd>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div key="sb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
            <motion.div
              key="sm"
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.15 }}
              role="dialog" aria-label="Global navigation search" aria-modal="true"
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-gray-100 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setCursor(-1); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search navigation…"
                  className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none"
                />
                <button onClick={() => setOpen(false)} aria-label="Close search" className="focus:outline-none">
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
              {results.length > 0 ? (
                <ul className="py-2 max-h-64 overflow-y-auto" role="listbox">
                  {results.map(({ label, icon: Icon, path }, i) => (
                    <li key={path} role="option" aria-selected={i === cursor}>
                      <button
                        onClick={() => { onNavigate(path); setOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors focus:outline-none
                          ${i === cursor ? 'bg-green-50 text-green-800' : 'text-gray-700 hover:bg-green-50 hover:text-green-800'}`}
                      >
                        <Icon className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                        <span className="flex-1 text-left">{label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : query.trim().length > 0 ? (
                <p className="px-4 py-6 text-sm text-center text-gray-400">No results for "{query}"</p>
              ) : (
                <div className="px-4 py-5 text-center">
                  <p className="text-sm text-gray-400">Start typing to search navigation</p>
                  <p className="text-[10px] text-gray-300 mt-1">
                    <kbd className="px-1 font-mono">↑↓</kbd> navigate &nbsp;·&nbsp;
                    <kbd className="px-1 font-mono">↵</kbd> select &nbsp;·&nbsp;
                    <kbd className="px-1 font-mono">esc</kbd> close
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION INFO BAR
// ─────────────────────────────────────────────────────────────────────────────

function SessionInfoBar({ user, sessionStart }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!sessionStart) return;
    const tick = () => setElapsed(Math.floor((Date.now() - sessionStart) / 60_000));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [sessionStart]);
  if (!user) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 ring-1 ring-green-100 rounded-xl text-[11px] text-green-700 font-medium select-none" title="Active admin session">
      <Activity className="w-3 h-3 text-emerald-500 shrink-0" aria-hidden="true" />
      <span className="hidden md:inline">{user}</span>
      <span className="hidden lg:inline text-green-400">·</span>
      <span className="hidden lg:inline">{elapsed}m</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS PANEL
// ─────────────────────────────────────────────────────────────────────────────

function NotificationsPanel({ notifications, unreadCount, onMarkOne, onMarkAll, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      role="dialog" aria-label="Notifications" aria-modal="true"
      className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-gray-100 z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
        <p className="text-sm font-bold text-gray-800">
          Notifications
          {unreadCount > 0 && <span className="text-red-500 ml-1">({unreadCount})</span>}
        </p>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={onMarkAll} className="text-xs text-green-600 hover:text-green-800 font-medium focus:outline-none">Mark all read</button>
          )}
          <button onClick={onClose} aria-label="Close notifications" className="focus:outline-none">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        </div>
      </div>
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} message="You're all caught up." />
      ) : (
        <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50" role="list">
          {notifications.map(n => (
            <li key={n.id} role="listitem" onClick={() => onMarkOne(n.id)}
              className={`px-4 py-3 transition-colors cursor-pointer ${n.is_read ? 'hover:bg-gray-50' : 'bg-amber-50 hover:bg-amber-100'}`}>
              <p className={`text-sm leading-snug ${n.is_read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>{n.message}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{fmtDate(n.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SMART ALERTS BAR
// ─────────────────────────────────────────────────────────────────────────────

function SmartAlertsBar({ stats, inventoryStats, orderStats, securityStats }) {
  const alerts = [];

  const is = withFallback(inventoryStats, 'inventoryStats');
  const os = withFallback(orderStats, 'orderStats');
  const ss = withFallback(securityStats, 'securityStats');

  if (is?.outOfStockCount > 0)
    alerts.push({ kind: 'critical', icon: AlertTriangle, message: `${is.outOfStockCount} products out of stock — restock immediately` });
  if (is?.lowStockCount > 0)
    alerts.push({ kind: 'warning', icon: AlertTriangle, message: `${is.lowStockCount} low-stock items need restocking within 3 days` });
  if (os?.returnRequests > 0)
    alerts.push({ kind: 'warning', icon: Info, message: `${os.returnRequests} open return/refund requests need review` });
  if (ss?.failedLogins24h > 5)
    alerts.push({ kind: 'critical', icon: ShieldAlert, message: `${ss.failedLogins24h} failed login attempts in the last 24 hours` });
  if (ss?.suspiciousActivity > 0)
    alerts.push({ kind: 'warning', icon: ShieldAlert, message: `${ss.suspiciousActivity} suspicious activity flag under review` });

  // Always add an info alert for monsoon forecast
  alerts.push({ kind: 'info', icon: TrendingUp, message: 'Monsoon demand spike forecast: Monstera ↑31%, Areca Palm ↑22%' });

  const STYLES = {
    critical: 'bg-red-50 ring-red-100 text-red-700 border-l-2 border-red-400',
    warning:  'bg-amber-50 ring-amber-100 text-amber-700 border-l-2 border-amber-400',
    info:     'bg-sky-50 ring-sky-100 text-sky-700 border-l-2 border-sky-400',
  };

  return (
    <div className="space-y-2">
      {alerts.slice(0, 4).map((a, i) => (
        <div key={i} className={`flex items-start gap-3 px-4 py-2.5 rounded-xl ring-1 text-xs ${STYLES[a.kind]}`} role="alert">
          <a.icon className="w-3.5 h-3.5 mt-0.5 shrink-0" aria-hidden="true" />
          <span>{a.message}</span>
          <span className={`ml-auto text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full shrink-0
            ${a.kind === 'critical' ? 'bg-red-100 text-red-600' : a.kind === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-sky-100 text-sky-600'}`}>
            {a.kind}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB PANELS
// ─────────────────────────────────────────────────────────────────────────────

// ── Overview ─────────────────────────────────────────────────────────────────
function OverviewPanel({ data, loading, navigate }) {
  const stats  = withFallback(data.stats,  'stats');
  const health = withFallback(data.health, 'health');
  const orderStats = withFallback(data.orderStats, 'orderStats');
  const activity   = data.activity.length ? data.activity : FALLBACK.activity;
  const salesChart = withFallback(data.salesChart, 'salesChart');
  const recentOrders = data.recentOrders.length ? data.recentOrders : FALLBACK.recentOrders;

  const statCards = [
    { label: 'Total Products', value: fmtNum(stats?.totalProducts), icon: Package,      iconBg: 'bg-sky-50',     iconColor: 'text-sky-600',     delta: stats?.productsDelta },
    { label: 'Total Orders',   value: fmtNum(stats?.totalOrders),   icon: ShoppingCart, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', delta: stats?.ordersDelta   },
    { label: 'Total Users',    value: fmtNum(stats?.totalUsers),    icon: UserCheck,    iconBg: 'bg-violet-50',  iconColor: 'text-violet-600',  delta: stats?.usersDelta    },
    { label: 'Total Sales',    value: fmtINR(stats?.totalSales),    icon: DollarSign,   iconBg: 'bg-orange-50',  iconColor: 'text-orange-600',  delta: stats?.salesDelta    },
  ];

  const pipelineItems = [
    { label: 'Pending',    value: orderStats?.pending ?? 24,  color: 'bg-amber-400' },
    { label: 'Processing', value: orderStats?.processing ?? 12, color: 'bg-blue-400'  },
    { label: 'Shipped',    value: orderStats?.shipped ?? 34,  color: 'bg-violet-400' },
    { label: 'Delivered',  value: orderStats?.delivered ?? 156, color: 'bg-emerald-400' },
    { label: 'Cancelled',  value: orderStats?.cancelled ?? 8, color: 'bg-red-400'   },
    { label: 'Return requests', value: orderStats?.returnRequests ?? 5, color: 'bg-orange-400' },
  ];

  return (
    <>
      {/* Stat cards */}
      <section aria-label="Key metrics">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
            : statCards.map((c, i) => (
                <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <MetricCard {...c} loading={false} />
                </motion.div>
              ))
          }
        </div>
      </section>

      {/* Alert metrics */}
      <section aria-label="Alert metrics">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Pending Orders', value: fmtNum(stats?.pendingOrders ?? 24),      icon: ClipboardList, iconBg: 'bg-red-50',   iconColor: 'text-red-600'   },
            { label: 'Stock Alerts',   value: `${fmtNum(stats?.lowStockAlerts ?? 12)} products`, icon: AlertTriangle, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
          ].map(c => <MetricCard key={c.label} {...c} loading={loading} />)}
        </div>
      </section>

      {/* Charts */}
      <section aria-label="Charts">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
            <SectionHeader title="Sales overview — last 6 months" icon={TrendingUp} iconColor="text-emerald-500" />
            <div className="h-56">
              {loading || !salesChart ? <Skeleton className="h-full" /> : <Line data={salesChart} options={CHART_OPTIONS_BASE} />}
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
            <SectionHeader title="Inventory levels by category" icon={Package} iconColor="text-sky-500" />
            <div className="h-56">
              {loading || !data.invChart ? <Skeleton className="h-full" /> : <Bar data={data.invChart} options={CHART_OPTIONS_BASE} />}
            </div>
          </div>
        </div>
      </section>

      {/* Order pipeline + system health */}
      <section aria-label="Pipeline and health">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
            <SectionHeader title="Order status pipeline" icon={ClipboardList} iconColor="text-violet-500" />
            <ul className="space-y-2" role="list">
              {pipelineItems.map(({ label, value, color }) => (
                <li key={label} className="flex items-center justify-between" role="listitem">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <span className={`w-2 h-2 rounded-full ${color}`} aria-hidden="true" />
                    {label}
                  </span>
                  <span className="text-sm font-semibold text-gray-800">{fmtNum(value)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
            <SectionHeader title="System health" icon={Activity} iconColor={health?.status === 'healthy' ? 'text-emerald-500' : 'text-red-500'} />
            <div className="space-y-2.5">
              {[
                { label: 'Database latency', value: `${health?.database?.latencyMs ?? 12}ms`, ok: true },
                { label: 'API response',      value: '98ms', ok: true },
                { label: 'Server uptime',     value: '99.97%', ok: true },
                { label: 'Cache hit rate',    value: '94.2%', ok: true },
                { label: 'Active sessions',   value: '3 admins', ok: true },
              ].map(({ label, value, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{label}</span>
                  <Badge variant={ok ? 'green' : 'red'}>{value}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent activity */}
      <section aria-label="Recent activity">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Recent activity" icon={Activity} iconColor="text-gray-400" />
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}</div>
          ) : activity.length === 0 ? (
            <EmptyState icon={Activity} message="No recent activity yet." />
          ) : (
            <ul className="space-y-2" role="list">
              {activity.map(({ id, type, detail, actor_name, created_at }) => (
                <li key={id} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3" role="listitem">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1.5" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    {actor_name && <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-0.5">{actor_name}</p>}
                    <p className="text-sm text-gray-700 leading-snug"><span className="font-semibold text-gray-900">{type}:</span> {detail}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{fmtDate(created_at)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Recent orders widget */}
      <section aria-label="Recent orders">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Recent orders" icon={ShoppingCart} iconColor="text-emerald-500"
            action={<button onClick={() => navigate('/admin/vieworders/orderactions')} className="text-xs text-green-600 font-semibold hover:underline">View all</button>}
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Order #', 'Customer', 'City', 'Items', 'Amount', 'Payment', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left pb-2 pr-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(({ id, customer, city, items, amount, payment, status, date }) => (
                  <tr key={id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-2.5 pr-4 font-semibold text-blue-600">{id}</td>
                    <td className="py-2.5 pr-4 whitespace-nowrap">{customer}</td>
                    <td className="py-2.5 pr-4 text-gray-500">{city}</td>
                    <td className="py-2.5 pr-4 text-gray-600 max-w-[140px] truncate">{items}</td>
                    <td className="py-2.5 pr-4 font-semibold">{fmtINR(amount)}</td>
                    <td className="py-2.5 pr-4"><Badge variant={statusVariant(payment)}>{payment}</Badge></td>
                    <td className="py-2.5 pr-4"><Badge variant={statusVariant(status)}>{status}</Badge></td>
                    <td className="py-2.5 text-gray-400 text-xs">{date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section aria-label="Quick actions">
        <h2 className="text-sm font-bold text-gray-800 mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ label, icon: Icon, path, color }) => (
            <motion.button
              key={path}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(path)}
              className={`${color} text-white py-4 px-5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white`}
              aria-label={label}
            >
              <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span className="text-sm font-semibold">{label}</span>
            </motion.button>
          ))}
        </div>
      </section>
    </>
  );
}

// ── Inventory ────────────────────────────────────────────────────────────────
function InventoryPanel({ data, loading }) {
  const is   = withFallback(data.inventoryStats,    'inventoryStats');
  const low  = data.lowStockProducts.length  ? data.lowStockProducts  : FALLBACK.lowStockProducts;
  const dead = data.deadStockProducts.length ? data.deadStockProducts : FALLBACK.deadStockProducts;
  const rs   = data.restockSuggestions.length ? data.restockSuggestions : FALLBACK.restockSuggestions;

  const catChartData = withFallback(data.invChart, 'invChart');

  const metricCards = [
    { label: 'Total inventory value',  value: fmtINR(is?.totalValue),   icon: DollarSign,    iconBg: 'bg-green-50',  iconColor: 'text-green-600' },
    { label: 'Low stock products',     value: fmtNum(is?.lowStockCount), icon: AlertTriangle, iconBg: 'bg-amber-50',  iconColor: 'text-amber-600' },
    { label: 'Out of stock',           value: fmtNum(is?.outOfStockCount), icon: Package2,    iconBg: 'bg-red-50',    iconColor: 'text-red-600'   },
    { label: 'Dead stock (90d)',       value: fmtNum(is?.deadStockCount),  icon: Clock,       iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <MetricCard {...c} loading={loading} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Fast-moving plants */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Fast-moving plants" icon={TrendingUp} iconColor="text-emerald-500" />
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <ul className="divide-y divide-gray-50" role="list">
              {low.map(({ id, name, category, weeklySales, stock, status }) => (
                <li key={id} className="flex items-center justify-between py-2.5 gap-3" role="listitem">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{name}</p>
                    <p className="text-[11px] text-gray-400">{category} · {weeklySales} sold/wk</p>
                  </div>
                  <Badge variant={statusVariant(status)}>
                    {status === 'out' ? 'Out of stock' : `${stock} left`}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dead stock */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Dead stock — clearance needed" icon={Clock} iconColor="text-violet-500" />
          {loading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : dead.length === 0 ? (
            <EmptyState icon={Package} message="No dead stock. Great job keeping inventory moving!" />
          ) : (
            <ul className="divide-y divide-gray-50" role="list">
              {dead.map(({ id, name, lastSoldDays, units }) => (
                <li key={id} className="flex items-center justify-between py-2.5 gap-3" role="listitem">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{name}</p>
                    <p className="text-[11px] text-gray-400">Last sold {lastSoldDays}d ago</p>
                  </div>
                  <Badge variant={lastSoldDays > 70 ? 'red' : 'amber'}>{units} units</Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Category chart */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
        <SectionHeader title="Inventory by category" icon={BarChart2} iconColor="text-sky-500" />
        <div className="h-52">
          {loading || !catChartData ? <Skeleton className="h-full" /> : <Bar data={catChartData} options={CHART_OPTIONS_BASE} />}
        </div>
      </div>

      {/* Restock suggestions */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
        <SectionHeader title="Restock suggestions" icon={TruckIcon} iconColor="text-amber-500" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Product', 'Current stock', 'Weekly demand', 'Days left', 'Suggested order', 'Priority'].map(h => (
                  <th key={h} className="text-left pb-2 pr-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rs.map(({ id, name, stock, weeklyDemand, daysLeft, suggestedQty, priority }) => (
                <tr key={id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4 font-medium">{name}</td>
                  <td className="py-2.5 pr-4">{fmtNum(stock)}</td>
                  <td className="py-2.5 pr-4">{weeklyDemand}/wk</td>
                  <td className="py-2.5 pr-4">{daysLeft === 0 ? <span className="text-red-600 font-bold">0 — urgent</span> : daysLeft}</td>
                  <td className="py-2.5 pr-4 font-semibold">{suggestedQty} units</td>
                  <td className="py-2.5"><Badge variant={priorityVariant(priority)}>{priority}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Orders ───────────────────────────────────────────────────────────────────
function OrdersPanel({ data, loading }) {
  const os = withFallback(data.orderStats, 'orderStats');
  const orders  = data.recentOrders.length  ? data.recentOrders  : FALLBACK.recentOrders;
  const returns = data.returnRequests.length ? data.returnRequests : FALLBACK.returnRequests;

  const statusChartData = {
    labels: ['Delivered', 'Shipped', 'Processing', 'Pending', 'Cancelled'],
    datasets: [{
      data: [os?.delivered ?? 156, os?.shipped ?? 34, os?.processing ?? 12, os?.pending ?? 24, os?.cancelled ?? 8],
      backgroundColor: ['#22c55e', '#8b5cf6', '#3b82f6', '#f59e0b', '#ef4444'],
      borderWidth: 0,
    }],
  };

  const metricCards = [
    { label: "Today's orders",  value: fmtNum(os?.todayOrders),   icon: ShoppingCart, iconBg: 'bg-blue-50',   iconColor: 'text-blue-600',   delta: 12, deltaLabel: '+12 vs yesterday' },
    { label: 'Shipped today',   value: fmtNum(os?.shippedToday),  icon: TruckIcon,    iconBg: 'bg-green-50',  iconColor: 'text-green-600'   },
    { label: 'Return requests', value: fmtNum(os?.returnRequests), icon: RefreshCw,   iconBg: 'bg-amber-50',  iconColor: 'text-amber-600'   },
    { label: 'Cancelled today', value: fmtNum(os?.cancelledToday), icon: X,           iconBg: 'bg-red-50',    iconColor: 'text-red-600'     },
  ];

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <MetricCard {...c} loading={loading} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Status donut */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Order status breakdown" icon={BarChart2} iconColor="text-violet-500" />
          <div className="h-52">
            <Doughnut data={statusChartData} options={DOUGHNUT_OPTIONS} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 justify-center">
            {statusChartData.labels.map((l, i) => (
              <span key={l} className="flex items-center gap-1 text-[11px] text-gray-500">
                <span className="w-2 h-2 rounded-sm" style={{ background: statusChartData.datasets[0].backgroundColor[i] }} />
                {l}
              </span>
            ))}
          </div>
        </div>

        {/* Return/refund tracker */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Refund & return tracker" icon={RefreshCw} iconColor="text-orange-500" />
          <ul className="divide-y divide-gray-50 mb-4" role="list">
            {returns.map(({ id, customer, amount, status, type }) => (
              <li key={id} className="flex items-center justify-between py-2.5" role="listitem">
                <div>
                  <p className="text-sm font-medium text-gray-800">{id} — {customer}</p>
                  <p className="text-[11px] text-gray-400 capitalize">{type} · {fmtINR(amount)}</p>
                </div>
                <Badge variant={statusVariant(status)}>{status}</Badge>
              </li>
            ))}
          </ul>
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500">Refund success rate</span>
              <span className="font-semibold">94.2%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* All orders table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
        <SectionHeader title="Order management" icon={ClipboardList} iconColor="text-gray-500" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Order #', 'Customer', 'City', 'Items', 'Amount', 'Payment', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left pb-2 pr-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map(({ id, customer, city, items, amount, payment, status, date }) => (
                <tr key={id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-3 font-semibold text-blue-600">{id}</td>
                  <td className="py-2.5 pr-3 whitespace-nowrap">{customer}</td>
                  <td className="py-2.5 pr-3 text-gray-500">{city}</td>
                  <td className="py-2.5 pr-3 max-w-[120px] truncate text-gray-600">{items}</td>
                  <td className="py-2.5 pr-3 font-semibold">{fmtINR(amount)}</td>
                  <td className="py-2.5 pr-3"><Badge variant={statusVariant(payment)}>{payment}</Badge></td>
                  <td className="py-2.5 pr-3"><Badge variant={statusVariant(status)}>{status}</Badge></td>
                  <td className="py-2.5 pr-3 text-gray-400 text-xs whitespace-nowrap">{date}</td>
                  <td className="py-2.5">
                    <button className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none" aria-label={`View order ${id}`}>
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Revenue ──────────────────────────────────────────────────────────────────
function RevenuePanel({ data, loading }) {
  const rs   = withFallback(data.revenueStats,    'revenueStats');
  const cats = data.revenueByCategory.length ? data.revenueByCategory : FALLBACK.revenueByCategory;
  const cities = data.revenueByCity.length   ? data.revenueByCity     : FALLBACK.revenueByCity;
  const forecast = data.salesForecast.length ? data.salesForecast     : FALLBACK.salesForecast;
  const salesChart = withFallback(data.salesChart, 'salesChart');

  const metricCards = [
    { label: "Today's revenue",   value: fmtINR(rs?.todayRevenue), icon: DollarSign,   iconBg: 'bg-green-50',  iconColor: 'text-green-600',  delta: rs?.todayDelta  },
    { label: 'This month',        value: fmtINR(rs?.thisMonth),    icon: TrendingUp,   iconBg: 'bg-blue-50',   iconColor: 'text-blue-600',   delta: rs?.monthDelta  },
    { label: 'Avg. order value',  value: fmtINR(rs?.aov),          icon: ShoppingCart, iconBg: 'bg-purple-50', iconColor: 'text-purple-600'  },
    { label: 'Profit margin',     value: `${rs?.profitMargin ?? 32}%`, icon: Percent,  iconBg: 'bg-amber-50',  iconColor: 'text-amber-600'  },
  ];

  const CAT_COLORS = ['bg-green-500', 'bg-blue-400', 'bg-amber-400', 'bg-violet-400', 'bg-orange-400'];

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <MetricCard {...c} loading={loading} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue by category */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Revenue by category" icon={Layers} iconColor="text-green-500" />
          {cats.map(({ name, value, pct }, i) => (
            <ProgressRow key={name} label={name} pct={pct} displayValue={fmtINR(value)} color={CAT_COLORS[i % CAT_COLORS.length]} />
          ))}
        </div>

        {/* Revenue by city */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Revenue by city" icon={MapPin} iconColor="text-blue-500" />
          {cities.map(({ city, value, pct }) => (
            <ProgressRow key={city} label={city} pct={pct} displayValue={fmtINR(value)} color="bg-emerald-500" />
          ))}
        </div>
      </div>

      {/* Sales chart */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
        <SectionHeader title="Sales trend — last 6 months" icon={TrendingUp} iconColor="text-emerald-500" />
        <div className="h-56">
          {loading || !salesChart ? <Skeleton className="h-full" /> : <Line data={salesChart} options={CHART_OPTIONS_BASE} />}
        </div>
        <div className="flex gap-4 mt-3 justify-center">
          {[{ color: '#16a34a', label: 'Revenue (₹K)' }, { color: '#3b82f6', label: 'Orders', dashed: true }].map(({ color, label, dashed }) => (
            <span key={label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <span className={`w-5 h-0.5 ${dashed ? 'border-t-2 border-dashed' : ''}`}
                style={dashed ? { borderColor: color } : { background: color }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Monsoon sales forecast */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
        <SectionHeader title="Monsoon demand forecast 2026" icon={TrendingUp} iconColor="text-blue-500" />
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
          {forecast.map(({ plant, delta, expected }) => (
            <div key={plant} className="bg-gray-50 rounded-xl p-3 ring-1 ring-gray-100">
              <p className="text-xs text-gray-500 mb-1">{plant}</p>
              <p className="text-lg font-bold text-emerald-600">↑ {delta}%</p>
              <p className="text-[11px] text-gray-400 mt-1">{expected} units/wk expected</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── Customers ────────────────────────────────────────────────────────────────
function CustomersPanel({ data, loading }) {
  const cs   = withFallback(data.customerStats, 'customerStats');
  const ca   = withFallback(data.cartAnalytics,  'cartAnalytics');
  const top  = data.topCustomers.length ? data.topCustomers : FALLBACK.topCustomers;

  const metricCards = [
    { label: 'New customers',      value: fmtNum(cs?.newCustomers),       icon: Users2,    iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'   },
    { label: 'Returning customers', value: fmtNum(cs?.returningCustomers), icon: UserCheck, iconBg: 'bg-green-50',  iconColor: 'text-green-600'  },
    { label: 'Retention rate',     value: `${cs?.retentionRate ?? 67}%`,   icon: TrendingUp,iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Avg. lifetime value', value: fmtINR(cs?.clv),                icon: DollarSign,iconBg: 'bg-amber-50',  iconColor: 'text-amber-600' },
  ];

  const INITIALS_COLORS = [
    'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700',
    'bg-purple-100 text-purple-700', 'bg-amber-100 text-amber-700', 'bg-red-100 text-red-700',
  ];

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <MetricCard {...c} loading={loading} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top customers */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Top customers by lifetime value" icon={Star} iconColor="text-amber-500" />
          <ul className="divide-y divide-gray-50" role="list">
            {top.map(({ initials, name, orders, value }, i) => (
              <li key={name} className="flex items-center justify-between py-2.5 gap-3" role="listitem">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${INITIALS_COLORS[i % INITIALS_COLORS.length]}`}>
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{name}</p>
                    <p className="text-[11px] text-gray-400">{orders} orders</p>
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-800">{fmtINR(value)}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Cart analytics */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Cart & checkout analytics" icon={ShoppingCart} iconColor="text-sky-500" />
          <div className="space-y-3">
            {[
              { label: 'Abandoned carts',      value: fmtNum(ca?.abandonedCarts),               badge: 'amber' },
              { label: 'Cart abandonment rate', value: `${ca?.abandonmentRate ?? 62.4}%`,         badge: 'amber' },
              { label: 'Checkout drop rate',    value: `${ca?.dropRate ?? 31.2}%`,                badge: 'red'   },
              { label: 'Conversion rate',       value: `${ca?.conversionRate ?? 4.8}%`,           badge: 'green' },
              { label: 'Avg. abandoned cart',   value: fmtINR(ca?.avgAbandonedValue),             badge: 'gray'  },
            ].map(({ label, value, badge }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <Badge variant={badge}>{value}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-gray-500">Repeat purchase rate</span>
              <span className="font-semibold">{cs?.retentionRate ?? 67}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${cs?.retentionRate ?? 67}%` }} />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              {cs?.retentionRate ?? 67}% of customers reorder within 90 days
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Plants ───────────────────────────────────────────────────────────────────
function PlantsPanel({ data, loading }) {
  const plants = data.topPlants.length ? data.topPlants : FALLBACK.topPlants;
  const rs     = withFallback(data.reviewStats, 'reviewStats');

  const indoorOutdoorData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      { label: 'Indoor',  data: [42, 48, 44, 58, 68, 74], backgroundColor: '#86efac', borderRadius: 3 },
      { label: 'Outdoor', data: [18, 22, 20, 26, 30, 32], backgroundColor: '#93c5fd', borderRadius: 3 },
    ],
  };

  const dist = rs?.distribution ?? FALLBACK.reviewStats.distribution;

  return (
    <>
      {/* Top plants table */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
        <SectionHeader title="Top selling plants" icon={TrendingUp} iconColor="text-green-500" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Rank', 'Plant', 'Category', 'Units sold', 'Revenue'].map(h => (
                  <th key={h} className="text-left pb-2 pr-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {plants.map(({ rank, name, category, unitsSold, revenue }) => (
                <tr key={name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4">
                    <span className={`text-sm font-bold ${rank === 1 ? 'text-amber-500' : rank <= 3 ? 'text-gray-600' : 'text-gray-300'}`}>
                      {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 font-medium">{name}</td>
                  <td className="py-2.5 pr-4"><Badge variant={category === 'Indoor' ? 'green' : 'blue'}>{category}</Badge></td>
                  <td className="py-2.5 pr-4">{fmtNum(unitsSold)}</td>
                  <td className="py-2.5 font-semibold">{fmtINR(revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Indoor vs outdoor chart */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Indoor vs outdoor sales" icon={BarChart2} iconColor="text-sky-500" />
          <div className="h-48">
            <Bar data={indoorOutdoorData} options={CHART_OPTIONS_BASE} />
          </div>
          <div className="flex gap-4 mt-2 justify-center">
            {[{ color: '#86efac', label: 'Indoor' }, { color: '#93c5fd', label: 'Outdoor' }].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Reviews & ratings */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Product reviews & ratings" icon={Star} iconColor="text-amber-500" />
          <div className="flex items-center gap-6 mb-4 pb-4 border-b border-gray-100">
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-500">{rs?.avgRating ?? 4.6}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">avg rating</p>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-gray-400 w-5">{star}★</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${dist[star] ?? 0}%` }} />
                  </div>
                  <span className="text-[10px] text-gray-500 w-6 text-right">{dist[star] ?? 0}%</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Pending reviews',   value: rs?.pendingReviews ?? 15,  badge: 'amber' },
              { label: 'Reported reviews',  value: rs?.reportedReviews ?? 2,  badge: 'red'   },
              { label: 'Lowest rated product', value: 'Cactus Mix — 2.8 ★',  badge: 'red'   },
            ].map(({ label, value, badge }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{label}</span>
                <Badge variant={badge}>{value}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Marketing ────────────────────────────────────────────────────────────────
function MarketingPanel({ data, loading }) {
  const ms = withFallback(data.marketingStats, 'marketingStats');
  const campaigns = data.activeCampaigns.length ? data.activeCampaigns : FALLBACK.activeCampaigns;

  const metricCards = [
    { label: 'Coupon redemptions', value: fmtNum(ms?.couponRedemptions), icon: Tag,         iconBg: 'bg-green-50',  iconColor: 'text-green-600' },
    { label: 'Campaign ROI',       value: `${ms?.campaignROI ?? 320}%`,  icon: TrendingUp,  iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'  },
    { label: 'Affiliate sales',    value: fmtINR(ms?.affiliateSales),    icon: UserCog,     iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Active promotions',  value: fmtNum(ms?.activePromotions),  icon: Megaphone,   iconBg: 'bg-amber-50',  iconColor: 'text-amber-600'  },
  ];

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <MetricCard {...c} loading={loading} />
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
        <SectionHeader title="Active campaigns" icon={Megaphone} iconColor="text-violet-500" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Campaign', 'Type', 'Reach', 'Conversions', 'ROI', 'Status', 'Ends'].map(h => (
                  <th key={h} className="text-left pb-2 pr-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campaigns.map(({ name, type, reach, conversions, roi, status, ends }) => (
                <tr key={name} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4 font-medium">{name}</td>
                  <td className="py-2.5 pr-4 text-gray-500">{type}</td>
                  <td className="py-2.5 pr-4">{fmtNum(reach)}</td>
                  <td className="py-2.5 pr-4 font-semibold">{fmtNum(conversions)}</td>
                  <td className="py-2.5 pr-4 font-bold text-green-600">{roi}%</td>
                  <td className="py-2.5 pr-4"><Badge variant={statusVariant(status)}>{status}</Badge></td>
                  <td className="py-2.5 text-gray-500 text-xs">{ends}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ── Logistics ────────────────────────────────────────────────────────────────
function LogisticsPanel({ data, loading }) {
  const ls = withFallback(data.logisticsStats, 'logisticsStats');
  const courier = data.courierPerformance.length ? data.courierPerformance : FALLBACK.courierPerformance;
  const regions = data.regionDelivery.length    ? data.regionDelivery     : FALLBACK.regionDelivery;

  const metricCards = [
    { label: 'On-time delivery',   value: `${ls?.onTimeRate ?? 96}%`,          icon: CheckCircle2, iconBg: 'bg-green-50',  iconColor: 'text-green-600' },
    { label: 'Delayed orders',     value: fmtNum(ls?.delayedOrders),            icon: AlertTriangle,iconBg: 'bg-amber-50',  iconColor: 'text-amber-600' },
    { label: 'Avg. delivery time', value: `${ls?.avgDeliveryDays ?? 2.4} days`, icon: Clock,        iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'  },
    { label: 'Delivery success',   value: `${ls?.successRate ?? 98.1}%`,        icon: TruckIcon,    iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <MetricCard {...c} loading={loading} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Courier performance */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Courier performance" icon={TruckIcon} iconColor="text-blue-500" />
          {courier.map(({ name, shipments, rate }) => (
            <ProgressRow key={name} label={`${name} (${shipments})`} pct={rate} displayValue={`${rate}%`}
              color={rate >= 97 ? 'bg-emerald-500' : rate >= 95 ? 'bg-amber-400' : 'bg-red-400'} />
          ))}
        </div>

        {/* Region delivery status */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <SectionHeader title="Region-wise delivery status" icon={Globe} iconColor="text-violet-500" />
          <ul className="divide-y divide-gray-50" role="list">
            {regions.map(({ region, status, delays }) => (
              <li key={region} className="flex items-center justify-between py-2.5" role="listitem">
                <span className="text-sm text-gray-700">{region}</span>
                <Badge variant={statusVariant(status)}>
                  {status === 'on-time' ? 'On time' : `${delays} delay${delays !== 1 ? 's' : ''}`}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

// ── Security ─────────────────────────────────────────────────────────────────
function SecurityPanel({ data, loading, toast }) {
  const ss      = withFallback(data.securityStats, 'securityStats');
  const logins  = data.loginHistory.length ? data.loginHistory : FALLBACK.loginHistory;
  const audits  = data.auditEntries.length ? data.auditEntries : FALLBACK.auditEntries;

  const metricCards = [
    { label: 'Failed logins (24h)',    value: fmtNum(ss?.failedLogins24h),  icon: ShieldAlert, iconBg: 'bg-red-50',    iconColor: 'text-red-600'    },
    { label: 'Active sessions',        value: fmtNum(ss?.activeSessions),   icon: Users2,      iconBg: 'bg-blue-50',   iconColor: 'text-blue-600'   },
    { label: '2FA enabled',            value: `${ss?.twoFARate ?? 100}%`,   icon: Lock,        iconBg: 'bg-green-50',  iconColor: 'text-green-600'  },
    { label: 'Suspicious activity',    value: fmtNum(ss?.suspiciousActivity),icon: Eye,        iconBg: 'bg-amber-50',  iconColor: 'text-amber-600'  },
  ];

  const copyIP = (ip) => {
    navigator.clipboard.writeText(ip).then(() => toast({ message: `Copied ${ip}`, kind: 'success' })).catch(() => {});
  };

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metricCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <MetricCard {...c} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Login history */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
        <SectionHeader title="Active sessions & login history" icon={Shield} iconColor="text-green-500" />
        <ul className="divide-y divide-gray-50" role="list">
          {logins.map(({ admin, ip, device, status, time }) => (
            <li key={`${admin}-${time}`} className="flex items-center justify-between py-3 gap-3" role="listitem">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full shrink-0 ${status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-gray-300'}`} aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{admin}</p>
                  <p className="text-[11px] text-gray-400">{device}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => copyIP(ip)}
                  aria-label={`Copy IP ${ip}`}
                  className="font-mono text-[10px] text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1 focus:outline-none focus-visible:underline"
                >
                  {ip} <Copy className="w-3 h-3" />
                </button>
                <Badge variant={statusVariant(status)}>{time}</Badge>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Audit trail */}
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
        <SectionHeader title="Audit trail" icon={Clock} iconColor="text-violet-500"
          action={<span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Last 10 entries</span>}
        />
        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : audits.length === 0 ? (
          <EmptyState icon={Clock} message="No audit entries yet. Admin actions will appear here." />
        ) : (
          <ul className="space-y-2" role="list">
            {audits.map(({ id, admin_name, action, target, ip_address, created_at }) => (
              <li key={id} className="flex items-start gap-3 rounded-xl px-4 py-3 bg-violet-50/50 ring-1 ring-violet-100/60" role="listitem">
                <Shield className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">
                    <span className="font-semibold text-violet-700">{admin_name}</span>
                    {' → '}
                    <span className="font-medium text-gray-900">{action}</span>
                    {target && <span className="text-gray-500"> on <em>{target}</em></span>}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <p className="text-[11px] text-gray-400">{fmtDate(created_at)}</p>
                    {ip_address && (
                      <button
                        onClick={() => copyIP(ip_address)}
                        aria-label={`Copy IP address ${ip_address}`}
                        className="flex items-center gap-1 text-[10px] font-mono text-gray-300 hover:text-gray-500 transition-colors focus:outline-none focus-visible:underline"
                      >
                        {ip_address} <Copy className="w-2.5 h-2.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

function AdminDashboardInner() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const dispatch  = useDispatch();
  const toast     = useToast();
  const user      = useLocalUser();

  const [activeNav, setActiveNav]             = useState(location.pathname);
  const [activeTab, setActiveTab]             = useState('overview');
  const [sidebarOpen, setSidebarOpen]         = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [confirm, setConfirm]                 = useState({ open: false });
  const [sessionStart]                        = useState(() => Date.now());

  const notifRef     = useRef(null);
  const navItemRefs  = useRef([]);

  useEffect(() => setActiveNav(location.pathname), [location.pathname]);

  const dashData = useDashboard();
  const {
    notifications, loading, error, refreshing,
    fetchAll, markNotifRead, markAllNotifsRead,
    stats, inventoryStats, orderStats, securityStats,
  } = dashData;

  // Merge fallback into notifications
  const visibleNotifs = notifications.length ? notifications : FALLBACK.notifications;

  // Close sidebar on desktop
  useEffect(() => {
    const fn = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const fn = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Sidebar keyboard nav
  const handleSidebarKeyDown = (e, idx) => {
    const flat = NAV_GROUPS.flatMap(g => g.items);
    if (e.key === 'ArrowDown') { e.preventDefault(); navItemRefs.current[Math.min(idx + 1, flat.length - 1)]?.focus(); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); navItemRefs.current[Math.max(idx - 1, 0)]?.focus(); }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleNav = useCallback((path) => {
    setActiveNav(path);
    // Also switch tab if the nav item has a tab mapping
    const item = ALL_NAV_ITEMS.find(i => i.path === path);
    if (item?.tab) setActiveTab(item.tab);
    navigate(path);
    setSidebarOpen(false);
  }, [navigate]);

  const handleRefresh = useCallback(() => {
    fetchAll(true);
    toast({ message: 'Dashboard refreshed', kind: 'success' });
  }, [fetchAll, toast]);

  const handleLogout = () => {
    setConfirm({
      open: true,
      title: 'Sign out',
      message: 'You will be redirected to the login page. Any unsaved changes will be lost.',
      confirmLabel: 'Sign out',
      destructive: false,
      onConfirm: async () => {
        setConfirm(c => ({ ...c, open: false }));
        try { await authAPI.logout(); } catch { /* stateless JWT — ignore */ }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch(logoutAction());
        navigate('/login', { replace: true });
      },
      onCancel: () => setConfirm(c => ({ ...c, open: false })),
    });
  };

  const handleBulkExport = () => {
    setConfirm({
      open: true,
      title: 'Export all data',
      message: 'This will generate a full export of orders, users, and inventory. Large exports may take a moment.',
      confirmLabel: 'Export',
      destructive: false,
      onConfirm: () => {
        setConfirm(c => ({ ...c, open: false }));
        navigate('/admin/reports?export=all');
        toast({ message: 'Export started — check Reports for the download link', kind: 'info' });
      },
      onCancel: () => setConfirm(c => ({ ...c, open: false })),
    });
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      markAllNotifsRead();
      toast({ message: 'All notifications marked as read', kind: 'success' });
    } catch {
      toast({ message: 'Could not mark notifications as read', kind: 'error' });
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      markNotifRead(id);
    } catch { /* swallow */ }
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const unreadCount = visibleNotifs.filter(n => !n.is_read).length;

  let navFlatIdx = 0;

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const SidebarContent = ({ collapsed }) => (
    <>
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center px-2' : ''}`}>
        <span className="text-2xl shrink-0" role="img" aria-label="Paradise Nursery">🌿</span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div key="logo-text" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <p className="text-sm font-bold text-white whitespace-nowrap">Paradise Nursery</p>
              <p className="text-[9px] text-green-300 uppercase tracking-widest whitespace-nowrap">Admin Panel</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!collapsed && user?.role && (
        <div className="px-4 pt-3 pb-1"><RoleBadge role={user.role} /></div>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5" role="navigation" aria-label="Main navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label ?? 'top'}>
            {group.label && <SectionLabel label={group.label} icon={group.icon} collapsed={collapsed} />}
            {group.items.map((item) => {
              const thisIdx = navFlatIdx++;
              return (
                <div key={item.path} onKeyDown={(e) => handleSidebarKeyDown(e, thisIdx)}
                  ref={(el) => { navItemRefs.current[thisIdx] = el?.querySelector('button'); }}>
                  <NavItem
                    icon={item.icon} label={item.label} path={item.path}
                    active={activeNav === item.path} collapsed={collapsed}
                    onClick={() => handleNav(item.path)} tabIndex={0}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-2 py-3 border-t border-white/10">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400
            ${collapsed ? 'justify-center px-0 py-3' : 'px-3 py-2.5'}`}
          title={collapsed ? 'Sign out' : undefined}
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span key="logout-lbl" initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.2 }}
                className="overflow-hidden whitespace-nowrap">
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarOpen(false)} aria-hidden="true" />
            <motion.aside key="mobile-sidebar"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-green-700 flex flex-col lg:hidden shadow-2xl"
              aria-label="Mobile navigation" role="dialog" aria-modal="true">
              <button
                className="absolute top-4 right-4 text-green-200 hover:text-white p-1 rounded-lg focus:outline-none"
                onClick={() => setSidebarOpen(false)} aria-label="Close navigation">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="hidden lg:flex flex-col bg-green-700 h-full shrink-0 relative overflow-hidden"
        aria-label="Desktop navigation">
        <SidebarContent collapsed={sidebarCollapsed} />
        <button
          onClick={() => setSidebarCollapsed(v => !v)}
          className="absolute bottom-16 -right-3 w-6 h-6 bg-green-600 hover:bg-green-500 text-white rounded-full flex items-center justify-center shadow-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={sidebarCollapsed}>
          <motion.div animate={{ rotate: sidebarCollapsed ? 0 : 180 }} transition={{ duration: 0.25 }}>
            <ChevronRight className="w-3 h-3" aria-hidden="true" />
          </motion.div>
        </button>
      </motion.aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Header */}
        <header className="bg-white shadow-sm px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors focus:outline-none"
              onClick={() => setSidebarOpen(true)} aria-label="Open navigation" aria-expanded={sidebarOpen}>
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">Admin Dashboard</h1>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                {user?.name ? `Welcome back, ${user.name}` : 'Welcome back, Admin'}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all disabled:opacity-40 focus:outline-none"
              aria-label={refreshing ? 'Refreshing…' : 'Refresh dashboard'}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            </button>
            <GlobalSearch onNavigate={handleNav} />
          </div>

          <div className="flex items-center gap-2">
            <SessionInfoBar user={user?.name} sessionStart={sessionStart} />
            <button
              onClick={handleBulkExport}
              className="hidden md:flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all focus:outline-none"
              aria-label="Export all data">
              <Download className="w-3.5 h-3.5" aria-hidden="true" /> Export All
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(n => !n)}
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={showNotifications}
                aria-haspopup="dialog"
                className="relative flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-white px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all focus:outline-none shadow-sm shadow-amber-100">
                <Bell className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">Notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center" aria-hidden="true">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <NotificationsPanel
                    notifications={visibleNotifs}
                    unreadCount={unreadCount}
                    onMarkOne={handleMarkOneRead}
                    onMarkAll={handleMarkAllRead}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <main id="main-content" className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6" tabIndex={-1}>

          {/* Error banner */}
          {error && (
            <div role="alert" className="mb-5 bg-red-50 ring-1 ring-red-100 text-red-700 px-4 py-3 rounded-2xl text-sm flex items-center justify-between gap-4">
              <span>⚠️ {error}</span>
              <button onClick={() => fetchAll()} className="text-red-500 hover:text-red-700 font-semibold text-xs underline focus:outline-none">Retry</button>
            </div>
          )}

          {/* Smart alerts bar */}
          <div className="mb-5">
            <SmartAlertsBar
              stats={withFallback(stats, 'stats')}
              inventoryStats={withFallback(dashData.inventoryStats, 'inventoryStats')}
              orderStats={withFallback(orderStats, 'orderStats')}
              securityStats={withFallback(securityStats, 'securityStats')}
            />
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 mb-6 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-1.5 overflow-x-auto" role="tablist" aria-label="Dashboard sections">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                aria-controls={`panel-${id}`}
                id={`tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 shrink-0
                  ${activeTab === id
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              id={`panel-${activeTab}`}
              role="tabpanel"
              aria-labelledby={`tab-${activeTab}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {activeTab === 'overview'  && <OverviewPanel  data={dashData} loading={loading} navigate={navigate} />}
              {activeTab === 'inventory' && <InventoryPanel data={dashData} loading={loading} />}
              {activeTab === 'orders'    && <OrdersPanel    data={dashData} loading={loading} />}
              {activeTab === 'revenue'   && <RevenuePanel   data={dashData} loading={loading} />}
              {activeTab === 'customers' && <CustomersPanel data={dashData} loading={loading} />}
              {activeTab === 'plants'    && <PlantsPanel    data={dashData} loading={loading} />}
              {activeTab === 'marketing' && <MarketingPanel data={dashData} loading={loading} />}
              {activeTab === 'logistics' && <LogisticsPanel data={dashData} loading={loading} />}
              {activeTab === 'security'  && <SecurityPanel  data={dashData} loading={loading} toast={toast} />}
            </motion.div>
          </AnimatePresence>

          <div className="h-8" aria-hidden="true" />
        </main>
      </div>

      <ConfirmDialog {...confirm} />
    </div>
  );
}

const AdminDashboard = () => (
  <ToastProvider>
    <AdminDashboardInner />
  </ToastProvider>
);

export default AdminDashboard;







// src/admin/users/ManageUsers.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus, Search, Users, Loader2, ArrowLeft,
  ChevronLeft, ChevronRight, AlertCircle, X, CheckCircle,
  Eye, ShieldBan, Trash2, Edit, Download, FileText,
  Phone, MapPin, ShoppingBag, Heart, ShoppingCart,
  Star, Activity, Filter, MoreVertical, Ban,
  UserCheck, TrendingUp, Calendar, Mail, Shield,
  ClipboardList, StickyNote,
} from 'lucide-react';
import UserRow from './UserRow';
import { fetchUsers, deleteUser, banUser, createUser } from './services/UserService';

// ─── Constants ─────────────────────────────────────────────────────────────────
const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const EMPTY_FORM = {
  name: '', email: '', role: 'User', status: 'Active',
  gender: 'Other', avatar: '', phone: '',
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  amount != null ? `₹${Number(amount).toLocaleString('en-IN')}` : '—';

const formatDate = (val) => {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch { return '—'; }
};

const getCustomerType = (user) => {
  if (user.customerType) return user.customerType;
  const orders = user.totalOrders ?? 0;
  const spent  = user.totalSpending ?? 0;
  const days   = user.created_at
    ? Math.floor((Date.now() - new Date(user.created_at)) / 86400000)
    : 999;
  if (spent >= 10000 || orders >= 15) return 'VIP';
  if (spent >= 5000  || orders >= 5)  return 'High Value';
  if (orders > 1)                      return 'Returning';
  if (days <= 30)                      return 'New';
  return 'Inactive';
};

const CUSTOMER_TYPE_STYLES = {
  VIP:          'bg-yellow-100 text-yellow-800 border border-yellow-200',
  'High Value': 'bg-purple-100 text-purple-800 border border-purple-200',
  Returning:    'bg-blue-100 text-blue-800 border border-blue-200',
  New:          'bg-green-100 text-green-800 border border-green-200',
  Inactive:     'bg-gray-100 text-gray-600 border border-gray-200',
};

// ─── Stats Cards ──────────────────────────────────────────────────────────────
const StatsCards = ({ stats }) => {
  const cards = [
    { label: 'Total Users',     value: stats.total,       icon: Users,    color: 'text-blue-600',  bg: 'bg-blue-50' },
    { label: 'Active Users',    value: stats.active,      icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Banned Users',    value: stats.banned,      icon: Ban,       color: 'text-red-600',   bg: 'bg-red-50' },
    { label: 'New This Month',  value: stats.newThisMonth,icon: TrendingUp,color: 'text-purple-600',bg: 'bg-purple-50' },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${bg}`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── User Profile Modal ────────────────────────────────────────────────────────
const UserProfileModal = ({ user, onClose }) => {
  if (!user) return null;
  const customerType = getCustomerType(user);
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">User Profile</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Avatar + basic */}
          <div className="flex items-center gap-4">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-green-100"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=16a34a&color=fff`; }} />
            ) : (
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold">
                {user.name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CUSTOMER_TYPE_STYLES[customerType]}`}>
                  {customerType === 'VIP' ? '⭐ VIP' : customerType}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  user.status === 'Active' ? 'bg-green-100 text-green-700' :
                  user.status === 'Banned' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{user.status}</span>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Orders', value: user.totalOrders ?? 0, icon: ShoppingBag, color: 'text-blue-600' },
              { label: 'Total Spent',  value: formatCurrency(user.totalSpending), icon: TrendingUp, color: 'text-green-600' },
              { label: 'Reward Pts',   value: user.rewardPoints ?? 0, icon: Star, color: 'text-yellow-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
                <p className="font-bold text-gray-900 text-sm">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Wishlist Items', value: user.wishlistCount ?? 0, icon: Heart,        color: 'text-pink-500' },
              { label: 'Cart Items',     value: user.cartCount ?? 0,    icon: ShoppingCart, color: 'text-orange-500' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
                <Icon className={`h-4 w-4 ${color} mx-auto mb-1`} />
                <p className="font-bold text-gray-900 text-sm">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>

          {/* Info rows */}
          <div className="space-y-2 text-sm">
            {[
              { icon: Mail,     label: 'Email',          value: user.email },
              { icon: Phone,    label: 'Phone',          value: user.phone || '—' },
              { icon: Calendar, label: 'Registered',     value: formatDate(user.created_at) },
              { icon: Activity, label: 'Last Login',     value: formatDate(user.last_login) },
              { icon: ShoppingBag, label: 'Last Order',  value: formatDate(user.last_order_date) },
              { icon: Heart,    label: 'Last Wishlist',  value: formatDate(user.last_wishlist_update) },
              { icon: Shield,   label: 'Role',           value: user.role },
              { icon: MapPin,   label: 'Addresses',      value: user.addressCount ? `${user.addressCount} saved address${user.addressCount > 1 ? 'es' : ''}` : (user.defaultAddress || '—') },
              { icon: Mail,     label: 'Email Verified', value: user.emailVerified ? '✅ Verified' : '❌ Not Verified' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 py-2 border-b border-gray-50">
                <Icon className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                <span className="text-gray-500 w-32 shrink-0">{label}</span>
                <span className="text-gray-800 font-medium">{value}</span>
              </div>
            ))}
          </div>

          {/* Admin Notes */}
          {user.admin_notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <StickyNote className="h-4 w-4 text-yellow-600" />
                <span className="text-xs font-semibold text-yellow-700">Admin Notes</span>
              </div>
              <p className="text-sm text-yellow-800">{user.admin_notes}</p>
            </div>
          )}

          {/* Ban Reason */}
          {user.status === 'Banned' && user.ban_reason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1">
                <Ban className="h-4 w-4 text-red-600" />
                <span className="text-xs font-semibold text-red-700">Ban Reason</span>
              </div>
              <p className="text-sm text-red-800">{user.ban_reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Ban Modal (with reason) ──────────────────────────────────────────────────
const BAN_REASONS = ['Spam', 'Fake Orders', 'Abusive Behavior', 'Fraudulent Activity', 'Other'];

const BanModal = ({ user, onConfirm, onClose, banning }) => {
  const [reason, setReason] = useState('');
  const [custom, setCustom] = useState('');
  const isBanned = user?.status === 'Banned';

  const handleConfirm = () => {
    const finalReason = reason === 'Other' ? custom.trim() : reason;
    onConfirm(user.id, finalReason);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-full ${isBanned ? 'bg-green-100' : 'bg-red-100'}`}>
            {isBanned
              ? <UserCheck className="text-green-600 h-5 w-5" />
              : <Ban className="text-red-600 h-5 w-5" />}
          </div>
          <h3 className="font-bold text-gray-900">{isBanned ? 'Unban' : 'Ban'} User</h3>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          {isBanned
            ? `Unban ${user?.name}? They will be able to log in again.`
            : `Ban ${user?.name}? They will lose access immediately.`}
        </p>

        {!isBanned && (
          <div className="mb-4 space-y-2">
            <label className="text-sm font-semibold text-gray-700">Reason</label>
            {BAN_REASONS.map((r) => (
              <label key={r} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="ban_reason" value={r}
                  checked={reason === r} onChange={() => setReason(r)}
                  className="accent-red-600" />
                {r}
              </label>
            ))}
            {reason === 'Other' && (
              <input value={custom} onChange={(e) => setCustom(e.target.value)}
                placeholder="Enter reason…"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 mt-1" />
            )}
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2 text-gray-600 hover:bg-gray-50 text-sm font-medium transition">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={banning || (!isBanned && !reason)}
            className={`flex-1 text-white rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-50 ${
              isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}>
            {banning ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isBanned ? 'Unban' : 'Ban User'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Add User Modal ────────────────────────────────────────────────────────────
const UserModal = ({ onClose, onSave }) => {
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [errors,   setErrors]   = useState({});
  const [saving,   setSaving]   = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      errs.name = 'Name must be at least 2 characters.';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = 'Valid email is required.';
    if (!['Admin', 'User'].includes(form.role))
      errs.role = 'Role must be Admin or User.';
    if (form.avatar && !/^https?:\/\/.+/.test(form.avatar))
      errs.avatar = 'Avatar must be a valid http/https URL.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    setApiError('');
    try {
      await onSave({
        name:   form.name.trim(),
        email:  form.email.trim(),
        role:   form.role,
        status: form.status,
        gender: form.gender,
        avatar: form.avatar.trim() || null,
        phone:  form.phone.trim() || null,
      });
      onClose();
    } catch (err) {
      setApiError(err.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-3 py-2.5 border rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-green-500 focus:border-transparent ${
      errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
    }`;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="font-bold text-gray-900">Add New User</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {apiError && (
          <div className="mx-5 mt-4 flex items-center gap-2 bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded-lg text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />{apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input name="name" value={form.name} onChange={handleChange}
              placeholder="e.g. Arjun Sharma" className={inputCls('name')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="user@example.com" className={inputCls('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange}
              placeholder="+91 98765 43210" className={inputCls('phone')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className={inputCls('role')}>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className={inputCls('gender')}>
                {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputCls('status')}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Banned">Banned</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Avatar URL <span className="text-xs font-normal text-gray-400">(optional)</span>
            </label>
            <input name="avatar" value={form.avatar} onChange={handleChange}
              placeholder="https://..." className={inputCls('avatar')} />
            {errors.avatar && <p className="text-red-500 text-xs mt-1">{errors.avatar}</p>}
            {form.avatar && /^https?:\/\/.+/.test(form.avatar) && (
              <img src={form.avatar} alt="avatar preview"
                className="mt-2 h-10 w-10 rounded-full object-cover border border-gray-200"
                onError={(e) => { e.target.style.display = 'none'; }} />
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition">
              {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ──────────────────────────────────────────────────────
const DeleteModal = ({ user, onConfirm, onClose, deleting }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-red-100 rounded-full">
          <AlertCircle className="text-red-600 h-5 w-5" />
        </div>
        <h3 className="font-bold text-gray-900">Delete User</h3>
      </div>
      <p className="text-gray-600 text-sm mb-2">
        Are you sure you want to delete <strong>{user?.name}</strong>?
      </p>
      <p className="text-xs text-gray-400 mb-5 bg-amber-50 border border-amber-200 rounded-lg p-2">
        ⚠️ The user will be soft-deleted. Order history and analytics will be preserved. Their account can be recovered if needed.
      </p>
      <div className="flex gap-3">
        <button onClick={onClose}
          className="flex-1 border border-gray-200 rounded-xl py-2 text-gray-600 hover:bg-gray-50 text-sm font-medium transition">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-2 transition disabled:opacity-60">
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Bulk Action Bar ───────────────────────────────────────────────────────────
const BulkActionBar = ({ selectedCount, onBanSelected, onUnbanSelected, onDeleteSelected, onExportSelected, onClear }) => (
  <div className="bg-green-700 text-white rounded-xl px-4 py-3 flex items-center gap-3 flex-wrap">
    <span className="text-sm font-semibold">{selectedCount} user{selectedCount > 1 ? 's' : ''} selected</span>
    <div className="flex gap-2 ml-auto flex-wrap">
      <button onClick={onBanSelected}
        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
        <Ban className="h-3.5 w-3.5" /> Ban
      </button>
      <button onClick={onUnbanSelected}
        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
        <UserCheck className="h-3.5 w-3.5" /> Unban
      </button>
      <button onClick={onExportSelected}
        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
        <Download className="h-3.5 w-3.5" /> Export
      </button>
      <button onClick={onDeleteSelected}
        className="px-3 py-1.5 bg-red-500/80 hover:bg-red-500 rounded-lg text-xs font-medium flex items-center gap-1.5 transition">
        <Trash2 className="h-3.5 w-3.5" /> Delete
      </button>
      <button onClick={onClear}
        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium transition">
        Clear
      </button>
    </div>
  </div>
);

// ─── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ toast }) =>
  toast ? (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium z-50 ${
      toast.type === 'error' ? 'bg-red-600' : 'bg-green-700'
    }`}>
      {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
      {toast.msg}
    </div>
  ) : null;

// ─── Enhanced User Row ─────────────────────────────────────────────────────────
const EnhancedUserRow = ({ user, selected, onSelect, onView, onEdit, onDelete, onBan, onViewOrders }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const customerType = getCustomerType(user);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <tr className={`hover:bg-gray-50 transition ${selected ? 'bg-green-50' : ''}`}>
      {/* Checkbox */}
      <td className="px-4 py-3">
        <input type="checkbox" checked={selected} onChange={() => onSelect(user.id)}
          className="h-4 w-4 rounded border-gray-300 accent-green-600 cursor-pointer" />
      </td>

      {/* User */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name}
              className="h-9 w-9 rounded-full object-cover border border-gray-200 shrink-0"
              onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=16a34a&color=fff`; }} />
          ) : (
            <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold shrink-0">
              {user.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-400">#{user.id?.toString().slice(0, 8) ?? '—'}</p>
          </div>
        </div>
      </td>

      {/* Email + Verified */}
      <td className="px-4 py-3">
        <p className="text-sm text-gray-700">{user.email}</p>
        <span className={`text-xs ${user.emailVerified ? 'text-green-600' : 'text-red-500'}`}>
          {user.emailVerified ? '✅ Verified' : '❌ Not Verified'}
        </span>
      </td>

      {/* Phone */}
      <td className="px-4 py-3 text-sm text-gray-600">{user.phone || '—'}</td>

      {/* Customer Type */}
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CUSTOMER_TYPE_STYLES[customerType]}`}>
          {customerType === 'VIP' ? '⭐ VIP' : customerType}
        </span>
      </td>

      {/* Orders + Spent */}
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-gray-800">{user.totalOrders ?? 0} orders</p>
        <p className="text-xs text-gray-500">{formatCurrency(user.totalSpending)}</p>
      </td>

      {/* Wishlist */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Heart className="h-3.5 w-3.5 text-pink-400" />
          {user.wishlistCount ?? 0}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
          user.status === 'Active'   ? 'bg-green-100 text-green-700' :
          user.status === 'Banned'   ? 'bg-red-100 text-red-700' :
          user.status === 'Deleted'  ? 'bg-gray-100 text-gray-500' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${
            user.status === 'Active' ? 'bg-green-500' :
            user.status === 'Banned' ? 'bg-red-500' :
            user.status === 'Deleted' ? 'bg-gray-400' : 'bg-yellow-500'
          }`} />
          {user.status}
        </span>
      </td>

      {/* Joined */}
      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(user.created_at)}</td>

      {/* Last Login */}
      <td className="px-4 py-3 text-xs text-gray-500">{formatDate(user.last_login)}</td>

      {/* Reward Points */}
      <td className="px-4 py-3">
        {user.rewardPoints != null ? (
          <div className="flex items-center gap-1 text-xs text-yellow-700 font-medium">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            {user.rewardPoints}
          </div>
        ) : '—'}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1" ref={menuRef}>
          <button onClick={() => onView(user)}
            title="View Profile"
            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => onEdit(user)}
            title="Edit"
            className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition">
            <Edit className="h-4 w-4" />
          </button>
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition">
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 w-44">
                <button onClick={() => { onViewOrders(user); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition">
                  <ClipboardList className="h-4 w-4 text-gray-400" /> View Orders
                </button>
                <button onClick={() => { onBan(user); setMenuOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 transition ${
                    user.status === 'Banned' ? 'text-green-700' : 'text-orange-600'
                  }`}>
                  {user.status === 'Banned'
                    ? <><UserCheck className="h-4 w-4" /> Unban User</>
                    : <><Ban className="h-4 w-4" /> Ban User</>}
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button onClick={() => { onDelete(user.id); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

// ─── Export Utility ────────────────────────────────────────────────────────────
const exportToCSV = (users, filename = 'users') => {
  const headers = [
    'ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Gender',
    'Customer Type', 'Total Orders', 'Total Spent', 'Wishlist', 'Cart',
    'Reward Points', 'Email Verified', 'Joined', 'Last Login',
  ];
  const rows = users.map((u) => [
    u.id, u.name, u.email, u.phone ?? '',
    u.role, u.status, u.gender ?? '',
    getCustomerType(u), u.totalOrders ?? 0, u.totalSpending ?? 0,
    u.wishlistCount ?? 0, u.cartCount ?? 0, u.rewardPoints ?? 0,
    u.emailVerified ? 'Yes' : 'No', u.created_at ?? '', u.last_login ?? '',
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── useDebounce Hook ──────────────────────────────────────────────────────────
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ─── Main Component ────────────────────────────────────────────────────────────
const ManageUsers = () => {
  const navigate = useNavigate();

  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [pagination,    setPagination]    = useState({ page: 1, totalPages: 1, total: 0 });
  const [stats,         setStats]         = useState({ total: 0, active: 0, banned: 0, newThisMonth: 0 });
  const [searchQuery,   setSearchQuery]   = useState('');
  const [roleFilter,    setRoleFilter]    = useState('');
  const [statusFilter,  setStatusFilter]  = useState('');
  const [genderFilter,  setGenderFilter]  = useState('');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState('');
  const [customerTypeFilter,  setCustomerTypeFilter]  = useState('');
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [deleteTarget,  setDeleteTarget]  = useState(null);
  const [deleting,      setDeleting]      = useState(false);
  const [banTarget,     setBanTarget]     = useState(null);
  const [banning,       setBanning]       = useState(false);
  const [viewUser,      setViewUser]      = useState(null);
  const [selectedIds,   setSelectedIds]   = useState(new Set());
  const [toast,         setToast]         = useState(null);

  // Debounced search — 500ms delay to reduce API calls
  const debouncedSearch = useDebounce(searchQuery, 500);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers({
        search:        debouncedSearch || undefined,
        role:          roleFilter      || undefined,
        status:        statusFilter    || undefined,
        gender:        genderFilter    || undefined,
        emailVerified: emailVerifiedFilter === 'verified' ? true
                     : emailVerifiedFilter === 'unverified' ? false
                     : undefined,
        page,
        limit:     10,
        sortBy:    'created_at',
        sortOrder: 'desc',
      });

      const users = data.users ?? [];
      setUsers(users);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });

      // Build stats from available data (or use data.stats if your API returns it)
      if (data.stats) {
        setStats(data.stats);
      } else {
        const now   = new Date();
        const month = now.getMonth();
        const year  = now.getFullYear();
        setStats({
          total:        data.total ?? 0,
          active:       users.filter((u) => u.status === 'Active').length,
          banned:       users.filter((u) => u.status === 'Banned').length,
          newThisMonth: users.filter((u) => {
            if (!u.created_at) return false;
            const d = new Date(u.created_at);
            return d.getMonth() === month && d.getFullYear() === year;
          }).length,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter, genderFilter, emailVerifiedFilter]);

  useEffect(() => {
    loadUsers(1);
    setSelectedIds(new Set());
  }, [debouncedSearch, roleFilter, statusFilter, genderFilter, emailVerifiedFilter]); // eslint-disable-line

  // ── Selection helpers ──
  const allSelected = users.length > 0 && users.every((u) => selectedIds.has(u.id));
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectedUsers = users.filter((u) => selectedIds.has(u.id));

  // ── Handlers ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      showToast(`${deleteTarget.name} deleted successfully.`);
      loadUsers(pagination.page);
    } catch (err) {
      showToast(err.message || 'Delete failed.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleBanConfirm = async (userId, reason) => {
    setBanning(true);
    try {
      const updated = await banUser(userId, reason);
      setUsers((prev) => prev.map((u) => u.id === userId ? updated : u));
      showToast(`User ${updated.status === 'Banned' ? 'banned' : 'unbanned'} successfully.`);
      setBanTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to update user.', 'error');
    } finally {
      setBanning(false);
    }
  };

  const handleAddUser = async (payload) => {
    await createUser(payload);
    showToast('User created successfully.');
    loadUsers(1);
  };

  // ── Bulk Actions ──
  const handleBulkBan = async () => {
    for (const u of selectedUsers) {
      try { await banUser(u.id, 'Bulk ban by admin'); } catch {}
    }
    showToast(`${selectedIds.size} users banned.`);
    setSelectedIds(new Set());
    loadUsers(pagination.page);
  };

  const handleBulkUnban = async () => {
    for (const u of selectedUsers.filter((u) => u.status === 'Banned')) {
      try { await banUser(u.id); } catch {}
    }
    showToast('Selected users unbanned.');
    setSelectedIds(new Set());
    loadUsers(pagination.page);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} users? This cannot be undone.`)) return;
    for (const u of selectedUsers) {
      try { await deleteUser(u.id); } catch {}
    }
    showToast(`${selectedIds.size} users deleted.`);
    setSelectedIds(new Set());
    loadUsers(pagination.page);
  };

  const handleBulkExport = () => {
    exportToCSV(selectedUsers, 'selected_users');
    showToast('Export downloaded.');
  };

  const handleExportAll = () => {
    exportToCSV(users, 'all_users');
    showToast('Export downloaded.');
  };

  const TABLE_HEADERS = [
    '', 'User', 'Email', 'Phone', 'Type', 'Orders / Spent',
    'Wishlist', 'Status', 'Joined', 'Last Login', 'Reward Pts', 'Actions',
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/admindashboard')}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-100 px-3 py-2 rounded-xl shadow-sm transition text-sm font-medium">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-xl">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500 mt-0.5">{pagination.total} total users</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleExportAll}
              className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-xl text-sm font-medium transition shadow-sm">
              <Download className="h-4 w-4" /> Export CSV
            </button>
            <button onClick={() => setShowAddModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition shadow-sm text-sm font-medium">
              <UserPlus className="h-4 w-4" /> Add New User
            </button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <StatsCards stats={stats} />

        {/* ── Error ── */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />{error}
          </div>
        )}

        {/* ── Filters ── */}
        <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input type="text" placeholder="Search by name, email, phone, or user ID…"
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              {
                value: roleFilter, onChange: setRoleFilter,
                options: [['', 'All Roles'], ['Admin', 'Admin'], ['User', 'User']],
              },
              {
                value: statusFilter, onChange: setStatusFilter,
                options: [['', 'All Statuses'], ['Active', 'Active'], ['Inactive', 'Inactive'], ['Banned', 'Banned']],
              },
              {
                value: genderFilter, onChange: setGenderFilter,
                options: [['', 'All Genders'], ...GENDER_OPTIONS.map((g) => [g, g])],
              },
              {
                value: emailVerifiedFilter, onChange: setEmailVerifiedFilter,
                options: [['', 'Email Status'], ['verified', '✅ Verified'], ['unverified', '❌ Not Verified']],
              },
              {
                value: customerTypeFilter, onChange: setCustomerTypeFilter,
                options: [['', 'All Types'], ['VIP', '⭐ VIP'], ['High Value', 'High Value'], ['Returning', 'Returning'], ['New', 'New'], ['Inactive', 'Inactive']],
              },
            ].map((sel, i) => (
              <select key={i} value={sel.value} onChange={(e) => sel.onChange(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white">
                {sel.options.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            ))}
          </div>
        </div>

        {/* ── Bulk Action Bar ── */}
        {selectedIds.size > 0 && (
          <BulkActionBar
            selectedCount={selectedIds.size}
            onBanSelected={handleBulkBan}
            onUnbanSelected={handleBulkUnban}
            onDeleteSelected={handleBulkDelete}
            onExportSelected={handleBulkExport}
            onClear={() => setSelectedIds(new Set())}
          />
        )}

        {/* ── Table ── */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64 gap-3 text-gray-500">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-14">
              <Users className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-700 mb-1">No users found</h3>
              <p className="text-xs text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">
                      <input type="checkbox" checked={allSelected} onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 accent-green-600 cursor-pointer" />
                    </th>
                    {TABLE_HEADERS.slice(1).map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {users
                    .filter((u) => !customerTypeFilter || getCustomerType(u) === customerTypeFilter)
                    .map((user) => (
                      <EnhancedUserRow
                        key={user.id}
                        user={user}
                        selected={selectedIds.has(user.id)}
                        onSelect={toggleSelect}
                        onView={setViewUser}
                        onEdit={(u) => navigate(`/admin/users/useredit/${u.id}`)}
                        onDelete={(id) => setDeleteTarget(users.find((u) => u.id === id))}
                        onBan={setBanTarget}
                        onViewOrders={(u) => navigate(`/admin/orders?user=${u.id}`)}
                      />
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
            </p>
            <div className="flex gap-2">
              <button disabled={pagination.page === 1 || loading}
                onClick={() => loadUsers(pagination.page - 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-40 text-sm transition">
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button disabled={pagination.page === pagination.totalPages || loading}
                onClick={() => loadUsers(pagination.page + 1)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-40 text-sm transition">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddModal && <UserModal onClose={() => setShowAddModal(false)} onSave={handleAddUser} />}
      {deleteTarget && (
        <DeleteModal user={deleteTarget} onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)} deleting={deleting} />
      )}
      {banTarget && (
        <BanModal user={banTarget} onConfirm={handleBanConfirm}
          onClose={() => setBanTarget(null)} banning={banning} />
      )}
      {viewUser && <UserProfileModal user={viewUser} onClose={() => setViewUser(null)} />}

      <Toast toast={toast} />
    </div>
  );
};

export default ManageUsers;