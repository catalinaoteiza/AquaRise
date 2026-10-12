import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
  isRevenueCatConfigured,
  initializeRevenueCat,
  syncRevenueCatUser,
  fetchCustomerInfo,
  fetchOfferingsWithDetails,
  parseSupporterEntitlement,
  purchasePackage,
  presentRevenueCatPaywall
} from '../services/revenueCatService';

const RevenueCatContext = createContext({
  isConfigured: false,
  isSupporter: false,
  supporterData: { isSupporter: false, entitlement: null, expiresDate: null, willRenew: false },
  customerInfo: null,
  offerings: null,
  currentOffering: null,
  monthlyPackage: null,
  loading: true,
  actionLoading: false,
  dashboardIssues: [],
  managementUrl: null,
  refreshSubscription: async () => {},
  subscribeMonthly: async () => ({ success: false }),
  showPaywall: async () => ({ success: false })
});

export function RevenueCatProvider({ children }) {
  const { user } = useAuth();

  const [isConfigured, setIsConfigured] = useState(() => isRevenueCatConfigured());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [customerInfo, setCustomerInfo] = useState(null);
  const [supporterData, setSupporterData] = useState({
    isSupporter: false,
    entitlement: null,
    expiresDate: null,
    willRenew: false
  });

  const [offerings, setOfferings] = useState(null);
  const [currentOffering, setCurrentOffering] = useState(null);
  const [monthlyPackage, setMonthlyPackage] = useState(null);
  const [dashboardIssues, setDashboardIssues] = useState([]);

  // Initialize and sync with auth
  useEffect(() => {
    let isMounted = true;

    async function loadRevenueCat() {
      if (!isRevenueCatConfigured()) {
        if (isMounted) {
          setIsConfigured(false);
          setLoading(false);
        }
        return;
      }

      setIsConfigured(true);
      setLoading(true);

      try {
        // Initialize with user.id or persistent anonymous ID
        initializeRevenueCat(user?.id || null);

        // Fetch customer info and offerings in parallel
        const [info, offeringData] = await Promise.allSettled([
          syncRevenueCatUser(user?.id || null),
          fetchOfferingsWithDetails()
        ]);

        if (isMounted) {
          if (info.status === 'fulfilled' && info.value) {
            setCustomerInfo(info.value);
            setSupporterData(parseSupporterEntitlement(info.value));
          }

          if (offeringData.status === 'fulfilled' && offeringData.value) {
            setOfferings(offeringData.value.offerings);
            setCurrentOffering(offeringData.value.currentOffering);
            setMonthlyPackage(offeringData.value.monthlyPackage);
            setDashboardIssues(offeringData.value.dashboardIssues || []);
          }
        }
      } catch (err) {
        console.warn('[AquaRise RevenueCatProvider] Initialization error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRevenueCat();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Refresh latest customer info & entitlement status
  const refreshSubscription = useCallback(async () => {
    if (!isConfigured) return;
    try {
      const info = await fetchCustomerInfo();
      if (info) {
        setCustomerInfo(info);
        setSupporterData(parseSupporterEntitlement(info));
      }
    } catch (err) {
      console.warn('[AquaRise RevenueCatProvider] Failed to refresh customer info:', err);
    }
  }, [isConfigured]);

  // Purchase monthly package
  const subscribeMonthly = useCallback(
    async ({ htmlTarget } = {}) => {
      if (!isConfigured) {
        return { success: false, error: 'RevenueCat is not configured.' };
      }

      const targetPackage = monthlyPackage;
      if (!targetPackage) {
        return {
          success: false,
          error: 'Monthly subscription package is not configured yet in the RevenueCat dashboard.'
        };
      }

      setActionLoading(true);
      try {
        const result = await purchasePackage({
          rcPackage: targetPackage,
          customerEmail: user?.email || undefined,
          htmlTarget
        });

        if (result.success && result.customerInfo) {
          setCustomerInfo(result.customerInfo);
          setSupporterData(parseSupporterEntitlement(result.customerInfo));
        }

        return result;
      } finally {
        setActionLoading(false);
      }
    },
    [isConfigured, monthlyPackage, user?.email]
  );

  // Present RevenueCat Web Paywall
  const showPaywall = useCallback(
    async ({ htmlTarget } = {}) => {
      if (!isConfigured) {
        return { success: false, error: 'RevenueCat is not configured.' };
      }

      setActionLoading(true);
      try {
        const result = await presentRevenueCatPaywall({
          offering: currentOffering || undefined,
          customerEmail: user?.email || undefined,
          htmlTarget
        });

        if (result.success && result.customerInfo) {
          setCustomerInfo(result.customerInfo);
          setSupporterData(parseSupporterEntitlement(result.customerInfo));
        }

        return result;
      } finally {
        setActionLoading(false);
      }
    },
    [isConfigured, currentOffering, user?.email]
  );

  const managementUrl = customerInfo?.managementURL || null;

  return (
    <RevenueCatContext.Provider
      value={{
        isConfigured,
        isSupporter: supporterData.isSupporter,
        supporterData,
        customerInfo,
        offerings,
        currentOffering,
        monthlyPackage,
        loading,
        actionLoading,
        dashboardIssues,
        managementUrl,
        refreshSubscription,
        subscribeMonthly,
        showPaywall
      }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
}

export function useRevenueCat() {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within a RevenueCatProvider');
  }
  return context;
}
