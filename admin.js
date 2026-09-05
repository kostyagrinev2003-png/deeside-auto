const SUPABASE_URL = "https://wteaesiyktwcoheyfatd.supabase.co";
const SUPABASE_KEY = "sb_publishable_WLAH_yCrEj6aBbgxogFuTQ_JKen_ciI";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const loginSection = document.querySelector("#login-section");
const reviewsPanel = document.querySelector("#reviews-panel");
const loginButton = document.querySelector("#login-button");
const logoutButton = document.querySelector("#logout-button");
const loginError = document.querySelector("#login-error");
const reviewsList = document.querySelector("#reviews-list");

loginButton.addEventListener("click", async () => {

    const email = document.querySelector("#admin-email").value;
    const password = document.querySelector("#admin-password").value;

    loginError.textContent = "";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginError.textContent = "Incorrect email or password.";
        console.error(error);
        return;
    }

    showAdmin();
});

logoutButton.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();

    reviewsPanel.style.display = "none";
    loginSection.style.display = "block";
});

async function showAdmin() {

    loginSection.style.display = "none";
    reviewsPanel.style.display = "block";

    await loadReviews();
}

async function loadReviews() {

    reviewsList.innerHTML = "Loading reviews...";

    const { data: reviews, error } = await supabaseClient
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        reviewsList.innerHTML = "Could not load reviews.";
        console.error(error);
        return;
    }

    if (!reviews.length) {
        reviewsList.innerHTML = "No reviews yet.";
        return;
    }

    reviewsList.innerHTML = "";

    reviews.forEach((review) => {

        const card = document.createElement("div");
        card.className = "review-card";

        const stars = "★".repeat(review.rating) +
                      "☆".repeat(5 - review.rating);

        const status = review.approved
            ? '<span class="approved">Approved</span>'
            : '<span class="pending">Pending</span>';

        card.innerHTML = `
            <h3>${escapeHtml(review.name)}</h3>
            <div>${stars}</div>
            <p>${escapeHtml(review.review)}</p>
            <p>Status: ${status}</p>

            ${
                review.approved
                    ? ""
                    : `<button class="approve-button"
                         data-id="${review.id}">
                         Approve
                       </button>`
            }
        `;

        reviewsList.appendChild(card);
    });

    document.querySelectorAll(".approve-button").forEach(button => {

        button.addEventListener("click", async () => {

            const id = button.dataset.id;

            const { error } = await supabaseClient
                .from("reviews")
                .update({ approved: true })
                .eq("id", id);

            if (error) {
                alert("Could not approve review.");
                console.error(error);
                return;
            }

            await loadReviews();
        });
    });
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

async function checkSession() {

    const { data } = await supabaseClient.auth.getSession();

    if (data.session) {
        showAdmin();
    }
}

checkSession();