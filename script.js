/* =========================================
   EZMOIRE
========================================= */

const WHATSAPP = "6288216358530";
const ADMIN_PASSWORD = "ezmoire2026";

let templates = JSON.parse(
    localStorage.getItem("ezmoireTemplates")
) || [];

let currentCategory = "all";
let currentAudience = "all";


/* =========================================
   INITIALIZE
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    renderTemplates();

    renderAdminList();

    updateAdminStats();

    setupFilters();

    setupModalClose();

});


/* =========================================
   THEME
========================================= */

function loadTheme() {

    const saved =
        localStorage.getItem("ezmoireTheme");

    if (saved === "dark") {

        document.body.classList.add("dark");

        document.getElementById("themeBtn").textContent = "☀";

    }

}


document
    .getElementById("themeBtn")
    .addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const isDark =
            document.body.classList.contains("dark");

        localStorage.setItem(
            "ezmoireTheme",
            isDark ? "dark" : "light"
        );

        document.getElementById("themeBtn").textContent =
            isDark ? "☀" : "☾";

    });


/* =========================================
   FILTER
========================================= */

function setupFilters() {

    document
        .querySelectorAll(".category-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                document
                    .querySelectorAll(".category-btn")
                    .forEach(item =>
                        item.classList.remove("active")
                    );

                button.classList.add("active");

                currentCategory =
                    button.dataset.category;

                renderTemplates();

            });

        });


    document
        .querySelectorAll(".who-btn")
        .forEach(button => {

            button.addEventListener("click", () => {

                document
                    .querySelectorAll(".who-btn")
                    .forEach(item =>
                        item.classList.remove("active")
                    );

                button.classList.add("active");

                currentAudience =
                    button.dataset.audience;

                renderTemplates();

            });

        });

}


/* =========================================
   RENDER TEMPLATES
========================================= */

function renderTemplates() {

    const grid =
        document.getElementById("templateGrid");

    const empty =
        document.getElementById("emptyState");


    grid.innerHTML = "";


    const result = templates.filter(template => {

        const categoryOkay =
            currentCategory === "all" ||
            template.categories.includes(
                currentCategory
            );

        const audienceOkay =
            currentAudience === "all" ||
            template.audience.includes(
                currentAudience
            );

        return categoryOkay && audienceOkay;

    });


    if (result.length === 0) {

        empty.style.display = "block";

        return;

    }


    empty.style.display = "none";


    result.forEach(template => {

        const card =
            document.createElement("article");

        card.className = "template-card";


        const tags =
            template.categories
                .slice(0, 3)
                .map(category => `
                    <span class="template-tag">
                        ${safe(category)}
                    </span>
                `)
                .join("");


        card.innerHTML = `

            <div class="template-cover">

                <img
                    src="${safe(template.image)}"
                    alt="${safe(template.title)}"
                    onerror="
                        this.src='https://placehold.co/800x1000/15181e/ffffff?text=Ezmoire'
                    "
                >

                <span class="template-code">
                    ${template.code}
                </span>

            </div>


            <div class="template-info">

                <h3>
                    ${safe(template.title)}
                </h3>

                <div class="template-price">
                    ${rupiah(template.price)}
                </div>

                <div class="template-tags">
                    ${tags}
                </div>

                <div class="template-buttons">

                    <button
                        class="detail-btn"
                        onclick="openTemplate('${template.id}')"
                    >
                        Detail
                    </button>

                    <button
                        class="order-btn"
                        onclick="orderTemplate('${template.id}')"
                    >
                        Pesan
                    </button>

                </div>

            </div>
        `;


        grid.appendChild(card);

    });

}


/* =========================================
   TEMPLATE DETAIL
========================================= */

