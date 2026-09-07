/* =====================================================
   EZMOIRE — ADMIN PANEL
   FIREBASE AUTH + FIRESTORE
   STORAGE TIDAK DIGUNAKAN
===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const ADMIN_EMAIL = "ezharafwanjamil@gmail.com";

let templates = [];
let currentUser = null;


/* =====================================================
   FIREBASE READY
===================================================== */

function waitForFirebase(callback) {

    if (window.firebaseReady) {
        callback();
        return;
    }

    const check = setInterval(() => {

        if (window.firebaseReady) {

            clearInterval(check);

            callback();
        }

    }, 100);

}


/* =====================================================
   GET FIREBASE
===================================================== */

function getDB() {

    return window.firebaseDB;

}

function getAuth() {

    return window.firebaseAuth;

}


/* =====================================================
   FORMAT RUPIAH
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


/* =====================================================
   SAFE HTML
===================================================== */

function safe(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}


/* =====================================================
   GENERATE TEMPLATE CODE
===================================================== */

function generateCode() {

    let highest = 0;

    templates.forEach(template => {

        const code =
            String(template.code || "");

        const number =
            parseInt(
                code.replace("EZ", ""),
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
        String(highest + 1)
            .padStart(3, "0")
    );

}


/* =====================================================
   LOAD TEMPLATES FROM FIRESTORE
===================================================== */

async function loadTemplates() {

    try {

        const db =
            getDB();

        const collection =
            window.firebaseCollection;

        const getDocs =
            window.firebaseGetDocs;

        if (
            !db ||
            !collection ||
            !getDocs
        ) {

            console.error(
                "Firebase Firestore belum siap."
            );

            return;

        }

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "templates"
                )
            );

        templates = [];

        snapshot.forEach(doc => {

            templates.push({

                id: doc.id,

                ...doc.data()

            });

        });

        console.log(
            `Berhasil memuat ${templates.length} template.`
        );

        renderAdminList();

        updateStats();

    }
    catch (error) {

        console.error(
            "Gagal mengambil template dari Firebase:",
            error
        );

        templates = [];

        renderAdminList();

        updateStats();

        const message =
            error?.code ===
            "permission-denied"

                ? "Firestore menolak akses. Periksa Firestore Rules."

                : "Gagal mengambil data template dari Firebase.";

        console.error(message);

    }

}


/* =====================================================
   LOGIN FIREBASE
===================================================== */

async function login() {

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

    const button =
        document.getElementById(
            "loginBtn"
        );


    const email =
        emailInput
            ? emailInput.value.trim()
            : "";

    const password =
        passwordInput
            ? passwordInput.value
            : "";


    error.textContent = "";


    /* =========================
       VALIDASI
    ========================= */

    if (!email) {

        error.textContent =
            "Masukkan email admin.";

        return;

    }


    if (!password) {

        error.textContent =
            "Masukkan password.";

        return;

    }


    /* =========================
       CEK EMAIL ADMIN
    ========================= */

    if (
        email.toLowerCase() !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        error.textContent =
            "Email tersebut bukan email admin.";

        return;

    }


    try {

        button.disabled = true;

        button.textContent =
            "Logging in...";


        const auth =
            getAuth();

        const signIn =
            window.firebaseSignIn;


        if (!auth || !signIn) {

            throw new Error(
                "Firebase Authentication belum siap."
            );

        }


        const result =
            await signIn(
                auth,
                email,
                password
            );


        currentUser =
            result.user;


        console.log(
            "Admin login:",
            currentUser.email
        );


        showDashboard();


    }
    catch (error) {

        console.error(
            "Login gagal:",
            error
        );


        switch (error.code) {

            case "auth/invalid-credential":

                errorMessage(
                    "Email atau password salah."
                );

                break;


            case "auth/invalid-email":

                errorMessage(
                    "Format email tidak valid."
                );

                break;


            case "auth/user-disabled":

                errorMessage(
                    "Akun admin dinonaktifkan."
                );

                break;


            case "auth/too-many-requests":

                errorMessage(
                    "Terlalu banyak percobaan. Coba lagi nanti."
                );

                break;


            default:

                errorMessage(
                    error.message ||
                    "Login gagal."
                );

        }

    }
    finally {

        button.disabled = false;

        button.textContent =
            "Login";

    }

}


/* =====================================================
   LOGIN ERROR
===================================================== */

function errorMessage(message) {

    const error =
        document.getElementById(
            "loginError"
        );

    if (error) {

        error.textContent =
            message;

    }

}


