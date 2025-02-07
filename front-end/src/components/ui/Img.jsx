import React from "react";

const Img = ({ 
  className, 
  src = "defaultNoData.png", 
  alt = "testImg", 
  ...restProps 
}) => {
  return (
    <img 
      className={className} 
      src={src} 
      alt={alt} 
      loading="lazy" 
      {...restProps} 
    />
  );
};

export { Img };