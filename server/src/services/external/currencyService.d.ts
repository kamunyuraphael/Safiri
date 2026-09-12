/**
 * Returns { USD: 0.0077, EUR: 0.0071, ... } — rates FROM KES to other currencies.
 * Serves from cache if fetched within the last hour, otherwise refreshes.
 */
export declare function getExchangeRates(): Promise<Record<string, number>>;
/**
 * Converts an amount in KES to the target currency.
 * Falls back to returning the original amount if the currency isn't found.
 */
export declare function convertFromKes(amountKes: number, targetCurrency: string): Promise<number>;
//# sourceMappingURL=currencyService.d.ts.map