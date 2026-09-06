/* =====================================================
   EZMOIRE
   SINGLE SCRIPT
   PUBLIC + ADMIN + FIREBASE
   FINAL
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const WHATSAPP = "6288216358530";

const PLACEHOLDER =
    "https://placehold.co/800x1000/15181e/ffffff?text=Ezmoire";

const ADMIN_PLACEHOLDER =
    "https://placehold.co/100x120/15181e/ffffff?text=E";


/* =====================================================
   DATA
===================================================== */

let templates = [];
let currentCategory = "all";
let currentAudience = "all";
let currentUser = null;


/* =====================================================
   FORMAT RUPIAH
===================================================== */

function rupiah(value) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}


/* =====================================================
   SAFE HTML
===================================================== */

function safe(value) {
    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}


/* =====================================================
   PAGE CHECK
===================================================== */

function isAdminPage() {
    return !!document.getElementById("adminDashboard");
}

function isPublicPage() {
    return !!document.getElementById("templateGrid");
}


/* =====================================================
   FIREBASE CHECK
===================================================== */

function firebaseIsReady() {
    return (
        window.firebaseReady === true &&
        window.firebaseDB &&
        window.firebaseCollection &&
        window.firebaseGetDocs
    );
}


/* =====================================================
   WAIT FOR FIREBASE
===================================================== */

function waitForFirebase(timeout = 10000) {
    return new Promise((resolve, reject) => {
        if (firebaseIsReady()) {
            resolve();
            return;
        }

        const start = Date.now();

        const timer = setInterval(() => {
            if (firebaseIsReady()) {
                clearInterval(timer);
                resolve();
                return;
            }

            if (Date.now() - start >= timeout) {
                clearInterval(timer);

                reject(
                    new Error(
                        "Firebase tidak siap dalam waktu yang ditentukan."
                    )
                );
            }
        }, 50);
    });
}


/* =====================================================
   LOAD TEMPLATES
===================================================== */

async function loadTemplates() {
    try {
        await waitForFirebase();

        const templatesRef =
            window.firebaseCollection(
                window.firebaseDB,
                "templates"
            );

        const snapshot =
            await window.firebaseGetDocs(
                templatesRef
            );

        templates = [];

        snapshot.forEach(docSnapshot => {
            const data = docSnapshot.data();

            templates.push({
                id: docSnapshot.id,

                ...data,

                categories:
                    Array.isArray(data.categories)
                        ? data.categories
                        : [],

                audience:
                    Array.isArray(data.audience)
                        ? data.audience
                        : [],

                features:
                    Array.isArray(data.features)
                        ? data.features
                        : []
            });
        });

        console.log(
            `Berhasil memuat ${templates.length} template.`
        );

        if (isPublicPage()) {
            renderTemplates();
        }

        if (isAdminPage()) {
            renderAdminList();
            updateStats();
        }

    } catch (error) {
        console.error(
            "Gagal mengambil template dari Firebase:",
            error
        );

        if (isPublicPage()) {
            const grid =
                document.getElementById(
                    "templateGrid"
                );

            const empty =
                document.getElementById(
                    "emptyState"
                );

            if (grid) {
                grid.innerHTML = `
                    <div
                        style="
                            grid-column:1/-1;
                            text-align:center;
                            padding:50px 20px;
                        "
                    >
                        <h3>
                            Template gagal dimuat
                        </h3>

                        <p>
                            Silakan refresh halaman.
                        </p>
                    </div>
                `;
            }

            if (empty) {
                empty.style.display = "none";
            }
        }
    }
}


/* =====================================================
   GENERATE TEMPLATE CODE
===================================================== */

function generateCode() {
    let highest = 0;

    templates.forEach(template => {
        const code = String(
            template.code || ""
        );

        const number = parseInt(
            code.replace(/[^0-9]/g, ""),
            10
        );

        if (
            !isNaN(number) &&
            number > highest
        ) {
            highest = number;
        }
    });

    return (
        "EZ" +
        String(highest + 1).padStart(3, "0")
    );
}


/* =====================================================
   THEME
===================================================== */

