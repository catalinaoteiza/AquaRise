import { Purchases, ErrorCode, PackageType } from '@revenuecat/purchases-js';

export const ENTITLEMENT_ID = 'aquarise_supporter';
export const PACKAGE_IDENTIFIER_MONTHLY = 'monthly';

const ANON_STORAGE_KEY = 'aquarise_rc_anon_user_id';

/**
 * Returns the RevenueCat Web SDK Public API Key from environment variables.
 */
export function getRevenueCatApiKey() {
  const metaEnv = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY : '';
  const procEnv = typeof process !== 'undefined' && process.env ? process.env.VITE_REVENUECAT_PUBLIC_API_KEY : '';
  return (metaEnv || procEnv || '').trim();
}


/**
 * Checks if a RevenueCat Public API Key is configured.
 */
export function isRevenueCatConfigured() {
  const key = getRevenueCatApiKey();
  return Boolean(key && key.length > 5);
}

/**
 * Gets or creates a persisted anonymous user ID for guest visitors.
 */
export function getOrCreateAnonymousUserId() {
  if (typeof window === 'undefined') return 'guest_server_placeholder';
  
  let anonId = localStorage.getItem(ANON_STORAGE_KEY);
  if (!anonId) {
    try {
      anonId = Purchases.generateRevenueCatAnonymousAppUserId();
    } catch {
      anonId = `$RCAnonymousID:${Math.random().toString(36).substring(2)}${Date.now().toString(36)}`;
    }
    localStorage.setItem(ANON_STORAGE_KEY, anonId);
  }
  return anonId;
}

let purchasesInstance = null;
let currentConfiguredUserId = null;

/**
 * Initializes or updates the RevenueCat SDK instance.
 *
 * @param {string|null} userId - The Supabase user.id or null for anonymous visitors
 * @returns {Purchases|null}
 */
export function initializeRevenueCat(userId = null) {
  const apiKey = getRevenueCatApiKey();

  if (!apiKey) {
    console.warn('[AquaRise RevenueCat] Missing VITE_REVENUECAT_PUBLIC_API_KEY in environment.');
    return null;
  }

  const effectiveUserId = userId || getOrCreateAnonymousUserId();

  try {
    if (Purchases.isConfigured() && purchasesInstance) {
      if (currentConfiguredUserId !== effectiveUserId) {
        currentConfiguredUserId = effectiveUserId;
        purchasesInstance.changeUser(effectiveUserId).catch((err) => {
          console.warn('[AquaRise RevenueCat] Error changing user:', err);
        });
      }
      return purchasesInstance;
    }

    purchasesInstance = Purchases.configure({
      apiKey,
      appUserId: effectiveUserId
    });
    currentConfiguredUserId = effectiveUserId;

    // Optional preload for faster paywall rendering
    purchasesInstance.preload().catch((err) => {
      // Non-fatal preload error
      console.debug('[AquaRise RevenueCat] Preload notice:', err?.message || err);
    });

    return purchasesInstance;
  } catch (error) {
    console.error('[AquaRise RevenueCat] Initialization failed:', error);
    return null;
  }
}

/**
 * Returns the current shared Purchases instance if configured.
 */
