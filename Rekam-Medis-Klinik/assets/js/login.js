
/* === ENTER TO SUBMIT === */
document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        document.getElementById("btnLogin").click();
    }
});

/* === SHAKE EFFECT SAAT ERROR === */
function shakeBox() {
    const box = document.querySelector(".login-box");
    box.classList.add("shake");
    setTimeout(() => box.classList.remove("shake"), 500);
}

/* Hook ke alert login */
window.alert = (msg) => {
    shakeBox();
    setTimeout(() => {
        window.confirm(msg);
    }, 200);
};

/* === OPTIONAL: SHOW/HIDE PASSWORD === */
const passwordInput = document.getElementById("password");

passwordInput.addEventListener("focus", () => {
    passwordInput.setAttribute("type", "text");
});

passwordInput.addEventListener("blur", () => {
    passwordInput.setAttribute("type", "password");
});