function loadTheme() {
    const saved =
        localStorage.getItem(
            "ezmoireTheme"
        );

    if (saved === "dark") {
        document.body.classList.add("dark");
    }

    updatePublicThemeButton();
    updateAdminThemeButton();
}


function updatePublicThemeButton() {
    const button =
        document.getElementById("themeBtn");

    if (!button) {
        return;
    }

    button.textContent =
        document.body.classList.contains("dark")
            ? "☀"
            : "☾";
}


function updateAdminThemeButton() {
    const button =
        document.getElementById(
            "adminThemeBtn"
        );

    if (!button) {
        return;
    }

    button.textContent =
        document.body.classList.contains("dark")
            ? "☀"
            : "☾";
}


function toggleTheme() {
    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "ezmoireTheme",
        isDark ? "dark" : "light"
    );

    updatePublicThemeButton();
    updateAdminThemeButton();
}


/* =====================================================
   PUBLIC FILTER
===================================================== */

function setupFilters() {

    document
        .querySelectorAll(".category-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".category-btn"
                        )
                        .forEach(item => {
                            item.classList.remove(
                                "active"
                            );
                        });

                    button.classList.add("active");

                    currentCategory =
                        button.dataset.category ||
                        "all";

                    renderTemplates();
                }
            );
        });


    document
        .querySelectorAll(".who-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".who-btn"
                        )
                        .forEach(item => {
                            item.classList.remove(
                                "active"
                            );
                        });

                    button.classList.add("active");

                    currentAudience =
                        button.dataset.audience ||
                        "all";

                    renderTemplates();
                }
            );
        });
}


/* =====================================================
   PUBLIC RENDER
===================================================== */

function renderTemplates() {

    const grid =
        document.getElementById(
            "templateGrid"
        );

    const empty =
        document.getElementById(
            "emptyState"
        );

    if (!grid) {
        return;
    }

    grid.innerHTML = "";

    const result =
        templates.filter(template => {

            const categories =
                Array.isArray(
                    template.categories
                )
                    ? template.categories
                    : [];

            const audience =
                Array.isArray(
                    template.audience
                )
                    ? template.audience
                    : [];


            const categoryOkay =
                currentCategory === "all"
                    ? true
                    : categories.includes(
                        currentCategory
                    );


            const audienceOkay =
                currentAudience === "all"
                    ? true
                    : audience.includes(
                        currentAudience
                    );


            return (
                categoryOkay &&
                audienceOkay
            );
        });


    if (result.length === 0) {

        if (empty) {
            empty.style.display = "block";
        }

        return;
    }


    if (empty) {
        empty.style.display = "none";
    }


    result.forEach(template => {

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "template-card";


        const categories =
            Array.isArray(
                template.categories
            )
                ? template.categories
                : [];


        const tags =
            categories
                .slice(0, 3)
                .map(category => `
                    <span class="template-tag">
                        ${safe(category)}
                    </span>
                `)
                .join("");


        const image =
            template.image ||
            PLACEHOLDER;


        card.innerHTML = `
            <div class="template-cover">

                <img
                    src="${safe(image)}"
                    alt="${safe(template.title)}"
                >

                <span class="template-code">
                    ${safe(template.code)}
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
                        type="button"
                    >
                        Detail
                    </button>


                    <button
                        class="order-btn"
                        type="button"
                    >
                        Pesan
                    </button>

                </div>

            </div>
        `;


        const imageElement =
            card.querySelector("img");

        if (imageElement) {
            imageElement.onerror = () => {
                imageElement.src =
                    PLACEHOLDER;
            };
        }


        const detailButton =
            card.querySelector(
                ".detail-btn"
            );

        if (detailButton) {
            detailButton.addEventListener(
                "click",
                () => {
                    openTemplate(
                        template.id
                    );
                }
            );
        }


        const orderButton =
            card.querySelector(
                ".order-btn"
            );

        if (orderButton) {
            orderButton.addEventListener(
                "click",
                () => {
                    orderTemplate(
                        template.id
                    );
                }
            );
        }


        grid.appendChild(card);
    });
}


/* =====================================================
   DETAIL MODAL
===================================================== */

