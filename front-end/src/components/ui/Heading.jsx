import React from "react";

const Heading = React.forwardRef(({ as: Component = "h2", className, children, ...props }, ref) => {
  return (
    <Component className={className} ref={ref} {...props}>
      {children}
    </Component>
  );
});

Heading.displayName = "Heading";

export { Heading };