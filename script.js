/* =====================================================
   EZMOIRE — ADMIN
===================================================== */

const ADMIN_PASSWORD = "ezmoire2026";


let templates = [];


/* =====================================================
   LOAD
===================================================== */

function loadTemplates() {

    try {

        templates =
            JSON.parse(
                localStorage.getItem(
                    "ezmoireTemplates"
                )
            ) || [];

    } catch {

        templates = [];

    }

}


/* =====================================================
   SAVE
===================================================== */

function saveTemplates() {

    localStorage.setItem(
        "ezmoireTemplates",
        JSON.stringify(templates)
    );

}


/* =====================================================
   FORMAT
===================================================== */

function rupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(Number(value) || 0);

}


function safe(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


/* =====================================================
   CODE
===================================================== */

function generateCode() {

    let highest = 0;


    templates.forEach(template => {

        const number =
            parseInt(
                String(template.code)
                    .replace("EZ", "")
            );


        if (
            !isNaN(number) &&
            number > highest
        ) {

            highest = number;

        }

    });


    return "EZ" +
        String(highest + 1)
            .padStart(3, "0");

}


/* =====================================================
   LOGIN
===================================================== */

function login() {

    const password =
        document.getElementById(
            "adminPassword"
        ).value;


    const error =
        document.getElementById(
            "loginError"
        );


    if (password !== ADMIN_PASSWORD) {

        error.textContent =
            "Password salah.";

        return;

    }


    sessionStorage.setItem(
        "ezmoireAdmin",
        "true"
    );


    showDashboard();

}


function showDashboard() {

    document
        .getElementById("loginScreen")
        .classList.add("hidden");


    document
        .getElementById("adminDashboard")
        .classList.remove("hidden");


    loadTemplates();

    renderAdminList();

    updateStats();

}


/* =====================================================
   IMAGE TO DATA URL
===================================================== */

function imageToDataURL(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload = () => {

                resolve(
                    reader.result
                );

            };


            reader.onerror = () => {

                reject(
                    new Error(
                        "Gagal membaca gambar."
                    )
                );

            };


            reader.readAsDataURL(file);

        }
    );

}


/* =====================================================
   IMAGE PREVIEW
===================================================== */

