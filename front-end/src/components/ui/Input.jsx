import React from "react";
import { cn } from "../../lib/utils"; 
import { cva } from "class-variance-authority";

const inputVariants = cva(
  "w-full flex items-center justify-center sm:px-[1.25rem] cursor-text text-white-a700 text-[1.25rem] font-semibold rounded-[32px]",
  {
    variants: {
      fill: {
        indigo_800: "bg-indigo-800 text-white-a700",
        indigo_800_01: "bg-indigo-800_01 text-white-a700",
      },
      size: {
        xs: "h-[4.13rem] px-[1.50rem] text-[1.25rem]",
      },
      shape: {
        round: "rounded-[32px]",
      },
    },
    defaultVariants: {},
  }
);

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => {
  return <input type={type} className={className} ref={ref} {...props} />;
});

Input.displayName = "Input";

const InputGroup = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div className={cn("relative flex w-full", className)} ref={ref} {...props}>
      {children}
    </div>
  );
});

InputGroup.displayName = "InputGroup";

const InputLeftElement = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      className={cn("absolute aspect-square h-full left-0 justify-center flex items-center", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

InputLeftElement.displayName = "InputLeftElement";

const InputRightElement = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      className={cn("absolute aspect-square h-full right-0 justify-center flex items-center", className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  );
});

InputRightElement.displayName = "InputRightElement";

export { Input, InputGroup, InputLeftElement, InputRightElement };