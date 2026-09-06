const SUPABASE_URL = "https://wteaesiyktwcoheyfatd.supabase.co";
const SUPABASE_KEY = "sb_publishable_WLAH_yCrEj6aBbgxogFuTQ_JKen_ciI";
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginSection = document.querySelector("#login-section");
const adminPanel = document.querySelector("#admin-panel");
const loginForm = document.querySelector("#admin-login");
const loginMessage = document.querySelector("#login-message");
const bookingList = document.querySelector("#booking-list");
const reviewList = document.querySelector("#review-list");
const logoutButton = document.querySelector("#logout-button");


loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.querySelector("#admin-email").value;
    const password = document.querySelector("#admin-password").value;

    loginMessage.textContent = "Logging in...";

    const { error } = await db.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        loginMessage.textContent = "Incorrect email or password.";
        console.error(error);
        return;
    }

    loginMessage.textContent = "";
    await showAdminPanel();
});


async function showAdminPanel() {
    loginSection.style.display = "none";
    adminPanel.style.display = "block";

    await loadBookings();
    await loadReviews();
}


async function loadBookings() {
    bookingList.innerHTML = "Loading bookings...";

    const { data, error } = await db
        .from("booking")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        bookingList.innerHTML = "Could not load bookings.";
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        bookingList.innerHTML = "<p>No bookings yet.</p>";
        return;
    }

    bookingList.innerHTML = "";

    data.forEach(function (booking) {
        const card = document.createElement("div");
        card.className = "review-card";

        const status = booking.status || "pending";

        card.innerHTML = `
            <h3>${escapeHtml(booking.name)}</h3>

            <p><strong>Email:</strong> ${escapeHtml(booking.email || "-")}</p>
            <p><strong>Phone:</strong> ${escapeHtml(booking.phone || "-")}</p>
            <p><strong>Service:</strong> ${escapeHtml(booking.service || "-")}</p>
            <p><strong>Date:</strong> ${escapeHtml(booking.booking_date || "-")}</p>
            <p><strong>Time:</strong> ${escapeHtml(booking.booking_time || "-")}</p>
            <p><strong>Car / message:</strong> ${escapeHtml(booking.message || "-")}</p>

            <p>
                <strong>Status:</strong>
                ${escapeHtml(status)}
            </p>

            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">
                <button class="booking-accept" data-id="${booking.id}">
                    Accept
                </button>

                <button class="booking-reject" data-id="${booking.id}">
                    Reject
                </button>

                <button class="booking-delete" data-id="${booking.id}">
                    Delete
                </button>
            </div>
        `;

        bookingList.appendChild(card);
    });

    document.querySelectorAll(".booking-accept").forEach(function (button) {
        button.addEventListener("click", async function () {
            await updateBooking(button.dataset.id, "accepted");
        });
    });

    document.querySelectorAll(".booking-reject").forEach(function (button) {
        button.addEventListener("click", async function () {
            await updateBooking(button.dataset.id, "rejected");
        });
    });

    document.querySelectorAll(".booking-delete").forEach(function (button) {
        button.addEventListener("click", async function () {
            await deleteBooking(button.dataset.id);
        });
    });
}


async function updateBooking(id, status) {
    const { error } = await db
        .from("booking")
        .update({ status })
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("Could not update booking.");
        return;
    }

    await loadBookings();
}


async function deleteBooking(id) {
    const confirmed = confirm(
        "Are you sure you want to delete this booking?"
    );

    if (!confirmed) return;

    const { error } = await db
        .from("booking")
        .delete()
        .eq("id", id);

    if (error) {
        console.error(error);
        alert("Could not delete booking.");
        return;
    }

    await loadBookings();
}


async function loadReviews() {
    reviewList.innerHTML = "Loading reviews...";

    const { data, error } = await db
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        reviewList.innerHTML = "Could not load reviews.";
        console.error(error);
        return;
    }

    if (!data || data.length === 0) {
        reviewList.innerHTML = "<p>No reviews yet.</p>";
        return;
    }

    reviewList.innerHTML = "";

    data.forEach(function (review) {
        const card = document.createElement("div");
        card.className = "review-card";

        const stars =
            "★".repeat(review.rating) +
            "☆".repeat(5 - review.rating);

        card.innerHTML = `
            <div class="stars">${stars}</div>

            <p>${escapeHtml(review.review)}</p>

            <span>— ${escapeHtml(review.name)}</span>

            <p>
                <strong>Status:</strong>
                ${review.approved ? "Approved" : "Pending"}
            </p>

            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:15px;">
                ${
                    review.approved
                        ? ""
                        : `<button class="review-approve" data-id="${review.id}">
                               Approve
                           </button>`
                }

                <button class="review-delete" data-id="${review.id}">
                    Delete
                </button>
            </div>
        `;

        reviewList.appendChild(card);
    });

    document.querySelectorAll(".review-approve").forEach(function (button) {
        button.addEventListener("click", async function () {
            const { error } = await db
                .from("reviews")
                .update({ approved: true })
                .eq("id", button.dataset.id);

            if (error) {
                console.error(error);
                alert("Could not approve review.");
                return;
            }

            await loadReviews();
        });
    });

    document.querySelectorAll(".review-delete").forEach(function (button) {
        button.addEventListener("click", async function () {
            const confirmed = confirm("Delete this review?");

            if (!confirmed) return;

            const { error } = await db
                .from("reviews")
                .delete()
                .eq("id", button.dataset.id);

            if (error) {
                console.error(error);
                alert("Could not delete review.");
                return;
            }

            await loadReviews();
        });
    });
}


logoutButton.addEventListener("click", async function () {
    await db.auth.signOut();

    adminPanel.style.display = "none";
    loginSection.style.display = "block";
});


async function checkLogin() {
    const { data } = await db.auth.getSession();

    if (data.session) {
        await showAdminPanel();
    }
}


function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}


checkLogin();