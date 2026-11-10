// Laisser vide : la maquette invite à appeler.
// Renseigner un e-mail pour ouvrir un message prérempli.
const CONTACT_EMAIL = "";

const root = document.documentElement;
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function armIntro() {
  if (root.classList.contains("is-ready")) return;
  let seen = false;
  try { seen = sessionStorage.getItem("tp64") === "1"; } catch (error) { seen = false; }
  if (seen) {
    root.classList.add("is-ready");
    return;
  }
  window.setTimeout(() => {
    root.classList.add("is-ready");
    try { sessionStorage.setItem("tp64", "1"); } catch (error) { /* navigation privée */ }
  }, 980);
}

armIntro();

const header = document.querySelector(".site-header");
const progress = document.querySelector(".progress");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#navigation");
const mobileNav = window.matchMedia("(max-width: 979px)");

function syncInert() {
  if (!nav) return;
  if (mobileNav.matches && !document.body.classList.contains("nav-open")) nav.setAttribute("inert", "");
  else nav.removeAttribute("inert");
}

function setNav(open) {
  document.body.classList.toggle("nav-open", open);
  if (!toggle) return;
  toggle.setAttribute("aria-expanded", String(open));
  const label = toggle.querySelector(".sr");
  if (label) label.textContent = open ? "Fermer le menu" : "Ouvrir le menu";
  syncInert();
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    setNav(!document.body.classList.contains("nav-open"));
  });
  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNav(false));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNav(false);
  });
  mobileNav.addEventListener("change", () => {
    if (!mobileNav.matches) setNav(false);
    syncInert();
  });
  syncInert();
}

function onScroll() {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  if (!progress) return;
  const max = root.scrollHeight - root.clientHeight;
  progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const services = [...document.querySelectorAll(".service")];
const slides = [...document.querySelectorAll(".stage-img")];
const stageLabel = document.querySelector("#stage-label");

function activateService(item) {
  services.forEach((service) => service.classList.toggle("is-active", service === item));
  slides.forEach((img) => img.classList.toggle("is-active", img.dataset.service === item.dataset.service));
  if (stageLabel) stageLabel.textContent = item.dataset.prestation || "";
}

const serviceList = document.querySelector(".service-list");
if (serviceList) {
  serviceList.addEventListener("pointerover", (event) => {
    const item = event.target.closest(".service");
    if (item) activateService(item);
  });
  serviceList.addEventListener("focusin", (event) => {
    const item = event.target.closest(".service");
    if (item) activateService(item);
  });
}

document.addEventListener("click", (event) => {
  const city = event.target.closest("[data-ville]");
  if (city) {
    const input = document.querySelector("#ville");
    if (input) input.value = city.dataset.ville;
  }
  const offer = event.target.closest("[data-prestation]");
  if (offer) {
    const select = document.querySelector("#prestation");
    if (select) select.value = offer.dataset.prestation;
  }
});

if (!reduce) {
  const observed = document.querySelectorAll(".reveal, .rule, .frame");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
  observed.forEach((node) => observer.observe(node));

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine) {
    document.querySelectorAll("[data-magnetic]").forEach((node) => {
      node.addEventListener("mousemove", (event) => {
        const rect = node.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.2;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.35;
        node.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
      node.addEventListener("mouseleave", () => {
        node.style.transform = "";
      });
    });

    const layers = [...document.querySelectorAll("[data-parallax]")];
    if (layers.length) {
      let ticking = false;
      const parallax = () => {
        layers.forEach((layer) => {
          const parent = layer.parentElement.getBoundingClientRect();
          if (parent.bottom < 0 || parent.top > window.innerHeight) return;
          const shift = (parent.top - window.innerHeight * 0.4) * Number(layer.dataset.parallax);
          layer.style.transform = `translate3d(0, ${shift.toFixed(1)}px, 0)`;
        });
        ticking = false;
      };
      window.addEventListener("scroll", () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(parallax);
      }, { passive: true });
      parallax();
    }
  }
}

const form = document.querySelector("#demande");
const thanks = document.querySelector("#thanks");
const thanksText = document.querySelector("#thanks-text");
const thanksBack = document.querySelector("#thanks-back");

if (form && thanks && thanksText) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.classList.add("was-checked");
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const first = form.nom.value.trim().split(/\s+/)[0];
    if (CONTACT_EMAIL) {
      const body = [
        `Nom : ${form.nom.value.trim()}`,
        `Téléphone : ${form.telephone.value.trim()}`,
        `Ville : ${form.ville.value.trim()}`,
        `Prestation : ${form.prestation.value}`,
        "",
        form.message.value.trim()
      ].join("\n");
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Demande de rappel — Top Peinture 64")}&body=${encodeURIComponent(body)}`;
      thanksText.textContent = first
        ? `${first}, votre messagerie va s’ouvrir avec la demande prête à envoyer.`
        : "Votre messagerie va s’ouvrir avec la demande prête à envoyer.";
    } else {
      thanksText.textContent = first
        ? `${first}, le formulaire sera relié à une boîte mail à la mise en ligne. En attendant, le 06 33 68 79 66 répond 24h/24.`
        : "Le formulaire sera relié à une boîte mail à la mise en ligne. En attendant, le 06 33 68 79 66 répond 24h/24.";
    }

    form.hidden = true;
    thanks.hidden = false;
  });
}

if (thanksBack && form && thanks) {
  thanksBack.addEventListener("click", () => {
    thanks.hidden = true;
    form.hidden = false;
  });
}
