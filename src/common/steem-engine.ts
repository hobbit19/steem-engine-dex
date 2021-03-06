/* eslint-disable no-undef */
import { State } from 'store/state';
import { HttpClient } from 'aurelia-fetch-client';
import { queryParam } from 'common/functions';
import { environment } from './../environment';
import { ssc } from './ssc';
import { getStateOnce } from 'store/store';
import { query } from 'common/apollo';

const http = new HttpClient();

export async function request(url: string, params: any = {}) {
    // Cache buster
    params.v = new Date().getTime();

    url = url + queryParam(params);

    return http.fetch(url, {
        method: 'GET',
    });
}

/**
 *
 * @param symbol a Steem-Engine token symbol (required)
 * @param timestampStart a unix timestamp that represents the start of the dataset (optional)
 * @param timestampEnd a unix timestamp that represents the end of the dataset (optional)
 */
export async function loadTokenMarketHistory(
    symbol: string,
    timestampStart?: string,
    timestampEnd?: string,
): Promise<IHistoryApiItem[]> {
    let url = `${environment.HISTORY_API}?symbol=${symbol.toUpperCase()}`;

    if (timestampStart) {
        url += `&timestampStart=${timestampStart}`;
    }

    if (timestampEnd) {
        url += `&timestampEnd=${timestampEnd}`;
    }

    const response = await http.fetch(url, {
        method: 'GET',
    });

    return response.json() as Promise<IHistoryApiItem[]>;
}

/* istanbul ignore next */
export async function loadCoinPairs(): Promise<ICoinPair[]> {
    const url = `${environment.CONVERTER_API}/pairs/`;

    const response = await http.fetch(url, {
        method: 'GET',
    });

    return response.json() as Promise<ICoinPair[]>;
}

/* istanbul ignore next */
export async function loadCoins(): Promise<ICoin[]> {
    const url = `${environment.CONVERTER_API}/coins/`;

    const response = await http.fetch(url, {
        method: 'GET',
    });

    return response.json() as Promise<ICoin[]>;
}

export function parseTokens(data: any, settings: State['settings']): State {
    const tokens = data.tokens.filter(t => !settings.disabledTokens.includes(t.symbol));

    if (data.steempBalance && data.steempBalance.balance) {
        const token = tokens.find(t => t.symbol === 'STEEMP');

        token.supply -= parseFloat(data.steempBalance.balance);
        (token as any).circulatingSupply -= parseFloat(data.steempBalance.balance);
    }

    return tokens;
}

/* istanbul ignore next */
export async function loadTokens(symbols = [], limit = 1000, offset = 0): Promise<any[]> {
    const callQl = await query(`query {
        tokens(limit: ${limit}, offset: ${offset}, symbols: ${JSON.stringify(symbols)}) {
            issuer,
            symbol,
            name,
            metadata {
                url,
                icon,
                desc
            },
            metric {
                symbol,
                volume,
                volumeExpiration,
                lastPrice,
                lowestAsk,
                highestBid,
                lastDayPrice,
                lastDayPriceExpiration,
                priceChangeSteem,
                priceChangePercent,
                marketCap
            },
            precision,
            maxSupply,
            supply,
            circulatingSupply,
            stakingEnabled,
            delegationEnabled
        },
        steempBalance {
            account,
            symbol,
            balance
        }
    }
    `);

    const { tokens, steempBalance } = callQl.data as {
        tokens: IToken[];
        steempBalance: IBalance;
    };

    const state = await getStateOnce();

    const finalTokens = tokens.filter(t => !state.settings.disabledTokens.includes(t.symbol));

    if (steempBalance && steempBalance.balance) {
        const token = finalTokens.find(t => t.symbol === 'STEEMP');

        if (token) {
            token.supply -= parseFloat(steempBalance.balance);
            (token as any).circulatingSupply -= parseFloat(steempBalance.balance);
        }
    }

    return finalTokens;
}

/* istanbul ignore next */
export async function loadExchangeUiLoggedIn(account, symbol) {
    const callQl = await query(`query {
        tokens(symbols: ["${symbol}", "STEEMP"]) {
            issuer,
            symbol,
            name,
            metadata {
                url,
                icon,
                desc
            },
            metric {
                symbol,
                volume,
                volumeExpiration,
                lastPrice,
                lowestAsk,
                highestBid,
                lastDayPrice,
                lastDayPriceExpiration,
                priceChangeSteem,
                priceChangePercent
            },
            precision,
            maxSupply,
            supply,
            circulatingSupply,
            stakingEnabled,
            delegationEnabled
        },
        steempBalance {
            account,
            symbol,
            balance
        },
        userBalances: balances(account: "${account}", limit: 1000, offset: 0) {
            account,
            symbol,
            balance,
            delegationsIn,
            delegationsOut,
            pendingUndelegations,
            stake,
            pendingUnstake,
            scotConfig {
                pending_token,
                staked_tokens
            },
            usdValueFormatted
        },
        buyBook(symbol: "${symbol}", limit: 1000, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            tokensLocked,
            expiration
          },
          sellBook(symbol: "${symbol}", limit: 1000, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            expiration
          },
          tradesHistory(symbol: "${symbol}", limit: 30, offset: 0) {
            type,
            symbol,
            quantity,
            price,
            timestamp
          },
          userBuyBook: buyBook(symbol: "${symbol}", account: "${account}", limit: 100, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            tokensLocked,
            expiration
          },
          userSellBook: sellBook(symbol: "${symbol}", account: "${account}", limit: 100, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            expiration
          },
          tokenBalance(symbol: "${symbol}", account: "${account}") {
            account,
            symbol,
            balance
          }
    }
    `);

    return callQl?.data as {
        tokens: IToken[];
        steempBalance: IBalance;
        userBalances: IBalance[];
        buyBook: any;
        sellBook: any;
        tradesHistory: any;
        userBuyBook: any;
        userSellBook: any;
        tokenBalance: any;
    };
}