function openTemplate(id) {

    const template =
        templates.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!template) {
        return;
    }


    const modal =
        document.getElementById(
            "detailModal"
        );

    if (!modal) {
        return;
    }


    const image =
        document.getElementById(
            "detailImage"
        );

    const code =
        document.getElementById(
            "detailCode"
        );

    const title =
        document.getElementById(
            "detailTitle"
        );

    const price =
        document.getElementById(
            "detailPrice"
        );

    const categories =
        document.getElementById(
            "detailCategories"
        );

    const audience =
        document.getElementById(
            "detailAudience"
        );

    const features =
        document.getElementById(
            "detailFeatures"
        );

    const preview =
        document.getElementById(
            "previewBtn"
        );

    const whatsapp =
        document.getElementById(
            "detailWhatsapp"
        );


    /* IMAGE */

    if (image) {

        image.src =
            template.image ||
            PLACEHOLDER;

        image.alt =
            template.title || "";

        image.onerror = () => {
            image.src =
                PLACEHOLDER;
        };
    }


    /* BASIC INFO */

    if (code) {
        code.textContent =
            template.code || "";
    }

    if (title) {
        title.textContent =
            template.title || "";
    }

    if (price) {
        price.textContent =
            rupiah(template.price);
    }


    /* CATEGORIES */

    if (categories) {

        const list =
            Array.isArray(
                template.categories
            )
                ? template.categories
                : [];

        categories.innerHTML =
            list
                .map(item => `
                    <span>
                        ${safe(item)}
                    </span>
                `)
                .join("");
    }


    /* AUDIENCE */

    if (audience) {

        const list =
            Array.isArray(
                template.audience
            )
                ? template.audience
                : [];

        audience.innerHTML =
            list
                .map(item => `
                    <span>
                        ${safe(item)}
                    </span>
                `)
                .join("");
    }


    /* FEATURES */

    if (features) {

        const featureList =
            Array.isArray(
                template.features
            )
                ? template.features
                : [];


        features.innerHTML =
            featureList.length
                ? featureList
                    .map(item => `
                        <div>
                            ${safe(item)}
                        </div>
                    `)
                    .join("")
                : `
                    <div>
                        Belum ada fitur khusus.
                    </div>
                `;
    }


    /* PREVIEW */

    if (preview) {

        preview.onclick = null;

        if (template.link) {

            preview.href =
                template.link;

            preview.target =
                "_blank";

            preview.rel =
                "noopener noreferrer";

        } else {

            preview.href = "#";

            preview.onclick =
                event => {

                    event.preventDefault();

                    alert(
                        "Preview website belum ditambahkan."
                    );
                };
        }
    }


    /* WHATSAPP */

    if (whatsapp) {

        whatsapp.onclick = () => {
            orderTemplate(
                template.id
            );
        };
    }


    modal.classList.add("show");
}


/* =====================================================
   WHATSAPP
===================================================== */

function orderTemplate(id) {

    const template =
        templates.find(
            item =>
                String(item.id) ===
                String(id)
        );

    if (!template) {
        return;
    }


    const message =
        `Halo Ezmoire, saya tertarik dengan template "${template.title}" (${template.code}). Apakah saya bisa memesan template ini?`;


    const url =
        `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`;


    window.open(
        url,
        "_blank"
    );
}


/* =====================================================
   MODAL CLOSE
===================================================== */

function setupModalClose() {

    const modal =
        document.getElementById(
            "detailModal"
        );

    const close =
        document.getElementById(
            "detailClose"
        );


    if (close) {

        close.addEventListener(
            "click",
            () => {

                if (modal) {
                    modal.classList.remove(
                        "show"
                    );
                }
            }
        );
    }


    if (modal) {

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {

                    modal.classList.remove(
                        "show"
                    );
                }
            }
        );
    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                if (modal) {

                    modal.classList.remove(
                        "show"
                    );
                }
            }
        }
    );
}


/* =====================================================
   ADMIN LOGIN
===================================================== */

