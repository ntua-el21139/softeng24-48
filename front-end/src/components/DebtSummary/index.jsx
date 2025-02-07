import { Heading } from "components/ui";
import React from "react";

export default function DebtSummary({
  isDebt = false,
  ...props
}) {
  const data = isDebt ? {
    headerText: "You debt:",
    items: [
      { label: "Kentriki Odos", amount: "1000 €" },
      { label: "Moreas", amount: "2000 €" },
      { label: "Nea Odos", amount: "50 €" },
      { label: "Olympia Odos", amount: "250 €" },
    ],
    totalLabel: "Amount payable:",
    totalAmount: "1500 €"
  } : {
    headerText: "You are indebted:",
    items: [
      { label: "Aodos", amount: "1000 €" },
      { label: "Gefyra", amount: "500 €" },
    ],
    totalLabel: "Total receivables:",
    totalAmount: "1500 €"
  };

  return (
    <div
      {...props}
      className={`${props.className} flex flex-col items-center w-[320px] h-[280px] rounded-[16px] text-white`}
    >
      <Heading size="headingmd" as="h2" className="mt-4 text-[1.75rem] font-semibold text-white">
        {data.headerText}
      </Heading>

      <div className="flex-1 w-full px-6 mt-3">
        {data.items.map((item, index) => (
          <React.Fragment key={index}>
            <div className="flex justify-between items-center py-1">
              <Heading as="h4" className="text-[1.25rem] font-semibold text-white">
                {item.label}
              </Heading>
              <Heading as="h4" className="text-[1.25rem] font-semibold text-white">
                {item.amount}
              </Heading>
            </div>
            {index < data.items.length - 1 && (
              <div className="w-full h-[1px] bg-white opacity-50" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="w-full flex justify-between items-center px-6 py-3 mt-auto bg-opacity-20 bg-black rounded-b-[16px]">
        <Heading as="h4" className="text-[1.25rem] font-semibold text-white">
          {data.totalLabel}
        </Heading>
        <Heading as="h4" className="text-[1.25rem] font-semibold text-white">
          {data.totalAmount}
        </Heading>
      </div>
    </div>
  );
}