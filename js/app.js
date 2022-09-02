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

const utilsOrderNumber = () => {
  return Math.random().toString().substring(2, 6);
};

// Reusable "Components"
const setHomeButton = container => {
  const homeBtn = container.querySelector(".home-btn");

  homeBtn.addEventListener("click", () => {
    homeBtn.disabled = true;
    barba.go(rootDir);
  });
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
    })
    .catch(error => {
      alert("There was an error fetching application data. Please refresh the page.");
    });
};

// Home page
const setHomeContext = container => {
  order = {
    items: [],
    quantity: 1,
    total: 0,
  };

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
    barba.go(rootDir + "order");
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
    cheese: "no-cheese",
    extras: [],
    side: "no-side",
    drink: "no-drink",
    page: 0,
    price: 0,
    set setPrice(val) {
      this.price = val;
      displayPrice.innerText = `Burger ${utilsFormatPrice(val)}`;
    },
  };

  const radioInput = {
    burger: {
      id: 'input[name="burger-opt"]',
      initial: null,
      key: "burger",
    },
    cheese: {
      id: 'input[name="cheese-opt"]',
      initial: "no-cheese",
      key: "cheese",
    },
    side: {
      id: 'input[name="side-opts"]',
      initial: "no-side",
      key: "side",
    },
    drink: {
      id: 'input[name="drink-opts"]',
      initial: "no-drink",
      key: "drink",
    },
  };

  displayCount.innerText = `Order ${currentOrder}/${order.quantity}`;
  displayPrice.innerText = `Burger ${utilsFormatPrice(options.price)}`;

  // Button actions
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

  const handleNextPage = () => {
    nextBtn.disabled = true;

    options.page += 1;
    handleMenuSwitch(tabs[options.page - 1], tabs[options.page]);

    switch (options.page) {
      case 3:
        const idx = options.extras.length;

        gsap.fromTo(".bread-top", 0.5, breadAnim.in(idx).from, breadAnim.in(idx).to);
        break;
      case 4:
        nextBtn.innerText = "Done";
        break;
      case 5:
        order.items.push(options);
        order.total += options.price;

        if (order.items.length === order.quantity) {
          barba.go(rootDir + "order-review");
        } else {
          barba.go(rootDir + "order");
        }
        break;
    }

    setTimeout(() => {
      nextBtn.disabled = false;

      if (options.page > 0) {
        prevBtn.disabled = false;
      }
    }, 1500);
  };

  const setRadioDefault = (radio, anim) => {
    const inputs = container.querySelectorAll(radio.id);
    const current = options[radio.key];

    inputs[0].checked = true;

    if (current !== radio.initial) {
      gsap.fromTo(`.${current}`, 0.5, anim.out().from, anim.out().to);

      if (radio.key === "side") {
        gsap.fromTo(`.bbq`, 0.5, sidesBbqAnim.out().from, sidesBbqAnim.out().to);
      }

      options.setPrice = options.price - appData[current].price;
    }

    if (radio.key === "side") {
      gsap.fromTo(".bread-top", 0.5, breadAnim.out().from, breadAnim.out().to);
    } else if (radio.key === "drink") {
      nextBtn.innerText = "Next";
    }

    options[radio.key] = radio.initial;
  };

  const handlePrevPage = () => {
    prevBtn.disabled = true;

    options.page -= 1;
    handleMenuSwitch(tabs[options.page + 1], tabs[options.page]);

    switch (options.page) {
      case 0:
        setRadioDefault(radioInput.cheese, cheeseAnim);
        break;
      case 1:
        const price = (sum => {
          options.extras.forEach(extra => {
            sum += appData[extra].price;
          });

          return sum;
        })(0);

        inputExtras.forEach(input => (input.checked = false));

        options.extras = [];
        options.setPrice = options.price - price;
        gsap.to(".extra", 0.5, { opacity: 0 });
        break;
      case 2:
        setRadioDefault(radioInput.side, sidesAnim);
        break;
      case 3:
        setRadioDefault(radioInput.drink, drinkAnim);
        break;
    }

    setTimeout(() => {
      if (options.page > 0) {
        prevBtn.disabled = false;
      }
    }, 1500);
  };

  nextBtn.addEventListener("click", handleNextPage);
  prevBtn.addEventListener("click", handlePrevPage);

  const setRadioOptions = (radio, anim) => {
    const inputs = container.querySelectorAll(radio.id);

    const handleRadioInput = ({ target }) => {
      const current = options[radio.key];

      if (current !== radio.initial) {
        gsap.fromTo(`.${current}`, 0.5, anim.out().from, anim.out().to);

        if (radio.key === "side") {
          gsap.fromTo(`.bbq`, 0.5, sidesBbqAnim.out().from, sidesBbqAnim.out().to);
        }

        options.setPrice = options.price - appData[current].price;
      } else {
        nextBtn.disabled = false;
      }

      if (target.value !== radio.initial) {
        gsap.fromTo(`.${target.value}`, 0.5, anim.in().from, anim.in().to);

        if (radio.key === "side") {
          gsap.fromTo(`.bbq`, 0.5, sidesBbqAnim.in().from, sidesBbqAnim.in().to);
        }
      }

      options[radio.key] = target.value;
      options.setPrice = options.price + appData[target.value].price;
    };

    inputs.forEach(input => {
      input.addEventListener("change", handleRadioInput);
    });
  };

  setRadioOptions(radioInput.burger, burgerAnim);
  setRadioOptions(radioInput.cheese, cheeseAnim);
  setRadioOptions(radioInput.side, sidesAnim);
  setRadioOptions(radioInput.drink, drinkAnim);

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
        options.extras.forEach((extra, index) => {
          if (index >= idx) {
            gsap.to(`.${extra}`, 0.5, extrasAnim.move().to);
          }
        });
      }
    }
  };

  inputExtras.forEach(input => {
    input.addEventListener("click", handleExtrasInput);
  });
};

