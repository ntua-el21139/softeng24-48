import * as React from "react";
import {
  Menu,
  Group,
  Portal,
  Sub,
  RadioGroup,
  CheckboxItem,
  Content,
  Item,
  ItemIndicator,
  Label,
  RadioItem,
  Root,
  Separator,
  SubContent,
  SubTrigger,
  Trigger,
} from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";
import { cn } from "../../lib/utils";

const MenubarMenu = Menu;
const MenubarGroup = Group;
const MenubarPortal = Portal;
const MenubarSub = Sub;
const MenubarRadioGroup = RadioGroup;

const Menubar = React.forwardRef(({ className, ...props }, ref) => (
  <Root
    ref={ref}
    className={cn("flex items-center space-x-1 rounded-md border bg-background p-1", className)}
    {...props}
  />
));
Menubar.displayName = Root.displayName;

const MenubarTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <Trigger
    ref={ref}
    className={cn("flex cursor-pointer select-none items-center text-left focus-visible:outline-0", className)}
    {...props}
  />
));
MenubarTrigger.displayName = Trigger.displayName;

const MenubarSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => (
  <SubTrigger
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto h-4 w-4" />
  </SubTrigger>
));
MenubarSubTrigger.displayName = SubTrigger.displayName;

const MenubarSubContent = React.forwardRef(({ className, ...props }, ref) => (
  <SubContent
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
));
MenubarSubContent.displayName = SubContent.displayName;

const MenubarContent = React.forwardRef(({ className, align = "start", alignOffset = -4, sideOffset = 8, ...props }, ref) => (
  <Portal>
    <Content
      ref={ref}
      align={align}
      alignOffset={alignOffset}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[12rem] overflow-hidden bg-[#fff] rounded-md border shadow-md data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </Portal>
));
MenubarContent.displayName = Content.displayName;

const MenubarItem = React.forwardRef(({ className, inset, ...props }, ref) => (
  <Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      inset && "pl-8",
      className
    )}
    {...props}
  />
));
MenubarItem.displayName = Item.displayName;

const MenubarCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => (
  <CheckboxItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicator>
        <Check className="h-4 w-4" />
      </ItemIndicator>
    </span>
    {children}
  </CheckboxItem>
));
MenubarCheckboxItem.displayName = CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <RadioItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ItemIndicator>
        <Circle className="h-2 w-2 fill-current" />
      </ItemIndicator>
    </span>
    {children}
  </RadioItem>
));
MenubarRadioItem.displayName = RadioItem.displayName;

const MenubarLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props} />
));
MenubarLabel.displayName = Label.displayName;

const MenubarSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
));
MenubarSeparator.displayName = Separator.displayName;

const MenubarShortcut = ({ className, ...props }) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
MenubarShortcut.displayName = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarContent,
  MenubarItem,
  MenubarCheckboxItem,
  MenubarRadioItem,
  MenubarRadioGroup,
  MenubarLabel,
  MenubarSeparator,
  MenubarPortal,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};