import React, { useState } from "react";
import "./styles.css";

const Box = () => (
  <div
    style={{
      height: 200,
      backgroundColor: "pink",
      margin: 10,
      border: "1px solid black",
      boxSizing: "border-box"
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
    toggle
  };
}

export const Toggle = ({ children, list, increment, decrement }) => {
  const { items = [], max, offset, renderButton, toggle } = useToggle({
    list,
    decrement,
    increment
  });
  console.log("items:", items);
  return (
    <ToggleContext.Provider
      value={{ items, decrement, increment, max, offset, renderButton, toggle }}
    >
      {children}
    </ToggleContext.Provider>
  );
};

const Button = ({ toggle = () => {} }) => {
  return <button onClick={toggle}>Click me!</button>;
};

export default function App() {
  const list = [1, 2, 3, 4, 5, 6];
  const listRef = React.useRef(null);
  const itemRef = React.useRef(null);

  const [isOpen, setIsOpen] = React.useState(false);

  React.useLayoutEffect(() => {
    console.log("listRef offsetWidth:", listRef?.current.offsetWidth);
    console.log("listRef offsetHeight:", listRef?.current.offsetHeight);
    console.log("itemsRef", itemRef?.current?.offsetHeight);
  }, [listRef]);

  console.log("llisth", listRef?.current?.offsetHeight);
  return (
    <div className="App">
      <Toggle list={[1, 2, 3, 4, 5, 6]} increment={3} decrement={3}>
        <ToggleContext.Consumer>
          {({ items = [], offset, originalList, toggle }) => {
            const onClick = () => {
              if (offset >= items.length) {
                setIsOpen(true);
                toggle();
              } else {
                setIsOpen(false);
                toggle();
              }
            };

            return (
              <>
                <ul
                  ref={listRef}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    listStyle: "none",
                    maxHeight: !isOpen
                      ? itemRef?.current?.offsetHeight
                      : itemRef?.current?.offsetHeight * 2,
                    border: "1px solid blue",
                    transition: isOpen
                      ? "max-height 1s ease-in"
                      : "max-height 5s ease-out",
                    overflow: "hidden"
                  }}
                >
                  {items.map((item, idx) => {
                    return (
                      <li ref={itemRef} style={{ flexBasis: "33%" }}>
                        <Box />
                      </li>
                    );
                  })}
                </ul>
                <Button toggle={onClick} />
              </>
            );
          }}
        </ToggleContext.Consumer>
      </Toggle>
    </div>
  );
}
