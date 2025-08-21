import { useState } from "react";

export default function ProfitCalculator() {
  const [seedsCost, setSeedsCost] = useState(0);
  const [fertilizerCost, setFertilizerCost] = useState(0);
  const [laborCost, setLaborCost] = useState(0);
  const [otherCosts, setOtherCosts] = useState(0);
  const [expectedYield, setExpectedYield] = useState(0);
  const [expectedPrice, setExpectedPrice] = useState(0);

  const totalCost = seedsCost + fertilizerCost + laborCost + otherCosts;
  const totalRevenue = expectedYield * expectedPrice;
  const profit = totalRevenue - totalCost;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-green-700">
          🌾 Profit Calculator
        </h1>
        <p className="text-gray-600 mb-6">Calculate your crop profitability by entering costs and expected yield</p>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700">Seeds Cost (₹)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2"
              value={seedsCost}
              onChange={(e) => setSeedsCost(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-gray-700">Fertilizer Cost (₹)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2"
              value={fertilizerCost}
              onChange={(e) => setFertilizerCost(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-gray-700">Labor Cost (₹)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2"
              value={laborCost}
              onChange={(e) => setLaborCost(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-gray-700">Other Costs (₹)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2"
              value={otherCosts}
              onChange={(e) => setOtherCosts(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-gray-700">Expected Yield (kg)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2"
              value={expectedYield}
              onChange={(e) => setExpectedYield(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-gray-700">Expected Price per kg (₹)</label>
            <input
              type="number"
              className="w-full border rounded-lg p-2"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="mt-6 bg-green-50 border rounded-lg p-4">
          <h2 className="text-xl font-semibold text-green-800">📊 Results</h2>
          <p>
            Total Cost: ₹{totalCost}
          </p>
          <p>
            Total Revenue: ₹{totalRevenue}
          </p>
          <p className={`font-bold ${profit >= 0 ? "text-green-700" : "text-red-600"}`}>
            {profit >= 0 ? "Net Profit" : "Net Loss"}: ₹{profit}
          </p>
        </div>
      </div>
    </div>
  );
}



