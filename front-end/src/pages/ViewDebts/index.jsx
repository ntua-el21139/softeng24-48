import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import ViewDebtsColumn from "./ViewdebtsColumn";
import React from "react";

export default function ViewDebtsPage() {
  return (
    <>
      <Helmet>
        <title>InterToll</title>
        <meta name="description" content="Web site created using create-react-app" />
      </Helmet>

      <div className="flex w-full flex-col gap-[2.38rem] bg-gradient">
        {/* Header Section */}
        <Header />

        {/* View Debts Content */}
        <ViewDebtsColumn />
      </div>
    </>
  );
}