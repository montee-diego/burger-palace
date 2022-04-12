//Globals
let orderTotal;
let orderCurrent = 0;
let orderPrice = 0;
let orderPage = 0;
let orderList = [];

//Page transitions
barba.init({
  views: [
    {
      namespace: "home",
      beforeLeave(data) {
        //Save input data from landing page and reset old data
        orderTotal = document.querySelector(".nr-of-orders").value;
        orderCurrent = 0;
        orderPrice = 0;
        orderPage = 0;
        orderList = [];
      },
      beforeEnter(data) {
        const beginBtn = document.querySelector(".begin-order");

        beginBtn.addEventListener("submit", function (e) {
          e.preventDefault();
          e.target[1].disabled = true;
          barba.go("/order");
        });
      },
    },
    {
      namespace: "order",
      afterEnter(data) {
        const cancelBtn = data.next.container.querySelector(".cancel-order");

        cancelBtn.addEventListener("click", () => {
          cancelBtn.disabled = true;
          barba.go("/");
        });

        orderPrice = 0;

        initOrderPanel(data.next.container);
      },
    },
    {
      namespace: "order-review",
      afterEnter(data) {
        const cancelBtn = data.next.container.querySelector(".cancel-order");

        cancelBtn.addEventListener("click", () => {
          cancelBtn.disabled = true;
          barba.go("/");
        });

        orderPrice = 0;

        initReviewPanel(data.next.container);
      },
    },
    {
      namespace: "order-complete",
      afterEnter(data) {
        const orderNrDisplay = data.next.container.querySelector(".order-number");
        const orderDoneBtn = data.next.container.querySelector(".order-done");

        let orderNumber = (function () {
          return Math.random().toString().substring(2, 6);
        })();

        orderNrDisplay.innerText = `Order N° 0${orderNumber}`;

        orderDoneBtn.addEventListener("click", () => {
          orderDoneBtn.disabled = true;
          barba.go("/");
        });
      },
    },
  ],
  transitions: [
    {
      name: "opacity-transition",
      leave(data) {
        let done = this.async();
        //Create animation
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        tl.fromTo(data.current.container, 0.25, { opacity: 1 }, { opacity: 0 });
        tl.fromTo(".swipe", 0.75, { x: "-100%" }, { x: "0%", onComplete: done });
      },
      enter(data) {
        let done = this.async();
        //Create animation
        const tl = gsap.timeline({ defaults: { ease: "power2.inOut" } });
        tl.fromTo(".swipe", 0.75, { x: "0%" }, { x: "100%", stagger: 0.25, onComplete: done });
        tl.fromTo(data.next.container, 0.25, { opacity: 0 }, { opacity: 1 });
      },
    },
  ],
});

//FUNCTIONS

