import React, { useState } from "react";
import "./styles.css";

const Box = () => (
  <div
    style={{
      height: 200,
      backgroundColor: "pink",
      margin: 10,
      border: "1px solid black",
      boxSizing: "border-box",
    }}
  />
);

const ToggleContext = React.createContext();
export function useToggle({ decrement = 0, increment = 0, list = [] }) {
  const [offset, setOffset] = useState(increment); // show at least 3 items

  function formatListInIncrements() {
    if (list && list.length) {
      if (list?.length % increment === 0) {
        return list;
      }
      const remainder = list.length % increment;
      return list.slice(0, list.length - remainder); // if 7 items initial, return 6. If 8 return 6
    }
    return [];
  }

  // Note: items broken up in increments.
  // Example: If increments of 3, toggling 3 items at a time
  // if 7 or 8 items are received as props, should return a max of 6.
  const items = formatListInIncrements();

  const toggle = () => {
    // expand list by increment value
    if (offset < items.length) {
      setOffset(offset + increment);
      return;
    }
    // reduce list by decrement value
    if (offset === items.length) {
      setOffset(offset - decrement);
      return;
    }
  };

  return {
    offset, // how many viewable items are in the list
    increment, // how many items we want to see per row
    decrement, // number of items to reduce the items by when toggle collapse
    // Note: items in the list, are broken up by an offset based on the increment
    items: list.slice(0, offset), // items to be rendered
    originalList: list,
    // renderButton: items.length > increment,
    max: items.length || 0, // items rendered count
    toggle,
  };
}

export const Toggle = ({ children, list, increment, decrement }) => {
  const {
    items = [],
    max,
    offset,
    renderButton,
    toggle,
  } = useToggle({
    list,
    decrement,
    increment,
  });

  return (
    <ToggleContext.Provider
      value={{ items, decrement, increment, max, offset, renderButton, toggle }}
    >
      {children}
    </ToggleContext.Provider>
  );
};

const Button = ({ callback, toggle = () => {} }) => {
  const [hoverRef, isHovered] = useHover();
  React.useEffect(() => {
    callback(isHovered);
  }, [isHovered]);

  return <button ref={hoverRef}>Click me!</button>;
};

// Hook
function useHover() {
  const [value, setValue] = React.useState(false);
  console.log("value:", value);
  const ref = React.useRef(null);
  const handleMouseOver = () => setValue(true);
  const handleMouseOut = () => setValue(false);
  React.useEffect(
    () => {
      const node = ref.current;
      if (node) {
        node.addEventListener("mouseover", handleMouseOver);
        node.addEventListener("mouseout", handleMouseOut);
        return () => {
          node.removeEventListener("mouseover", handleMouseOver);
          node.removeEventListener("mouseout", handleMouseOut);
        };
      }
    },
    [ref.current] // Recall only if ref changes
  );
  return [ref, value];
}

export default function App() {
  const listRef = React.useRef(null);
  const itemRef = React.useRef(null);

  const [isExpanded, setIsExpanding] = React.useState(false);
  const [opacity, setOpacity] = React.useState(0);

  return (
    <div className="App">
      <Toggle list={[1, 2, 3, 4, 5, 6]} increment={3} decrement={3}>
        <ToggleContext.Consumer>
          {({ items = [], offset, originalList, toggle }) => {
            function onHover(isHovered) {
              if (isHovered && offset >= items.length) {
                toggle();
                setIsExpanding(true);
                setTimeout(() => {
                  setOpacity(1);
                }, 1000);
              }
              if (isHovered && offset < items.length) {
                toggle();
                setIsExpanding(false);
                setTimeout(() => {
                  setOpacity(0);
                }, 1000);
              }
            }

            return (
              <div className="collections">
                <ul
                  className="list"
                  ref={listRef}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    listStyle: "none",
                    maxHeight: !isExpanded ? 220 : 440,
                    border: "1px solid blue",
                    transition: isExpanded
                      ? "max-height 1000ms ease-in"
                      : "max-height 1000ms ease-out",
                  }}
                >
                  {items.map((item, idx) => {
                    return (
                      <li
                        ref={itemRef}
                        style={{
                          flexBasis: "33%",
                          transition: `opacity 100ms ease-out`,
                          opacity:
                            (offset > 3 && idx < 3) || idx < 3 ? 1 : opacity,
                          border:
                            (offset > 3 && idx < 3) || idx < 3 ? null : "blue",
                        }}
                      >
                        <Box />
                      </li>
                    );
                  })}
                </ul>
                <Button callback={onHover} />
              </div>
            );
          }}
        </ToggleContext.Consumer>
      </Toggle>
    </div>
  );
}
