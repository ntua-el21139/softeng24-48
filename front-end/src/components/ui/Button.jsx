import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "lib/utils";

const buttonVariants = cva(
  "w-full flex flex-row items-center justify-center text-center cursor-pointer whitespace-nowrap text-white-a700 text-[1.25rem] font-semibold bg-light_blue-a700 shadow-sm min-w-[15.88rem] rounded-[24px]",
  {
    variants: {
      fill: {
        light_blue_A700: "bg-light_blue-a700 shadow-sm text-white-a700",
      },
      size: {
        xs: "h-[3.00rem] px-[2.13rem] text-[1.25rem]",
      },
      shape: {
        round: "rounded-[24px]",
      },
    },
    defaultVariants: {},
  }
);

const Button = React.forwardRef(
  (
    {
      colorScheme = "light_blue_A700",
      variant = "fill",
      shape,
      size = "xs",
      children,
      leftIcon,
      rightIcon,
      className,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ [variant]: colorScheme, size, shape, className }))}
        ref={ref}
        {...props}
      >
        {!!leftIcon && leftIcon}
        {children}
        {!!rightIcon && rightIcon}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };