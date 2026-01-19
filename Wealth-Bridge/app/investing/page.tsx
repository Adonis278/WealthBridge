'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaChartLine, FaArrowUp, FaArrowDown, FaCoins, FaTrophy } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { getPortfolio, buyStock, sellStock, initializePortfolio } from '@/lib/portfolioService';
import { addPoints } from '@/lib/gamificationService';

interface Stock {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

interface Portfolio {
  [key: string]: {
    shares: number;
    avgPrice: number;
  };
}

export default function InvestingPage() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(10000); // Virtual currency (leaf tokens)
  const [portfolio, setPortfolio] = useState<Portfolio>({});
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const stocks: Stock[] = [
    { id: '1', name: 'Tech Growth Fund', symbol: 'TGF', price: 125.50, change: 3.25, changePercent: 2.66 },
    { id: '2', name: 'Green Energy ETF', symbol: 'GEE', price: 78.90, change: -1.20, changePercent: -1.50 },
    { id: '3', name: 'Healthcare Index', symbol: 'HCI', price: 210.30, change: 5.80, changePercent: 2.84 },
    { id: '4', name: 'Real Estate Trust', symbol: 'RET', price: 45.60, change: 0.90, changePercent: 2.01 },
    { id: '5', name: 'S&P 500 Index', symbol: 'SPX', price: 450.00, change: 8.50, changePercent: 1.93 },
    { id: '6', name: 'Dividend Leaders', symbol: 'DIV', price: 92.40, change: -0.60, changePercent: -0.65 },
  ];