function initOrderPanel(container) {
  let optBurger = null;
  let optCheese = 0;
  let optExtras = {
    list: [],
    listPrice: 0,
    listTotal: 0,
  };
  let optSides = 0;
  let optDrink = 0;
  let optList = {};

  //Update current order
  const orderDisplay = container.querySelector(".nav-header h2");
  orderCurrent += 1;
  orderDisplay.innerText = `Order ${orderCurrent}/${orderTotal}`;
  orderPage = 0;

  //Update price display
  container.querySelector(".price-display").innerText = `Burger: $${orderPrice.toFixed(2)}`;

  //Reset order panel to first step
  const orderTabs = container.querySelectorAll(".tab");
  gsap.fromTo(orderTabs[0], 0.5, { display: "none", opacity: 0 }, { display: "block", opacity: 1 });
  gsap.fromTo(".bread", 0.5, { y: "-200%", opacity: 0 }, { y: "-55%", opacity: 1 });

  const prevBtn = container.querySelector(".prev-btn");
  const nextBtn = container.querySelector(".next-btn");

  //Select order options
  const inputBurger = container.querySelectorAll('input[name="burger-opt"]');
  const inputCheese = container.querySelectorAll('input[name="cheese-opt"]');
  const inputExtras = container.querySelectorAll('input[type="checkbox"]');
  const inputSides = container.querySelectorAll('input[name="sides"]');
  const inputDrink = container.querySelectorAll('input[name="drink"]');

  inputBurger.forEach((input, index) => {
    input.addEventListener("change", () => {
      //Animate and update price
      if (optBurger === null) {
        gsap.fromTo("." + input.value, 0.5, { x: "0%", y: "-300%", opacity: 0, "z-index": 2 }, { x: "0%", y: "-110%", opacity: 1, "z-index": 2 });
        updatePrice(true, input.dataset.price);
        nextBtn.classList.add("enabled");
      } else {
        gsap.fromTo("." + inputBurger[optBurger].value, 0.5, { x: "0%" }, { x: "200%", opacity: 0 });
        gsap.fromTo("." + input.value, 0.5, { x: "0%", y: "-300%", opacity: 0, "z-index": 2 }, { x: "0%", y: "-110%", opacity: 1, "z-index": 2 });
      }
      //Save current selection
      optBurger = index;
    });
  });

  inputCheese.forEach((input, index) => {
    input.addEventListener("change", () => {
      //Animate and update price
      if (input.value === "no-cheese") {
        if (optCheese > 0) {
          updatePrice(false, inputCheese[optCheese].dataset.price);
          gsap.fromTo("." + inputCheese[optCheese].value, 0.5, { x: "0%" }, { x: "200%", opacity: 0 });
        }
      } else {
        if (optCheese > 0) {
          updatePrice(false, inputCheese[optCheese].dataset.price);
          gsap.fromTo("." + inputCheese[optCheese].value, 0.5, { x: "0%" }, { x: "200%", opacity: 0 });
        }
        updatePrice(true, input.dataset.price);
        gsap.fromTo("." + input.value, 0.5, { x: "0%", y: "-300%", opacity: 0, "z-index": 2 }, { x: "0%", y: "-100%", opacity: 1, "z-index": 3 });
      }
      //Save current selection
      optCheese = index;
    });
  });

  inputExtras.forEach((input, index) => {
    input.addEventListener("click", () => {
      //Update price
      updatePrice(input.checked, input.dataset.price);

      if (input.checked) {
        optExtras.list.push(index);
        optExtras.listPrice += +input.dataset.price;
        optExtras.listTotal = optExtras.list.length;
        gsap.fromTo("." + input.value, 0.5, { x: "0%", y: "-300%", opacity: 0, "z-index": 3 + optExtras.listTotal }, { x: "0%", y: `-${110 + 10 * optExtras.listTotal}%`, opacity: 1, "z-index": 3 + optExtras.listTotal });
      } else {
        let idx = optExtras.list.findIndex(item => item === index);

        optExtras.list.splice(idx, 1);
        optExtras.listPrice -= +input.dataset.price;
        optExtras.listTotal = optExtras.list.length;
        gsap.fromTo("." + input.value, 0.5, { x: "0%" }, { x: "200%", opacity: 0 });

        if (index != optExtras.list[optExtras.listTotal] && optExtras.listTotal > 0) {
          const optExtraItems = document.querySelectorAll(".extra");

          for (let i = idx; i < optExtras.list.length; i++) {
            let remove = optExtras.list[i];
            gsap.to(optExtraItems[remove], 0.5, { y: "+=10%", "z-index": "-=1" });
          }
        }
      }
    });
  });

  inputSides.forEach((input, index) => {
    input.addEventListener("change", () => {
      //Animate and update price
      if (input.value === "no-side") {
        if (optSides > 0) {
          updatePrice(false, inputSides[optSides].dataset.price);
          gsap.fromTo("." + inputSides[optSides].value, 0.5, { x: "-45%" }, { x: "-45%", y: "-300%", opacity: 0 });
          gsap.fromTo(".bbq", 0.5, { x: "-70%" }, { x: "-70%", y: "-300%", opacity: 0 });
        }
      } else {
        if (optSides > 0) {
          updatePrice(false, inputSides[optSides].dataset.price);
          gsap.fromTo("." + inputSides[optSides].value, 0.5, { x: "-45%" }, { x: "-45%", y: "-300%", opacity: 0 });
          gsap.fromTo(".bbq", 0.5, { x: "-70%" }, { x: "-70%", y: "-300%", opacity: 0 });
        }
        updatePrice(true, input.dataset.price);
        gsap.fromTo("." + input.value, 0.5, { x: "-45%", y: "-300%", opacity: 0 }, { x: "-45%", y: "-50%", opacity: 1 });
        gsap.fromTo(".bbq", 0.5, { x: "-70%", y: "-300%", opacity: 0 }, { x: "-70%", y: "-40%", opacity: 1 });
      }
      //Save current selection
      optSides = index;
    });
  });

  inputDrink.forEach((input, index) => {
    input.addEventListener("change", () => {
      if (input.value === "no-drink") {
        if (optDrink > 0) {
          updatePrice(false, inputDrink[optDrink].dataset.price);
          gsap.fromTo("." + inputDrink[optDrink].value, 0.5, { x: "50%" }, { x: "200%", opacity: 0 });
        }
      } else {
        if (optDrink > 0) {
          updatePrice(false, inputDrink[optDrink].dataset.price);
          gsap.fromTo("." + inputDrink[optDrink].value, 0.5, { x: "50%" }, { x: "200%", opacity: 0 });
        }
        updatePrice(true, input.dataset.price);
        gsap.fromTo("." + input.value, 0.5, { x: "50%", y: "-300%", opacity: 0 }, { x: "50%", y: "-10%", opacity: 1 });
      }
      //Save current selection
      optDrink = index;
    });
  });

  prevBtn.addEventListener("click", () => {
    //Disable button to prevent multiple clicks
    prevBtn.disabled = true;
    //Go to previous menu option
    orderPage -= 1;
    menuSwitchAnimation(orderTabs[orderPage + 1], orderTabs[orderPage]);
    //Steps
    switch (orderPage) {
      case 0:
        //Step: cheese leave
        prevBtn.classList.remove("enabled");
        inputCheese[0].checked = true;
        if (optCheese > 0) {
          updatePrice(false, inputCheese[optCheese].dataset.price);
          gsap.fromTo("." + inputCheese[optCheese].value, 0.5, { x: "50%" }, { x: "200%", opacity: 0 });
          optCheese = 0;
        }
        break;
      case 1:
        //Step: extras leave
        gsap.to(".extra", 0.5, { opacity: 0 });

        inputExtras.forEach(el => (el.checked = false));
        updatePrice(false, optExtras.listPrice);
        optExtras.list = [];
        optExtras.listPrice = 0;
        optExtras.listTotal = 0;
        break;
      case 2:
        //Step: sides leave
        inputSides[0].checked = true;
        if (optSides > 0) {
          updatePrice(false, inputSides[optSides].dataset.price);
          gsap.fromTo("." + inputSides[optSides].value, 0.5, { x: "-45%" }, { x: "-45%", y: "-300%", opacity: 0 });
          gsap.fromTo(".bbq", 0.5, { x: "-70%" }, { x: "-70%", y: "-300%", opacity: 0 });
          optSides = 0;
        }
        gsap.fromTo(".bread-top", 0.5, { x: "0%" }, { x: "200%", opacity: 0 });
        break;
      case 3:
        //Step: drinks leave
        inputDrink[0].checked = true;
        if (optDrink > 0) {
          updatePrice(false, inputDrink[optDrink].dataset.price);
          gsap.fromTo("." + inputDrink[optDrink].value, 0.5, { x: "50%" }, { x: "200%", opacity: 0 });
          optDrink = 0;
        }
        nextBtn.innerText = "Next";
        break;
    }

    setTimeout(() => {
      prevBtn.disabled = false;
    }, 1500);
  });

  nextBtn.addEventListener("click", () => {
    //Disable button to prevent multiple clicks
    nextBtn.disabled = true;
    //Go to next menu option
    orderPage += 1;
    menuSwitchAnimation(orderTabs[orderPage - 1], orderTabs[orderPage]);
    //Steps
    switch (orderPage) {
      case 1:
        //Step: cheese enter
        prevBtn.classList.add("enabled");
        break;
      case 2:
        //Step: extras enter
        break;
      case 3:
        //Step: sides enter
        gsap.fromTo(".bread-top", 0.5, { x: "0%", y: "-300%", opacity: 0, "z-index": 3 + optExtras.listTotal + 1 }, { x: "0%", y: `-${110 + 10 * (optExtras.listTotal + 1)}%`, opacity: 1, "z-index": 3 + optExtras.listTotal + 1 });
        break;
      case 4:
        //Step: drinks enter
        nextBtn.innerText = "Done";
        break;
      case 5:
        //Step: done or select next burger
        let extraValues = [];

        extraValues.push(inputCheese[optCheese].dataset.display);
        optExtras.list.forEach(extra => {
          extraValues.push(inputExtras[extra].dataset.display);
        });

        optList = {
          burger: inputBurger[optBurger].dataset.display,
          extras: extraValues,
          sides: inputSides[optSides].dataset.display,
          drink: inputDrink[optDrink].dataset.display,
          price: orderPrice,
        };

        orderList.push(optList);

        //Navigate to next page
        if (orderCurrent == orderTotal) {
          barba.go("/order-review");
        } else {
          barba.go("/order");
        }
        break;
    }
    //Enable button after animations
    setTimeout(() => {
      nextBtn.disabled = false;
    }, 1500);
  });
}

