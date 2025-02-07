import DebtSummary from "../../components/DebtSummary";
import { Button, Img } from "components/ui";
import React from "react";

export default function ViewDebtsColumn() {
  return (
    <div className="mb-[0.25rem] flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem]">

        {/* Header Image */}
        <Img src="images/img_i_3_2.png" alt="I3one" className="h-[13.50rem] w-[42%] object-contain" />

        {/* Debt Summary Section */}
        <div className="ml-[3.50rem] mt-[0.63rem] flex w-[72%] gap-[8.75rem] self-end md:ml-0 md:w-full md:flex-col">
          <DebtSummary className="bg-green-600" />
          <DebtSummary className="bg-red-700" />
        </div>

        {/* Action Buttons */}
        <Button
          shape="round"
          className="mt-[4.13rem] w-full min-w-[15.88rem] max-w-[15.88rem] rounded-[24px] px-[1.88rem] sm:px-[1.25rem]"
        >
          Download the invoice
        </Button>

        <Button
          shape="round"
          className="mt-[1.50rem] w-full min-w-[15.88rem] max-w-[15.88rem] rounded-[24px] px-[2.13rem] sm:px-[1.25rem]"
        >
          Mark as Paid
        </Button>

      </div>
    </div>
  );
}