const text = "Sistem Rekam Medis Klinik";
const h2 = document.querySelector(".nav-logo h2");

let index = 0;
let isDeleting = false;

function typingEffect() {
    let currentText = text.substring(0, index);
    h2.textContent = currentText;

    if (!isDeleting) {
        // mode mengetik
        if (index < text.length) {
            index++;
        } else {
            // tunggu sebentar sebelum menghapus
            setTimeout(() => { isDeleting = true; }, 1000);
        }
    } else {
        // mode menghapus
        if (index > 0) {
            index--;
        } else {
            // mulai lagi
            isDeleting = false;
        }
    }

    // kecepatan ketik dan hapus
    let speed = isDeleting ? 80 : 120;

    setTimeout(typingEffect, speed);
}

typingEffect();
