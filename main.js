/* =========================
   Northline Digital — main.js
   Делает:
   - бургер-меню (мобилка)
   - плавный скролл по якорям с учётом sticky header
   - кнопку "наверх" (появляется при прокрутке)
   - фильтр кейсов (работает даже без data-атрибутов)
   - обработку формы (проверка + фейковая отправка)
   ========================= */

document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------
     1) Плавный скролл по якорям
     ------------------------- */
  const header = document.querySelector(".header");
  const headerHeight = () => (header ? header.offsetHeight : 0);

  function scrollToId(id) {
    const el = document.querySelector(id);
    if (!el) return;

    const top = el.getBoundingClientRect().top + window.scrollY - headerHeight();
    window.scrollTo({ top, behavior: "smooth" });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    // если якорь существует на странице — скроллим сами
    if (document.querySelector(href)) {
      e.preventDefault();
      scrollToId(href);

      // если меню открыто на мобилке — закроем
      closeMobileMenu();
    }
  });

  /* -------------------------
     2) Бургер-меню (мобилка)
     ------------------------- */
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav");
  const headerCta = document.querySelector(".header__cta");

  function isMobile() {
    return window.matchMedia("(max-width: 768px)").matches;
  }

  function openMobileMenu() {
    if (!isMobile()) return;
    document.body.classList.add("menu-open");
    if (burger) burger.setAttribute("aria-expanded", "true");

    // Показать nav и кнопку заявки на мобилке (CSS у тебя их скрывает)
    if (nav) {
      nav.style.display = "block";
      nav.style.position = "absolute";
      nav.style.top = "72px";
      nav.style.left = "0";
      nav.style.right = "0";
      nav.style.padding = "14px 20px";
      nav.style.background = "rgba(15, 23, 42, 0.96)";
      nav.style.borderBottom = "1px solid rgba(241, 245, 249, 0.12)";
      nav.style.backdropFilter = "blur(10px)";
    }

    const navList = document.querySelector(".nav__list");
    if (navList) {
      navList.style.flexDirection = "column";
      navList.style.alignItems = "stretch";
      navList.style.gap = "6px";
    }

    if (headerCta) {
      headerCta.style.display = "inline-flex";
      headerCta.style.marginLeft = "0";
      headerCta.style.marginTop = "10px";
    }
  }

  function closeMobileMenu() {
    document.body.classList.remove("menu-open");
    if (burger) burger.setAttribute("aria-expanded", "false");

    // вернуть как было (пусть CSS решает)
    if (nav) {
      nav.removeAttribute("style");
    }
    const navList = document.querySelector(".nav__list");
    if (navList) navList.removeAttribute("style");
    if (headerCta) headerCta.removeAttribute("style");
  }

  function toggleMobileMenu() {
    if (document.body.classList.contains("menu-open")) closeMobileMenu();
    else openMobileMenu();
  }

  if (burger) {
    burger.addEventListener("click", (e) => {
      e.preventDefault();
      toggleMobileMenu();
    });
  }

  // Закрытие по ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });

  // Если растянули окно до десктопа — закрываем меню и сбрасываем inline-стили
  window.addEventListener("resize", () => {
    if (!isMobile()) closeMobileMenu();
  });

  /* -------------------------
     3) Кнопка "наверх"
     ------------------------- */
  const scrollTopBtn = document.querySelector(".scroll-top");

  function setScrollTopVisible(visible) {
    if (!scrollTopBtn) return;
    // не требуем доп CSS — управляем прямо стилями
    scrollTopBtn.style.opacity = visible ? "1" : "0";
    scrollTopBtn.style.pointerEvents = visible ? "auto" : "none";
    scrollTopBtn.style.transform = visible ? "translateY(0)" : "translateY(6px)";
  }

  if (scrollTopBtn) {
    // стартовое состояние
    setScrollTopVisible(window.scrollY > 400);

    window.addEventListener("scroll", () => {
      setScrollTopVisible(window.scrollY > 400);
    });

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* -------------------------
     4) Фильтр кейсов
     ------------------------- */
  const filterBtns = Array.from(document.querySelectorAll(".cases__filter-btn"));
  const caseCards = Array.from(document.querySelectorAll(".cases__card"));

  function normalize(str) {
    return (str || "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Если у карточек нет data-category — попробуем угадать по заголовку
  function inferCategory(card) {
    const title = normalize(card.querySelector(".cases__title")?.textContent);
    // можно расширять по желанию
    if (title.includes("seo")) return "seo";
    if (title.includes("реклам")) return "ads";
    if (title.includes("бренд")) return "branding";
    if (title.includes("сайт") || title.includes("лендинг")) return "sites";
    return "all";
  }

  function getCardCategory(card) {
    const cat = normalize(card.dataset.category);
    if (cat) return cat; // если ты потом добавишь data-category — будет идеально
    return inferCategory(card);
  }

  function setActiveFilter(btn) {
    filterBtns.forEach((b) => b.setAttribute("aria-selected", "false"));
    btn.setAttribute("aria-selected", "true");
  }

  function filterCases(key) {
    const k = normalize(key);

    caseCards.forEach((card) => {
      const cat = getCardCategory(card);

      // "все"
      const show =
        k === "все" || k === "all" ||
        (k === "сайты" && cat === "sites") ||
        (k === "seo" && cat === "seo") ||
        (k === "реклама" && cat === "ads") ||
        (k === "брендинг" && cat === "branding");

      card.style.display = show ? "" : "none";
    });
  }

  if (filterBtns.length && caseCards.length) {
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        setActiveFilter(btn);
        filterCases(btn.textContent);
      });
    });
  }

  /* -------------------------
     5) Форма: проверка + фейковая отправка
     ------------------------- */
  const form = document.querySelector(".contact__form");
  if (form) {
    // блок под сообщение (создаём один раз)
    const msg = document.createElement("div");
    msg.className = "form__message";
    msg.style.marginTop = "12px";
    msg.style.fontSize = "14px";
    msg.style.fontWeight = "600";
    msg.style.display = "none";
    form.appendChild(msg);

    function showMessage(text, ok = true) {
      msg.textContent = text;
      msg.style.display = "block";
      msg.style.color = ok ? "green" : "crimson";
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = form.querySelector('input[name="name"]');
      const contact = form.querySelector('input[name="contact"]');
      const service = form.querySelector('select[name="service"]');
      const checkbox = form.querySelector('input[type="checkbox"]');

      if (!name?.value.trim()) {
        showMessage("Введите имя.", false);
        name?.focus();
        return;
      }
      if (!contact?.value.trim()) {
        showMessage("Введите телефон или email.", false);
        contact?.focus();
        return;
      }
      if (!service?.value) {
        showMessage("Выберите услугу.", false);
        service?.focus();
        return;
      }
      if (checkbox && !checkbox.checked) {
        showMessage("Поставьте галочку согласия.", false);
        checkbox?.focus();
        return;
      }

      // Фейковая успешная отправка (как будто отправили)
      showMessage("Заявка отправлена! Мы свяжемся с вами в течение 24 часов.", true);
      form.reset();
    });
  }
});