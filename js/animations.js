const burgerAnim = {
  in: () => {
    return {
      from: { x: "0%", y: "-300%", opacity: 0, "z-index": 2 },
      to: { x: "0%", y: "-110%", opacity: 1, "z-index": 2 },
    };
  },
  out: () => {
    return {
      from: { x: "0%" },
      to: { x: "300%", opacity: 0 },
    };
  },
};
// const cheeseAnim
// const extrasAnim
// const sidesAnim
// const drinkAnim