function openTemplate(id) {

    const template =
        templates.find(item => item.id === id);

    if (!template) return;


    document.getElementById("detailImage").src =
        template.image;

    document.getElementById("detailCode").textContent =
        template.code;

    document.getElementById("detailTitle").textContent =
        template.title;

    document.getElementById("detailPrice").textContent =
        rupiah(template.price);


    document.getElementById("detailCategories").innerHTML =
        template.categories
            .map(item => `
                <span>${safe(item)}</span>
            `)
            .join("");


    document.getElementById("detailAudience").innerHTML =
        template.audience
            .map(item => `
                <span>${safe(item)}</span>
            `)
            .join("");


    document.getElementById("detailFeatures").innerHTML =
        template.features.length
            ? template.features
                .map(item => `
                    <div>${safe(item)}</div>
                `)
                .join("")
            : "<div>Belum ada fitur khusus.</div>";


    const preview =
        document.getElementById("previewBtn");

    preview.href =
        template.link || "#";


    if (!template.link) {

        preview.onclick = event => {

            event.preventDefault();

            alert(
                "Preview website belum ditambahkan."
            );

        };

    } else {

        preview.onclick = null;

    }


    document.getElementById(
        "detailWhatsapp"
    ).onclick = () => {

        orderTemplate(template.id);

    };


    document
        .getElementById("detailModal")
        .classList.add("show");

}


/* =========================================
   WHATSAPP
========================================= */

function orderTemplate(id) {

    const template =
        templates.find(item => item.id === id);

    if (!template) return;


    /*
        Sengaja TIDAK memasukkan:
        - harga
        - ketersediaan
    */

    const message =
        `Halo Ezmoire, saya tertarik dengan template "${template.title}" (${template.code}). Apakah saya bisa memesan template ini?`;


    const url =
        `https://wa.me/${WHATSAPP}?text=${
            encodeURIComponent(message)
        }`;


    window.open(url, "_blank");

}


/* =========================================
   ADMIN LOGIN
========================================= */

function openLogin() {

    document
        .getElementById("loginModal")
        .classList.add("show");

    document
        .getElementById("adminPassword")
        .value = "";

    document
        .getElementById("loginError")
        .textContent = "";

}


function loginAdmin() {

    const password =
        document.getElementById(
            "adminPassword"
        ).value;


    if (password !== ADMIN_PASSWORD) {

        document.getElementById(
            "loginError"
        ).textContent =
            "Password salah.";

        return;

    }


    closeModal("loginModal");

    document
        .getElementById("adminModal")
        .classList.add("show");

    renderAdminList();

    updateAdminStats();

}


/* ENTER LOGIN */

document
    .getElementById("adminPassword")
    .addEventListener("keydown", event => {

        if (event.key === "Enter") {

            loginAdmin();

        }

    });


/* =========================================
   ADD TEMPLATE
========================================= */

function addTemplate() {

    const title =
        document
            .getElementById("templateTitle")
            .value.trim();

    const price =
        document
            .getElementById("templatePrice")
            .value;

    const link =
        document
            .getElementById("templateLink")
            .value.trim();

    const image =
        document
            .getElementById("templateImage")
            .value.trim();


    if (!title || !price || !image) {

        alert(
            "Judul, harga, dan cover image wajib diisi."
        );

        return;

    }


    const categories =
        [...document.querySelectorAll(
            ".category-check:checked"
        )]
        .map(item => item.value);


    const audience =
        [...document.querySelectorAll(
            ".audience-check:checked"
        )]
        .map(item => item.value);


    const features =
        [...document.querySelectorAll(
            ".feature-check:checked"
        )]
        .map(item => item.value);


    if (!categories.length) {

        alert(
            "Pilih minimal satu kategori."
        );

        return;

    }


    if (!audience.length) {

        alert(
            "Pilih minimal satu pilihan Who is it for?"
        );

        return;

    }


    const template = {

        id: Date.now().toString(),

        code: generateCode(),

        title: title,

        price: Number(price),

        image: image,

        link: link,

        categories: categories,

        audience: audience,

        features: features

    };


    templates.push(template);

    saveTemplates();

    clearForm();

    renderTemplates();

    renderAdminList();

    updateAdminStats();


    alert(
        `${template.code} berhasil ditambahkan.`
    );

}