const setOrderReviewContext = container => {
  const orderList = container.querySelector(".review-container");
  const displayPrice = container.querySelector(".order-price h3");
  const submitBtn = container.querySelector(".submit-order");
  const submitCheck = container.querySelector("#confirm-order");

  const handleSubmitOrder = () => {
    submitBtn.disabled = true;

    barba.go(rootDir + "order-complete");
  };

  const handleSubmitCheck = ({ target }) => {
    submitBtn.disabled = !target.checked;
  };

  submitBtn.addEventListener("click", handleSubmitOrder);
  submitCheck.addEventListener("change", handleSubmitCheck);

  displayPrice.innerText = `Total ${utilsFormatPrice(order.total)}`;

  const displayOrderItem = (item, index) => {
    const child = document.createElement("div");
    const options = {
      burger: appData[item.burger].name,
      cheese: appData[item.cheese].name,
      extras: (() => {
        let names = item.extras.length > 0 ? "" : "No Extras";

        item.extras.forEach((extra, index) => {
          names += (index === 0 ? "" : ", ") + appData[extra].name;
        });

        return names;
      })(),
      side: appData[item.side].name,
      drink: appData[item.drink].name,
    };

    child.innerHTML = `
      <div class="item-info">
        <h4>${options.burger}</h4>
        <p>${options.cheese} • ${options.extras} • ${options.side} • ${options.drink}</p>
      </div>
      <h4>${utilsFormatPrice(item.price)}</h4>
    `;

    return child;
  };

  order.items.forEach((item, index) => {
    const orderItem = displayOrderItem(item, index);
    orderList.appendChild(orderItem);
  });
};

const setOrderCompleteContext = container => {
  const displayOrderNr = container.querySelector(".order-number");

  displayOrderNr.innerText = `Order N° 0${utilsOrderNumber()}`;
};

// Barba.js configuration
barba.init({
  preventRunning: true,
  views: [
    {
      namespace: "home",
      beforeEnter({ next }) {
        setAppData();
        setImageSrcPath(next.container);
        setHomeContext(next.container);
      },
    },
    {
      namespace: "order",
      beforeEnter({ current, next }) {
        setAppData();
        setHomeButton(next.container);
        setImageSrcPath(next.container);

        // if (!current.container) {
        //   window.setTimeout(() => {
        //     barba.go(rootDir);
        //   }, 2500);
        // }

        setOrderContext(next.container);
      },
    },
    {
      namespace: "order-review",
      beforeEnter({ current, next }) {
        setHomeButton(next.container);
        setOrderReviewContext(next.container);
      },
    },
    {
      namespace: "order-complete",
      beforeEnter({ current, next }) {
        setImageSrcPath(next.container);
        setHomeButton(next.container);
        setOrderCompleteContext(next.container);
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