export function getPurchases() {
  if (purchasesInstance) return purchasesInstance;
  if (Purchases.isConfigured()) {
    try {
      purchasesInstance = Purchases.getSharedInstance();
      return purchasesInstance;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Changes or syncs the active RevenueCat user ID when auth state changes.
 *
 * @param {string|null} newUserId
 */
export async function syncRevenueCatUser(newUserId = null) {
  const effectiveUserId = newUserId || getOrCreateAnonymousUserId();
  const purchases = getPurchases() || initializeRevenueCat(effectiveUserId);

  if (!purchases) return null;

  try {
    if (currentConfiguredUserId !== effectiveUserId) {
      currentConfiguredUserId = effectiveUserId;
      const customerInfo = await purchases.changeUser(effectiveUserId);
      return customerInfo;
    }
    return await purchases.getCustomerInfo();
  } catch (error) {
    console.warn('[AquaRise RevenueCat] Failed to sync user ID:', error);
    return null;
  }
}

/**
 * Evaluates whether customer has the active 'aquarise_supporter' entitlement.
 *
 * @param {object} customerInfo
 * @returns {{ isSupporter: boolean, entitlement: object|null, expiresDate: Date|null, willRenew: boolean }}
 */
export function parseSupporterEntitlement(customerInfo) {
  if (!customerInfo || !customerInfo.entitlements) {
    return {
      isSupporter: false,
      entitlement: null,
      expiresDate: null,
      willRenew: false
    };
  }

  const supporterEntitlement = customerInfo.entitlements.active?.[ENTITLEMENT_ID] || null;
  const isSupporter = Boolean(supporterEntitlement && supporterEntitlement.isActive);

  return {
    isSupporter,
    entitlement: supporterEntitlement,
    expiresDate: supporterEntitlement?.expirationDate || null,
    willRenew: Boolean(supporterEntitlement?.willRenew)
  };
}

/**
 * Fetches latest CustomerInfo from RevenueCat.
 */
export async function fetchCustomerInfo() {
  const purchases = getPurchases() || initializeRevenueCat();
  if (!purchases) return null;

  try {
    const customerInfo = await purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('[AquaRise RevenueCat] Error fetching customer info:', error);
    throw error;
  }
}

/**
 * Fetches offerings and extracts the default offering and monthly package.
 * Also reports any dashboard configuration issues.
 */
export async function fetchOfferingsWithDetails() {
  const purchases = getPurchases() || initializeRevenueCat();
  if (!purchases) {
    return {
      offerings: null,
      currentOffering: null,
      monthlyPackage: null,
      dashboardIssues: ['RevenueCat SDK is not initialized. Please verify VITE_REVENUECAT_PUBLIC_API_KEY.']
    };
  }

  const dashboardIssues = [];

  try {
    const offerings = await purchases.getOfferings();
    const currentOffering = offerings?.current || null;

    if (!currentOffering) {
      dashboardIssues.push(
        'No "current" offering configured in RevenueCat dashboard. Mark an offering as current under Offerings in the dashboard.'
      );
    }

    // Identify monthly package (either offering.monthly or packageType === Monthly or identifier matches)
    let monthlyPackage = null;
    if (currentOffering) {
      monthlyPackage =
        currentOffering.monthly ||
        currentOffering.availablePackages?.find(
          (pkg) =>
            pkg.packageType === PackageType.Monthly ||
            pkg.packageType === '$rc_monthly' ||
            pkg.identifier === 'monthly' ||
            pkg.identifier === '$rc_monthly'
        ) ||
        currentOffering.availablePackages?.[0] ||
        null;

      if (!monthlyPackage) {
        dashboardIssues.push(
          'No Monthly package ($rc_monthly or "monthly") found in current offering. Add a monthly package to your current offering.'
        );
      }

      if (!currentOffering.hasPaywall) {
        // Not necessarily an error, but worth reporting for web paywall feature
        dashboardIssues.push(
          'Notice: Current offering does not have a RevenueCat Web Paywall attached yet. Direct package checkout will be used as fallback.'
        );
      }
    }

    return {
      offerings,
      currentOffering,
      monthlyPackage,
      dashboardIssues
    };
  } catch (error) {
    console.error('[AquaRise RevenueCat] Error fetching offerings:', error);
    dashboardIssues.push(`RevenueCat API Error: ${error.message || error}`);
    return {
      offerings: null,
      currentOffering: null,
      monthlyPackage: null,
      dashboardIssues
    };
  }
}

/**
 * Purchases the monthly supporter subscription package.
 *
 * @param {object} params
 * @param {object} params.rcPackage - The Package to purchase
 * @param {string} [params.customerEmail] - Optional user email
 * @param {HTMLElement} [params.htmlTarget] - Optional HTML mount target
 * @returns {Promise<{ success: boolean, cancelled?: boolean, customerInfo?: object, error?: string }>}
 */
export async function purchasePackage({ rcPackage, customerEmail, htmlTarget }) {
  const purchases = getPurchases() || initializeRevenueCat();
  if (!purchases) {
    return { success: false, error: 'RevenueCat is not initialized.' };
  }

  if (!rcPackage) {
    return { success: false, error: 'No subscription package provided.' };
  }

  try {
    const result = await purchases.purchase({
      rcPackage,
      customerEmail: customerEmail || undefined,
      htmlTarget: htmlTarget || undefined
    });

    const entitlementCheck = parseSupporterEntitlement(result.customerInfo);

    return {
      success: true,
      customerInfo: result.customerInfo,
      isSupporter: entitlementCheck.isSupporter
    };
  } catch (error) {
    if (error?.errorCode === ErrorCode?.UserCancelledError || error?.message?.toLowerCase().includes('cancel')) {
      return { success: false, cancelled: true };
    }
    console.error('[AquaRise RevenueCat] Purchase error:', error);
    return {
      success: false,
      error: error?.message || 'Unable to complete purchase at this time.'
    };
  }
}

/**
 * Launches the RevenueCat Web Paywall for an offering.
 *
 * @param {object} params
 * @param {object} [params.offering] - The offering to present
 * @param {string} [params.customerEmail] - Optional user email
 * @param {HTMLElement} [params.htmlTarget] - Optional HTML mount target
 * @returns {Promise<{ success: boolean, cancelled?: boolean, customerInfo?: object, error?: string }>}
 */
export async function presentRevenueCatPaywall({ offering, customerEmail, htmlTarget }) {
  const purchases = getPurchases() || initializeRevenueCat();
  if (!purchases) {
    return { success: false, error: 'RevenueCat is not initialized.' };
  }

  try {
    const result = await purchases.presentPaywall({
      offering: offering || undefined,
      customerEmail: customerEmail || undefined,
      htmlTarget: htmlTarget || undefined
    });

    const entitlementCheck = parseSupporterEntitlement(result.customerInfo);

    return {
      success: true,
      customerInfo: result.customerInfo,
      selectedPackage: result.selectedPackage,
      isSupporter: entitlementCheck.isSupporter
    };
  } catch (error) {
    if (error?.errorCode === ErrorCode?.UserCancelledError || error?.message?.toLowerCase().includes('cancel')) {
      return { success: false, cancelled: true };
    }
    console.error('[AquaRise RevenueCat] Paywall presentation error:', error);
    return {
      success: false,
      error: error?.message || 'Unable to open paywall.'
    };
  }
}
