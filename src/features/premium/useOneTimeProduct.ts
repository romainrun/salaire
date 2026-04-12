import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import {
  endConnection,
  fetchProducts,
  finishTransaction,
  initConnection,
  purchaseErrorListener,
  purchaseUpdatedListener,
  requestPurchase,
  type Product,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';
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

export function useOneTimeProduct(): OneTimeProductState {
  const setPremium = usePremiumStore((s) => s.setPremium);
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const isSupported = Platform.OS === 'android' || Platform.OS === 'ios';

  useEffect(() => {
    if (!isSupported) return;

    let mounted = true;
    const sku = IAP_CONFIG.proPlanProductId;

    const updateSubscription = purchaseUpdatedListener(async (purchase: Purchase) => {
      try {
        const ids = purchase.ids ?? [purchase.productId];
        if (ids.includes(sku)) {
          setPremium(true);
          await finishTransaction({ purchase, isConsumable: false });
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

    const errorSubscription = purchaseErrorListener((error: PurchaseError) => {
      console.warn('[iap] purchase error', error);
      if (mounted) {
        setPurchasing(false);
        setPurchaseError(error.message ?? 'Achat annulé.');
      }
    });

    const bootstrap = async () => {
      setLoadingPrice(true);
      try {
        await initConnection();
        const products = await fetchProducts({ skus: [sku], type: 'in-app' });
        if (mounted) {
          const found =
            products?.find((item) => item.id === sku && item.type === 'in-app') ?? null;
          setProduct(found as Product | null);
        }
      } catch (error) {
        console.warn('[iap] product fetch failed', error);
        if (mounted) {
          setPurchaseError('Prix indisponible pour le moment.');
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
      updateSubscription.remove();
      errorSubscription.remove();
      void endConnection();
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
      await requestPurchase({
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