/* =========================================
   CODE GENERATOR
========================================= */

function generateCode() {

    let max = 0;


    templates.forEach(template => {

        const number =
            parseInt(
                String(template.code)
                    .replace("EZ", "")
            );

        if (
            !isNaN(number) &&
            number > max
        ) {

            max = number;

        }

    });


    return "EZ" +
        String(max + 1)
            .padStart(3, "0");

}


/* =========================================
   ADMIN LIST
========================================= */

function renderAdminList() {

    const container =
        document.getElementById(
            "adminTemplateList"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!templates.length) {

        container.innerHTML = `
            <div class="empty-state"
                 style="display:block;padding:35px 10px">

                <div class="empty-symbol">
                    +
                </div>

                <h3>
                    No templates yet
                </h3>

                <p>
                    Tambahkan template pertama.
                </p>

            </div>
        `;

        return;

    }


    [...templates]
        .reverse()
        .forEach(template => {

            const item =
                document.createElement("div");

            item.className =
                "admin-template-item";


            item.innerHTML = `

                <img
                    class="admin-thumb"
                    src="${safe(template.image)}"
                    alt=""
                    onerror="
                        this.src='https://placehold.co/100x120/15181e/ffffff?text=E'
                    "
                >

                <div class="admin-template-info">

                    <strong>
                        ${safe(template.title)}
                    </strong>

                    <span>
                        ${template.code}
                        ·
                        ${rupiah(template.price)}
                    </span>

                </div>

                <button
                    class="delete-template"
                    onclick="deleteTemplate('${template.id}')"
                >
                    Delete
                </button>
            `;


            container.appendChild(item);

        });

}


/* =========================================
   DELETE
========================================= */

function deleteTemplate(id) {

    const template =
        templates.find(item => item.id === id);

    if (!template) return;


    const yes =
        confirm(
            `Hapus "${template.title}"?`
        );


    if (!yes) return;


    templates =
        templates.filter(
            item => item.id !== id
        );


    saveTemplates();

    renderTemplates();

    renderAdminList();

    updateAdminStats();

}


/* =========================================
   ADMIN STATS
========================================= */

function updateAdminStats() {

    const count =
        document.getElementById(
            "templateCount"
        );

    const next =
        document.getElementById(
            "nextCode"
        );


    if (count) {

        count.textContent =
            templates.length;

    }


    if (next) {

        next.textContent =
            generateCode();

    }

}


/* =========================================
   CLEAR FORM
========================================= */

function clearForm() {

    document.getElementById(
        "templateTitle"
    ).value = "";

    document.getElementById(
        "templatePrice"
    ).value = "";

    document.getElementById(
        "templateLink"
    ).value = "";

    document.getElementById(
        "templateImage"
    ).value = "";


    document
        .querySelectorAll(
            ".category-check, .audience-check, .feature-check"
        )
        .forEach(input => {

            input.checked = false;

        });

}


/* =========================================
   SAVE
========================================= */

function saveTemplates() {

    localStorage.setItem(
        "ezmoireTemplates",
        JSON.stringify(templates)
    );

}


/* =========================================
   RUPIAH
========================================= */

function rupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


/* =========================================
   SAFE TEXT
========================================= */

function safe(value) {

    const element =
        document.createElement("div");

    element.textContent =
        value ?? "";

    return element.innerHTML;

}


/* =========================================
   MODAL
========================================= */

function closeModal(id) {

    document
        .getElementById(id)
        .classList.remove("show");

}


function closeAdmin() {

    document
        .getElementById("adminModal")
        .classList.remove("show");

}


function setupModalClose() {

    document
        .querySelectorAll(".modal")
        .forEach(modal => {

            modal.addEventListener(
                "click",
                event => {

                    if (
                        event.target === modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );

                    }

                }
            );

        });

}


/* =========================================
   FOCUS ADD FORM
========================================= */

function focusAddForm() {

    const form =
        document.getElementById("addForm");

    if (!form) return;

    form.scrollIntoView({
        behavior: "smooth"
    });

}