import { Helmet } from "react-helmet";
import Header from "../../components/Header";
import StatisticsColumn from "./StatisticsColumn";
import React from "react";

export default function StatisticsPage() {
  return (
    <>
      <Helmet>
        <title>InterToll</title>
        <meta name="description" content="Web site created using create-react-app" />
      </Helmet>

      <div className="flex w-full flex-col gap-[2.38rem] bg-gradient">
        {/* Header Section */}
        <Header />

        {/* Statistics Content */}
        <StatisticsColumn />
      </div>
    </>
  );
}