function setupImageUpload() {

    const input =
        document.getElementById(
            "templateImage"
        );


    const preview =
        document.getElementById(
            "imagePreview"
        );


    input.addEventListener(
        "change",
        () => {

            const file =
                input.files[0];


            preview.innerHTML = "";

            preview.classList.remove(
                "show"
            );


            if (!file) return;


            const allowed = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];


            if (
                !allowed.includes(
                    file.type
                )
            ) {

                alert(
                    "Gunakan JPG, PNG, atau WEBP."
                );

                input.value = "";

                return;

            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Ukuran gambar maksimal 5 MB."
                );

                input.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                event => {

                    preview.innerHTML = `

                        <img
                            src="${event.target.result}"
                            alt="Preview"
                        >

                    `;


                    preview.classList.add(
                        "show"
                    );

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =====================================================
   ADD TEMPLATE
===================================================== */

async function addTemplate() {

    const title =
        document
            .getElementById(
                "templateTitle"
            )
            .value
            .trim();


    const price =
        document
            .getElementById(
                "templatePrice"
            )
            .value;


    const link =
        document
            .getElementById(
                "templateLink"
            )
            .value
            .trim();


    const imageInput =
        document.getElementById(
            "templateImage"
        );


    const imageFile =
        imageInput.files[0];


    if (
        !title ||
        !price ||
        !imageFile
    ) {

        alert(
            "Cover, judul, dan harga wajib diisi."
        );

        return;

    }


    const categories =
        [
            ...document.querySelectorAll(
                ".category-check:checked"
            )
        ]
        .map(
            input => input.value
        );


    const audience =
        [
            ...document.querySelectorAll(
                ".audience-check:checked"
            )
        ]
        .map(
            input => input.value
        );


    const features =
        [
            ...document.querySelectorAll(
                ".feature-check:checked"
            )
        ]
        .map(
            input => input.value
        );


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


    const button =
        document.getElementById(
            "addTemplateBtn"
        );


    button.disabled = true;

    button.innerHTML =
        "Saving...";


    try {

        const image =
            await imageToDataURL(
                imageFile
            );


        const template = {

            id:
                Date.now().toString(),

            code:
                generateCode(),

            title:
                title,

            price:
                Number(price),

            image:
                image,

            link:
                link,

            categories:
                categories,

            audience:
                audience,

            features:
                features,

            createdAt:
                new Date().toISOString()

        };


        templates.push(
            template
        );


        saveTemplates();

        clearForm();

        renderAdminList();

        updateStats();


        alert(
            `${template.code} berhasil ditambahkan.`
        );


    } catch {

        alert(
            "Gagal menyimpan gambar."
        );

    }


    button.disabled = false;

    button.innerHTML =
        "Add Template <span>+</span>";

}


/* =====================================================
   CLEAR FORM
===================================================== */

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


    const preview =
        document.getElementById(
            "imagePreview"
        );


    preview.innerHTML = "";

    preview.classList.remove(
        "show"
    );

}


/* =====================================================
   RENDER ADMIN LIST
===================================================== */

function renderAdminList() {

    const container =
        document.getElementById(
            "adminTemplateList"
        );


    container.innerHTML = "";


    if (!templates.length) {

        container.innerHTML = `

            <div class="empty-state"
                 style="display:block;padding:45px 10px">

                <div class="empty-symbol">
                    +
                </div>

                <h3>
                    Belum ada template
                </h3>

                <p>
                    Tambahkan template pertama kamu.
                </p>

            </div>

        `;

        return;

    }


    [
        ...templates
    ]
        .reverse()
        .forEach(template => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-template-item";


            const tags =
                (template.categories || [])
                    .slice(0, 3)
                    .map(category => `
                        <span>
                            ${safe(category)}
                        </span>
                    `)
                    .join("");


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
                        ${safe(template.code)}
                        ·
                        ${rupiah(template.price)}
                    </span>


                    <div class="admin-template-tags">
                        ${tags}
                    </div>

                </div>


                <div class="admin-item-actions">

                    <button
                        type="button"
                        onclick="previewTemplate('${template.id}')"
                    >
                        Preview
                    </button>

                    <button
                        type="button"
                        class="delete"
                        onclick="deleteTemplate('${template.id}')"
                    >
                        Delete
                    </button>

                </div>

            `;


            container.appendChild(
                item
            );

        });

}


/* =====================================================
   PREVIEW
===================================================== */

function previewTemplate(id) {

    const template =
        templates.find(
            item => item.id === id
        );


    if (!template) return;


    if (!template.link) {

        alert(
            "Template ini belum memiliki link preview."
        );

        return;

    }


    window.open(
        template.link,
        "_blank"
    );

}


/* =====================================================
   DELETE
===================================================== */

function deleteTemplate(id) {

    const template =
        templates.find(
            item => item.id === id
        );


    if (!template) return;


    const confirmDelete =
        confirm(
            `Hapus template "${template.title}"?`
        );


    if (!confirmDelete) return;


    templates =
        templates.filter(
            item => item.id !== id
        );


    saveTemplates();

    renderAdminList();

    updateStats();

}


/* =====================================================
   STATS
===================================================== */

function updateStats() {

    document.getElementById(
        "templateCount"
    ).textContent =
        templates.length;


    document.getElementById(
        "nextCode"
    ).textContent =
        generateCode();

}


/* =====================================================
   THEME
===================================================== */

function loadTheme() {

    const theme =
        localStorage.getItem(
            "ezmoireTheme"
        );


    if (theme === "dark") {

        document.body.classList.add(
            "dark"
        );

    }


    updateThemeButton();

}


function updateThemeButton() {

    const button =
        document.getElementById(
            "adminThemeBtn"
        );


    if (!button) return;


    button.textContent =
        document.body.classList.contains(
            "dark"
        )
            ? "☀"
            : "☾";

}


function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    localStorage.setItem(
        "ezmoireTheme",

        document.body.classList.contains(
            "dark"
        )
            ? "dark"
            : "light"
    );


    updateThemeButton();

}


/* =====================================================
   SIDEBAR
===================================================== */

function setupSidebar() {

    const buttons =
        document.querySelectorAll(
            ".sidebar-item[data-section]"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                buttons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                const section =
                    button.dataset.section;


                if (
                    section === "add"
                ) {

                    document
                        .getElementById(
                            "addSection"
                        )
                        .scrollIntoView({
                            behavior: "smooth"
                        });

                }


                if (
                    section === "templates"
                ) {

                    document
                        .getElementById(
                            "templatesSection"
                        )
                        .scrollIntoView({
                            behavior: "smooth"
                        });

                }

            }
        );

    });

}


/* =====================================================
   INIT
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTheme();

        const loggedIn =
            sessionStorage.getItem(
                "ezmoireAdmin"
            );


        if (loggedIn === "true") {

            showDashboard();

        }


        document
            .getElementById("loginBtn")
            .addEventListener(
                "click",
                login
            );


        document
            .getElementById("adminPassword")
            .addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter"
                    ) {

                        login();

                    }

                }
            );


        document
            .getElementById(
                "addTemplateBtn"
            )
            .addEventListener(
                "click",
                addTemplate
            );


        document
            .getElementById(
                "adminThemeBtn"
            )
            .addEventListener(
                "click",
                toggleTheme
            );


        setupImageUpload();

        setupSidebar();

    }
);
