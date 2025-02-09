import DebtSummary from "../../components/DebtSummary";
import { Button, Img } from "../../components/ui";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ViewDebtsColumn() {
  const [isPaid, setIsPaid] = useState(false);
  const [station, setStation] = useState('NO');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [charges, setCharges] = useState(null);
  const [error, setError] = useState('');

  const stations = ['NO', 'NAO', 'AM', 'KO', 'EG', 'OO'];

  const handleMarkAsPaid = () => {
    setIsPaid(!isPaid);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchCharges = async () => {
    if (!fromDate || !toDate) {
      setError('Please select both dates');
      return;
    }
    
    setError('');
    try {
      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);
      
      const url = `http://localhost:9115/api/chargesBy/${station}/${formattedFromDate}/${formattedToDate}`;
      console.log('Making request to:', url);
      
      const response = await axios.get(url);
      setCharges(response.data);
    } catch (error) {
      console.error('Full error:', error);
      setError(`Error fetching charges: ${error.message}`);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center">
        {/* Station and Date Selection */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex gap-4">
            <select
              value={station}
              onChange={(e) => setStation(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {stations.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span>From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span>To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <Button
            shape="round"
            onClick={fetchCharges}
            className="w-48 rounded-[55px] bg-[#2D7EFF] py-2 text-white text-base font-medium shadow-lg hover:bg-[#2D7EFF]/90 focus:outline-none transition-colors"
          >
            Search Charges
          </Button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        {/* Debt Summary Section */}
        <div className="flex justify-center gap-16">
          <DebtSummary className="bg-[#29AD52]" />
          <DebtSummary className="bg-[#CC3843]" isDebt={true} />
        </div>

        {/* Debug Info */}
        <div className="mt-4 text-sm text-gray-600">
          <p>Selected Station: {station}</p>
          <p>From Date: {fromDate}</p>
          <p>To Date: {toDate}</p>
          <p>Data Received: {charges ? 'Yes' : 'No'}</p>
          {charges && <p>Number of Operators: {charges.vOpList?.length || 0}</p>}
        </div>

        {/* Display Charges Data */}
        {charges ? (
          <div className="mt-6 w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Summary for Station: {charges.tollOpID}</h3>
                <p className="text-sm text-gray-600">Period: {charges.periodFrom} to {charges.periodTo}</p>
                <p className="text-sm text-gray-600">Request Time: {charges.requestTimestamp}</p>
              </div>
              
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="px-4 py-2 text-left">Visiting Operator</th>
                    <th className="px-4 py-2 text-left">Number of Passes</th>
                    <th className="px-4 py-2 text-left">Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {charges.vOpList && charges.vOpList.map((op, index) => (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="px-4 py-2">{op.visitingOpID}</td>
                      <td className="px-4 py-2">{op.nPasses}</td>
                      <td className="px-4 py-2">€{op.passesCost.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-200">
                  <tr>
                    <td className="px-4 py-2 font-semibold">Total</td>
                    <td className="px-4 py-2 font-semibold">
                      {charges.vOpList?.reduce((sum, op) => sum + op.nPasses, 0)}
                    </td>
                    <td className="px-4 py-2 font-semibold">
                      €{charges.vOpList?.reduce((sum, op) => sum + op.passesCost, 0).toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-gray-500">No data loaded yet. Please search for charges.</p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col items-center mt-6">
          <Button
            shape="round"
            className="w-48 rounded-[55px] bg-[#2D7EFF] py-2 text-white text-base font-medium shadow-lg hover:bg-[#2D7EFF]/90 focus:outline-none transition-colors mb-4"
          >
            Download the invoice
          </Button>

          <Button
            shape="round"
            onClick={handleMarkAsPaid}
            className={`w-48 rounded-[55px] py-2 text-white text-base font-medium shadow-lg focus:outline-none transition-colors ${
              isPaid 
                ? 'bg-[#29AD52] hover:bg-[#29AD52]/90' 
                : 'bg-[#2D7EFF] hover:bg-[#2D7EFF]/90'
            }`}
          >
            {isPaid ? 'Paid' : 'Mark as Paid'}
          </Button>
        </div>
      </div>
    </div>
  );
}