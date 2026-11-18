document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("feedbackForm");

    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            const name = document.getElementById("name").value;
            const response = document.getElementById("response");

            response.textContent =
                "Thank you, " + name +
                "! Your feedback has been received.";

            response.style.color = "green";

            form.reset();
        });
    }

});
