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
const bookingStats = document.querySelector("#booking-stats");

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
const pendingCount = data.filter(item => item.status === "pending").length;
const acceptedCount = data.filter(item => item.status === "accepted").length;
const rejectedCount = data.filter(item => item.status === "rejected").length;

bookingStats.innerHTML = `
    <button class="booking-filter" data-filter="pending"
        style="background:#332d00; padding:10px 15px; border-radius:10px; border:none; color:white; cursor:pointer;">
        🟡 Pending: <strong>${pendingCount}</strong>
    </button>

    <button class="booking-filter" data-filter="accepted"
        style="background:#12351d; padding:10px 15px; border-radius:10px; border:none; color:white; cursor:pointer;">
        🟢 Accepted: <strong>${acceptedCount}</strong>
    </button>

    <button class="booking-filter" data-filter="rejected"
        style="background:#3b1515; padding:10px 15px; border-radius:10px; border:none; color:white; cursor:pointer;">
        🔴 Rejected: <strong>${rejectedCount}</strong>
    </button>

    <button class="booking-filter" data-filter="all"
        style="background:#222; padding:10px 15px; border-radius:10px; border:1px solid #444; color:white; cursor:pointer;">
        All
    </button>
`;
    bookingList.innerHTML = "";
const statusOrder = {
    pending: 1,
    accepted: 2,
    rejected: 3
};

data.sort((a, b) => {
    return (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99);
});
    data.forEach(function (booking) {
        const card = document.createElement("div");
        card.className = "review-card";
        card.dataset.status = booking.status || "pending";

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
    ${status === "pending" ? "🟡 Pending" :
      status === "accepted" ? "🟢 Accepted" :
      status === "rejected" ? "🔴 Rejected" :
      escapeHtml(status)}
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
document.querySelectorAll(".booking-filter").forEach(function (button) {
    button.addEventListener("click", function () {
        const filter = button.dataset.filter;

        document.querySelectorAll("#booking-list .review-card").forEach(function (card) {
            const status = card.dataset.status;

            if (filter === "all" || status === filter) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
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

        if (error.code === "23505" && status === "accepted") {
            alert("This time is already booked.");
        } else {
            alert("Could not update booking.");
        }

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