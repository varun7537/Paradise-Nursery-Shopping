// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

// ── Auth ──────────────────────────────────────────────────────────────────────
import { AuthProvider } from "./context/Authcontext";
import ProtectedRoute from "./pages/Protectedroute";
import AdminRoute from "./components/AdminRoute";

// ── Layout ────────────────────────────────────────────────────────────────────
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// ── Public pages ──────────────────────────────────────────────────────────────
import LandingPage from "./pages/LandingPage";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/AboutPage";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import TermsAndConditions from "./components/TermsAndConditions";
import PrivacyPolicy from "./components/PrivacyPolicy";
import FreeConsultation from "./pages/FreeConsultation";

// ── Auth pages ────────────────────────────────────────────────────────────────
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPassword from "./pages/ForgetPassword";
import NewPassword from "./pages/NewPassword";

// ── User (protected) pages ────────────────────────────────────────────────────
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import OrderHistory from "./pages/OrderHistory";
import CareGuides from "./pages/CareGuides";
import ShippingInfo from "./pages/ShippingInfo";
import TrackOrder from "./pages/TrackOrder";
import Returns from "./pages/Returns";
import ShippingDetails from "./pages/ShippingDetails";
import DeliveryOptions from "./pages/DeliveryOptions";

// ── Admin pages ───────────────────────────────────────────────────────────────
import AdminDashboard from "./admin/AdminDashboard";
import Settings from "./admin/Settings";

// Admin › Users
import ManageUsers from "./admin/users/ManageUsers";
import UserEdit from "./admin/users/UserEdit";
import UserRow from "./admin/users/UserRow";
import UserAdd from "./admin/users/UserAdd";

// Admin › Consultation
import ConsultationDetail from "./admin/consultation-request/ConsultationDetail";
import ConsultationRequests from "./admin/consultation-request/ConsultationRequests";

// Admin › Products
import ManageProducts from "./admin/products/ManageProducts";
import ProductForm from "./admin/products/ProductForm";
import EditProductForm from "./admin/products/EditProductForm";

// Admin › Orders
import OrderList from "./admin/vieworders/OrderList";
import OrderDetails from "./admin/vieworders/OrderDetails";
import OrderTable from "./admin/vieworders/OrderTable";
import OrderActions from "./admin/vieworders/OrderActions";

// Admin › Customer Support
import NewTicketForm from "./admin/customer-support/NewTicketForm";
import SupportAnalytics from "./admin/customer-support/SupportAnalytics";
import TicketDetails from "./admin/customer-support/TicketDetails";
import TicketList from "./admin/customer-support/TicketList";
import ChatsSupport from "./admin/customer-support/ChatsSupport";
import CustomersSupports from "./admin/customer-support/CustomersSupports";

// Admin › Sales Reports
import SalesReport from "./admin/salesreports/SalesReport";

// Admin › Payment Settings
import PaymentSettings from "./admin/paymentsettings/PaymentSettings";
import ChangeLogs from "./admin/paymentsettings/components/ChangeLogs";
import PaymentGatewaySettings from "./admin/paymentsettings/components/PaymentGatewaySettings";
import PaymentMethods from "./admin/paymentsettings/components/PaymentMethods";
import TransactionLogs from "./admin/paymentsettings/components/TransactionLogs";
import UpdatePaymentSettings from "./admin/paymentsettings/components/UpdatePaymentSettings";

// Admin › Marketing Campaigns
import MarketingCampaigns from "./admin/marketingcampaigns/MarketingCampaigns";
import CreateCampaign from "./admin/marketingcampaigns/components/CreateCampaign";
import CampaignAnalytics from "./admin/marketingcampaigns/components/CampaignAnalytics";
import CampaignDetails from "./admin/marketingcampaigns/components/CampaignDetails";
import CampaignList from "./admin/marketingcampaigns/components/CampaignList";

// Admin › Affiliate Program
import AffiliateDashboard from "./admin/affiliate-program/AffiliateDashboard";
import AffiliateList from "./admin/affiliate-program/AffiliateList";
import AffiliateDetails from "./admin/affiliate-program/AffiliateDetails";
import AffiliatePayouts from "./admin/affiliate-program/AffiliatePayouts";
import AffiliateSettings from "./admin/affiliate-program/AffiliateSettings";


const AuthLogoutListener = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = () => {
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [navigate]);

  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
const NavbarFooterWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <div className={isAdminRoute ? '' : 'flex-grow'}>
        {children}
      </div>
      {!isAdminRoute && <Footer />}
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// App
// ─────────────────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <AuthProvider>
      <Router>
        {/* FIX: AuthLogoutListener must be inside <Router> so it can call useNavigate() */}
        <AuthLogoutListener />
        <div className="flex flex-col min-h-screen">
          <NavbarFooterWrapper>
            <Routes>

              {/* ── Fully public ─────────────────────────────────────────── */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/products" element={<ProductListing />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contactus" element={<ContactUs />} />
              <Route path="/careguides" element={<CareGuides />} />
              <Route path="/shippinginfo" element={<ShippingInfo />} />
              <Route path="/shippingdetails" element={<ShippingDetails />} />
              <Route path="/deliveryoptions" element={<DeliveryOptions />} />
              <Route path="/trackorder" element={<TrackOrder />} />
              <Route path="/returns" element={<Returns />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/freeconsultation" element={<FreeConsultation />} />
              <Route path="/termsandconditions" element={<TermsAndConditions />} />
              <Route path="/privacypolicies" element={<PrivacyPolicy />} />

              {/* ── Auth ────────────────────────────────────────────────── */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgetpassword" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<NewPassword />} />
              <Route path="/newpassword" element={<Navigate to="/reset-password" replace />} />

              {/* ── User protected ───────────────────────────────────────── */}
              <Route path="/cart" element={
                <ProtectedRoute><CartPage /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><ProfilePage /></ProtectedRoute>
              } />
              <Route path="/orderhistory" element={
                <ProtectedRoute><OrderHistory /></ProtectedRoute>
              } />

              {/* ── Admin protected ──────────────────────────────────────── */}
              <Route element={<AdminRoute />}>
                <Route
                  path="/admindashboard"
                  element={<Navigate to="/admin/admindashboard" replace />}
                />
                <Route path="/admin/admindashboard"    element={<AdminDashboard />} />
                <Route path="/admin/settings"          element={<Settings />} />

                {/* Users */}
                <Route path="/admin/users/manageusers"     element={<ManageUsers />} />
                <Route path="/admin/users/useredit/:id"    element={<UserEdit />} />
                <Route path="/admin/users/userrow"         element={<UserRow />} />
                <Route path="/admin/users/useradd"         element={<UserAdd />} />

                {/* Products */}
                <Route path="/admin/products/manageproducts"      element={<ManageProducts />} />
                <Route path="/admin/products/productform"         element={<ProductForm />} />
                <Route path="/admin/products/editproductform/:id" element={<EditProductForm />} />

                {/* Consultation Requests */}
                <Route path="/admin/consultation-request" element={<ConsultationRequests />} />
                <Route path="/admin/consultation-request/:id" element={<ConsultationDetail />} />

                {/* Orders */}
                <Route path="/admin/vieworders/orderactions"  element={<OrderActions />} />
                <Route path="/admin/vieworders/orderdetails"  element={<OrderDetails />} />
                <Route path="/admin/vieworders/ordertable"    element={<OrderTable />} />
                <Route path="/admin/vieworders/orderlist"     element={<OrderList />} />

                {/* Customer Support */}
                <Route path="/admin/customer-support/newticketform"    element={<NewTicketForm />} />
                <Route path="/admin/customer-support/supportanalytics" element={<SupportAnalytics />} />
                <Route path="/admin/customer-support/ticketdetails"    element={<TicketDetails />} />
                <Route path="/admin/customer-support/ticketlist"       element={<TicketList />} />
                <Route path="/admin/customer-support/chatssupport"     element={<ChatsSupport />} />
                <Route path="/admin/customer-support/*"                element={<CustomersSupports />} />

                {/* Sales Reports */}
                <Route path="/admin/salesreports/salesreport" element={<SalesReport />} />

                {/* Payment Settings */}
                <Route path="/admin/paymentsettings/paymentsettings"                   element={<PaymentSettings />} />
                <Route path="/admin/paymentsettings/components/changelogs"             element={<ChangeLogs />} />
                <Route path="/admin/paymentsettings/components/paymentgatewaysettings" element={<PaymentGatewaySettings />} />
                <Route path="/admin/paymentsettings/components/paymentmethods"         element={<PaymentMethods />} />
                <Route path="/admin/paymentsettings/components/transactionlogs"        element={<TransactionLogs />} />
                <Route path="/admin/paymentsettings/components/updatepaymentsettings"  element={<UpdatePaymentSettings />} />

                {/* Marketing Campaigns */}
                <Route path="/admin/marketingcampaigns/marketingcampaigns" element={<MarketingCampaigns />} />
                <Route path="/admin/marketingcampaigns/createcampaign"    element={<CreateCampaign />} />
                <Route path="/admin/marketingcampaigns/campaignanalytics"  element={<CampaignAnalytics />} />
                <Route path="/admin/marketingcampaigns/campaigndetails"   element={<CampaignDetails />} />
                <Route path="/admin/marketingcampaigns/campaignlist"       element={<CampaignList />} />


                {/* Affiliate Program */}
                <Route path="/admin/affiliate-program/affiliatedashboard" element={<AffiliateDashboard />} />
                <Route path="/admin/affiliate-program/affiliatelist"     element={<AffiliateList />} />
                <Route path="/admin/affiliate-program/affiliatedetails"   element={<AffiliateDetails />} />
                <Route path="/admin/affiliate-program/affiliatepayouts"    element={<AffiliatePayouts />} />
                <Route path="/admin/affiliate-program/affiliatesettings"  element={<AffiliateSettings />} />
              </Route>

              {/* ── Catch-all ──────────────────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </NavbarFooterWrapper>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;