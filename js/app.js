// Globals
let orderTotal;

/*
  Workaround to relative paths when using barba.js
  Since barba.js makes the page behave like a Single Page Application, this small
  helper function sets the paths relative to the current barba-namespace rather
  than the URL
*/
const setImageSrcPath = (container, path) => {
  const images = container.querySelectorAll("img");

  images.forEach(image => {
    image.setAttribute("src", path + image.dataset.src);
  });
};

// Home page
const setHomeContext = () => {
  const decreaseOrderBtn = document.querySelector(".decrease-order");
  const increaseOrderBtn = document.querySelector(".increase-order");
  const curOrder = document.querySelector("#nr-of-orders");
  const beginOrder = document.querySelector("#begin-order");

  const handleOrderDecrease = () => {
    curOrder.value = Math.max(1, parseInt(curOrder.value) - 1);
  };

  const handleOrderIncrease = () => {
    curOrder.value = Math.min(30, parseInt(curOrder.value) + 1);
  };

  const handleBeginOrder = event => {
    event.preventDefault();
    orderTotal = parseInt(curOrder.value);
    barba.go("./order");
  };

  decreaseOrderBtn.addEventListener("click", handleOrderDecrease);
  increaseOrderBtn.addEventListener("click", handleOrderIncrease);
  beginOrder.addEventListener("submit", handleBeginOrder);
};

// Barba.js configuration
barba.init({
  debug: true,
  preventRunning: true,
  views: [
    {
      namespace: "home",
      beforeEnter({ next }) {
        console.log("beforeEnter: home");
        setImageSrcPath(next.container, "./");
        setHomeContext();

        // const testBtn = document.querySelector(".test");
        // testBtn.addEventListener("click", setTest);
      },
      beforeLeave({ next }) {
        // const testBtn = document.querySelector(".test");
        // testBtn.removeEventListener("click", setTest);
      },
    },
    {
      namespace: "order",
      beforeEnter({ next }) {
        console.log("beforeEnter: order");
        console.log(orderTotal);
        //setImageSrcPath(next.container, "../");
        console.log(window.location.href);

        if (orderTotal === undefined) {
          //window.location.href = "../";
          // const path = window.location.href;
          // const path2 = path.slice(0, -6);

          const url = window.location.href.replace(/\/$/, "");
          const map = url.substring(url.lastIndexOf("/"));

          const path = window.location.href.slice(0, -map.length);

          console.log("redirect to: ", path);
          setImageSrcPath(next.container, "../");
          barba.go(path);
        } else {
          setImageSrcPath(next.container, "./");
        }
      },
      afterEnter() {
        console.log(window.location.href);
        if (orderTotal === undefined) {
          //barba.go("../");
        }
        console.log("after");
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