async function loginAdmin() {

    const emailInput =
        document.getElementById(
            "adminEmail"
        );

    const passwordInput =
        document.getElementById(
            "adminPassword"
        );

    const error =
        document.getElementById(
            "loginError"
        );

    const loginButton =
        document.getElementById(
            "loginBtn"
        );


    if (
        !emailInput ||
        !passwordInput
    ) {
        return;
    }


    const email =
        emailInput.value.trim();

    const password =
        passwordInput.value;


    if (
        !email ||
        !password
    ) {

        if (error) {
            error.textContent =
                "Email dan password wajib diisi.";
        }

        return;
    }


    try {

        await waitForFirebase();


        if (
            !window.firebaseAuth ||
            !window.firebaseSignIn
        ) {

            throw new Error(
                "Firebase Authentication belum siap."
            );
        }


        if (error) {
            error.textContent = "";
        }


        if (loginButton) {

            loginButton.disabled = true;

            loginButton.textContent =
                "Logging in...";
        }


        await window.firebaseSignIn(
            window.firebaseAuth,
            email,
            password
        );


        console.log(
            "Login Firebase berhasil."
        );


    } catch (firebaseError) {

        console.error(
            "Login Firebase gagal:",
            firebaseError
        );


        if (error) {

            switch (
                firebaseError.code
            ) {

                case "auth/invalid-credential":
                case "auth/wrong-password":
                case "auth/user-not-found":

                    error.textContent =
                        "Email atau password salah.";

                    break;


                case "auth/invalid-email":

                    error.textContent =
                        "Format email tidak valid.";

                    break;


                case "auth/user-disabled":

                    error.textContent =
                        "Akun admin dinonaktifkan.";

                    break;


                case "auth/too-many-requests":

                    error.textContent =
                        "Terlalu banyak percobaan. Coba lagi nanti.";

                    break;


                default:

                    error.textContent =
                        "Login gagal. Periksa email dan password.";
            }
        }

    } finally {

        if (loginButton) {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "Login";
        }
    }
}


/* =====================================================
   SHOW LOGIN
===================================================== */

function showLogin() {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    const dashboard =
        document.getElementById(
            "adminDashboard"
        );


    if (loginScreen) {
        loginScreen.classList.remove(
            "hidden"
        );
    }


    if (dashboard) {
        dashboard.classList.add(
            "hidden"
        );
    }
}


/* =====================================================
   SHOW DASHBOARD
===================================================== */

async function showDashboard() {

    const loginScreen =
        document.getElementById(
            "loginScreen"
        );

    const dashboard =
        document.getElementById(
            "adminDashboard"
        );


    if (loginScreen) {
        loginScreen.classList.add(
            "hidden"
        );
    }


    if (dashboard) {
        dashboard.classList.remove(
            "hidden"
        );
    }


    await loadTemplates();
}


/* =====================================================
   AUTH STATE
===================================================== */

async function setupAuth() {

    try {

        await waitForFirebase();


        window.firebaseOnAuthStateChanged(
            window.firebaseAuth,
            async user => {

                currentUser =
                    user;


                if (user) {

                    console.log(
                        "Admin login:",
                        user.email
                    );

                    await showDashboard();

                } else {

                    console.log(
                        "Admin belum login."
                    );

                    showLogin();
                }
            }
        );


    } catch (error) {

        console.error(
            "Auth Firebase gagal:",
            error
        );

        showLogin();
    }
}


