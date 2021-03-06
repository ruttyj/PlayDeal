import React from "react";

// Children will fill space
export default ({ children }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column"
      }}
    >
      {children}
    </div>
  );
};
