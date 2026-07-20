document.addEventListener("DOMContentLoaded", function () {

    console.log("Welcome to MindSpace!");

    // ==========================
    // Start Button
    // ==========================

    const startButton = document.getElementById("startBtn");

    if (startButton) {
        startButton.addEventListener("click", function () {
            alert("Welcome to your Mental Wellness Journey! 🌿");
        });
    }

    // ==========================
    // Mood Tracker
    // ==========================

    const moods = document.querySelectorAll(".mood-card");
    const message = document.getElementById("message");
    const aiSuggestion = document.getElementById("aiSuggestion");

    const suggestions = {
        "😊": "Keep smiling and spread positivity! 🌞",
        "😀": "Great day! Try helping someone today. ❤️",
        "😐": "Take a short break and relax. ☕",
        "😔": "Talk to someone you trust. Tomorrow is a new day. 💙",
        "😡": "Take deep breaths and go for a short walk. 🌿"
    };

    moods.forEach(function (mood) {

        mood.addEventListener("click", function () {

            moods.forEach(function (item) {
                item.classList.remove("selected");
            });

            mood.classList.add("selected");

            localStorage.setItem("selectedMood", mood.textContent);

            if (message) {
                message.textContent =
                    "Your mood is " + mood.textContent + " today 💙";
            }

            if (aiSuggestion) {
                aiSuggestion.textContent =
                    suggestions[mood.textContent] ||
                    "Take care of yourself 💙";
            }

        });

    });

    // ==========================
    // Load Saved Mood
    // ==========================

    const savedMood = localStorage.getItem("selectedMood");

    if (savedMood) {

        moods.forEach(function (mood) {

            if (mood.textContent === savedMood) {

                mood.classList.add("selected");

                if (message) {
                    message.textContent =
                        "Your mood is " + savedMood + " today 💙";
                }

                if (aiSuggestion) {
                    aiSuggestion.textContent =
                        suggestions[savedMood] ||
                        "Take care of yourself 💙";
                }

            }

        });

    }

    // ==========================
    // Reset Mood
    // ==========================

    const resetButton = document.getElementById("resetMood");

    if (resetButton) {

        resetButton.addEventListener("click", function () {

            localStorage.removeItem("selectedMood");

            moods.forEach(function (mood) {
                mood.classList.remove("selected");
            });

            if (message) {
                message.textContent = "Mood Reset Successfully!";
            }

            if (aiSuggestion) {
                aiSuggestion.textContent = "";
            }

        });

    }

    // ==========================
    // Journal Variables
    // ==========================

    const journalInput = document.getElementById("journalInput");
    const saveJournal = document.getElementById("saveJournal");
    const journalList = document.getElementById("journalList");

    let journals =
        JSON.parse(localStorage.getItem("journals")) || [];
            // ==========================
    // Display Journals
    // ==========================

    function displayJournals() {

        if (!journalList) return;

        journalList.innerHTML = "";

        journals.forEach(function (entry, index) {

            journalList.innerHTML += `
                <div class="entry">
                    <strong>${entry.date}</strong>
                    <p>${entry.text}</p>
                    <small>Mood: ${entry.mood || "Not Selected"}</small>
                    <br><br>

                    <button onclick="editJournal(${index})">
                        Edit
                    </button>

                    <button onclick="deleteJournal(${index})">
                        Delete
                    </button>
                </div>
            `;

        });

    }

    displayJournals();

    // ==========================
    // Save Journal
    // ==========================

    if (saveJournal) {

        saveJournal.addEventListener("click", function () {

            if (journalInput.value.trim() === "") {
                alert("Please write something!");
                return;
            }

            const journal = {

                date: new Date().toLocaleDateString(),
                text: journalInput.value,
                mood: localStorage.getItem("selectedMood")

            };

            journals.push(journal);

            localStorage.setItem(
                "journals",
                JSON.stringify(journals)
            );

            journalInput.value = "";

            displayJournals();

        });

    }

    // ==========================
    // Delete Journal
    // ==========================

    function deleteJournal(index) {

        journals.splice(index, 1);

        localStorage.setItem(
            "journals",
            JSON.stringify(journals)
        );

        displayJournals();

    }

    // ==========================
    // Edit Journal
    // ==========================

    function editJournal(index) {

        if (!journalInput) return;

        journalInput.value = journals[index].text;

        journals.splice(index, 1);

        localStorage.setItem(
            "journals",
            JSON.stringify(journals)
        );

        displayJournals();

    }

    window.deleteJournal = deleteJournal;
    window.editJournal = editJournal;

    // ==========================
    // Search Journal
    // ==========================

    const searchJournal =
        document.getElementById("searchJournal");

    if (searchJournal) {

        searchJournal.addEventListener("input", function () {

            const search =
                this.value.toLowerCase();

            document.querySelectorAll(".entry")
                .forEach(function (entry) {

                    if (
                        entry.textContent
                            .toLowerCase()
                            .includes(search)
                    ) {

                        entry.style.display = "";

                    } else {

                        entry.style.display = "none";

                    }

                });

        });

    }

    // ==========================
    // Theme Toggle
    // ==========================

    const themeBtn =
        document.getElementById("themeBtn");

    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark");

        if (themeBtn) {
            themeBtn.textContent = "☀️";
        }

    }

    if (themeBtn) {

        themeBtn.addEventListener("click", function () {

            document.body.classList.toggle("dark");

            if (document.body.classList.contains("dark")) {

                localStorage.setItem("theme", "dark");
                themeBtn.textContent = "☀️";

            } else {

                localStorage.setItem("theme", "light");
                themeBtn.textContent = "🌙";

            }

        });

    }

    // ==========================
    // Daily Quotes
    // ==========================

    const quotes = [

        "Believe in yourself. 🌸",
        "Every small step counts. 💙",
        "Your mental health matters. 🌿",
        "Be kind to yourself today. 😊",
        "You are stronger than you think. 💪",
        "Progress is better than perfection. ⭐"

    ];

    const quote =
        document.getElementById("quote");

    const quoteBtn =
        document.getElementById("quoteBtn");

    if (quoteBtn) {

        quoteBtn.addEventListener("click", function () {

            const random =
                Math.floor(Math.random() * quotes.length);

            if (quote) {

                quote.textContent =
                    quotes[random];

            }

        });

    }

        // ==========================
    // Registration Form Validation
    // ==========================

    const form = document.getElementById("registerForm");

    if (form) {

        form.addEventListener("submit", function (event) {

            event.preventDefault();

            let valid = true;

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            const nameError = document.getElementById("nameError");
            const emailError = document.getElementById("emailError");
            const phoneError = document.getElementById("phoneError");
            const passwordError = document.getElementById("passwordError");
            const confirmPasswordError = document.getElementById("confirmPasswordError");
            const successMessage = document.getElementById("successMessage");

            // Clear old errors
            nameError.textContent = "";
            emailError.textContent = "";
            phoneError.textContent = "";
            passwordError.textContent = "";
            confirmPasswordError.textContent = "";
            successMessage.textContent = "";

            // Name Validation
            if (name === "") {
                nameError.textContent = "Name is required";
                valid = false;
            }

            // Email Validation
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (email === "") {
                emailError.textContent = "Email is required";
                valid = false;
            } else if (!emailPattern.test(email)) {
                emailError.textContent = "Enter a valid email";
                valid = false;
            }

            // Phone Validation
            const phonePattern = /^[0-9]{10}$/;

            if (phone === "") {
                phoneError.textContent = "Phone number is required";
                valid = false;
            } else if (!phonePattern.test(phone)) {
                phoneError.textContent = "Phone number must contain exactly 10 digits";
                valid = false;
            }

            // Password Validation
            const passwordPattern =
                /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

            if (password === "") {
                passwordError.textContent = "Password is required";
                valid = false;
            } else if (!passwordPattern.test(password)) {
                passwordError.textContent =
                    "Password must contain uppercase, lowercase, number, special character and be at least 8 characters.";
                valid = false;
            }

            // Confirm Password
            if (confirmPassword === "") {
                confirmPasswordError.textContent =
                    "Confirm Password is required";
                valid = false;
            } else if (password !== confirmPassword) {
                confirmPasswordError.textContent =
                    "Passwords do not match";
                valid = false;
            }

            // Success
            if (valid) {

                alert("Registration Successful! 🎉");

                successMessage.textContent =
                    "🎉 Registration Successful! Welcome " + name + ".";

                form.reset();

            }

        });

    }

}); // End DOMContentLoaded