/* =====================================================
   IMAGE UPLOAD PREVIEW
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


    if (
        !input ||
        !preview
    ) {
        return;
    }


    input.addEventListener(
        "change",
        () => {

            const file =
                input.files[0];


            preview.innerHTML = "";

            preview.classList.remove(
                "show"
            );


            if (!file) {
                return;
            }


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

    if (!currentUser) {

        alert(
            "Silakan login terlebih dahulu."
        );

        return;
    }


    const titleInput =
        document.getElementById(
            "templateTitle"
        );

    const priceInput =
        document.getElementById(
            "templatePrice"
        );

    const linkInput =
        document.getElementById(
            "templateLink"
        );

    const imageInput =
        document.getElementById(
            "templateImage"
        );

    const button =
        document.getElementById(
            "addTemplateBtn"
        );


    if (
        !titleInput ||
        !priceInput ||
        !linkInput ||
        !imageInput
    ) {

        console.error(
            "Form template tidak lengkap."
        );

        return;
    }


    const title =
        titleInput.value.trim();

    const price =
        priceInput.value;

    const link =
        linkInput.value.trim();

    const imageFile =
        imageInput.files[0];


    if (
        !title ||
        price === "" ||
        !imageFile
    ) {

        alert(
            "Cover, judul, dan harga wajib diisi."
        );

        return;
    }


    const categories = [
        ...document.querySelectorAll(
            ".category-check:checked"
        )
    ].map(
        input => input.value
    );


    const audience = [
        ...document.querySelectorAll(
            ".audience-check:checked"
        )
    ].map(
        input => input.value
    );


    const features = [
        ...document.querySelectorAll(
            ".feature-check:checked"
        )
    ].map(
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


    if (
        !window.firebaseStorage ||
        !window.firebaseStorageRef ||
        !window.firebaseUploadBytes ||
        !window.firebaseGetDownloadURL
    ) {

        alert(
            "Firebase Storage belum siap."
        );

        return;
    }


    if (
        !window.firebaseSetDoc ||
        !window.firebaseDoc
    ) {

        alert(
            "Firestore belum siap."
        );

        return;
    }


    if (button) {

        button.disabled = true;

        button.innerHTML =
            "Uploading...";
    }


    try {

        await waitForFirebase();


        /* =============================================
           GENERATE CODE
        ============================================= */

        const code =
            generateCode();


        /* =============================================
           EXTENSION
        ============================================= */

        let extension =
            imageFile.name
                .split(".")
                .pop()
                .toLowerCase();


        if (extension === "jpeg") {
            extension = "jpg";
        }


        /* =============================================
           STORAGE PATH
        ============================================= */

        const filePath =
            `templates/${code}.${extension}`;


        const storageRef =
            window.firebaseStorageRef(
                window.firebaseStorage,
                filePath
            );


        /* =============================================
           UPLOAD IMAGE
        ============================================= */

        console.log(
            `Mengupload ${filePath}...`
        );


        await window.firebaseUploadBytes(
            storageRef,
            imageFile
        );


        console.log(
            "Upload gambar berhasil."
        );


        /* =============================================
           DOWNLOAD URL
        ============================================= */

        const imageURL =
            await window.firebaseGetDownloadURL(
                storageRef
            );


        console.log(
            "URL gambar berhasil dibuat."
        );


        /* =============================================
           TEMPLATE DATA
        ============================================= */

        const template = {

            code,

            title,

            price:
                Number(price),

            image:
                imageURL,

            link,

            categories,

            audience,

            features,

            createdAt:
                new Date().toISOString(),

            createdBy:
                currentUser.uid
        };


        /* =============================================
           FIRESTORE
        ============================================= */

        await window.firebaseSetDoc(
            window.firebaseDoc(
                window.firebaseDB,
                "templates",
                code
            ),
            template
        );


        console.log(
            "Template berhasil disimpan ke Firestore."
        );


        /* =============================================
           LOCAL ARRAY
        ============================================= */

        templates.push({
            id: code,
            ...template
        });


        /* =============================================
           CLEAR FORM
        ============================================= */

        clearForm();


        /* =============================================
           REFRESH UI
        ============================================= */

        renderAdminList();

        updateStats();


        alert(
            `${code} berhasil ditambahkan ke Firebase.`
        );


    } catch (error) {

        console.error(
            "Gagal menambahkan template:",
            error
        );


        alert(
            "Gagal menyimpan template. Buka Console (F12) untuk melihat detail error."
        );


    } finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                "Add Template <span>+</span>";
        }
    }
}


/* =====================================================
   CLEAR FORM
===================================================== */

function clearForm() {

    const title =
        document.getElementById(
            "templateTitle"
        );

    const price =
        document.getElementById(
            "templatePrice"
        );

    const link =
        document.getElementById(
            "templateLink"
        );

    const image =
        document.getElementById(
            "templateImage"
        );


    if (title) {
        title.value = "";
    }

    if (price) {
        price.value = "";
    }

    if (link) {
        link.value = "";
    }

    if (image) {
        image.value = "";
    }


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


    if (preview) {

        preview.innerHTML = "";

        preview.classList.remove(
            "show"
        );
    }
}


