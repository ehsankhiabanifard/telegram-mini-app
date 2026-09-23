
"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

let PRODUCTS = [];

let currentProduct = null;
let currentImageIndex = 0;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const retryButton = document.getElementById("retryButton");
const productsGrid = document.getElementById("productsGrid");

const storeTitle = document.getElementById("storeTitle");
const storeSubtitle = document.getElementById("storeSubtitle");


/* Gallery */

const galleryModal = document.getElementById("galleryModal");
const galleryImage = document.getElementById("galleryImage");
const galleryTitle = document.getElementById("galleryTitle");
const galleryDescription = document.getElementById("galleryDescription");
const galleryCounter = document.getElementById("galleryCounter");

const galleryClose = document.getElementById("galleryClose");
const galleryPrev = document.getElementById("galleryPrev");
const galleryNext = document.getElementById("galleryNext");


/* Details */

const detailsModal = document.getElementById("detailsModal");
const detailsClose = document.getElementById("detailsClose");

const detailsCode = document.getElementById("detailsCode");
const detailsTitle = document.getElementById("detailsTitle");
const detailsDescription = document.getElementById("detailsDescription");
const detailsStatus = document.getElementById("detailsStatus");
const detailsTable = document.getElementById("detailsTable");

const telegramButton = document.getElementById("telegramButton");
const whatsappButton = document.getElementById("whatsappButton");
const locationButton = document.getElementById("locationButton");


/* =========================================================
   TELEGRAM MINI APP
========================================================= */

if (window.Telegram && window.Telegram.WebApp) {

    Telegram.WebApp.ready();
    Telegram.WebApp.expand();

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", init);


async function init() {

    applyStoreConfig();

    showLoading();

    try {

        await loadProducts();

        renderProducts();

        hideLoading();

    } catch (error) {

        console.error("Product loading error:", error);

        showError();

    }

}


/* =========================================================
   CONFIG
========================================================= */

function applyStoreConfig() {

    if (!STORE_CONFIG) return;

    storeTitle.textContent = STORE_CONFIG.title;
    storeSubtitle.textContent = STORE_CONFIG.subtitle;

    telegramButton.href =
        STORE_CONFIG.contact.telegram.url;

    whatsappButton.href =
        STORE_CONFIG.contact.whatsapp.url;

    locationButton.href =
        STORE_CONFIG.contact.location.url;

}


/* =========================================================
   LOAD PRODUCTS JSON
========================================================= */

async function loadProducts() {

    const response = await fetch(
        "./data/products.json",
        {
            cache: "no-store"
        }
    );


    if (!response.ok) {

        throw new Error(
            `HTTP error: ${response.status}`
        );

    }


    const data = await response.json();


    if (!Array.isArray(data)) {

        throw new Error(
            "products.json must contain an array"
        );

    }


    PRODUCTS = data;

}


/* =========================================================
   LOADING / ERROR
========================================================= */

function showLoading() {

    loading.classList.remove("hidden");
    errorMessage.classList.add("hidden");

}


function hideLoading() {

    loading.classList.add("hidden");

}


function showError() {

    loading.classList.add("hidden");
    errorMessage.classList.remove("hidden");

}


retryButton.addEventListener("click", () => {

    init();

});


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    productsGrid.innerHTML = "";

    if (!PRODUCTS.length) {

        productsGrid.innerHTML = `
            <div class="empty-products">
                محصولی برای نمایش وجود ندارد.
            </div>
        `;

        return;

    }


    PRODUCTS.forEach(product => {

        const card = createProductCard(product);

        productsGrid.appendChild(card);

    });

}


/* =========================================================
   PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const card = document.createElement("article");

    card.className = "product-card";


    const imageWrapper =
        document.createElement("div");

    imageWrapper.className =
        "product-image-wrapper";


    const image =
        document.createElement("img");

    image.className = "product-image";

    image.src = product.images[0];

    image.alt = product.name;

    image.loading = "lazy";


    image.addEventListener("click", () => {

        openGallery(product);

    });


    imageWrapper.appendChild(image);


    /* Status */

    const statusHTML =
        getProductStatusHTML(product);

    if (statusHTML) {

        imageWrapper.insertAdjacentHTML(
            "beforeend",
            statusHTML
        );

    }


    /* Card body */

    const body =
        document.createElement("div");

    body.className =
        "product-card-body";


    const title =
        document.createElement("h2");

    title.className =
        "product-title";

    title.textContent =
        product.name;


    const description =
        document.createElement("p");

    description.className =
        "product-description";

    description.textContent =
        product.description;


    /* Buttons */

    const actions =
        document.createElement("div");

    actions.className =
        "product-actions";


    const galleryButton =
        document.createElement("button");

    galleryButton.type = "button";

    galleryButton.className =
        "product-button gallery-button";

    galleryButton.innerHTML =
        "🖼 مشاهده تصاویر";


    galleryButton.addEventListener(
        "click",
        () => openGallery(product)
    );


    const detailsButton =
        document.createElement("button");

    detailsButton.type = "button";

    detailsButton.className =
        "product-button details-button";

    detailsButton.innerHTML =
        "✦ جزئیات";


    detailsButton.addEventListener(
        "click",
        () => openDetails(product)
    );


    actions.appendChild(galleryButton);
    actions.appendChild(detailsButton);


    body.appendChild(title);
    body.appendChild(description);
    body.appendChild(actions);


    card.appendChild(imageWrapper);
    card.appendChild(body);


    return card;

}


