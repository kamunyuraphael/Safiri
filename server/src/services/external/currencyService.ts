import axios from "axios";
import ExchangeRateCache from "../../models/ExchangeRateCache.model";

const FRANKFURTER_BASE_URL = "https://api.frankfurter.app";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const BASE_CURRENCY = "KES";

/**
 * Returns { USD: 0.0077, EUR: 0.0071, ... } — rates FROM KES to other currencies.
 * Serves from cache if fetched within the last hour, otherwise refreshes.
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  const cached = await ExchangeRateCache.findOne({ baseCurrency: BASE_CURRENCY });

  const isFresh =
    cached && Date.now() - cached.fetchedAt.getTime() < CACHE_TTL_MS;

  if (isFresh && cached) {
    return cached.rates as Record<string, number>;
  }

  const { data } = await axios.get(`${FRANKFURTER_BASE_URL}/latest`, {
    params: { from: BASE_CURRENCY },
  });

  const rates: Record<string, number> = data.rates;

  await ExchangeRateCache.findOneAndUpdate(
    { baseCurrency: BASE_CURRENCY },
    { baseCurrency: BASE_CURRENCY, rates, fetchedAt: new Date() },
    { upsert: true, new: true }
  );

  return rates;
}

/**
 * Converts an amount in KES to the target currency.
 * Falls back to returning the original amount if the currency isn't found.
 */
export async function convertFromKes(amountKes: number, targetCurrency: string): Promise<number> {
  if (targetCurrency.toUpperCase() === BASE_CURRENCY) return amountKes;

  const rates = await getExchangeRates();
  const rate = rates[targetCurrency.toUpperCase()];

  if (!rate) {
    throw new Error(`Unsupported currency: ${targetCurrency}`);
  }

  return Math.round(amountKes * rate * 100) / 100;
}
