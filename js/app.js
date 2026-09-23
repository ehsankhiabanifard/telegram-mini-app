
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

document.addEventListener("DOMContentLoaded", init);


async function init() {

    try {
loading.innerHTML = "مرحله 0:...";
        hideError();

        showLoading();

applyStoreConfig();

loading.innerHTML = "مرحله 1: شروع دریافت محصولات...";

await loadProducts();

loading.innerHTML = "مرحله 2: محصولات دریافت شدند...";

renderProducts();

loading.innerHTML = "مرحله 3: محصولات ساخته شدند...";

hideLoading();

    } catch (error) {

        console.error(error);

        hideLoading();

        showError(error);

    }

}


/* =========================================================
   CONFIG
========================================================= */

function applyStoreConfig() {

    if (
        typeof STORE_CONFIG === "undefined"
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

    const productsURL = "./data/products.json?v=" + Date.now();

    try {

        const response = await fetch(productsURL);

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error(
                "products.json آرایه نیست."
            );
        }

        PRODUCTS = data;

    } catch (error) {

        throw new Error(
            "خطا در دریافت محصولات: " + error.message
        );

    }

}




/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    loading.classList.remove("hidden");

}


function hideLoading() {

    loading.classList.add("hidden");

}


/* =========================================================
   ERROR
========================================================= */

function showError(error) {

    errorMessage.classList.remove("hidden");


    const errorText =
        errorMessage.querySelector("p");


    if (errorText) {

        errorText.innerHTML = `
            اطلاعات محصولات دریافت نشد.
            <br><br>
            <small>
                ${escapeHTML(error.message)}
            </small>
        `;

    }

}


function hideError() {

    errorMessage.classList.add("hidden");

}


retryButton.addEventListener(
    "click",
    init
);


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


    PRODUCTS.forEach(
        product => {

            const card =
                createProductCard(product);

            productsGrid.appendChild(card);

        }
    );

}


/* =========================================================
   PRODUCT CARD
========================================================= */

function createProductCard(product) {

    const card =
        document.createElement("article");

    card.className =
        "product-card";


    /* Image */

    const imageWrapper =
        document.createElement("div");

    imageWrapper.className =
        "product-image-wrapper";


    const image =
        document.createElement("img");

    image.className =
        "product-image";

    image.src =
        product.images[0];

    image.alt =
        product.name;

    image.loading =
        "lazy";


    image.addEventListener(
        "click",
        () => openGallery(product)
    );


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


    /* Body */

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


    /* Actions */

    const actions =
        document.createElement("div");

    actions.className =
        "product-actions";


    const galleryButton =
        document.createElement("button");

    galleryButton.type =
        "button";

    galleryButton.className =
        "product-button gallery-button";

    galleryButton.textContent =
        "🖼 مشاهده تصاویر";


    galleryButton.addEventListener(
        "click",
        () => openGallery(product)
    );


    const detailsButton =
        document.createElement("button");

    detailsButton.type =
        "button";

    detailsButton.className =
        "product-button details-button";

    detailsButton.textContent =
        "✦ جزئیات";


    detailsButton.addEventListener(
        "click",
        () => openDetails(product)
    );


    actions.appendChild(
        galleryButton
    );

    actions.appendChild(
        detailsButton
    );


    body.appendChild(title);

    body.appendChild(description);

    body.appendChild(actions);


    card.appendChild(
        imageWrapper
    );

    card.appendChild(
        body
    );


    return card;

}


/* =========================================================
   STATUS
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
        !Array.isArray(product.images) ||
        product.images.length === 0
    ) {
        return;
    }


    currentProduct =
        product;

    currentImageIndex =
        0;


    galleryTitle.textContent =
        product.name;

    galleryDescription.textContent =
        product.description;


    updateGallery();


    galleryModal.classList.remove(
        "hidden"
    );

    document.body.classList.add(
        "modal-open"
    );


    preloadGalleryImages(
        product
    );

}


function updateGallery() {

    if (!currentProduct) {
        return;
    }


    const images =
        currentProduct.images;


    const imageURL =
        images[currentImageIndex];


    galleryImage.src =
        imageURL;


    galleryImage.alt =
        `${currentProduct.name} - تصویر ${currentImageIndex + 1}`;


    galleryCounter.textContent =
        `${currentImageIndex + 1} / ${images.length}`;

}


function preloadGalleryImages(product) {

    if (!product.images) {
        return;
    }


    product.images.forEach(
        url => {

            const img =
                new Image();

            img.src =
                url;

        }
    );

}
