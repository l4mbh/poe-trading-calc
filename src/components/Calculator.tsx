import React, { useState, useEffect, useRef } from "react";
import { X, History, Calculator as CalculatorIcon } from "lucide-react";

interface CalculatorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CalculationHistory {
  expression: string;
  result: string;
  timestamp: Date;
}

export function Calculator({ isOpen, onClose }: CalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const calculatorRef = useRef<HTMLDivElement>(null);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!isOpen) return;

      const key = event.key;

      // Number keys (0-9)
      if (/^[0-9]$/.test(key)) {
        inputDigit(parseInt(key));
      }
      // Decimal point
      else if (key === "." || key === ",") {
        inputDecimal();
      }
      // Operators
      else if (key === "+") {
        performOperation("+");
      } else if (key === "-") {
        performOperation("-");
      } else if (key === "*") {
        performOperation("×");
      } else if (key === "/") {
        performOperation("÷");
      }
      // Enter or = for equals
      else if (key === "Enter" || key === "=") {
        performCalculation();
      }
      // Escape to clear
      else if (key === "Escape") {
        clearAll();
      }
      // Backspace
      else if (key === "Backspace") {
        clearLastChar();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyPress);
      calculatorRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [isOpen, display, previousValue, operation, waitingForOperand]);

  const inputDigit = (digit: number) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
    } else if (display.indexOf(".") === -1) {
      setDisplay(display + ".");
    }
  };

  const clearAll = () => {
    setDisplay("0");
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const clearLastChar = () => {
    if (display.length === 1) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  };

  const performOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);
      setPreviousValue(newValue);
      setDisplay(String(newValue));
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue === null || operation === null) {
      return;
    }

    const result = calculate(previousValue, inputValue, operation);
    const expression = `${previousValue} ${operation} ${inputValue}`;

    // Add to history
    const newHistoryItem: CalculationHistory = {
      expression,
      result: String(result),
      timestamp: new Date(),
    };

    setHistory((prev) => [newHistoryItem, ...prev.slice(0, 9)]); // Keep last 10 items

    setDisplay(String(result));
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const calculate = (
    firstValue: number,
    secondValue: number,
    operation: string
  ): number => {
    switch (operation) {
      case "+":
        return firstValue + secondValue;
      case "-":
        return firstValue - secondValue;
      case "×":
        return firstValue * secondValue;
      case "÷":
        return firstValue / secondValue;
      default:
        return secondValue;
    }
  };

  const formatDisplay = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "0";

    // Format large numbers with commas
    if (Math.abs(num) >= 1000000) {
      return num.toExponential(2);
    }

    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-40 right-4 w-72 h-100 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-40 flex flex-col">
      {/* Calculator Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <CalculatorIcon className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-semibold text-white">Máy tính</h3>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`p-1.5 rounded-lg transition-colors ${
              showHistory
                ? "bg-yellow-500 text-slate-900"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
            title="Lịch sử"
          >
            <History className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            title="Đóng"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Calculator Content */}
      <div className="flex-1 flex flex-col p-3">
        {/* Display */}
        <div className="bg-slate-900 rounded-lg p-3 mb-3">
          <div className="text-right">
            <div className="text-xs text-slate-500 h-4">
              {previousValue !== null &&
                operation &&
                `${previousValue} ${operation}`}
            </div>
            <div className="text-lg font-mono text-white break-all">
              {formatDisplay(display)}
            </div>
          </div>
        </div>

        {/* Calculator Buttons */}
        <div className="grid grid-cols-4 gap-1.5 flex-1 p-3">
          {/* Row 1 */}
          <button
            onClick={clearAll}
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-2 text-xs font-medium transition-colors"
          >
            AC
          </button>
          <button
            onClick={clearLastChar}
            className="bg-slate-600 hover:bg-slate-700 text-white rounded-lg p-2 text-xs font-medium transition-colors"
          >
            C
          </button>
          <button
            onClick={() => performOperation("÷")}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg p-2 text-sm font-medium transition-colors"
          >
            ÷
          </button>
          <button
            onClick={() => performOperation("×")}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg p-2 text-sm font-medium transition-colors"
          >
            ×
          </button>

          {/* Row 2 */}
          <button
            onClick={() => inputDigit(7)}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 text-base font-medium transition-colors"
          >
            7
          </button>
          <button
            onClick={() => inputDigit(8)}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 text-base font-medium transition-colors"
          >
            8
          </button>
          <button
            onClick={() => inputDigit(9)}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 text-base font-medium transition-colors"
          >
            9
          </button>
          <button
            onClick={() => performOperation("-")}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg p-2 text-base font-medium transition-colors"
          >
            -
          </button>

          {/* Row 3 */}
          <button
            onClick={() => inputDigit(4)}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 text-base font-medium transition-colors"
          >
            4
          </button>
          <button
            onClick={() => inputDigit(5)}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 text-base font-medium transition-colors"
          >
            5
          </button>
          <button
            onClick={() => inputDigit(6)}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 text-base font-medium transition-colors"
          >
            6
          </button>
          <button
            onClick={() => performOperation("+")}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg p-2 text-base font-medium transition-colors"
          >
            +
          </button>

          {/* Row 4 */}
          <button
            onClick={() => inputDigit(1)}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 text-base font-medium transition-colors"
          >
            1
          </button>
          <button
            onClick={() => inputDigit(2)}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 text-base font-medium transition-colors"
          >
            2
          </button>
          <button
            onClick={() => inputDigit(3)}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 text-base font-medium transition-colors"
          >
            3
          </button>
          <button
            onClick={performCalculation}
            className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 rounded-lg p-2 text-base font-medium transition-colors row-span-2"
          >
            =
          </button>

          {/* Row 5 */}
          <button
            onClick={() => inputDigit(0)}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 text-base font-medium transition-colors col-span-2"
          >
            0
          </button>
          <button
            onClick={inputDecimal}
            className="bg-slate-700 hover:bg-slate-600 text-white rounded-lg p-2 text-base font-medium transition-colors"
          >
            .
          </button>
        </div>
        {/* History Panel */}
        {showHistory && (
          <div>
            <div className="text-xs text-slate-500 mb-1">Lịch sử</div>
            <div className="bg-slate-900 rounded-lg p-2 mb-3 max-h-24 overflow-y-auto">
              {history.length === 0 ? (
                <div className="text-xs text-slate-600">Chưa có lịch sử</div>
              ) : (
                <div className="space-y-1">
                  {history.map((item, index) => (
                    <div key={index} className="text-xs">
                      <div className="text-slate-400">{item.expression}</div>
                      <div className="text-white font-mono">
                        = {item.result}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
