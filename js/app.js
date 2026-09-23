"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

let PRODUCTS = [];

let currentProduct = null;
let currentImageIndex = 0;

let touchStartX = 0;
let touchStartY = 0;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const retryButton =
    document.getElementById("retryButton");

const productsGrid =
    document.getElementById("productsGrid");

const storeTitle =
    document.getElementById("storeTitle");

const storeSubtitle =
    document.getElementById("storeSubtitle");
const storeFooter = document.getElementById("storeFooter");

/* =========================================================
   GALLERY ELEMENTS
========================================================= */

const galleryModal =
    document.getElementById("galleryModal");

const galleryImage =
    document.getElementById("galleryImage");

const galleryTitle =
    document.getElementById("galleryTitle");

const galleryDescription =
    document.getElementById("galleryDescription");

const galleryCounter =
    document.getElementById("galleryCounter");

const galleryClose =
    document.getElementById("galleryClose");

const galleryPrev =
    document.getElementById("galleryPrev");

const galleryNext =
    document.getElementById("galleryNext");


/* =========================================================
   DETAILS ELEMENTS
========================================================= */

const detailsModal =
    document.getElementById("detailsModal");

const detailsClose =
    document.getElementById("detailsClose");

const detailsCode =
    document.getElementById("detailsCode");

const detailsTitle =
    document.getElementById("detailsTitle");

const detailsDescription =
    document.getElementById("detailsDescription");

const detailsStatus =
    document.getElementById("detailsStatus");

const detailsTable =
    document.getElementById("detailsTable");

const telegramButton =
    document.getElementById("telegramButton");

const whatsappButton =
    document.getElementById("whatsappButton");

const locationButton =
    document.getElementById("locationButton");


/* =========================================================
   TELEGRAM MINI APP
========================================================= */

if (
    window.Telegram &&
    window.Telegram.WebApp
) {

    Telegram.WebApp.ready();

    Telegram.WebApp.expand();

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    init
);


async function init() {

    try {

        hideError();

        showLoading();

        applyStoreConfig();
        renderFooter();
        await loadProducts();

        renderProducts();

        hideLoading();

    }

    catch (error) {

        console.error(
            "Initialization error:",
            error
        );

        hideLoading();

        showError(error);

    }

}


/* =========================================================
   CONFIG
========================================================= */

function applyStoreConfig() {

    if (
        typeof STORE_CONFIG ===
        "undefined"
    ) {

        throw new Error(
            "فایل config.js پیدا نشد یا STORE_CONFIG تعریف نشده است."
        );

    }


    storeTitle.textContent =
        STORE_CONFIG.title;

    storeSubtitle.textContent =
        STORE_CONFIG.subtitle;


    telegramButton.href =
        STORE_CONFIG.contact.telegram.url;

    whatsappButton.href =
        STORE_CONFIG.contact.whatsapp.url;

    locationButton.href =
        STORE_CONFIG.contact.location.url;

}


/* =========================================================
   LOAD PRODUCTS
========================================================= */

