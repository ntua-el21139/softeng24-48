import { Heading } from "components/ui";
import React from "react";

export default function DebtSummary({
  isDebt = false,
  charges = null,
  ...props
}) {
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

  const calculateTotal = (items) => {
    return items?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  };

  const formatItems = (charges) => {
    if (!charges || !Array.isArray(charges)) {
      return [{
        label: 'Select parameters to view debts',
        amount: null
      }];
    }
    
    if (charges.length === 0) {
      return [{
        label: 'You have no outstanding balance for this time period',
        amount: null
      }];
    }
    
    return charges.map(charge => ({
      label: operatorNames[charge.creditor_operator_id] || charge.creditor_operator_id,
      amount: Number(charge.amount).toFixed(2)
    }));
  };

  const data = isDebt ? {
    headerText: "You owe:",
    items: formatItems(charges),
    totalLabel: "Amount payable:",
    totalAmount: calculateTotal(charges).toFixed(2)
  } : {
    headerText: "You are owed:",
    items: [],
    totalLabel: "Total receivables:",
    totalAmount: "0.00"
  };

  return (
    <div
      {...props}
      className={`${props.className} flex flex-col items-center min-h-[320px] rounded-[16px] text-white`}
    >
      <Heading 
        size="headingmd" 
        as="h2" 
        className="mt-4 text-lg md:text-[1.75rem] font-semibold text-white"
      >
        {data.headerText}
      </Heading>

      <div className="flex-1 w-full px-6 md:px-8 mt-3">
        {data.items.map((item, index) => (
          <React.Fragment key={index}>
            <div className={`flex ${item.amount === null ? 'justify-center' : 'justify-between'} items-center py-2`}>
              <Heading as="h4" className="text-base md:text-[1.25rem] font-semibold text-white">
                {item.label}
              </Heading>
              {item.amount !== null && (
                <Heading as="h4" className="text-base md:text-[1.25rem] font-semibold text-white">
                  {item.amount} €
                </Heading>
              )}
            </div>
            {index < data.items.length - 1 && item.amount !== null && (
              <div className="w-full h-[1px] bg-white opacity-50" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="w-full flex justify-between items-center px-6 md:px-8 py-4 mt-auto bg-opacity-20 bg-black rounded-b-[16px]">
        <Heading as="h4" className="text-base md:text-[1.25rem] font-semibold text-white">
          {data.totalLabel}
        </Heading>
        <Heading as="h4" className="text-base md:text-[1.25rem] font-semibold text-white">
          {data.totalAmount} €
        </Heading>
      </div>
    </div>
  );
}