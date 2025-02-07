import DebtSummary from "../../components/DebtSummary";
import { Button, Img } from "components/ui";
import React, { useState } from "react";

export default function ViewDebtsColumn() {
  const [isPaid, setIsPaid] = useState(false);

  const handleMarkAsPaid = () => {
    setIsPaid(!isPaid);
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center">
        {/* Debt Summary Section */}
        <div className="flex justify-center gap-16">
          <DebtSummary className="bg-[#29AD52]" />
          <DebtSummary className="bg-[#CC3843]" isDebt={true} />
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