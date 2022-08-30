/*
  Workaround to relative paths when using barba.js
  Since barba.js makes the page behave like a Single Page Application, this small
  helper function sets the paths relative to the current barba-namespace rather
  than the URL
*/
const rootDir = (location => {
  const dirTree = location.pathname.split("/");

  if (dirTree[1] === "burger-palace") {
    return "/burger-palace/";
  } else {
    return "/";
  }
})(window.location);

const setImageSrcPath = container => {
  const images = container.querySelectorAll("img");
  const imageTransition = document.querySelectorAll(".page-anim img");

  images.forEach(image => {
    image.setAttribute("src", rootDir + image.dataset.src);
  });

  imageTransition.forEach(image => {
    image.setAttribute("src", rootDir + image.dataset.src);
  });
};

let appData = null;
let order = {
  items: [],
  quantity: 1,
  price: 0,
};

// Fetch APP data
const setAppData = () => {
  fetch(rootDir + "data/data.json")
    .then(res => res.json())
    .then(data => {
      appData = data;
      console.log(appData);
    })
    .catch(error => {
      console.log(error);
    });
};

// Home page
const setHomeContext = container => {
  const decreaseOrderBtn = container.querySelector(".decrease-order");
  const increaseOrderBtn = container.querySelector(".increase-order");
  const curOrder = container.querySelector("#nr-of-orders");
  const beginOrder = container.querySelector("#begin-order");

  const handleOrderDecrease = () => {
    curOrder.value = Math.max(1, parseInt(curOrder.value) - 1);
  };

  const handleOrderIncrease = () => {
    curOrder.value = Math.min(30, parseInt(curOrder.value) + 1);
  };

  const handleBeginOrder = event => {
    event.preventDefault();
    order.quantity = parseInt(curOrder.value);
    barba.go("./order");
  };

  decreaseOrderBtn.addEventListener("click", handleOrderDecrease);
  increaseOrderBtn.addEventListener("click", handleOrderIncrease);
  beginOrder.addEventListener("submit", handleBeginOrder);
};

// Order page
const setOrderContext = container => {
  const cancelOrder = container.querySelector(".cancel-order");
  const orderCountDisplay = container.querySelector(".order-count h2");
  const orderPriceDisplay = container.querySelector(".order-price h3");
  const options = {
    burger: null,
    price: 0,
  };

  const handleCancelOrder = () => {
    barba.go(rootDir);
  };

  cancelOrder.addEventListener("click", handleCancelOrder);

  orderCountDisplay.innerText = `Order ${order.items.length + 1}/${order.quantity}`;
  orderPriceDisplay.innerText = `Burger: $${options.price.toFixed(2)}`;
  orderPage = 0;
};

// Barba.js configuration
barba.init({
  preventRunning: true,
  views: [
    {
      namespace: "home",
      beforeEnter({ next }) {
        console.log("beforeEnter: home");
        setAppData();
        setImageSrcPath(next.container);
        setHomeContext(next.container);
      },
      beforeLeave({ next }) {
        console.log("beforeLeave: home");
      },
    },
    {
      namespace: "order",
      beforeEnter({ current, next }) {
        console.log("beforeEnter: order");
        setAppData();
        setImageSrcPath(next.container);

        if (!current.container) {
          window.setTimeout(() => {
            barba.go(rootDir);
          });
        }

        setOrderContext(next.container);
      },
    },
  ],
  transitions: [
    {
      name: "page-transition",
      leave({ current }) {
        const done = this.async();
        const elements = document.querySelectorAll(".page-anim");
        const tl = gsap.timeline({
          defaults: {
            ease: "power2.inOut",
          },
        });

        tl.fromTo(current.container, 0.25, { opacity: 1 }, { opacity: 0 });
        tl.fromTo(elements, 0.75, { x: "-100%" }, { x: "0%", onComplete: done });
      },
      enter({ next }) {
        const done = this.async();
        const elements = document.querySelectorAll(".page-anim");
        const tl = gsap.timeline({
          defaults: {
            ease: "power2.inOut",
            stagger: 0.25,
          },
        });

        tl.fromTo(elements, 0.75, { x: "0%" }, { x: "100%", onComplete: done });
        tl.fromTo(next.container, 0.25, { opacity: 0 }, { opacity: 1 });
      },
    },
  ],
});
