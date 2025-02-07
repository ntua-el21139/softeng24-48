import { Heading } from "components/ui";
import React from "react";

export default function DebtSummary({
  headerText = "You are indebted:",
  firstLabel = "Aodos",
  firstAmount = "1000 €",
  secondLabel = "Gefyra",
  secondAmount = "500 €",
  totalLabel = "Total receivables:",
  totalAmount = "1500 €",
  ...props
}) {
  return (
    <div
      {...props}
      className={`${props.className} flex flex-col items-center w-[50%] md:w-full border-gray-900_75 border border-solid shadow-xs rounded-[16px]`}
    >
      <Heading size="headingmd" as="h2" className="mt-[0.38rem] text-[2.00rem] font-semibold">
        {headerText}
      </Heading>

      <div className="ml-[1.00rem] mr-[0.88rem] mt-[0.38rem] flex flex-wrap justify-between gap-[1.25rem] self-stretch">
        <Heading as="h4" className="text-[1.50rem] font-semibold">
          {firstLabel}
        </Heading>
        <Heading as="h4" className="text-[1.50rem] font-semibold">
          {firstAmount}
        </Heading>
      </div>

      <div className="mx-[0.88rem] flex flex-wrap justify-between gap-[1.25rem] self-stretch">
        <Heading as="h4" className="text-[1.50rem] font-semibold">
          {secondLabel}
        </Heading>
        <Heading as="h4" className="text-[1.50rem] font-semibold">
          {secondAmount}
        </Heading>
      </div>

      <div className="mt-[7.88rem] flex flex-wrap justify-between gap-[1.25rem] self-stretch rounded-bl-[16px] rounded-br-[16px] bg-green-700 px-[0.88rem] py-[0.63rem]">
        <Heading as="h4" className="text-[1.50rem] font-semibold">
          {totalLabel}
        </Heading>
        <Heading as="h4" className="text-[1.50rem] font-semibold">
          {totalAmount}
        </Heading>
      </div>
    </div>
  );
}