/* =========================================================
   PRODUCT STATUS
========================================================= */

function getProductStatusHTML(product) {

    if (product.status === "out_of_stock") {

        return `
            <div class="product-status-stamp">
                <span>اتمام</span>
                <span>موجودی</span>
            </div>
        `;

    }


    if (product.status === "restocking") {

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

    if (!product || !product.images?.length) {
        return;
    }


    currentProduct = product;
    currentImageIndex = 0;


    galleryTitle.textContent =
        product.name;

    galleryDescription.textContent =
        product.description;


    updateGallery();


    galleryModal.classList.remove("hidden");

    document.body.classList.add("modal-open");


    preloadGalleryImages(product);

}


function updateGallery() {

    if (!currentProduct) return;


    const imageURL =
        currentProduct.images[currentImageIndex];


    galleryImage.removeAttribute("src");


    requestAnimationFrame(() => {

        galleryImage.src = imageURL;

        galleryImage.alt =
            `${currentProduct.name} - تصویر ${currentImageIndex + 1}`;

    });


    galleryCounter.textContent =
        `${currentImageIndex + 1} / ${currentProduct.images.length}`;

}


function preloadGalleryImages(product) {

    product.images.forEach(url => {

        const img = new Image();

        img.src = url;

    });

}


function nextImage() {

    if (!currentProduct) return;


    if (
        currentImageIndex <
        currentProduct.images.length - 1
    ) {

        currentImageIndex++;

    } else {

        currentImageIndex = 0;

    }


    updateGallery();

}


function previousImage() {

    if (!currentProduct) return;


    if (currentImageIndex > 0) {

        currentImageIndex--;

    } else {

        currentImageIndex =
            currentProduct.images.length - 1;

    }


    updateGallery();

}


function closeGallery() {

    galleryModal.classList.add("hidden");

    document.body.classList.remove("modal-open");

    galleryImage.removeAttribute("src");

    currentProduct = null;

}


/* =========================================================
   DETAILS
========================================================= */

function openDetails(product) {

    if (!product) return;


    currentProduct = product;


    detailsCode.textContent =
        `کد ${product.id}`;

    detailsTitle.textContent =
        product.name;

    detailsDescription.textContent =
        product.description;


    renderDetails(product);

    renderDetailsStatus(product);


    detailsModal.classList.remove("hidden");

    document.body.classList.add("modal-open");

}


function renderDetails(product) {

    detailsTable.innerHTML = "";


    if (!product.details) return;


    Object.entries(product.details)
        .forEach(([key, value]) => {

            const row =
                document.createElement("div");

            row.className =
                "details-row";


            const label =
                document.createElement("div");

            label.className =
                "details-label";

            label.textContent =
                key;


            const content =
                document.createElement("div");

            content.className =
                "details-value";

            content.textContent =
                value;


            row.appendChild(label);
            row.appendChild(content);


            detailsTable.appendChild(row);

        });

}


function renderDetailsStatus(product) {

    detailsStatus.className =
        "details-status";


    if (product.status === "out_of_stock") {

        detailsStatus.classList.add(
            "status-out-of-stock"
        );

        detailsStatus.textContent =
            "اتمام موجودی";

        detailsStatus.classList.remove("hidden");

        return;

    }


    if (product.status === "restocking") {

        detailsStatus.classList.add(
            "status-restocking"
        );

        detailsStatus.textContent =
            "شارژ مجدد";

        detailsStatus.classList.remove("hidden");

        return;

    }


    detailsStatus.classList.add("hidden");

}


function closeDetails() {

    detailsModal.classList.add("hidden");

    document.body.classList.remove("modal-open");

    currentProduct = null;

}


/* =========================================================
   EVENTS
========================================================= */

galleryClose.addEventListener(
    "click",
    closeGallery
);


galleryPrev.addEventListener(
    "click",
    previousImage
);


galleryNext.addEventListener(
    "click",
    nextImage
);


detailsClose.addEventListener(
    "click",
    closeDetails
);


/* Close when clicking overlay */

galleryModal.addEventListener(
    "click",
    event => {

        if (event.target === galleryModal) {

            closeGallery();

        }

    }
);


detailsModal.addEventListener(
    "click",
    event => {

        if (event.target === detailsModal) {

            closeDetails();

        }

    }
);


/* =========================================================
   KEYBOARD CONTROLS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            !galleryModal.classList.contains("hidden")
        ) {

            if (event.key === "Escape") {

                closeGallery();

            }


            if (event.key === "ArrowRight") {

                nextImage();

            }


            if (event.key === "ArrowLeft") {

                previousImage();

            }

        }


        if (
            !detailsModal.classList.contains("hidden") &&
            event.key === "Escape"
        ) {

            closeDetails();

        }

    }
);


/* =========================================================
   TOUCH SWIPE FOR GALLERY
========================================================= */

let touchStartX = 0;
let touchEndX = 0;


galleryModal.addEventListener(
    "touchstart",
    event => {

        touchStartX =
            event.changedTouches[0].screenX;

    },
    {
        passive: true
    }
);


galleryModal.addEventListener(
    "touchend",
    event => {

        touchEndX =
            event.changedTouches[0].screenX;

        handleSwipe();

    },
    {
        passive: true
    }
);


function handleSwipe() {

    const difference =
        touchEndX - touchStartX;


    if (Math.abs(difference) < 50) {
        return;
    }


    if (difference > 0) {

        previousImage();

    } else {

        nextImage();

    }

}


