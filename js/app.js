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

// Utils
const utilsFormatPrice = price => {
  return Intl.NumberFormat(undefined, { style: "currency", currency: "EUR" }).format(price);
};

let appData = null;
let order = {
  items: [],
  quantity: 1,
  total: 0,
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
  const displayCount = container.querySelector(".order-count h2");
  const displayPrice = container.querySelector(".order-price h3");
  const currentOrder = order.items.length + 1;
  const options = {
    burger: null,
    cheese: null,
    extras: [],
    page: 0,
    price: 0,
    set setPrice(val) {
      this.price = val;
      displayPrice.innerText = `Burger ${utilsFormatPrice(val)}`;
    },
  };

  displayCount.innerText = `Order ${currentOrder}/${order.quantity}`;
  displayPrice.innerText = `Burger ${utilsFormatPrice(options.price)}`;

  // Button actions
  const cancelBtn = container.querySelector(".cancel-order");
  const prevBtn = container.querySelector(".prev-btn");
  const nextBtn = container.querySelector(".next-btn");
  const tabs = container.querySelectorAll(".tab");

  const handleMenuSwitch = (leave, enter) => {
    const tl = gsap.timeline({
      defaults: {
        duration: 0.5,
        ease: "power2.inOut",
      },
    });

    tl.fromTo(leave, menuAnim.out().from, menuAnim.out().to);
    tl.fromTo(enter, menuAnim.in().from, menuAnim.in().to);
  };

  const handleCancelOrder = () => {
    cancelBtn.disabled = true;

    barba.go(rootDir);

    setTimeout(() => {
      cancelBtn.disabled = false;
    }, 1500);
  };

  const handleNextPage = () => {
    nextBtn.disabled = true;

    options.page += 1;
    handleMenuSwitch(tabs[options.page - 1], tabs[options.page]);

    setTimeout(() => {
      nextBtn.disabled = false;

      if (options.page > 0) {
        prevBtn.disabled = false;
      }
    }, 1500);
  };

  const handlePrevPage = () => {
    prevBtn.disabled = true;

    options.page -= 1;
    handleMenuSwitch(tabs[options.page + 1], tabs[options.page]);

    if (options.page === 0) {
      inputCheese[0].checked = true;

      if (options.cheese === "swiss" || options.cheese === "cheddar") {
        gsap.fromTo(`.${options.cheese}`, 0.5, cheeseAnim.out().from, cheeseAnim.out().to);
        options.setPrice = options.price - appData[options.cheese].price;
      }

      options.cheese = "no-cheese";
    }

    setTimeout(() => {
      if (options.page > 0) {
        prevBtn.disabled = false;
      }
    }, 1500);
  };

  cancelBtn.addEventListener("click", handleCancelOrder);
  nextBtn.addEventListener("click", handleNextPage);
  prevBtn.addEventListener("click", handlePrevPage);

  // Option: Burger
  const inputBurger = container.querySelectorAll('input[name="burger-opt"]');

  const handleBurgerInput = ({ target }) => {
    if (options.burger) {
      gsap.fromTo(`.${options.burger}`, 0.5, burgerAnim.out().from, burgerAnim.out().to);
      options.setPrice = options.price - appData[options.burger].price;
    } else {
      nextBtn.disabled = false;
    }

    gsap.fromTo(`.${target.value}`, 0.5, burgerAnim.in().from, burgerAnim.in().to);
    options.burger = target.value;
    options.setPrice = options.price + appData[options.burger].price;
  };

  inputBurger.forEach(input => {
    input.addEventListener("change", handleBurgerInput);
  });

  // Option: Cheese
  const inputCheese = container.querySelectorAll('input[name="cheese-opt"]');

  const handleCheeseInput = ({ target }) => {
    if (options.cheese === "swiss" || options.cheese === "cheddar") {
      gsap.fromTo(`.${options.cheese}`, 0.5, cheeseAnim.out().from, cheeseAnim.out().to);
      options.setPrice = options.price - appData[options.cheese].price;
    }

    if (target.value !== "no-cheese") {
      gsap.fromTo(`.${target.value}`, 0.5, cheeseAnim.in().from, cheeseAnim.in().to);
    }

    options.cheese = target.value;
    options.setPrice = options.price + appData[options.cheese].price;
  };

  inputCheese.forEach(input => {
    input.addEventListener("change", handleCheeseInput);
  });

  // Options: Extras
  const inputExtras = container.querySelectorAll('input[type="checkbox"]');

  const handleExtrasInput = ({ target }) => {
    let idx;
    let isOnTop;

    if (target.checked) {
      options.extras.push(target.value);
      options.setPrice = options.price + appData[target.value].price;

      idx = options.extras.length;

      gsap.fromTo(`.${target.value}`, 0.5, extrasAnim.in(idx).from, extrasAnim.in(idx).to);
    } else {
      idx = options.extras.findIndex(extra => extra === target.value);
      isOnTop = idx === options.extras.length - 1;

      options.setPrice = options.price - appData[target.value].price;
      options.extras.splice(idx, 1);

      gsap.fromTo(`.${target.value}`, 0.5, extrasAnim.out().from, extrasAnim.out().to);

      if (!isOnTop) {
        options.extras.forEach(extra => {
          gsap.to(`.${extra}`, 0.5, extrasAnim.move().to);
        });
      }
    }
  };

  inputExtras.forEach(input => {
    input.addEventListener("click", handleExtrasInput);
  });
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

        // if (!current.container) {
        //   window.setTimeout(() => {
        //     barba.go(rootDir);
        //   }, 2500);
        // }

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

        tl.fromTo(current.container, 0.25, fadeAnim.out().from, fadeAnim.out().to);
        tl.fromTo(elements, 0.75, pageAnim.out().from, pageAnim.out(done).to);
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

        tl.fromTo(elements, 0.75, pageAnim.in().from, pageAnim.in(done).to);
        tl.fromTo(next.container, 0.25, fadeAnim.in().from, fadeAnim.in().to);
      },
    },
  ],
});
