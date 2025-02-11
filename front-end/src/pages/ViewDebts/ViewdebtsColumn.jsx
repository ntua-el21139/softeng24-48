import DebtSummary from "../../components/DebtSummary";
import { Button, Img } from "../../components/ui";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";

export default function ViewDebtsColumn() {
  const [isPaid, setIsPaid] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(''); // Changed to empty string
  const [selectedYear, setSelectedYear] = useState(''); // Changed to empty string
  const [charges, setCharges] = useState(null);
  const [error, setError] = useState('');
  const [operatorId, setOperatorId] = useState(null);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

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

  // Add useEffect to reset isPaid when parameters change
  useEffect(() => {
    setIsPaid(false);  // Reset to unpaid state when month or year changes
  }, [selectedMonth, selectedYear]);

  // Add useEffect to trigger API call only when both month and year are selected
  useEffect(() => {
    if (selectedMonth && selectedYear && operatorId) {
      fetchCharges();
    }
  }, [selectedMonth, selectedYear, operatorId, fetchCharges]);

  // Add a debug log when charges change
  useEffect(() => {
    console.log('Charges state updated:', charges);
  }, [charges]);

  // Add a function to check if we have valid charges
  const hasValidCharges = charges && Array.isArray(charges) && charges.length > 0;

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('InterToll Invoice', 105, 20, { align: 'center' });
    
    // Add period
    doc.setFontSize(12);
    const period = `${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`;
    doc.text(`Period: ${period}`, 20, 40);
    
    // Add operator info
    doc.text(`Operator: ${operatorNames[operatorId] || operatorId}`, 20, 50);
    
    // Add table headers
    doc.setFontSize(12);
    doc.text('Creditor', 20, 70);
    doc.text('Amount', 120, 70);
    
    // Add table content
    let yPosition = 80;
    charges.forEach(charge => {
      const creditor = operatorNames[charge.creditor_operator_id] || charge.creditor_operator_id;
      const amount = `€${Number(charge.amount).toFixed(2)}`;
      
      doc.text(creditor, 20, yPosition);
      doc.text(amount, 120, yPosition);
      yPosition += 10;
    });
    
    // Add total
    const total = charges.reduce((sum, charge) => sum + Number(charge.amount), 0);
    doc.setFontSize(14);
    doc.text('Total Amount:', 20, yPosition + 10);
    doc.text(`€${total.toFixed(2)}`, 120, yPosition + 10);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 280);
    
    // Download the PDF
    doc.save(`intertoll-invoice-${operatorId}-${period.replace(' ', '-')}.pdf`);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem]">
        {/* Selection Controls */}
        <div className="grid grid-cols-2 gap-4 w-[620px]">
          {/* Month Selection */}
          <div className="relative">
            <button 
              className="flex items-center justify-between bg-[#4A4A9A] text-white px-4 py-3 rounded-[16px] hover:bg-[#4A4A9A]/90 transition-colors w-full h-[48px]"
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
            >
              <span className="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {selectedMonth ? months.find(m => m.value === selectedMonth)?.label : 'Select Month'}
              </span>
              <span className="text-xl ml-2">›</span>
            </button>
            
            {showMonthDropdown && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-[300px] overflow-y-auto">
                {months.map((month) => (
                  <button
                    key={month.value}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 whitespace-normal"
                    onClick={() => {
                      setSelectedMonth(month.value);
                      setShowMonthDropdown(false);
                    }}
                  >
                    {month.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Year Selection */}
          <div className="relative">
            <button 
              className="flex items-center justify-between bg-[#4A4A9A] text-white px-4 py-3 rounded-[16px] hover:bg-[#4A4A9A]/90 transition-colors w-full h-[48px]"
              onClick={() => setShowYearDropdown(!showYearDropdown)}
            >
              <span className="text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {selectedYear || 'Select Year'}
              </span>
              <span className="text-xl ml-2">›</span>
            </button>
            
            {showYearDropdown && (
              <div className="absolute top-full left-0 w-full mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-[300px] overflow-y-auto">
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <button
                    key={year}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 whitespace-normal"
                    onClick={() => {
                      setSelectedYear(year.toString());
                      setShowYearDropdown(false);
                    }}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}

        {/* Debt Summary Section */}
        <div className="mt-6">
          <DebtSummary 
            className="bg-[#CC3843] w-[800px]" 
            isDebt={true} 
            charges={charges}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <Button
            shape="round"
            disabled={!hasValidCharges}
            onClick={handleDownloadInvoice}
            className={`w-48 rounded-[55px] py-2 text-white text-base font-medium shadow-lg focus:outline-none transition-colors ${
              hasValidCharges 
                ? 'bg-[#2D7EFF] hover:bg-[#2D7EFF]/90' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Download the invoice
          </Button>

          <Button
            shape="round"
            onClick={handleMarkAsPaid}
            disabled={!hasValidCharges}
            className={`w-48 rounded-[55px] py-2 text-white text-base font-medium shadow-lg focus:outline-none transition-colors ${
              !hasValidCharges 
                ? 'bg-gray-400 cursor-not-allowed'
                : isPaid 
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