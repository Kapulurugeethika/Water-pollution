document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("feedbackForm");
    if (!form) return;

    const response = document.getElementById("response");
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        response.textContent = "";

        const apiUrl = (window.WATER_POLLUTION_API_URL || "").trim().replace(/\/$/, "");
        if (!apiUrl) {
            response.textContent = "Feedback service is not configured yet. Please try again later.";
            response.className = "form-response error";
            return;
        }

        const payload = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            message: document.getElementById("message").value.trim(),
        };

        submitButton.disabled = true;
        submitButton.textContent = "Sending…";
        response.textContent = "Sending your feedback…";
        response.className = "form-response";

        try {
            const result = await fetch(`${apiUrl}/api/feedback`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await result.json().catch(() => ({}));
            if (!result.ok) throw new Error(data.error || "Unable to submit feedback.");

            response.textContent = `Thank you, ${payload.name}! Your feedback was saved.`;
            response.className = "form-response success";
            form.reset();
        } catch (error) {
            response.textContent = error.message || "Could not reach the feedback service. Please try again later.";
            response.className = "form-response error";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Submit Feedback";
        }
    });
});
