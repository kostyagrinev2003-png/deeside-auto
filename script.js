const SUPABASE_URL = "https://wteaesiyktwcoheyfatd.supabase.co";
const SUPABASE_KEY = "sb_publishable_WLAH_yCrEj6aBbgxogFuTQ_JKen_ciI";

const form = document.querySelector(".contact-form");
const message = document.querySelector(".form-message");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(form);

    const bookingData = {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    service: formData.get("service"),
    booking_date: formData.get("date"),
    booking_time: formData.get("time"),
    message: formData.get("message"),
    status: "pending"
};

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/booking`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            message.textContent =
                "✓ Booking request sent successfully!";
            message.className = "form-message success";
            form.reset();
        } else {
            console.error(await response.text());

            message.textContent =
                "Something went wrong. Please try again.";
            message.className = "form-message error";
        }

    } catch (error) {
        console.error(error);

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

    const reviewData = {
        name: formData.get("review_name"),
        rating: Number(formData.get("rating")),
        review: formData.get("review"),
        approved: false
    };

    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
            method: "POST",
            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            },
            body: JSON.stringify(reviewData)
        });

        if (response.ok) {
            reviewForm.reset();

            const successMessage = document.querySelector(".review-success");
            successMessage.classList.add("show");

            setTimeout(function () {
                successMessage.classList.remove("show");
            }, 5000);
        } else {
            console.error(await response.text());
            alert("Something went wrong. Please try again.");
        }

    } catch (error) {
        console.error(error);
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

async function loadApprovedReviews() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/reviews?approved=eq.true&select=name,rating,review,created_at&order=created_at.desc`,
            {
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            }
        );

        if (!response.ok) {
            console.error(await response.text());
            return;
        }

        const reviews = await response.json();
        const reviewCards = document.querySelector(".review-cards");

        if (!reviewCards) return;

        reviewCards.innerHTML = "";

        reviews.forEach(function (item) {
            const card = document.createElement("div");
            card.className = "review-card";

            const stars = "★".repeat(item.rating) + "☆".repeat(5 - item.rating);

const reviewDate = item.created_at
    ? new Date(item.created_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    })
    : "";

card.innerHTML = `
    <div class="stars">${stars}</div>
    <p>"${item.review}"</p>
    <div class="review-meta">
        <span>— ${item.name}</span>
        <small>${reviewDate}</small>
    </div>
`;

            reviewCards.appendChild(card);
        });

    } catch (error) {
        console.error(error);
    }
}

loadApprovedReviews();

// ===== DISABLE BOOKED TIMES =====

const bookingDateInput = document.querySelector(
    '#booking-form input[name="date"]'
);

const bookingTimeSelect = document.querySelector(
    '#booking-form select[name="time"]'
);

async function loadBookedTimes(date) {
    if (!date) return;

    // Сначала снова включаем все часы
    Array.from(bookingTimeSelect.options).forEach(option => {
        if (option.value) {
            option.disabled = false;
            option.textContent = option.value;
        }
    });

    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/rpc/get_booked_times`,
            {
                method: "POST",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    p_date: date
                })
            }
        );

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const bookedTimes = await response.json();

        bookedTimes.forEach(item => {
            const bookedTime = item.booking_time.substring(0, 5);

            const option = Array.from(
                bookingTimeSelect.options
            ).find(option => option.value === bookedTime);

            if (option) {
                option.disabled = true;
                option.textContent = `${bookedTime} — Booked`;
            }
        });

    } catch (error) {
        console.error("Could not load booked times:", error);
    }
}

bookingDateInput.addEventListener("change", function () {
    bookingTimeSelect.value = "";
    loadBookedTimes(this.value);
});