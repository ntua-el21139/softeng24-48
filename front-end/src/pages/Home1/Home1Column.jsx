import ImportTollDataColumn from "../../components/ImportTollDataColumn";
import { Img } from "components/ui";
import React, { Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const data = [
  { 
    importIcon: "images/img_icloud_and_arrow_up_fill.svg", 
    importTitle: "Import Toll Data",
    iconSize: "h-24 w-24",
    path: "/importtolldata"
  },
  { 
    importIcon: "images/img_creditcard_tria.svg", 
    importTitle: "View Debts", 
    iconSize: "h-28 w-28",
    path: "/viewdebts"
  },
  { 
    importIcon: "images/img_group.svg", 
    importTitle: "Statistics",
    iconSize: "h-20 w-20 mt-2",
    path: "/statistics"
  },
  { 
    importIcon: "images/img_group_indigo_50.svg", 
    importTitle: "Interactive Map",
    iconSize: "h-24 w-24",
    path: "/interactivemap"
  }
];

export default function Home1Column() {
  const navigate = useNavigate();
  const [roleId, setRoleId] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    setRoleId(userData?.data?.role_id);
  }, []);

  const isButtonDisabled = (title) => {
    if (roleId === 3) {
      return title === "Import Toll Data" || title === "View Debts";
    }
    if (roleId === 4) {
      return title === "Import Toll Data";
    }
    return false;
  };

  const handleClick = (path, title) => {
    if (!isButtonDisabled(title)) {
      navigate(path);
    }
  };

  const getButtonStyle = (title) => {
    const baseStyle = "transform hover:scale-105 transition-duration-300";
    if (isButtonDisabled(title)) {
      return `${baseStyle} opacity-50 pointer-events-none`;
    }
    return baseStyle;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mx-auto flex w-full max-w-[85.50rem] flex-col items-center px-[3.50rem] md:px-[1.25rem]">
        <div className="flex w-full justify-center gap-16 mt-16">
          <Suspense fallback={<div>Loading feed...</div>}>
            {data.map((d, index) => (
              <ImportTollDataColumn 
                {...d} 
                key={`home-${index}`} 
                className={getButtonStyle(d.importTitle)}
                onClick={() => handleClick(d.path, d.importTitle)}
              />
            ))}
          </Suspense>
        </div>
      </div>
    </div>
  );
}