const form = document.querySelector(".contact-form");
const message = document.querySelector(".form-message");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(form);

    try {
        const response = await fetch(form.action, {
            method: "POST",
            body: formData,
            headers: {
                Accept: "application/json"
            }
        });

        if (response.ok) {
            message.textContent =
                "✓ Request sent successfully! We'll contact you shortly.";
            message.className = "form-message success";
            form.reset();
        } else {
            message.textContent =
                "Something went wrong. Please try again.";
            message.className = "form-message error";
        }
    } catch (error) {
        message.textContent =
            "Something went wrong. Please try again.";
        message.className = "form-message error";
    }
});

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector("header nav");

menuButton.addEventListener("click", function () {
    nav.classList.toggle("active");
});

const navLinks = document.querySelectorAll("header nav a");

navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
        nav.classList.remove("active");
    });
});

const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
        if (entry.isIntersecting) {
            entry.target.classList.add("active");
        }
    });
}, {
    threshold: 0.15
});

revealElements.forEach(function (element) {
    revealObserver.observe(element);
});

const serviceButtons = document.querySelectorAll(".service-book");
const serviceSelect = document.querySelector('select[name="service"]');

serviceButtons.forEach(function (button) {
    button.addEventListener("click", function (event) {
        event.preventDefault();

        const selectedService = button.dataset.service;
        serviceSelect.value = selectedService;

        document.querySelector("#booking-form").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });
});
const dateInput = document.querySelector('input[name="date"]');

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

dateInput.min = `${year}-${month}-${day}`;
const reviewForm = document.querySelector(".review-form");

reviewForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(reviewForm);

    const response = await fetch(reviewForm.action, {
        method: reviewForm.method,
        body: formData,
        headers: {
            Accept: "application/json"
        }
    });

   if (response.ok) {
    reviewForm.reset();

    const successMessage = document.querySelector(".review-success");
    successMessage.classList.add("show");

    setTimeout(function () {
        successMessage.classList.remove("show");
    }, 5000);

} else {
    alert("Something went wrong. Please try again.");
}

});

const leaveReviewButton = document.querySelector(".leave-review-button");

leaveReviewButton.addEventListener("click", function () {
    reviewForm.classList.toggle("show");

    if (reviewForm.classList.contains("show")) {
        leaveReviewButton.textContent = "Close Review Form";
    } else {
        leaveReviewButton.textContent = "Leave a Review";
    }
});