/* =====================================================
   SHOW DASHBOARD
===================================================== */

async function showDashboard() {

    document
        .getElementById(
            "loginScreen"
        )
        .classList.add(
            "hidden"
        );


    document
        .getElementById(
            "adminDashboard"
        )
        .classList.remove(
            "hidden"
        );


    renderAdminList();

    updateStats();


    await loadTemplates();

}


/* =====================================================
   LOGOUT
===================================================== */

async function logout() {

    try {

        const auth =
            getAuth();

        const signOut =
            window.firebaseSignOut;


        if (
            auth &&
            signOut
        ) {

            await signOut(auth);

        }


        currentUser = null;

        templates = [];


        document
            .getElementById(
                "adminDashboard"
            )
            .classList.add(
                "hidden"
            );


        document
            .getElementById(
                "loginScreen"
            )
            .classList.remove(
                "hidden"
            );


        const password =
            document.getElementById(
                "adminPassword"
            );

        if (password) {

            password.value = "";

        }


        const error =
            document.getElementById(
                "loginError"
            );

        if (error) {

            error.textContent = "";

        }


    }
    catch (error) {

        console.error(
            "Logout gagal:",
            error
        );

    }

}


/* =====================================================
   IMAGE PREVIEW
   -----------------------------------------------
   GAMBAR OPSIONAL.
   TIDAK DIUPLOAD KE FIREBASE STORAGE.
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


    if (!input || !preview) {

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


            reader.readAsDataURL(
                file
            );

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
        imageInput &&
        imageInput.files
            ? imageInput.files[0]
            : null;


    /* =========================
       VALIDASI
       GAMBAR TIDAK WAJIB
    ========================= */

    if (
        !title ||
        !price
    ) {

        alert(
            "Judul dan harga wajib diisi."
        );

        return;

    }


    /* =========================
       CATEGORIES
    ========================= */

    const categories =
        [
            ...document.querySelectorAll(
                ".category-check:checked"
            )
        ]
        .map(
            input =>
                input.value
        );


    /* =========================
       AUDIENCE
    ========================= */

    const audience =
        [
            ...document.querySelectorAll(
                ".audience-check:checked"
            )
        ]
        .map(
            input =>
                input.value
        );


    /* =========================
       FEATURES
    ========================= */

    const features =
        [
            ...document.querySelectorAll(
                ".feature-check:checked"
            )
        ]
        .map(
            input =>
                input.value
        );


    /* =========================
       CATEGORY VALIDATION
    ========================= */

    if (!categories.length) {

        alert(
            "Pilih minimal satu kategori."
        );

        return;

    }


    /* =========================
       AUDIENCE VALIDATION
    ========================= */

    if (!audience.length) {

        alert(
            "Pilih minimal satu pilihan Who is it for?"
        );

        return;

    }


    /* =========================
       BUTTON
    ========================= */

    const button =
        document.getElementById(
            "addTemplateBtn"
        );


    button.disabled = true;

    button.innerHTML =
        "Saving...";


    try {

        /* =========================
           CEK LOGIN
        ========================= */

        const auth =
            getAuth();

        const user =
            auth.currentUser;


        if (!user) {

            throw new Error(
                "Sesi admin sudah berakhir. Silakan login kembali."
            );

        }


        if (
            user.email.toLowerCase() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            throw new Error(
                "Akun ini bukan akun admin."
            );

        }


        /* =========================
           GENERATE CODE
        ========================= */

        const code =
            generateCode();


        /* =========================
           IMAGE
           --------------------------------
           TIDAK DIUPLOAD.
           Hanya disimpan sebagai string kosong.
        ========================= */

        let imageURL = "";


        if (imageFile) {

            console.log(
                "Gambar dipilih, tetapi Firebase Storage tidak digunakan."
            );

            console.log(
                "Template tetap disimpan tanpa gambar."
            );

        }


        /* =========================
           TEMPLATE DATA
        ========================= */

        const template = {

            code:

                code,


            title:

                title,


            price:

                Number(price),


            image:

                imageURL,


            link:

                link,


            categories:

                categories,


            audience:

                audience,


            features:

                features,


            createdAt:

                new Date().toISOString(),


            createdBy:

                user.email

        };


        /* =========================
           SAVE FIRESTORE
        ========================= */

        const db =
            getDB();


        const collection =
            window.firebaseCollection;


        const doc =
            window.firebaseDoc;


        const setDoc =
            window.firebaseSetDoc;


        if (
            !db ||
            !collection ||
            !doc ||
            !setDoc
        ) {

            throw new Error(
                "Firebase Firestore belum siap."
            );

        }


        /*
            ID dokumen menggunakan code:
            EZ001
            EZ002
            EZ003
        */

        await setDoc(

            doc(
                db,
                "templates",
                code
            ),

            template

        );


        /* =========================
           UPDATE LOCAL ARRAY
        ========================= */

        templates.push({

            id: code,

            ...template

        });


        /* =========================
           RESET FORM
        ========================= */

        clearForm();


        /* =========================
           UPDATE UI
        ========================= */

        renderAdminList();

        updateStats();


        /* =========================
           SUCCESS
        ========================= */

        alert(
            `${code} berhasil ditambahkan.`
        );


        console.log(
            "Template berhasil disimpan:",
            template
        );


    }
    catch (error) {

        console.error(
            "Gagal menambahkan template:",
            error
        );


        if (
            error.code ===
            "permission-denied"
        ) {

            alert(
                "Firebase menolak penyimpanan. Periksa Firestore Rules."
            );

        }
        else {

            alert(
                error.message ||
                "Gagal menyimpan template."
            );

        }

    }
    finally {

        button.disabled = false;

        button.innerHTML =
            "Add Template <span>+</span>";

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
        .forEach(
            input => {

                input.checked =
                    false;

            }
        );


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
   RENDER ADMIN TEMPLATE LIST
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


    /* =========================
       EMPTY
    ========================= */

    if (!templates.length) {

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


    /* =========================
       SORT
    ========================= */

    const sorted =
        [...templates]
            .sort(
                (a, b) => {

                    const aCode =
                        String(
                            a.code || ""
                        );

                    const bCode =
                        String(
                            b.code || ""
                        );


                    const aNumber =
                        parseInt(
                            aCode.replace(
                                "EZ",
                                ""
                            )
                        ) || 0;


                    const bNumber =
                        parseInt(
                            bCode.replace(
                                "EZ",
                                ""
                            )
                        ) || 0;


                    return (
                        bNumber -
                        aNumber
                    );

                }
            );


    /* =========================
       CREATE ITEMS
    ========================= */

    sorted.forEach(
        template => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-template-item";


            /* =========================
               TAGS
            ========================= */

            const tags =
                (
                    template.categories ||
                    []
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


            /* =========================
               IMAGE
               --------------------------------
               Kalau image kosong,
               gunakan placeholder.
            ========================= */

            const imageSource =
                template.image
                    ? safe(
                        template.image
                    )
                    : "https://placehold.co/100x120/15181e/ffffff?text=EZ";


            /* =========================
               HTML
            ========================= */

            item.innerHTML = `

                <img
                    class="admin-thumb"
                    src="${imageSource}"
                    alt=""
                    onerror="
                        this.src='https://placehold.co/100x120/15181e/ffffff?text=EZ'
                    "
                >


                <div class="admin-template-info">

                    <strong>
                        ${safe(
                            template.title
                        )}
                    </strong>


                    <span>

                        ${safe(
                            template.code
                        )}

                        ·

                        ${rupiah(
                            template.price
                        )}

                    </span>


                    <div class="admin-template-tags">

                        ${tags}

                    </div>

                </div>


                <div class="admin-item-actions">

                    <button
                        type="button"
                        class="preview-template-btn"
                        data-id="${safe(
                            template.id
                        )}"
                    >
                        Preview
                    </button>


                    <button
                        type="button"
                        class="delete delete-template-btn"
                        data-id="${safe(
                            template.id
                        )}"
                    >
                        Delete
                    </button>

                </div>

            `;


            /* =========================
               PREVIEW BUTTON
            ========================= */

            const previewButton =
                item.querySelector(
                    ".preview-template-btn"
                );


            previewButton.addEventListener(
                "click",
                () => {

                    previewTemplate(
                        template.id
                    );

                }
            );


            /* =========================
               DELETE BUTTON
            ========================= */

            const deleteButton =
                item.querySelector(
                    ".delete-template-btn"
                );


            deleteButton.addEventListener(
                "click",
                () => {

                    deleteTemplate(
                        template.id
                    );

                }
            );


            container.appendChild(
                item
            );

        }
    );

}


/* =====================================================
   PREVIEW TEMPLATE
===================================================== */

function previewTemplate(id) {

    const template =
        templates.find(
            item =>
                item.id === id
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
   DELETE TEMPLATE
===================================================== */

async function deleteTemplate(id) {

    const template =
        templates.find(
            item =>
                item.id === id
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

        const auth =
            getAuth();


        const user =
            auth.currentUser;


        if (!user) {

            throw new Error(
                "Sesi admin sudah berakhir."
            );

        }


        const db =
            getDB();


        const doc =
            window.firebaseDoc;


        const deleteDoc =
            window.firebaseDeleteDoc;


        await deleteDoc(

            doc(
                db,
                "templates",
                id
            )

        );


        /* =========================
           REMOVE LOCAL
        ========================= */

        templates =
            templates.filter(
                item =>
                    item.id !== id
            );


        renderAdminList();

        updateStats();


        alert(
            "Template berhasil dihapus."
        );


    }
    catch (error) {

        console.error(
            "Gagal menghapus template:",
            error
        );


        if (
            error.code ===
            "permission-denied"
        ) {

            alert(
                "Firebase menolak penghapusan. Periksa Firestore Rules."
            );

        }
        else {

            alert(
                error.message ||
                "Gagal menghapus template."
            );

        }

    }

}


/* =====================================================
   STATS
===================================================== */

function updateStats() {

    const count =
        document.getElementById(
            "templateCount"
        );


    const nextCode =
        document.getElementById(
            "nextCode"
        );


    if (count) {

        count.textContent =
            templates.length;

    }


    if (nextCode) {

        nextCode.textContent =
            generateCode();

    }

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


/* =====================================================
   THEME BUTTON
===================================================== */

function updateThemeButton() {

    const button =
        document.getElementById(
            "adminThemeBtn"
        );


    if (!button) {

        return;

    }


    button.textContent =

        document.body.classList.contains(
            "dark"
        )

            ? "☀"

            : "☾";

}


/* =====================================================
   TOGGLE THEME
===================================================== */

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


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    buttons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    const section =
                        button.dataset.section;


                    if (
                        section ===
                        "add"
                    ) {

                        const target =
                            document.getElementById(
                                "addSection"
                            );


                        if (target) {

                            target.scrollIntoView({

                                behavior:
                                    "smooth"

                            });

                        }

                    }


                    if (
                        section ===
                        "templates"
                    ) {

                        const target =
                            document.getElementById(
                                "templatesSection"
                            );


                        if (target) {

                            target.scrollIntoView({

                                behavior:
                                    "smooth"

                            });

                        }

                    }

                }
            );

        }
    );

}


