import React from "react";

const DebtSummary = ({ className = "", isDebt = true, charges }) => {
  const total = charges
    ? charges.reduce((sum, charge) => sum + Number(charge.amount), 0)
    : 0;

  const operatorNames = {
    'AM': 'Aegean Motorway',
    'EG': 'Egnatia',
    'GE': 'Gefyra',
    'KO': 'Kentriki Odos',
    'MO': 'Moreas',
    'NAO': 'Nea Attiki Odos',
    'NO': 'Nea Odos',
    'OO': 'Olympia Odos'
  };

  const getEmptyMessage = () => {
    if (charges === null) {
      return isDebt 
        ? "Select parameters to view debts" 
        : "Select parameters to view credits";
    }
    // When charges is an empty array (204 response)
    if (charges.length === 0) {
      return isDebt
        ? "You have no debts for this time period."
        : "You have no credits for this time period.";
    }
    return "No charges found";
  };

  return (
    <div className={`rounded-[16px] flex flex-col ${className}`}>
      {/* Header */}
      <div className="text-center py-4 text-white text-2xl font-semibold">
        {isDebt ? "You owe:" : "You are credited:"}
      </div>

      {/* Content */}
      <div className="flex-1 px-6">
        {charges && charges.length > 0 ? (
          charges.map((charge, index) => (
            <React.Fragment key={index}>
              <div className="flex justify-between items-center py-3 text-white text-lg">
                <span>
                  {isDebt 
                    ? (operatorNames[charge.creditor_operator_id] || charge.creditor_operator_id)
                    : (operatorNames[charge.debtor_operator_id] || charge.debtor_operator_id)}
                </span>
                <span>{Number(charge.amount).toFixed(2)} €</span>
              </div>
              {index < charges.length - 1 && (
                <div className="border-t border-white border-opacity-30" />
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="text-center py-4 text-white">
            {getEmptyMessage()}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto border-t border-white border-opacity-20 bg-black bg-opacity-20 py-4 px-6 rounded-b-[16px]">
        <div className="flex justify-between items-center text-white text-lg font-semibold">
          <span>{isDebt ? "Amount payable:" : "Total receivables:"}</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </div>
    </div>
  );
};

export default DebtSummary;