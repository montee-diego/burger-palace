const fadeAnim = {
  in: () => {
    return {
      from: { opacity: 0 },
      to: { opacity: 1 },
    };
  },
  out: () => {
    return {
      from: { opacity: 1 },
      to: { opacity: 0 },
    };
  },
};

const pageAnim = {
  in: done => {
    return {
      from: { x: "0%" },
      to: { x: "100%", onComplete: done },
    };
  },
  out: done => {
    return {
      from: { x: "-100%" },
      to: { x: "0%", onComplete: done },
    };
  },
};

const menuAnim = {
  in: () => {
    return {
      from: { display: "none", opacity: 0 },
      to: { display: "flex", opacity: 1 },
    };
  },
  out: () => {
    return {
      from: { display: "flex", opacity: 1 },
      to: { display: "none", opacity: 0 },
    };
  },
};

const breadAnim = {
  in: index => {
    return {
      from: { x: "0%", y: "-300%", opacity: 0, "z-index": 3 + index + 1 },
      to: { x: "0%", y: `-${110 + 10 * (index + 1)}%`, opacity: 1, "z-index": 3 + index + 1 },
    };
  },
  out: () => {
    return {
      from: { x: "0%" },
      to: { x: "300%", opacity: 0 },
    };
  },
};

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

const cheeseAnim = {
  in: () => {
    return {
      from: { x: "0%", y: "-300%", opacity: 0, "z-index": 2 },
      to: { x: "0%", y: "-100%", opacity: 1, "z-index": 3 },
    };
  },
  out: () => {
    return {
      from: { x: "0%" },
      to: { x: "300%", opacity: 0 },
    };
  },
};

const extrasAnim = {
  in: index => {
    return {
      from: { x: "0%", y: "-300%", opacity: 0, "z-index": 3 + index },
      to: { x: "0%", y: `-${110 + 10 * index}%`, opacity: 1, "z-index": 3 + index },
    };
  },
  out: () => {
    return {
      from: { x: "0%" },
      to: { x: "200%", opacity: 0 },
    };
  },
  move: () => {
    return {
      to: { y: "+=10%", "z-index": "-=1" },
    };
  },
};

const sidesAnim = {
  in: () => {
    return {
      from: { x: "-45%", y: "-300%", opacity: 0 },
      to: { x: "-45%", y: "-50%", opacity: 1 },
    };
  },
  out: () => {
    return {
      from: { x: "-45%" },
      to: { x: "-45%", y: "-300%", opacity: 0 },
    };
  },
};

const sidesBbqAnim = {
  in: () => {
    return {
      from: { x: "-70%", y: "-300%", opacity: 0 },
      to: { x: "-70%", y: "-40%", opacity: 1 },
    };
  },
  out: () => {
    return {
      from: { x: "-70%" },
      to: { x: "-70%", y: "-300%", opacity: 0 },
    };
  },
};

const drinkAnim = {
  in: () => {
    return {
      from: { x: "50%", y: "-300%", opacity: 0 },
      to: { x: "50%", y: "-10%", opacity: 1 },
    };
  },
  out: () => {
    return {
      from: { x: "50%" },
      to: { x: "200%", opacity: 0 },
    };
  },
};
