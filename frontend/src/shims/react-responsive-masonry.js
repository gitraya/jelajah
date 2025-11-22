const React = require("react");

function ResponsiveMasonry({ children, ...props }) {
  return React.createElement(
    "div",
    { "data-testid": "responsive-masonry", ...props },
    children
  );
}

function Masonry({ children, ...props }) {
  return React.createElement(
    "div",
    { "data-testid": "masonry", ...props },
    children
  );
}

module.exports = {
  __esModule: true,
  ResponsiveMasonry,
  Masonry,
  default: { ResponsiveMasonry, Masonry },
};
