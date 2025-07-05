import React from "react";
import {
  Trash2,
  TrendingUp,
  TrendingDown,
  Star,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { TransactionCardProps } from "../types";
import { CURRENCY_IMAGES, STORAGE_KEYS } from "../utils/constants";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { showSuccessToast } from "../utils/toastUtils";
import { TransactionFooter } from "./TransactionFooter";

export function TransactionCard({
  transaction,
  onUpdate,
  onRemove,
  onToggleFavorite,
  calculateProfit,
  chaosToDiv: chaosToDivFn,
  divToChaos: divToChaosFn,
  convertPrice: convertPriceFn,
  getPriceInChaos: getPriceInChaosFn,
  groups,
  onResetTransaction,
  onCompleteTransaction,
  onStartSelling,
}: TransactionCardProps) {
  const { profit, profitPercentage } = calculateProfit(transaction);
  const isProfit = profit >= 0;
  const [profitDisplayCurrency, setProfitDisplayCurrency] = useLocalStorage<
    "chaos" | "divine"
  >(STORAGE_KEYS.PROFIT_DISPLAY_CURRENCY, "chaos");
  const [sellPriceMode, setSellPriceMode] = useLocalStorage<"unit" | "total">(
    STORAGE_KEYS.SELL_PRICE_MODE,
    "unit"
  ); // 'unit' = giá đơn vị, 'total' = tổng giá

  const toggleBuyPriceCurrency = () => {
    const newCurrency =
      transaction.buyPriceCurrency === "chaos" ? "divine" : "chaos";
    const convertedPrice = convertPriceFn(
      transaction.buyPrice,
      transaction.buyPriceCurrency,
      newCurrency
    );
    onUpdate(transaction.id, "buyPrice", convertedPrice);
    onUpdate(transaction.id, "buyPriceCurrency", newCurrency);
    showSuccessToast(
      `Đã chuyển đổi đơn vị giá mua sang ${
        newCurrency === "chaos" ? "Chaos Orb" : "Divine Orb"
      }`
    );
  };

  const toggleSellPriceCurrency = () => {
    const newCurrency =
      transaction.sellPriceCurrency === "chaos" ? "divine" : "chaos";
    const convertedPrice = convertPriceFn(
      transaction.sellPrice,
      transaction.sellPriceCurrency,
      newCurrency
    );
    onUpdate(transaction.id, "sellPrice", convertedPrice);
    onUpdate(transaction.id, "sellPriceCurrency", newCurrency);
    showSuccessToast(
      `Đã chuyển đổi đơn vị giá bán sang ${
        newCurrency === "chaos" ? "Chaos Orb" : "Divine Orb"
      }`
    );
  };

  const getBuyTotalInChaos = () => {
    return (
      transaction.buyQuantity *
      getPriceInChaosFn(transaction.buyPrice, transaction.buyPriceCurrency)
    );
  };

  const getSellTotalInChaos = () => {
    return (
      transaction.sellQuantity *
      getPriceInChaosFn(transaction.sellPrice, transaction.sellPriceCurrency)
    );
  };

  const getProfitInDisplayCurrency = () => {
    return profitDisplayCurrency === "chaos" ? profit : chaosToDivFn(profit);
  };





  const toggleSellPriceMode = () => {
    setSellPriceMode(sellPriceMode === "unit" ? "total" : "unit");
    showSuccessToast(
      `Đã chuyển sang chế độ nhập ${
        sellPriceMode === "unit" ? "tổng giá" : "giá đơn vị"
      }`
    );
  };

  const handleResetTransaction = () => {
    onResetTransaction(transaction.id);
    showSuccessToast("Đã reset các trường mua vào và bán ra");
  };



  return (
    <div
      className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border p-6 hover:border-slate-600/50 transition-all duration-200 hover:shadow-lg ${
        transaction.isFavorite
          ? "border-yellow-400/50 ring-1 ring-yellow-400/20"
          : "border-slate-700/50"
      }`}
    >
      {/* Transaction Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1">
          <input
            type="checkbox"
            checked={transaction.isSelected || false}
            onChange={(e) =>
              onUpdate(transaction.id, "isSelected", e.target.checked)
            }
            className="w-4 h-4 text-yellow-400 bg-slate-700 border-slate-600 rounded focus:ring-yellow-400 focus:ring-2"
            title="Chọn để tính tổng lợi nhuận"
          />
          <input
            type="text"
            value={transaction.name}
            onChange={(e) => onUpdate(transaction.id, "name", e.target.value)}
            className="text-lg font-semibold text-white bg-transparent border-b border-slate-600 focus:border-yellow-400 focus:outline-none pb-1 flex-1"
          />
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleResetTransaction}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 p-2 rounded-lg transition-colors"
            title="Reset các trường mua vào và bán ra"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleFavorite(transaction.id)}
            className={`p-2 rounded-lg transition-colors ${
              transaction.isFavorite
                ? "text-yellow-400 hover:text-yellow-300 bg-yellow-400/10"
                : "text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10"
            }`}
            title={
              transaction.isFavorite ? "Bỏ yêu thích" : "Đánh dấu yêu thích"
            }
          >
            <Star
              className={`w-4 h-4 ${
                transaction.isFavorite ? "fill-current" : ""
              }`}
            />
          </button>
          <button
            onClick={() => onRemove(transaction.id)}
            className="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-2 rounded-lg transition-colors"
            title="Xóa giao dịch"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Group Selection */}
      <div className="mb-4">
        <label className="text-xs text-slate-400 block mb-1">Nhóm</label>
        <select
          value={transaction.groupId || ""}
          onChange={(e) =>
            onUpdate(transaction.id, "groupId", e.target.value || null)
          }
          className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
        >
          <option value="">Không có nhóm</option>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {/* Buy Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-medium text-slate-300">Mua vào</h3>
          <div className="text-xs text-slate-500">
            <span title="Hỗ trợ tính toán: +, -, *, /, (), 40/30, 100+50">
              🧮
            </span>
          </div>
        </div>
        {/* A divider line */}
        <div className="w-full my-2 h-[1px] bg-slate-600/50"></div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Số lượng
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={transaction.buyQuantity === 0 ? "" : transaction.buyQuantity.toString()}
              onChange={(e) => {
                const raw = e.target.value.replace(",", ".");
                if (raw === "" || raw === "0") {
                  onUpdate(transaction.id, "buyQuantity", 0);
                } else if (raw.endsWith(".")) {
                  // Không update ngay, chờ user nhập xong
                } else {
                  const num = parseFloat(raw);
                  if (!isNaN(num)) {
                    onUpdate(transaction.id, "buyQuantity", Math.round(num * 1000000) / 1000000);
                  }
                }
              }}
              className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-3 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Giá/đơn vị
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={transaction.buyPrice === 0 ? "" : transaction.buyPrice.toString()}
                onChange={(e) => {
                  const raw = e.target.value.replace(",", ".");
                  if (raw === "" || raw === "0") {
                    onUpdate(transaction.id, "buyPrice", 0);
                  } else {
                    // Cho phép nhập số thập phân incomplete như "1." hoặc biểu thức như "40/30"
                    if (raw.endsWith(".") || /[+\-*/÷×()]/.test(raw)) {
                      // Không update ngay, chờ user nhập xong
                      if (/[+\-*/÷×()]/.test(raw)) {
                        // Nếu có phép tính, thử evaluate
                        try {
                          const result = new Function("return " + raw.replace(/÷/g, "/").replace(/×/g, "*"))();
                          if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
                            onUpdate(transaction.id, "buyPrice", Math.round(result * 1000000) / 1000000);
                          }
                        } catch {
                          // Ignore invalid expressions
                        }
                      }
                    } else {
                      const num = parseFloat(raw);
                      if (!isNaN(num)) {
                        onUpdate(transaction.id, "buyPrice", Math.round(num * 1000000) / 1000000);
                      }
                    }
                  }
                }}
                className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-3 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none pr-16"
                placeholder="Ví dụ: 40/30 hoặc 1.5 hoặc 1,5"
              />
              <button
                onClick={toggleBuyPriceCurrency}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-slate-400 hover:text-yellow-400 transition-colors"
                title="Chuyển đổi đơn vị"
              >
                <img
                  src={CURRENCY_IMAGES[transaction.buyPriceCurrency]}
                  alt={`${transaction.buyPriceCurrency} Orb`}
                  className="w-4 h-4"
                />
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
            {transaction.buyPrice > 0 && (
              <div className="text-sm font-medium text-slate-300 mt-1 flex items-center space-x-1">
                <span>
                  ≈{" "}
                  {transaction.buyPriceCurrency === "chaos"
                    ? chaosToDivFn(transaction.buyPrice).toFixed(4)
                    : divToChaosFn(transaction.buyPrice).toFixed(2)}
                </span>
                <img
                  src={
                    CURRENCY_IMAGES[
                      transaction.buyPriceCurrency === "chaos"
                        ? "divine"
                        : "chaos"
                    ]
                  }
                  alt={`${
                    transaction.buyPriceCurrency === "chaos"
                      ? "divine"
                      : "chaos"
                  } Orb`}
                  className="w-4 h-4"
                />
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 text-sm font-medium text-slate-300 flex items-center space-x-1">
          <span>Tổng: {getBuyTotalInChaos().toFixed(2)}</span>
          <img
            src={CURRENCY_IMAGES.chaos}
            alt="Chaos Orb"
            className="w-4 h-4"
          />
          {getBuyTotalInChaos() > 0 && (
            <>
              <span>(≈ {chaosToDivFn(getBuyTotalInChaos()).toFixed(3)}</span>
              <img
                src={CURRENCY_IMAGES.divine}
                alt="Divine Orb"
                className="w-4 h-4"
              />
              <span>)</span>
            </>
          )}
        </div>
      </div>

      {/* Sell Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-medium text-slate-300">Bán ra</h3>
          <div className="text-xs text-slate-500">
            <span title="Hỗ trợ tính toán: +, -, *, /, (), 40/30, 100+50">
              🧮
            </span>
          </div>
        </div>
        <div className="w-full my-2 h-[1px] bg-slate-600/50"></div>
        {/* Mode Toggle Button - Outside of Grid */}
        <div className="flex justify-center mb-2">
          <button
            onClick={toggleSellPriceMode}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-3 py-1 rounded border border-blue-400/30 hover:border-blue-300/50"
            title={
              sellPriceMode === "unit"
                ? "Chuyển sang nhập tổng giá"
                : "Chuyển sang nhập giá đơn vị"
            }
          >
            {sellPriceMode === "unit" ? "Chế độ: Đơn vị" : "Chế độ: Tổng giá"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              Số lượng
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={transaction.sellQuantity === 0 ? "" : transaction.sellQuantity.toString()}
              onChange={(e) => {
                const raw = e.target.value.replace(",", ".");
                if (raw === "" || raw === "0") {
                  onUpdate(transaction.id, "sellQuantity", 0);
                } else if (raw.endsWith(".")) {
                  // Không update ngay, chờ user nhập xong
                } else {
                  const num = parseFloat(raw);
                  if (!isNaN(num)) {
                    onUpdate(transaction.id, "sellQuantity", Math.round(num * 1000000) / 1000000);
                  }
                }
              }}
              className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-3 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">
              {sellPriceMode === "unit" ? "Giá/đơn vị" : "Tổng giá"}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={
                  sellPriceMode === "total"
                    ? (transaction.sellPrice * transaction.sellQuantity === 0 ? "" : (transaction.sellPrice * transaction.sellQuantity).toString())
                    : (transaction.sellPrice === 0 ? "" : transaction.sellPrice.toString())
                }
                onChange={(e) => {
                  const raw = e.target.value.replace(",", ".");
                  if (raw === "" || raw === "0") {
                    onUpdate(transaction.id, "sellPrice", 0);
                  } else {
                    // Cho phép nhập số thập phân incomplete như "1." hoặc biểu thức như "40/30"
                    if (raw.endsWith(".") || /[+\-*/÷×()]/.test(raw)) {
                      // Không update ngay, chờ user nhập xong
                      if (/[+\-*/÷×()]/.test(raw)) {
                        // Nếu có phép tính, thử evaluate
                        try {
                          const result = new Function("return " + raw.replace(/÷/g, "/").replace(/×/g, "*"))();
                          if (typeof result === "number" && !isNaN(result) && isFinite(result)) {
                            if (sellPriceMode === "total") {
                              // Từ tổng giá tính ra giá đơn vị
                              if (transaction.sellQuantity > 0) {
                                const unitPrice = result / transaction.sellQuantity;
                                onUpdate(transaction.id, "sellPrice", Math.round(unitPrice * 1000000) / 1000000);
                              } else {
                                onUpdate(transaction.id, "sellPrice", Math.round(result * 1000000) / 1000000);
                              }
                            } else {
                              onUpdate(transaction.id, "sellPrice", Math.round(result * 1000000) / 1000000);
                            }
                          }
                        } catch {
                          // Ignore invalid expressions
                        }
                      }
                    } else {
                      const num = parseFloat(raw);
                      if (!isNaN(num)) {
                        if (sellPriceMode === "total") {
                          // Từ tổng giá tính ra giá đơn vị
                          if (transaction.sellQuantity > 0) {
                            const unitPrice = num / transaction.sellQuantity;
                            onUpdate(transaction.id, "sellPrice", Math.round(unitPrice * 1000000) / 1000000);
                          } else {
                            onUpdate(transaction.id, "sellPrice", Math.round(num * 1000000) / 1000000);
                          }
                        } else {
                          onUpdate(transaction.id, "sellPrice", Math.round(num * 1000000) / 1000000);
                        }
                      }
                    }
                  }
                }}
                className="w-full bg-slate-700/50 text-white rounded-lg px-3 py-3 text-sm border border-slate-600 focus:border-yellow-400 focus:outline-none pr-16"
                placeholder={
                  sellPriceMode === "total"
                    ? "Ví dụ: 1000+500 (tổng giá)"
                    : "Ví dụ: 40/30 hoặc 1.5 hoặc 1,5"
                }
              />
              <button
                onClick={toggleSellPriceCurrency}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-slate-400 hover:text-yellow-400 transition-colors"
                title="Chuyển đổi đơn vị tiền tệ"
              >
                <img
                  src={CURRENCY_IMAGES[transaction.sellPriceCurrency]}
                  alt={`${transaction.sellPriceCurrency} Orb`}
                  className="w-4 h-4"
                />
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>
            {transaction.sellPrice > 0 && (
              <div className="text-sm font-medium text-slate-300 mt-1 flex items-center space-x-1">
                {sellPriceMode === "unit" ? (
                  <>
                    <span>
                      ≈{" "}
                      {transaction.sellPriceCurrency === "chaos"
                        ? chaosToDivFn(transaction.sellPrice).toFixed(4)
                        : divToChaosFn(transaction.sellPrice).toFixed(2)}
                    </span>
                    <img
                      src={
                        CURRENCY_IMAGES[
                          transaction.sellPriceCurrency === "chaos"
                            ? "divine"
                            : "chaos"
                        ]
                      }
                      alt={`${
                        transaction.sellPriceCurrency === "chaos"
                          ? "divine"
                          : "chaos"
                      } Orb`}
                      className="w-4 h-4"
                    />
                  </>
                ) : transaction.sellQuantity > 0 ? (
                  <>
                    <span>
                      Đơn vị:{" "}
                      {transaction.sellPrice === 0 ? "" : transaction.sellPrice.toString()}
                    </span>
                    <img
                      src={CURRENCY_IMAGES[transaction.sellPriceCurrency]}
                      alt={`${transaction.sellPriceCurrency} Orb`}
                      className="w-4 h-4"
                    />
                  </>
                ) : (
                  <span className="text-orange-400">
                    Cần nhập số lượng để tính giá đơn vị
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 text-sm font-medium text-slate-300 flex items-center space-x-1">
          <span>Tổng: {getSellTotalInChaos().toFixed(2)}</span>
          <img
            src={CURRENCY_IMAGES.chaos}
            alt="Chaos Orb"
            className="w-4 h-4"
          />
          {getSellTotalInChaos() > 0 && (
            <>
              <span>(≈ {chaosToDivFn(getSellTotalInChaos()).toFixed(3)}</span>
              <img
                src={CURRENCY_IMAGES.divine}
                alt="Divine Orb"
                className="w-4 h-4"
              />
              <span>)</span>
            </>
          )}
        </div>
      </div>

      {/* Profit/Loss Section */}
      <div
        className={`rounded-lg p-4 ${
          isProfit
            ? "bg-green-500/10 border border-green-500/20"
            : "bg-red-500/10 border border-red-500/20"
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {isProfit ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
            <span
              className={`text-sm font-medium ${
                isProfit ? "text-green-400" : "text-red-400"
              }`}
            >
              {isProfit ? "Lợi nhuận" : "Lỗ"}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`text-sm font-bold ${
                isProfit ? "text-green-400" : "text-red-400"
              }`}
            >
              {profitPercentage.toFixed(2)}%
            </div>
            <button
              onClick={() =>
                setProfitDisplayCurrency(
                  profitDisplayCurrency === "chaos" ? "divine" : "chaos"
                )
              }
              className={`text-xs ${
                isProfit
                  ? "text-green-400 hover:text-green-300"
                  : "text-red-400 hover:text-red-300"
              } transition-colors`}
              title="Chuyển đổi đơn vị"
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div
          className={`text-lg font-bold flex items-center space-x-1 ${
            isProfit ? "text-green-400" : "text-red-400"
          }`}
        >
          <span>
            {isProfit ? "+" : ""}
            {getProfitInDisplayCurrency().toFixed(
              profitDisplayCurrency === "chaos" ? 2 : 3
            )}
          </span>
          <img
            src={CURRENCY_IMAGES[profitDisplayCurrency]}
            alt={`${profitDisplayCurrency} Orb`}
            className="w-4 h-4"
          />
        </div>
        <div className="text-sm font-medium text-slate-300 mt-1 flex items-center space-x-1">
          <span>
            ≈{" "}
            {profitDisplayCurrency === "chaos"
              ? chaosToDivFn(profit).toFixed(3)
              : divToChaosFn(chaosToDivFn(profit)).toFixed(2)}
          </span>
          <img
            src={
              CURRENCY_IMAGES[
                profitDisplayCurrency === "chaos" ? "divine" : "chaos"
              ]
            }
            alt={`${
              profitDisplayCurrency === "chaos" ? "divine" : "chaos"
            } Orb`}
            className="w-4 h-4"
          />
        </div>
      </div>
      
      {/* Transaction Footer */}
      <TransactionFooter
        transaction={transaction}
        profit={profit}
        profitPercentage={profitPercentage}
        onCompleteTransaction={onCompleteTransaction}
        onStartSelling={onStartSelling}
        isProfit={isProfit}
      />
    </div>
  );
}