/* =====================================================
   FIREBASE AUTH STATE
===================================================== */

function setupAuthListener() {

    const auth =
        getAuth();


    const listener =
        window.firebaseOnAuthStateChanged;


    if (
        !auth ||
        !listener
    ) {

        console.error(
            "Firebase Auth belum siap."
        );

        return;

    }


    listener(
        auth,
        async user => {

            if (user) {

                console.log(
                    "Admin login:",
                    user.email
                );


                if (
                    user.email.toLowerCase() !==
                    ADMIN_EMAIL.toLowerCase()
                ) {

                    console.warn(
                        "Akun bukan admin."
                    );

                    try {

                        await window.firebaseSignOut(
                            auth
                        );

                    }
                    catch {}

                    return;

                }


                currentUser =
                    user;


                showDashboard();

            }

            else {

                currentUser =
                    null;


                document
                    .getElementById(
                        "loginScreen"
                    )
                    .classList.remove(
                        "hidden"
                    );


                document
                    .getElementById(
                        "adminDashboard"
                    )
                    .classList.add(
                        "hidden"
                    );

            }

        }
    );

}


/* =====================================================
   ENTER KEY LOGIN
===================================================== */

function setupLoginEnter() {

    const password =
        document.getElementById(
            "adminPassword"
        );


    if (!password) {

        return;

    }


    password.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                login();

            }

        }
    );

}


/* =====================================================
   INITIALIZATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadTheme();

        setupImageUpload();

        setupSidebar();

        setupLoginEnter();


        const loginButton =
            document.getElementById(
                "loginBtn"
            );


        if (loginButton) {

            loginButton.addEventListener(
                "click",
                login
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


        const themeButton =
            document.getElementById(
                "adminThemeBtn"
            );


        if (themeButton) {

            themeButton.addEventListener(
                "click",
                toggleTheme
            );

        }


        /* =========================
           WAIT FIREBASE
        ========================= */

        waitForFirebase(
            () => {

                console.log(
                    "Firebase siap digunakan oleh script.js."
                );


                setupAuthListener();

            }
        );

    }
);