  // Load portfolio from Firebase
  useEffect(() => {
    const loadPortfolio = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await getPortfolio(user.uid);
        
        if (result.success && result.data) {
          setBalance(result.data.balance);
          
          // Convert holdings Record to portfolio object
          const portfolioObj: Portfolio = {};
          Object.entries(result.data.holdings).forEach(([symbol, holding]) => {
            portfolioObj[symbol] = {
              shares: holding.shares,
              avgPrice: holding.avgPrice
            };
          });
          setPortfolio(portfolioObj);
        } else {
          // Initialize new portfolio for new users
          await initializePortfolio(user.uid, 10000);
          setBalance(10000);
          setPortfolio({});
        }
      } catch (error) {
        console.error('Error loading portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [user]);

  const calculatePortfolioValue = () => {
    let total = 0;
    Object.keys(portfolio).forEach((symbol) => {
      const stock = stocks.find((s) => s.symbol === symbol);
      if (stock) {
        total += stock.price * portfolio[symbol].shares;
      }
    });
    return total;
  };

  const calculatePortfolioGainLoss = () => {
    let gainLoss = 0;
    Object.keys(portfolio).forEach((symbol) => {
      const stock = stocks.find((s) => s.symbol === symbol);
      if (stock) {
        const invested = portfolio[symbol].avgPrice * portfolio[symbol].shares;
        const current = stock.price * portfolio[symbol].shares;
        gainLoss += current - invested;
      }
    });
    return gainLoss;
  };

  const totalValue = balance + calculatePortfolioValue();
  const gainLoss = calculatePortfolioGainLoss();

  const handleBuy = async (stock: Stock) => {
    if (!user) return;
    
    const totalCost = stock.price * quantity;
    if (totalCost <= balance) {
      // Convert portfolio to holdings format
      const holdings: Record<string, { symbol: string; shares: number; avgPrice: number }> = {};
      Object.entries(portfolio).forEach(([symbol, data]) => {
        holdings[symbol] = { symbol, ...data };
      });
      
      // Save to Firebase first
      try {
        const result = await buyStock(user.uid, stock.symbol, quantity, stock.price, balance, holdings);
        
        if (result.success) {
          // Update UI after successful save
          const newBalance = balance - totalCost;
          setBalance(newBalance);
          
          setPortfolio((prev) => {
            const existing = prev[stock.symbol];
            if (existing) {
              const totalShares = existing.shares + quantity;
              const avgPrice = (existing.avgPrice * existing.shares + stock.price * quantity) / totalShares;
              return {
                ...prev,
                [stock.symbol]: { shares: totalShares, avgPrice },
              };
            }
            return {
              ...prev,
              [stock.symbol]: { shares: quantity, avgPrice: stock.price },
            };
          });
          
          // Award points for investing
          await addPoints(user.uid, Math.floor(quantity * 10));
          
          setSelectedStock(null);
          setQuantity(1);
        }
      } catch (error) {
        console.error('Error buying stock:', error);
      }
    }
  };

  const handleSell = async (stock: Stock) => {
    if (!user) return;
    
    const holding = portfolio[stock.symbol];
    if (holding && holding.shares >= quantity) {
      // Convert portfolio to holdings format
      const holdings: Record<string, { symbol: string; shares: number; avgPrice: number }> = {};
      Object.entries(portfolio).forEach(([symbol, data]) => {
        holdings[symbol] = { symbol, ...data };
      });
      
      try {
        const result = await sellStock(user.uid, stock.symbol, quantity, stock.price, balance, holdings);
        
        if (result.success) {
          // Update UI after successful save
          const saleValue = stock.price * quantity;
          setBalance(balance + saleValue);
          
          setPortfolio((prev) => {
            const newShares = holding.shares - quantity;
            if (newShares === 0) {
              const { [stock.symbol]: _, ...rest } = prev;
              return rest;
            }
            return {
              ...prev,
              [stock.symbol]: { ...holding, shares: newShares },
            };
          });
          
          // Award points for selling
          await addPoints(user.uid, Math.floor(quantity * 5));
          
          setSelectedStock(null);
          setQuantity(1);
        }
      } catch (error) {
        console.error('Error selling stock:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-secondary mb-4 font-serif">
            Smart Investing Simulator
          </h1>
          <p className="text-xl text-darkwood">
            Practice investing with virtual currency in a risk-free environment
          </p>
        </motion.div>

        {/* Show login message if not authenticated */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto mb-8 frosted-glass rounded-xl p-6 text-center"
          >
            <p className="text-darkwood mb-4">
              Please log in to start investing and track your portfolio!
            </p>
            <a
              href="/login"
              className="inline-block bg-primary hover:bg-amber text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              Log In
            </a>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && user && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-darkwood">Loading your portfolio...</p>
          </div>
        )}

        {/* Portfolio Summary */}
        {!loading && (
        <>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="frosted-glass rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-2">
              <FaLeaf className="text-3xl text-primary" />
              <span className="text-sm text-darkwood">Leaf Balance</span>
            </div>
            <div className="text-3xl font-bold text-secondary">
              {balance.toFixed(2)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="frosted-glass rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-2">
              <FaChartLine className="text-3xl text-amber" />
              <span className="text-sm text-darkwood">Portfolio Value</span>
            </div>
            <div className="text-3xl font-bold text-secondary">
              {calculatePortfolioValue().toFixed(2)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="frosted-glass rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center space-x-3 mb-2">
              <FaCoins className="text-3xl text-accent" />
              <span className="text-sm text-darkwood">Total Value</span>
            </div>
            <div className="text-3xl font-bold text-secondary">
              {totalValue.toFixed(2)}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`frosted-glass rounded-xl p-6 shadow-lg ${gainLoss >= 0 ? 'bg-green-50' : 'bg-red-50'}`}
          >
            <div className="flex items-center space-x-3 mb-2">
              {gainLoss >= 0 ? (
                <FaArrowUp className="text-3xl text-green-500" />
              ) : (
                <FaArrowDown className="text-3xl text-red-500" />
              )}
              <span className="text-sm text-darkwood">Gain/Loss</span>
            </div>
            <div className={`text-3xl font-bold ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {gainLoss >= 0 ? '+' : ''}{gainLoss.toFixed(2)}
            </div>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Available Stocks */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="frosted-glass rounded-2xl p-8 shadow-xl"
            >
              <h3 className="text-2xl font-bold text-secondary mb-6 font-serif">
                Available Investments
              </h3>
              <div className="space-y-4">
                {stocks.map((stock) => (
                  <div
                    key={stock.id}
                    className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-primary"
                    onClick={() => setSelectedStock(stock)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-lg text-secondary">{stock.symbol}</div>
                        <div className="text-sm text-darkwood">{stock.name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xl text-secondary">
                          <FaLeaf className="inline text-primary mr-1" />
                          {stock.price.toFixed(2)}
                        </div>
                        <div className={`text-sm flex items-center justify-end space-x-1 ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {stock.change >= 0 ? <FaArrowUp /> : <FaArrowDown />}
                          <span>{stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* My Portfolio */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="frosted-glass rounded-2xl p-8 shadow-xl mb-6"
            >
              <h3 className="text-2xl font-bold text-secondary mb-6 font-serif">
                My Portfolio
              </h3>
              {Object.keys(portfolio).length === 0 ? (
                <div className="text-center py-8 text-darkwood">
                  <FaTrophy className="text-5xl text-amber mx-auto mb-4 opacity-50" />
                  <p>Start investing to build your portfolio!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.keys(portfolio).map((symbol) => {
                    const stock = stocks.find((s) => s.symbol === symbol);
                    const holding = portfolio[symbol];
                    if (!stock) return null;

                    const currentValue = stock.price * holding.shares;
                    const costBasis = holding.avgPrice * holding.shares;
                    const gainLossAmount = currentValue - costBasis;
                    const gainLossPercent = (gainLossAmount / costBasis) * 100;

                    return (
                      <div key={symbol} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold text-secondary">{symbol}</div>
                            <div className="text-sm text-darkwood">{holding.shares} shares</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-secondary">
                              <FaLeaf className="inline text-primary mr-1" />
                              {currentValue.toFixed(2)}
                            </div>
                            <div className={`text-xs ${gainLossAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {gainLossAmount >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedStock(stock)}
                          className="w-full mt-2 text-sm bg-amber hover:bg-primary text-white font-medium py-2 px-4 rounded transition-all"
                        >
                          Trade
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
        </>
        )}

        {/* Trading Modal */}
        {selectedStock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedStock(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-2xl font-bold text-secondary mb-6 font-serif">
                Trade {selectedStock.symbol}
              </h3>
              <div className="mb-6">
                <div className="text-lg text-darkwood mb-2">{selectedStock.name}</div>
                <div className="text-3xl font-bold text-primary">
                  <FaLeaf className="inline mr-2" />
                  {selectedStock.price.toFixed(2)}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none"
                />
                <div className="text-sm text-darkwood mt-2">
                  Total: <FaLeaf className="inline text-primary" /> {(selectedStock.price * quantity).toFixed(2)}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleBuy(selectedStock)}
                  disabled={selectedStock.price * quantity > balance}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy
                </button>
                <button
                  onClick={() => handleSell(selectedStock)}
                  disabled={!portfolio[selectedStock.symbol] || portfolio[selectedStock.symbol].shares < quantity}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sell
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