/* istanbul ignore next */
export async function loadExchangeUiLoggedOut(symbol) {
    const callQl = await query(`query {
        tokens(symbols: ["${symbol}", "STEEMP"]) {
            issuer,
            symbol,
            name,
            metadata {
                url,
                icon,
                desc
            },
            metric {
                symbol,
                volume,
                volumeExpiration,
                lastPrice,
                lowestAsk,
                highestBid,
                lastDayPrice,
                lastDayPriceExpiration,
                priceChangeSteem,
                priceChangePercent
            },
            precision,
            maxSupply,
            supply,
            circulatingSupply,
            stakingEnabled,
            delegationEnabled
        },
        steempBalance {
            account,
            symbol,
            balance
        },
        buyBook(symbol: "${symbol}", limit: 1000, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            tokensLocked,
            expiration
          },
          sellBook(symbol: "${symbol}", limit: 1000, offset: 0) {
            txId,
            timestamp,
            account,
            symbol,
            quantity,
            price,
            expiration
          },
          tradesHistory(symbol: "${symbol}", limit: 30, offset: 0) {
            type,
            symbol,
            quantity,
            price,
            timestamp
          }
    }
    `);

    return callQl?.data as {
        tokens: IToken[];
        steempBalance: IBalance;
        userBalances: IBalance[];
        buyBook: any;
        sellBook: any;
        tradesHistory: any;
        userBuyBook: any;
        userSellBook: any;
        tokenBalance: any;
    };
}

/* istanbul ignore next */
export async function loadBalances(account: string): Promise<BalanceInterface[]> {
    const getUserBalances = await query(`query {
        balances(account: "${account}", limit: 1000, offset: 0) {
            account,
            symbol,
            balance,
            delegationsIn,
            delegationsOut,
            pendingUndelegations,
            stake,
            pendingUnstake,
            usdValueFormatted,
            token {
                circulatingSupply,
                issuer, 
                name, 
                symbol,
                delegationEnabled, 
                precision,
                maxSupply,
                stakingEnabled, 
                supply,
                metadata {
                    desc,
                    icon,
                    url
                }
            }
            metric {
                lastDayPriceExpiration,
                lastPrice,
                priceChangePercent,
                priceChangeSteem
            }
            scotConfig {
                pending_token,
                staked_tokens
            }
        }
    }`);

    const state = await getStateOnce();

    const loadedBalances: BalanceInterface[] = getUserBalances.data.balances;

    if (loadedBalances.length) {
        const balances = loadedBalances.filter(b => !state.settings.disabledTokens.includes(b.symbol));

        balances.sort(
            (a, b) =>
                parseFloat(b.balance) * b?.metric?.lastPrice ??
                0 * window.steem_price - parseFloat(b.balance) * a?.metric?.lastPrice ??
                0 * window.steem_price,
        );

        return balances;
    } else {
        return [];
    }
}

export async function loadPendingUnstakes(account: string) {
    try {
        const result = await ssc.find('tokens', 'pendingUnstakes', { account: account }, 1000, 0, '', false);

        return result;
    } catch (e) {
        return [];
    }
}

const delay = t => new Promise(resolve => setTimeout(resolve, t));

export const getTransactionInfo = (trxId: string) =>
    new Promise((resolve, reject) => {
        ssc.getTransactionInfo(trxId, async (err, result) => {
            if (result) {
                if (result.logs) {
                    const logs = JSON.parse(result.logs);

                    if (logs.errors && logs.errors.length > 0) {
                        reject({
                            ...result,
                            error: logs.errors[0],
                        });
                    }
                }

                resolve(result);
            } else {
                reject(result);
            }
        });
    });

export async function checkTransaction(trxId: string, retries: number) {
    try {
        return await getTransactionInfo(trxId);
    } catch (e) {
        if (retries > 0) {
            await delay(5000);
            return await checkTransaction(trxId, retries - 1);
        } else {
            throw new Error('Transaction not found.');
        }
    }
}

/* istanbul ignore next */
export async function loadConversionSentReceived(account) {
    const callQl = await query(`query {
                conversionReceived(account: "${account}") {
                    count,
                    next, 
                    previous,
                    results {
                    url,
                      from_coin_symbol,
                      to_coin_symbol,
                      from_address,
                      to_address,
                      to_memo,
                      to_amount,
                      to_txid,
                      tx_fee,
                      ex_fee,
                      created_at,
                      updated_at,
                      deposit,
                      from_coin,
                      to_coin
                    }
                  }
  
                conversionSent(account: "${account}") {
                    count,
                    next, 
                    previous,
                    results {
    	                url,
                      from_coin_symbol,
                      to_coin_symbol,
                      from_address,
                      to_address,
                      to_memo,
                      to_amount,
                      to_txid,
                      tx_fee,
                      ex_fee,
                      created_at,
                      updated_at,
                      deposit,
                      from_coin,
                      to_coin
                    }
                  }
                }
    `);

    return callQl?.data as {
        conversionSent: IConversionItem;
        conversionReceived: IConversionItem;
    };
}