/* =====================================================
   ADMIN LIST
===================================================== */

function renderAdminList() {

    const container =
        document.getElementById(
            "adminTemplateList"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (templates.length === 0) {

        container.innerHTML = `
            <div
                class="empty-state"
                style="display:block;padding:45px 10px"
            >

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


    const list =
        [...templates].sort(
            (a, b) => {

                const dateA =
                    new Date(
                        a.createdAt || 0
                    );

                const dateB =
                    new Date(
                        b.createdAt || 0
                    );

                return dateB - dateA;
            }
        );


    list.forEach(template => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "admin-template-item";


        const tags =
            (
                Array.isArray(
                    template.categories
                )
                    ? template.categories
                    : []
            )
                .slice(0, 3)
                .map(
                    category => `
                        <span>
                            ${safe(category)}
                        </span>
                    `
                )
                .join("");


        const image =
            template.image ||
            ADMIN_PLACEHOLDER;


        item.innerHTML = `
            <img
                class="admin-thumb"
                src="${safe(image)}"
                alt=""
            >


            <div
                class="admin-template-info"
            >

                <strong>
                    ${safe(template.title)}
                </strong>

                <span>
                    ${safe(template.code)}
                    ·
                    ${rupiah(template.price)}
                </span>


                <div
                    class="admin-template-tags"
                >
                    ${tags}
                </div>

            </div>


            <div
                class="admin-item-actions"
            >

                <button
                    type="button"
                    class="admin-preview-btn"
                >
                    Preview
                </button>


                <button
                    type="button"
                    class="delete admin-delete-btn"
                >
                    Delete
                </button>

            </div>
        `;


        const imageElement =
            item.querySelector(
                ".admin-thumb"
            );


        if (imageElement) {

            imageElement.onerror =
                () => {

                    imageElement.src =
                        ADMIN_PLACEHOLDER;
                };
        }


        const previewButton =
            item.querySelector(
                ".admin-preview-btn"
            );


        if (previewButton) {

            previewButton.addEventListener(
                "click",
                () => {

                    previewTemplate(
                        template.id
                    );
                }
            );
        }


        const deleteButton =
            item.querySelector(
                ".admin-delete-btn"
            );


        if (deleteButton) {

            deleteButton.addEventListener(
                "click",
                () => {

                    deleteTemplate(
                        template.id
                    );
                }
            );
        }


        container.appendChild(item);
    });
}


/* =====================================================
   ADMIN PREVIEW
===================================================== */

function previewTemplate(id) {

    const template =
        templates.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!template) {
        return;
    }


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
   ADMIN DELETE
===================================================== */

async function deleteTemplate(id) {

    if (!currentUser) {

        alert(
            "Silakan login terlebih dahulu."
        );

        return;
    }


    const template =
        templates.find(
            item =>
                String(item.id) ===
                String(id)
        );


    if (!template) {
        return;
    }


    const confirmed =
        confirm(
            `Hapus template "${template.title}"?`
        );


    if (!confirmed) {
        return;
    }


    try {

        await waitForFirebase();


        /* =============================================
           DELETE FIRESTORE
        ============================================= */

        await window.firebaseDeleteDoc(
            window.firebaseDoc(
                window.firebaseDB,
                "templates",
                String(template.id)
            )
        );


        /* =============================================
           DELETE STORAGE
        ============================================= */

        if (
            template.code &&
            template.image &&
            window.firebaseDeleteObject
        ) {

            try {

                let extension = "jpg";


                const match =
                    String(
                        template.image
                    ).match(
                        /\.(jpg|jpeg|png|webp)(?:\?|$)/i
                    );


                if (match) {

                    extension =
                        match[1].toLowerCase();

                    if (
                        extension === "jpeg"
                    ) {
                        extension = "jpg";
                    }
                }


                const imageRef =
                    window.firebaseStorageRef(
                        window.firebaseStorage,
                        `templates/${template.code}.${extension}`
                    );


                await window.firebaseDeleteObject(
                    imageRef
                );


                console.log(
                    "Gambar Storage berhasil dihapus."
                );


            } catch (storageError) {

                console.warn(
                    "Gambar Storage tidak berhasil dihapus:",
                    storageError
                );
            }
        }


        /* =============================================
           LOCAL ARRAY
        ============================================= */

        templates =
            templates.filter(
                item =>
                    String(item.id) !==
                    String(id)
            );


        renderAdminList();

        updateStats();


        alert(
            "Template berhasil dihapus."
        );


    } catch (error) {

        console.error(
            "Gagal menghapus template:",
            error
        );


        alert(
            "Gagal menghapus template. Lihat Console (F12)."
        );
    }
}


/* =====================================================
   ADMIN STATS
===================================================== */

function updateStats() {

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


/* =====================================================
   ADMIN SIDEBAR
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

                buttons.forEach(item => {
                    item.classList.remove(
                        "active"
                    );
                });


                button.classList.add(
                    "active"
                );


                const section =
                    button.dataset.section;


                if (
                    section ===
                    "add"
                ) {

                    const element =
                        document.getElementById(
                            "addSection"
                        );


                    if (element) {

                        element.scrollIntoView({
                            behavior:
                                "smooth"
                        });
                    }
                }


                if (
                    section ===
                    "templates"
                ) {

                    const element =
                        document.getElementById(
                            "templatesSection"
                        );


                    if (element) {

                        element.scrollIntoView({
                            behavior:
                                "smooth"
                        });
                    }
                }
            }
        );
    });
}


/* =====================================================
   ADMIN THEME
===================================================== */

function setupAdminTheme() {

    const button =
        document.getElementById(
            "adminThemeBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        toggleTheme
    );
}


/* =====================================================
   PUBLIC THEME
===================================================== */

function setupPublicTheme() {

    const button =
        document.getElementById(
            "themeBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        toggleTheme
    );
}


/* =====================================================
   LOGIN EVENTS
===================================================== */

function setupLoginEvents() {

    const loginButton =
        document.getElementById(
            "loginBtn"
        );


    if (loginButton) {

        loginButton.addEventListener(
            "click",
            loginAdmin
        );
    }


    const passwordInput =
        document.getElementById(
            "adminPassword"
        );


    if (passwordInput) {

        passwordInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    loginAdmin();
                }
            }
        );
    }


    const emailInput =
        document.getElementById(
            "adminEmail"
        );


    if (emailInput) {

        emailInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    loginAdmin();
                }
            }
        );
    }


    const logoutButton =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            logout
        );
    }
}


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

    if (
        !window.firebaseSignOut ||
        !window.firebaseAuth
    ) {
        return;
    }


    try {

        await window.firebaseSignOut(
            window.firebaseAuth
        );

        currentUser = null;


    } catch (error) {

        console.error(
            "Logout gagal:",
            error
        );
    }
}


/* =====================================================
   ADMIN ADD EVENT
===================================================== */

function setupAdminEvents() {

    const addButton =
        document.getElementById(
            "addTemplateBtn"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            addTemplate
        );
    }
}


/* =====================================================
   INIT PUBLIC
===================================================== */

async function initPublic() {

    loadTheme();

    setupPublicTheme();

    setupFilters();

    setupModalClose();

    try {

        await loadTemplates();

    } catch (error) {

        console.error(
            "Public initialization gagal:",
            error
        );
    }
}


/* =====================================================
   INIT ADMIN
===================================================== */

function initAdmin() {

    loadTheme();

    setupAdminTheme();

    setupLoginEvents();

    setupImageUpload();

    setupSidebar();

    setupAdminEvents();

    setupAuth();
}


/* =====================================================
   WAIT FOR DOM
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (isAdminPage()) {

            initAdmin();

        } else {

            initPublic();
        }
    }
);


/* =====================================================
   GLOBAL FUNCTIONS
===================================================== */

window.openTemplate =
    openTemplate;

window.orderTemplate =
    orderTemplate;

window.login =
    loginAdmin;

window.loginAdmin =
    loginAdmin;

window.logout =
    logout;

window.addTemplate =
    addTemplate;

window.previewTemplate =
    previewTemplate;

window.deleteTemplate =
    deleteTemplate;

window.toggleTheme =
    toggleTheme;

window.clearForm =
    clearForm;
