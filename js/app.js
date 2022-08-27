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

  console.log("Updating image src with: " + path);

  images.forEach(image => {
    image.setAttribute("src", path === "" ? "" : path + image.dataset.src);
  });
};

/*
  Workaround to redirect home when using barba.js
  This helper function will make redirect work with github pages, local server and
  any other hosting site.
*/
const setRedirectToHome = ({ pathname }) => {
  const url = pathname.replace(/\/$/, "");
  const path = url.substring(url.lastIndexOf("/"));
  const to = pathname.slice(0, -path.length);

  barba.go(to);
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
  preventRunning: true,
  views: [
    {
      namespace: "home",
      beforeEnter({ next }) {
        console.log("beforeEnter: home");
        setImageSrcPath(next.container, "./");
        setHomeContext();
      },
      beforeLeave({ next }) {
        console.log("beforeLeave: home");
        setImageSrcPath(current.container, "");
      },
      afterLeave({ current }) {
        console.log("beforeLeave: home");
        //setImageSrcPath(current.container, "");
      },
    },
    {
      namespace: "order",
      beforeEnter({ next }) {
        console.log("beforeEnter: order");

        if (orderTotal === undefined) {
          //setImageSrcPath(next.container, "../");
          setRedirectToHome(window.location);
        } else {
          //setImageSrcPath(next.container, "./");
        }
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