async function loadProducts() {

    /*
       استفاده از همان GitHub Pages
       برای جلوگیری از مشکل CORS
    */

    const productsURL =
        "./data/products.json?v=" +
        Date.now();


    try {

        const response =
            await fetch(
                productsURL,
                {
                    method: "GET"
                }
            );


        if (!response.ok) {

            throw new Error(
                `خطا در دریافت محصولات — HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "ساختار products.json صحیح نیست."
            );

        }


        if (
            data.length === 0
        ) {

            throw new Error(
                "هیچ محصولی در products.json وجود ندارد."
            );

        }


        PRODUCTS = data;

    }

    catch (error) {

        throw error;

    }

}


/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    loading.classList.remove(
        "hidden"
    );

}


function hideLoading() {

    loading.classList.add(
        "hidden"
    );

}


/* =========================================================
   ERROR
========================================================= */

function showError(error) {

    errorMessage.classList.remove(
        "hidden"
    );


    const errorText =
        errorMessage.querySelector("p");


    if (errorText) {

        errorText.innerHTML = `
            اطلاعات محصولات دریافت نشد.
            <br><br>
            <small>
                ${escapeHTML(
                    error?.message ||
                    "خطای نامشخص"
                )}
            </small>
        `;

    }

}


function hideError() {

    errorMessage.classList.add(
        "hidden"
    );

}


/* =========================================================
   RETRY
========================================================= */

if (retryButton) {

    retryButton.addEventListener(
        "click",
        init
    );

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    productsGrid.innerHTML = "";


    if (
        !PRODUCTS.length
    ) {

        productsGrid.innerHTML = `
            <div class="empty-products">
                محصولی برای نمایش وجود ندارد.
            </div>
        `;

        return;

    }


    PRODUCTS.forEach(
        product => {

            const card =
                createProductCard(
                    product
                );

            productsGrid.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const card =
        document.createElement(
            "article"
        );

    card.className =
        "product-card";


    /* -----------------------------------------------------
       IMAGE WRAPPER
    ----------------------------------------------------- */

    const imageWrapper =
        document.createElement(
            "div"
        );

    imageWrapper.className =
        "product-image-wrapper";


    /* -----------------------------------------------------
       MAIN IMAGE
    ----------------------------------------------------- */

    const image =
        document.createElement(
            "img"
        );

    image.className =
        "product-image";


    if (
        Array.isArray(
            product.images
        ) &&
        product.images.length
    ) {

        image.src =
            product.images[0];

    }


    image.alt =
        product.name || "";


    /*
       تصاویر کارت‌ها lazy load می‌شوند
    */

    image.loading =
        "lazy";

    image.decoding =
        "async";


    image.addEventListener(
        "click",
        () => {

            openGallery(
                product
            );

        }
    );


    imageWrapper.appendChild(
        image
    );


    /* -----------------------------------------------------
       STATUS
    ----------------------------------------------------- */

    const statusHTML =
        getProductStatusHTML(
            product
        );


    if (statusHTML) {

        imageWrapper.insertAdjacentHTML(
            "beforeend",
            statusHTML
        );

    }


    /* -----------------------------------------------------
       BODY
    ----------------------------------------------------- */

    const body =
        document.createElement(
            "div"
        );

    body.className =
        "product-card-body";


    /* -----------------------------------------------------
       TITLE
    ----------------------------------------------------- */

    const title =
        document.createElement(
            "h2"
        );

    title.className =
        "product-title";

    title.textContent =
        product.name || "";


    /* -----------------------------------------------------
       DESCRIPTION
    ----------------------------------------------------- */

    const description =
        document.createElement(
            "p"
        );

    description.className =
        "product-description";

    description.textContent =
        product.description || "";


    /* -----------------------------------------------------
       ACTIONS
    ----------------------------------------------------- */

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "product-actions";


    /* Gallery Button */

    const galleryButton =
        document.createElement(
            "button"
        );

    galleryButton.type =
        "button";

    galleryButton.className =
        "product-button gallery-button";

    galleryButton.textContent =
        "🖼 مشاهده تصاویر";


    galleryButton.addEventListener(
        "click",
        () => {

            openGallery(
                product
            );

        }
    );


    /* Details Button */

    const detailsButton =
        document.createElement(
            "button"
        );

    detailsButton.type =
        "button";

    detailsButton.className =
        "product-button details-button";

    detailsButton.textContent =
        "✦ جزئیات";


    detailsButton.addEventListener(
        "click",
        () => {

            openDetails(
                product
            );

        }
    );


    actions.appendChild(
        galleryButton
    );

    actions.appendChild(
        detailsButton
    );


    body.appendChild(
        title
    );

    body.appendChild(
        description
    );

    body.appendChild(
        actions
    );


    card.appendChild(
        imageWrapper
    );

    card.appendChild(
        body
    );


    return card;

}


/* =========================================================
   PRODUCT STATUS
========================================================= */

function getProductStatusHTML(product) {

    if (
        product.status ===
        "out_of_stock"
    ) {

        return `
            <div class="product-status-stamp">
                <span>اتمام</span>
                <span>موجودی</span>
            </div>
        `;

    }


    if (
        product.status ===
        "restocking"
    ) {

        return `
            <div class="product-status-restocking">
                شارژ مجدد
            </div>
        `;

    }


    return "";

}


/* =========================================================
   GALLERY
========================================================= */

function openGallery(product) {

    if (
        !product ||
        !Array.isArray(
            product.images
        ) ||
        product.images.length === 0
    ) {

        return;

    }


    currentProduct =
        product;

    currentImageIndex =
        0;


    galleryTitle.textContent =
        product.name || "";


    galleryDescription.textContent =
        product.description || "";


    updateGallery();


    galleryModal.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "modal-open"
    );


    updateGalleryButtons();

}


/* =========================================================
   UPDATE GALLERY
========================================================= */

function updateGallery() {

    if (
        !currentProduct
    ) {

        return;

    }


    const images =
        currentProduct.images;


    if (
        !Array.isArray(images) ||
        images.length === 0
    ) {

        return;

    }


    const imageURL =
        images[
            currentImageIndex
        ];


    galleryImage.src =
        imageURL;


    galleryImage.alt =
        `${currentProduct.name} - تصویر ${currentImageIndex + 1}`;


    galleryCounter.textContent =
        `${currentImageIndex + 1} / ${images.length}`;


    updateGalleryButtons();

}


/* =========================================================
   GALLERY BUTTON STATE
========================================================= */

function updateGalleryButtons() {

    if (
        !currentProduct ||
        !Array.isArray(
            currentProduct.images
        )
    ) {

        return;

    }


    const total =
        currentProduct.images.length;


    /*
       اگر فقط یک تصویر وجود دارد،
       دکمه‌های قبلی و بعدی غیرفعال می‌شوند.
    */

    if (
        total <= 1
    ) {

        galleryPrev.disabled =
            true;

        galleryNext.disabled =
            true;

    }

    else {

        galleryPrev.disabled =
            false;

        galleryNext.disabled =
            false;

    }

}


/* =========================================================
   NEXT IMAGE
========================================================= */

function showNextImage() {

    if (
        !currentProduct
    ) {

        return;

    }


    const images =
        currentProduct.images;


    if (
        !Array.isArray(images) ||
        images.length <= 1
    ) {

        return;

    }


    currentImageIndex++;


    if (
        currentImageIndex >=
        images.length
    ) {

        currentImageIndex =
            0;

    }


    updateGallery();

}


/* =========================================================
   PREVIOUS IMAGE
========================================================= */

function showPreviousImage() {

    if (
        !currentProduct
    ) {

        return;

    }


    const images =
        currentProduct.images;


    if (
        !Array.isArray(images) ||
        images.length <= 1
    ) {

        return;

    }


    currentImageIndex--;


    if (
        currentImageIndex < 0
    ) {

        currentImageIndex =
            images.length - 1;

    }


    updateGallery();

}


/* =========================================================
   CLOSE GALLERY
========================================================= */

function closeGallery() {

    galleryModal.classList.add(
        "hidden"
    );


    document.body.classList.remove(
        "modal-open"
    );


    galleryImage.src =
        "";


    currentProduct =
        null;


    currentImageIndex =
        0;

}


/* =========================================================
   GALLERY BUTTON EVENTS
========================================================= */

galleryClose.addEventListener(
    "click",
    closeGallery
);


galleryPrev.addEventListener(
    "click",
    showPreviousImage
);


galleryNext.addEventListener(
    "click",
    showNextImage
);


/* =========================================================
   CLOSE GALLERY BY CLICKING OUTSIDE
========================================================= */

galleryModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            galleryModal
        ) {

            closeGallery();

        }

    }
);


/* =========================================================
   TOUCH SWIPE
========================================================= */

galleryImage.addEventListener(
    "touchstart",
    function (event) {

        if (
            !event.touches ||
            !event.touches.length
        ) {

            return;

        }


        touchStartX =
            event.touches[0].clientX;

        touchStartY =
            event.touches[0].clientY;

    },
    {
        passive: true
    }
);


galleryImage.addEventListener(
    "touchend",
    function (event) {

        if (
            !event.changedTouches ||
            !event.changedTouches.length
        ) {

            return;

        }


        const touchEndX =
            event.changedTouches[0].clientX;

        const touchEndY =
            event.changedTouches[0].clientY;


        const deltaX =
            touchEndX -
            touchStartX;

        const deltaY =
            touchEndY -
            touchStartY;


        /*
           فقط حرکات افقی را به عنوان Swipe قبول کن
        */

        if (
            Math.abs(deltaX) <
            50
        ) {

            return;

        }


        /*
           اگر حرکت بیشتر عمودی باشد،
           Swipe محسوب نمی‌شود.
        */

        if (
            Math.abs(deltaY) >
            Math.abs(deltaX)
        ) {

            return;

        }


        if (
            deltaX < 0
        ) {

            /*
               Swipe به چپ
               → تصویر بعدی
            */

            showNextImage();

        }

        else {

            /*
               Swipe به راست
               → تصویر قبلی
            */

            showPreviousImage();

        }

    },
    {
        passive: true
    }
);


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        /*
           Gallery
        */

        if (
            !galleryModal.classList.contains(
                "hidden"
            )
        ) {

            if (
                event.key ===
                "Escape"
            ) {

                closeGallery();

                return;

            }


            if (
                event.key ===
                "ArrowLeft"
            ) {

                /*
                   در RTL:
                   Left → تصویر بعدی
                */

                showNextImage();

                return;

            }


            if (
                event.key ===
                "ArrowRight"
            ) {

                /*
                   در RTL:
                   Right → تصویر قبلی
                */

                showPreviousImage();

                return;

            }

        }


        /*
           Details
        */

        if (
            !detailsModal.classList.contains(
                "hidden"
            )
        ) {

            if (
                event.key ===
                "Escape"
            ) {

                closeDetails();

            }

        }

    }
);


/* =========================================================
   DETAILS
========================================================= */

function openDetails(product) {

    if (
        !product
    ) {

        return;

    }


    detailsCode.textContent =
        product.id
        ? `کد ${product.id}`
        : "";


    detailsTitle.textContent =
        product.name || "";


    detailsDescription.textContent =
        product.description || "";


    updateDetailsStatus(
        product
    );


    renderDetailsTable(
        product
    );


    detailsModal.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "modal-open"
    );

}


/* =========================================================
   DETAILS STATUS
========================================================= */

function updateDetailsStatus(product) {

    detailsStatus.innerHTML =
        "";


    if (
        product.status ===
        "out_of_stock"
    ) {

        detailsStatus.innerHTML = `
            <span class="details-status-out">
                اتمام موجودی
            </span>
        `;

        return;

    }


    if (
        product.status ===
        "restocking"
    ) {

        detailsStatus.innerHTML = `
            <span class="details-status-restocking">
                شارژ مجدد
            </span>
        `;

        return;

    }

}


/* =========================================================
   DETAILS TABLE
========================================================= */

function renderDetailsTable(product) {

    detailsTable.innerHTML =
        "";


    if (
        !product.details ||
        typeof product.details !==
        "object"
    ) {

        return;

    }


    const tbody =
        document.createElement(
            "tbody"
        );


    Object.entries(
        product.details
    ).forEach(
        ([key, value]) => {

            const row =
                document.createElement(
                    "tr"
                );


            const keyCell =
                document.createElement(
                    "th"
                );

            keyCell.textContent =
                key;


            const valueCell =
                document.createElement(
                    "td"
                );

            valueCell.textContent =
                value;


            row.appendChild(
                keyCell
            );

            row.appendChild(
                valueCell
            );


            tbody.appendChild(
                row
            );

        }
    );


    detailsTable.appendChild(
        tbody
    );

}


/* =========================================================
   CLOSE DETAILS
========================================================= */

function closeDetails() {

    detailsModal.classList.add(
        "hidden"
    );


    document.body.classList.remove(
        "modal-open"
    );


    detailsCode.textContent =
        "";

    detailsTitle.textContent =
        "";

    detailsDescription.textContent =
        "";

    detailsStatus.innerHTML =
        "";

    detailsTable.innerHTML =
        "";

}


/* =========================================================
   DETAILS EVENTS
========================================================= */

detailsClose.addEventListener(
    "click",
    closeDetails
);


detailsModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target ===
            detailsModal
        ) {

            closeDetails();

        }

    }
);


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

function renderFooter() {
    if (!storeFooter) return;

    const footer = STORE_CONFIG.footer;

    if (!footer) {
        storeFooter.innerHTML = "";
        return;
    }

    let html = `
        <div class="footer-inner">

            <div class="footer-brand">
                <h2>${escapeHTML(STORE_CONFIG.title || "")}</h2>

                ${
                    STORE_CONFIG.subtitle
                        ? `<p>${escapeHTML(STORE_CONFIG.subtitle)}</p>`
                        : ""
                }
            </div>
    `;


    /* =========================
       اطلاعات تماس
       ========================= */

    const hasContactInfo =
        footer.address ||
        footer.phone ||
        footer.mobile;

    if (hasContactInfo) {

        html += `
            <div class="footer-contact">

                <h3>اطلاعات تماس</h3>
        `;

        if (footer.address) {
            html += `
                <div class="footer-contact-item">
                    <span class="footer-contact-icon">⌖</span>
                    <span>${escapeHTML(footer.address)}</span>
                </div>
            `;
        }

        if (footer.phone) {
            html += `
                <a
                    class="footer-contact-item footer-link"
                    href="tel:${escapeHTML(footer.phone)}"
                >
                    <span class="footer-contact-icon">☎</span>
                    <span>${escapeHTML(footer.phone)}</span>
                </a>
            `;
        }

        if (footer.mobile) {
            html += `
                <a
                    class="footer-contact-item footer-link"
                    href="tel:${escapeHTML(footer.mobile)}"
                >
                    <span class="footer-contact-icon">📱</span>
                    <span>${escapeHTML(footer.mobile)}</span>
                </a>
            `;
        }

        html += `
            </div>
        `;
    }


    /* =========================
       شبکه‌های اجتماعی
       ========================= */

    const socialItems = [
        footer.instagram,
        footer.rubika,
        footer.telegram,
        footer.whatsapp
    ].filter(item => item && item.url);


    if (socialItems.length) {

        html += `
            <div class="footer-social">

                <h3>ما را دنبال کنید</h3>

                <div class="footer-social-links">
        `;

        socialItems.forEach(item => {

            let icon = "↗";

            if (item === footer.instagram) {
                icon = "◎";
            }

            if (item === footer.rubika) {
                icon = "◆";
            }

            if (item === footer.telegram) {
                icon = "✈";
            }

            if (item === footer.whatsapp) {
                icon = "◉";
            }

            html += `
                <a
                    class="footer-social-link"
                    href="${escapeHTML(item.url)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span class="footer-social-icon">${icon}</span>
                    <span>${escapeHTML(item.title || "")}</span>
                </a>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }


    html += `
        </div>

        <div class="footer-bottom">
            <span>© ${new Date().getFullYear()}</span>
            <span>${escapeHTML(STORE_CONFIG.title || "")}</span>
            <span>تمامی حقوق محفوظ است</span>
        </div>
    `;

    storeFooter.innerHTML = html;
}