function initReviewPanel(container) {
  const reviewContainer = container.querySelector(".review-container");

  for (let i = 0; i < orderList.length; i++) {
    burgerReview(reviewContainer, i);
    //Update total price
    orderPrice += orderList[i].price;
  }

  //Update price display
  container.querySelector(".price-display").innerText = `Total: $${orderPrice.toFixed(2)}`;

  //Confirm and place order
  const orderConsent = container.querySelector("#confirm-order");
  const orderBtn = container.querySelector(".submit-order");

  orderConsent.addEventListener("click", () => {
    if (orderConsent.checked) {
      orderBtn.classList.add("enabled");
    } else {
      orderBtn.classList.remove("enabled");
    }
  });

  orderBtn.addEventListener("click", () => {
    orderBtn.disabled = true;

    //console.log("completed animation goes here.");
    barba.go("/order-complete");

    setTimeout(() => {
      orderBtn.disabled = false;
    }, 1500);
  });
}

function burgerReview(parent, index) {
  //Create elements
  let divEl = document.createElement("div");
  let indexEl = document.createElement("h1");
  let burgerEl = document.createElement("h2");
  let extrasEl = document.createElement("h2");
  let sidesEl = document.createElement("h2");
  let priceEl = document.createElement("h3");
  let removeButton = document.createElement("button");

  //Update each order with its values
  indexEl.innerText = index + 1;
  burgerEl.innerText = orderList[index].burger;
  extrasEl.innerText = orderList[index].extras.join(", ");
  extrasEl.classList.add("item-info-big");
  sidesEl.innerText = orderList[index].sides + ", " + orderList[index].drink;
  priceEl.innerText = "$" + orderList[index].price.toFixed(2);

  //Remove item from order
  removeButton.classList.add("remove-btn");
  removeButton.dataset.index = index;
  removeButton.innerText = "X";
  removeButton.addEventListener("click", e => {
    if (orderList.length == 1) {
      return;
    }

    const orderEl = document.querySelectorAll(".burger-item");
    const orderIdx = e.target.dataset.index;

    //Update tatal, remove element and remove data from array
    orderPrice -= orderList[orderIdx].price;
    orderEl[orderIdx].remove();
    orderList.splice(orderIdx, 1);

    //Update index for remaining items
    orderEl.forEach(el => {
      if (el.dataset.index > orderIdx) {
        el.dataset.index -= 1;
        el.firstElementChild.innerText = +el.dataset.index + 1;
        el.lastElementChild.dataset.index -= 1;
      }
    });

    //Update price
    document.querySelector(".price-display").innerText = `Total: $${orderPrice.toFixed(2)}`;
  });

  //Append all elements to main div
  divEl.classList.add("burger-item");
  divEl.dataset.index = index;
  divEl.append(indexEl, burgerEl, extrasEl, sidesEl, priceEl, removeButton);

  //Append to main container
  parent.appendChild(divEl);
}

function updatePrice(add, price) {
  const priceDisplay = document.querySelector(".price-display");

  if (add) {
    orderPrice += +price;
  } else {
    orderPrice -= +price;
  }

  priceDisplay.innerText = `Burger: $${orderPrice.toFixed(2)}`;
}

function menuSwitchAnimation(leave, enter) {
  const timeLine = gsap.timeline({ defaults: { ease: "power2.inOut" } });

  timeLine.fromTo(leave, 0.5, { display: "block", opacity: 1 }, { display: "none", opacity: 0 });
  timeLine.fromTo(enter, 0.5, { display: "none", opacity: 0 }, { display: "block", opacity: 1 });
}
