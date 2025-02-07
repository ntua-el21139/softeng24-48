import React from "react";

const sizes = {
  headingxs: "text-[1.25rem] font-semibold",
  headings: "text-[1.50rem] font-semibold md:text-[1.38rem]",
  headingmd: "text-[2.00rem] font-semibold md:text-[1.88rem] sm:text-[1.75rem]",
  headinglg: "text-[3.00rem] font-bold md:text-[2.75rem] sm:text-[2.38rem]",
};

const Heading = ({ children, className = "", size = "headings", as, ...restProps }) => {
  const Component = as || "h6";

  return (
    <Component className={`text-white-a700 font-roboto ${className} ${sizes[size]}`} {...restProps}>
      {children}
    </Component>
  );
};

export { Heading };