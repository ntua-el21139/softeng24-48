import DebtSummary from "../../components/DebtSummary";
import { Button, Img } from "../../components/ui";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function ViewDebtsColumn() {
  const [isPaid, setIsPaid] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('1'); // Default to January
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [charges, setCharges] = useState(null);
  const [error, setError] = useState('');
  const [operatorId, setOperatorId] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    console.log('UserData from localStorage:', userData); // Debug log
    if (userData && userData.data && userData.data.operator_id) {  // Changed to access data.operator_id
      setOperatorId(userData.data.operator_id);
      console.log('Set operatorId to:', userData.data.operator_id); // Debug log
    } else {
      console.log('No operator_id found in userData:', userData); // Debug log
    }
  }, []);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const operatorNames = {
    'AM': 'Aegean Motorway',
    'EG': 'Egnantia',
    'GE': 'Gefyra',
    'KO': 'Kentriki Odos',
    'MO': 'Moreas',
    'NAO': 'Nea Attiki Odos',
    'NO': 'Nea Odos',
    'OO': 'Olympia Odos'
  };

  const handleMarkAsPaid = () => {
    setIsPaid(!isPaid);
  };

  const formatDateForApi = () => {
    // Remove any quotes and ensure month is padded with zero
    const paddedMonth = String(selectedMonth).padStart(2, '0');
    // Remove any quotes from the year and concatenate
    return String(selectedYear) + paddedMonth;
  };

  const fetchCharges = useCallback(async () => {
    if (!selectedYear || !selectedMonth || !operatorId) {
      console.log('Missing data:', {
        selectedYear,
        selectedMonth,
        operatorId
      });
      if (!operatorId) {
        setError('Unable to get operator ID. Please try logging in again.');
      } else {
        setError('Please select both month and year');
      }
      return;
    }
    
    setError('');
    try {
      const formattedDate = formatDateForApi();
      const url = `http://localhost:9115/api/deptOffsetting/${operatorId}/${formattedDate}`;
      console.log('Making request to:', url);
      
      const response = await axios.get(url);
      console.log('API Response:', response.data);

      // Handle 204 No Content
      if (response.status === 204) {
        setCharges([]);  // Set empty array to indicate no charges
      } else if (response.data.status === 'success' && Array.isArray(response.data.data)) {
        setCharges(response.data.data);
      } else {
        setError('Invalid response format from server');
        console.error('Invalid response format:', response.data);
      }
    } catch (error) {
      console.error('Full error:', error);
      if (error.response && error.response.status === 204) {
        setCharges([]); // Handle 204 in catch block as well
      } else if (error.response) {
        const errorMessage = error.response.data.message || JSON.stringify(error.response.data);
        setError(`Error ${error.response.status}: ${errorMessage}`);
      } else {
        setError(`Error fetching charges: ${error.message}`);
      }
    }
  }, [selectedMonth, selectedYear, operatorId]);

  useEffect(() => {
    fetchCharges();
  }, [fetchCharges]);

  // Add a debug log when charges change
  useEffect(() => {
    console.log('Charges state updated:', charges);
  }, [charges]);

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center">
        {/* Date Selection */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <span>Month:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span>Year:</span>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                min="2000"
                max="2099"
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>

        {/* Debt Summary Section */}
        <div className="flex justify-center gap-16">
          <DebtSummary 
            className="bg-[#CC3843] w-[800px]" 
            isDebt={true} 
            charges={charges}
          />
        </div>

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