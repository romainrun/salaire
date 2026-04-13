import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import type { Product, Purchase, PurchaseError } from 'react-native-iap';
import { IAP_CONFIG } from '../../config/monetization';
import { usePremiumStore } from '../../store/premiumStore';

interface OneTimeProductState {
  product: Product | null;
  displayPrice: string;
  loadingPrice: boolean;
  purchasing: boolean;
  purchaseError: string | null;
  isSupported: boolean;
  buy: () => Promise<void>;
}

type IAPSubscription = {
  remove: () => void;
};

type IAPModule = {
  endConnection: () => Promise<void>;
  fetchProducts: (options: { skus: string[]; type: 'in-app' }) => Promise<Product[] | null>;
  finishTransaction: (options: { purchase: Purchase; isConsumable: boolean }) => Promise<void>;
  initConnection: () => Promise<void>;
  purchaseErrorListener: (listener: (error: PurchaseError) => void) => IAPSubscription;
  purchaseUpdatedListener: (listener: (purchase: Purchase) => void) => IAPSubscription;
  requestPurchase: (options: {
    type: 'in-app';
    request: { android: { skus: string[] }; ios: { sku: string } };
  }) => Promise<void>;
};

function isMissingNativeIap(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /NitroModules|Native[\s-]?Module|react-native-iap|turbo\/native-module/i.test(message);
}

export function useOneTimeProduct(): OneTimeProductState {
  const setPremium = usePremiumStore((s) => s.setPremium);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const iapRef = useRef<IAPModule | null>(null);

  const isSupported = Platform.OS === 'android' || Platform.OS === 'ios';

  useEffect(() => {
    if (!isSupported) return;

    let mounted = true;
    const sku = IAP_CONFIG.proPlanProductId;
    let updateSubscription: IAPSubscription | null = null;
    let errorSubscription: IAPSubscription | null = null;

    const bootstrap = async () => {
      setLoadingPrice(true);
      try {
        const iap = (await import('react-native-iap')) as unknown as IAPModule;
        iapRef.current = iap;

        updateSubscription = iap.purchaseUpdatedListener(async (purchase: Purchase) => {
          try {
            const ids = purchase.ids ?? [purchase.productId];
            if (ids.includes(sku)) {
              setPremium(true);
              await iap.finishTransaction({ purchase, isConsumable: false });
              if (mounted) {
                setPurchasing(false);
                setPurchaseError(null);
              }
            }
          } catch (error) {
            console.warn('[iap] finish transaction failed', error);
            if (mounted) {
              setPurchasing(false);
              setPurchaseError('Validation achat impossible.');
            }
          }
        });

        errorSubscription = iap.purchaseErrorListener((error: PurchaseError) => {
          console.warn('[iap] purchase error', error);
          if (mounted) {
            setPurchasing(false);
            setPurchaseError(error.message ?? 'Achat annulé.');
          }
        });

        await iap.initConnection();
        const products = await iap.fetchProducts({ skus: [sku], type: 'in-app' });
        if (mounted) {
          const found =
            products?.find((item) => item.id === sku && item.type === 'in-app') ?? null;
          setProduct(found as Product | null);
        }
      } catch (error) {
        console.warn('[iap] product fetch failed', error);
        if (mounted) {
          setPurchaseError(
            isMissingNativeIap(error)
              ? 'Achats indisponibles sur cette build. Installe une build native.'
              : 'Prix indisponible pour le moment.'
          );
        }
      } finally {
        if (mounted) {
          setLoadingPrice(false);
        }
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
      updateSubscription?.remove();
      errorSubscription?.remove();
      const iap = iapRef.current;
      iapRef.current = null;
      if (iap) {
        void iap.endConnection();
      }
    };
  }, [isSupported, setPremium]);

  const buy = useCallback(async () => {
    if (!isSupported) {
      setPurchaseError('Achat disponible uniquement sur mobile.');
      return;
    }
    setPurchaseError(null);
    setPurchasing(true);
    try {
      const iap = iapRef.current;
      if (!iap) {
        setPurchasing(false);
        setPurchaseError('Achats indisponibles sur cette build. Installe une build native.');
        return;
      }
      await iap.requestPurchase({
        type: 'in-app',
        request: {
          android: { skus: [IAP_CONFIG.proPlanProductId] },
          ios: { sku: IAP_CONFIG.proPlanProductId },
        },
      });
    } catch (error) {
      console.warn('[iap] request purchase failed', error);
      setPurchasing(false);
      setPurchaseError('Impossible de lancer l\'achat.');
    }
  }, [isSupported]);

  const displayPrice = useMemo(() => {
    if (product?.displayPrice) return product.displayPrice;
    return IAP_CONFIG.fallbackPriceLabel;
  }, [product]);

  return {
    product,
    displayPrice,
    loadingPrice,
    purchasing,
    purchaseError,
    isSupported,
    buy,
  };
}
