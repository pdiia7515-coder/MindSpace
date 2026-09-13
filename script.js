/* =========================================================
   MindSpace — script.js
   All app logic: theme, navigation, mood tracker, journal,
   wellness suggestions, quotes, FAQ accordion, contact form.
   Data is persisted only in the browser's Local Storage.
   ========================================================= */

(function () {
  "use strict";

  /* ---------------------------------------------------------
     Storage keys & small storage helpers (reused everywhere)
     --------------------------------------------------------- */
  const STORAGE_KEYS = {
    THEME: "mindspace_theme",
    MOODS: "mindspace_moods",
    JOURNAL: "mindspace_journal_entries"
  };

  /** Safely read and JSON-parse a value from Local Storage. */
  function readStore(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      console.warn("MindSpace: could not read", key, err);
      return fallback;
    }
  }

  /** Safely JSON-stringify and write a value to Local Storage. */
  function writeStore(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn("MindSpace: could not save", key, err);
      return false;
    }
  }

  /** Generates a reasonably unique id without any external library. */
  function makeId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /** Escapes text before it is inserted as HTML, to keep user input safe. */
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  /** Shows a short-lived confirmation toast at the bottom of the screen. */
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ---------------------------------------------------------
     Mood reference data — shared by tracker, journal & tips
     --------------------------------------------------------- */
  const MOODS = [
    { id: "happy", label: "Happy", emoji: "😊" },
    { id: "calm", label: "Calm", emoji: "😌" },
    { id: "neutral", label: "Neutral", emoji: "😐" },
    { id: "sad", label: "Sad", emoji: "😢" },
    { id: "stressed", label: "Stressed", emoji: "😖" },
    { id: "angry", label: "Angry", emoji: "😠" }
  ];

  function getMoodById(id) {
    return MOODS.find((m) => m.id === id) || { id, label: id, emoji: "❓" };
  }

  /* =========================================================
     1. THEME (DARK / LIGHT MODE)
     ========================================================= */
  const themeToggleBtn = document.getElementById("themeToggle");

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const icon = themeToggleBtn.querySelector("i");
    const isDark = theme === "dark";
    icon.className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
    themeToggleBtn.setAttribute("aria-pressed", String(isDark));
    themeToggleBtn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  }

  function initTheme() {
    const saved = readStore(STORAGE_KEYS.THEME, null);
    if (saved) {
      applyTheme(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? "dark" : "light");
    }
  }

  themeToggleBtn.addEventListener("click", function () {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    writeStore(STORAGE_KEYS.THEME, next);
  });

  /* =========================================================
     2. NAVIGATION — mobile hamburger menu + active link + sticky shadow
     ========================================================= */
  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const navLinks = document.getElementById("navLinks");

  hamburgerBtn.addEventListener("click", function () {
    const isOpen = navLinks.classList.toggle("open");
    hamburgerBtn.setAttribute("aria-expanded", String(isOpen));
    hamburgerBtn.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  // Close the mobile menu after a link is chosen
  navLinks.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburgerBtn.setAttribute("aria-expanded", "false");
    });
  });

  /* =========================================================
     3. MOOD TRACKER
     ========================================================= */
  const moodGrid = document.getElementById("moodGrid");
  const moodForm = document.getElementById("moodForm");
  const moodNote = document.getElementById("moodNote");
  const moodFormMessage = document.getElementById("moodFormMessage");
  const moodHistoryList = document.getElementById("moodHistoryList");
  const moodChart = document.getElementById("moodChart");

  /** Builds the emoji mood selector cards once, from the shared MOODS list. */
  function renderMoodOptions() {
    moodGrid.innerHTML = MOODS.map((mood, index) => `
      <div class="mood-card">
        <input type="radio" name="mood" id="mood-${mood.id}" value="${mood.id}" ${index === 0 ? "" : ""}>
        <label for="mood-${mood.id}">
          <span class="emoji" aria-hidden="true">${mood.emoji}</span>
          <span class="label-text">${mood.label}</span>
        </label>
      </div>
    `).join("");
  }

  function getMoodEntries() {
    return readStore(STORAGE_KEYS.MOODS, []);
  }

  function saveMoodEntries(entries) {
    writeStore(STORAGE_KEYS.MOODS, entries);
  }

  /** Formats an ISO timestamp into a friendly "Today · 4:30 PM" style string. */
  function formatTimestamp(isoString) {
    const date = new Date(isoString);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();

    const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    if (isToday) return `Today · ${time}`;
    if (isYesterday) return `Yesterday · ${time}`;
    return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} · ${time}`;
  }

  /** Renders the most recent mood check-ins (newest first). */
  function renderMoodHistory() {
    const entries = getMoodEntries().slice().reverse().slice(0, 10);
    if (entries.length === 0) {
      moodHistoryList.innerHTML = `<p class="empty-note">No check-ins yet — your first one will show up here.</p>`;
      return;
    }
    moodHistoryList.innerHTML = entries.map((entry) => {
      const mood = getMoodById(entry.mood);
      return `
        <div class="mood-history-item">
          <span class="emoji" aria-hidden="true">${mood.emoji}</span>
          <div class="meta">
            <p class="mood-name">${escapeHtml(mood.label)}</p>
            <p class="timestamp">${formatTimestamp(entry.timestamp)}</p>
            ${entry.note ? `<p class="note">${escapeHtml(entry.note)}</p>` : ""}
          </div>
          <button type="button" class="delete-mood-btn" data-id="${entry.id}" aria-label="Delete this check-in">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>
      `;
    }).join("");
  }

  /** Draws a simple 7-day bar chart of mood check-in counts using plain divs. */
  function renderMoodChart() {
    const entries = getMoodEntries();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    const counts = days.map((day) => {
      return entries.filter((entry) => {
        const entryDate = new Date(entry.timestamp);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === day.getTime();
      }).length;
    });

    const max = Math.max(1, ...counts);

    moodChart.innerHTML = days.map((day, index) => {
      const heightPct = Math.round((counts[index] / max) * 100);
      const dayLabel = day.toLocaleDateString([], { weekday: "short" }).charAt(0);
      return `
        <div class="mood-chart-bar-wrap">
          <span class="mood-chart-count">${counts[index] || ""}</span>
          <div class="mood-chart-bar" style="height:${counts[index] ? Math.max(heightPct, 6) : 2}%"></div>
          <span class="mood-chart-day">${dayLabel}</span>
        </div>
      `;
    }).join("");
  }

  function refreshMoodUI() {
    renderMoodHistory();
    renderMoodChart();
  }

  moodForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const selected = moodForm.querySelector('input[name="mood"]:checked');

    if (!selected) {
      moodFormMessage.textContent = "Please choose a mood first.";
      moodFormMessage.className = "form-message error";
      return;
    }

    const entries = getMoodEntries();
    entries.push({
      id: makeId(),
      mood: selected.value,
      note: moodNote.value.trim(),
      timestamp: new Date().toISOString()
    });
    saveMoodEntries(entries);

    moodFormMessage.textContent = "Mood saved. Thank you for checking in.";
    moodFormMessage.className = "form-message success";
    moodForm.reset();
    refreshMoodUI();
    setTimeout(() => { moodFormMessage.textContent = ""; }, 3500);
  });

  // Event delegation for deleting a single mood history entry
  moodHistoryList.addEventListener("click", function (event) {
    const btn = event.target.closest(".delete-mood-btn");
    if (!btn) return;
    const id = btn.dataset.id;
    const remaining = getMoodEntries().filter((entry) => entry.id !== id);
    saveMoodEntries(remaining);
    refreshMoodUI();
  });

  /* =========================================================
     4. AI-STYLE WELLNESS SUGGESTIONS (rule-based, fully local)
     ========================================================= */
  const suggestionMoodSelect = document.getElementById("suggestionMood");
  const getSuggestionBtn = document.getElementById("getSuggestionBtn");
  const suggestionOutput = document.getElementById("suggestionOutput");

  const SUGGESTIONS = {
    happy: {
      heading: "Keep that good feeling going",
      tips: [
        "Take a moment to acknowledge the progress that got you here.",
        "Write down what contributed to this feeling so you can return to it later.",
        "Share a little positivity with someone — a kind word travels far."
      ]
    },
    calm: {
      heading: "Protect this sense of calm",
      tips: [
        "Notice what's helping you feel steady right now, and save it for harder days.",
        "A short walk without your phone can help this feeling settle in.",
        "This is a good moment for a few slow, easy breaths — in for 4, out for 6."
      ]
    },
    neutral: {
      heading: "A gentle check-in",
      tips: [
        "Neutral is a perfectly valid place to be — no feeling needs to be forced.",
        "Try naming one small thing you're looking forward to today.",
        "A short stretch or glass of water can be a nice reset."
      ]
    },
    sad: {
      heading: "Be gentle with yourself today",
      tips: [
        "Try a slow breathing exercise: in for 4 counts, hold for 4, out for 6.",
        "Write down what you're feeling, without judging it — just let it out on the page.",
        "If it feels right, reach out to someone you trust and let them know how you're doing."
      ]
    },
    stressed: {
      heading: "Let's take some pressure off",
      tips: [
        "Step away for a short break, even five minutes, before returning to the task.",
        "Try the 4-7-8 breathing exercise: inhale 4 seconds, hold 7, exhale 8.",
        "List what's on your plate and pick just one small next step, not all of it."
      ]
    },
    angry: {
      heading: "Give the feeling some space",
      tips: [
        "Pause before responding — a short walk or a glass of water can help the heat pass.",
        "Try box breathing: in for 4, hold for 4, out for 4, hold for 4.",
        "Write down what triggered this, so you can look at it clearly once you're calmer."
      ]
    }
  };

  /** Renders a mood-matched wellness suggestion into the output panel. */
  function renderSuggestion(moodId) {
    const data = SUGGESTIONS[moodId] || SUGGESTIONS.neutral;
    suggestionOutput.innerHTML = `
      <h4>${escapeHtml(data.heading)}</h4>
      <ul>${data.tips.map((tip) => `<li>${escapeHtml(tip)}</li>`).join("")}</ul>
    `;
  }

  getSuggestionBtn.addEventListener("click", function () {
    renderSuggestion(suggestionMoodSelect.value);
  });

  /* =========================================================
     5. DAILY MOTIVATIONAL QUOTE
     ========================================================= */
  const QUOTES = [
    { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
    { text: "Almost everything will work again if you unplug it for a few minutes, including you.", author: "Anne Lamott" },
    { text: "This too shall pass — it always does.", author: "Unknown" },
    { text: "Progress, not perfection.", author: "Unknown" },
    { text: "You are not required to set yourself on fire to keep others warm.", author: "Unknown" },
    { text: "Small steps every day add up to big changes.", author: "Unknown" },
    { text: "Rest is not a reward for finishing. It's a requirement for continuing.", author: "Unknown" },
    { text: "Feelings are visitors. Let them come and go.", author: "Mooji" },
    { text: "You have survived 100% of your hardest days so far.", author: "Unknown" },
    { text: "Be patient with yourself. Nothing in nature blooms all year.", author: "Unknown" }
  ];

  const quoteText = document.getElementById("quoteText");
  const quoteAuthor = document.getElementById("quoteAuthor");
  const newQuoteBtn = document.getElementById("newQuoteBtn");
  let lastQuoteIndex = -1;

  function showRandomQuote() {
    let index;
    do {
      index = Math.floor(Math.random() * QUOTES.length);
    } while (index === lastQuoteIndex && QUOTES.length > 1);
    lastQuoteIndex = index;
    const quote = QUOTES[index];
    quoteText.textContent = `"${quote.text}"`;
    quoteAuthor.textContent = `— ${quote.author}`;
  }

  newQuoteBtn.addEventListener("click", showRandomQuote);

  /* =========================================================
     6. DAILY JOURNAL — create, read, update, delete, search
     ========================================================= */
  const journalForm = document.getElementById("journalForm");
  const journalEditId = document.getElementById("journalEditId");
  const journalTitle = document.getElementById("journalTitle");
  const journalDate = document.getElementById("journalDate");
  const journalMood = document.getElementById("journalMood");
  const journalContent = document.getElementById("journalContent");
  const journalFormMessage = document.getElementById("journalFormMessage");
  const journalSubmitBtn = document.getElementById("journalSubmitBtn");
  const journalCancelEditBtn = document.getElementById("journalCancelEditBtn");
  const journalList = document.getElementById("journalList");
  const journalSearch = document.getElementById("journalSearch");

  function getJournalEntries() {
    return readStore(STORAGE_KEYS.JOURNAL, []);
  }
  function saveJournalEntries(entries) {
    writeStore(STORAGE_KEYS.JOURNAL, entries);
  }

  function todayIso() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }
  journalDate.value = todayIso();

  function clearJournalErrors() {
    ["journalTitleError", "journalDateError", "journalContentError"].forEach((id) => {
      document.getElementById(id).textContent = "";
    });
  }

  /** Validates the journal form; returns true if valid, otherwise shows inline errors. */
  function validateJournalForm() {
    clearJournalErrors();
    let valid = true;

    if (!journalTitle.value.trim()) {
      document.getElementById("journalTitleError").textContent = "Please give your entry a title.";
      valid = false;
    }
    if (!journalDate.value) {
      document.getElementById("journalDateError").textContent = "Please choose a date.";
      valid = false;
    }
    if (!journalContent.value.trim()) {
      document.getElementById("journalContentError").textContent = "Your entry can't be empty.";
      valid = false;
    }
    return valid;
  }

  function resetJournalForm() {
    journalForm.reset();
    journalDate.value = todayIso();
    journalEditId.value = "";
    journalSubmitBtn.innerHTML = `<i class="fa-solid fa-pen-nib" aria-hidden="true"></i> Save Entry`;
    journalCancelEditBtn.hidden = true;
    clearJournalErrors();
  }

  journalCancelEditBtn.addEventListener("click", resetJournalForm);

  journalForm.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateJournalForm()) return;

    const entries = getJournalEntries();
    const editingId = journalEditId.value;

    if (editingId) {
      // Update existing entry in place
      const idx = entries.findIndex((e) => e.id === editingId);
      if (idx !== -1) {
        entries[idx] = {
          ...entries[idx],
          title: journalTitle.value.trim(),
          date: journalDate.value,
          mood: journalMood.value,
          content: journalContent.value.trim(),
          updatedAt: new Date().toISOString()
        };
      }
      journalFormMessage.textContent = "Entry updated.";
    } else {
      // Create a new entry
      entries.push({
        id: makeId(),
        title: journalTitle.value.trim(),
        date: journalDate.value,
        mood: journalMood.value,
        content: journalContent.value.trim(),
        createdAt: new Date().toISOString()
      });
      journalFormMessage.textContent = "Entry saved.";
    }

    saveJournalEntries(entries);
    journalFormMessage.className = "form-message success";
    resetJournalForm();
    renderJournalList();
    setTimeout(() => { journalFormMessage.textContent = ""; }, 3000);
  });

  function formatDisplayDate(isoDate) {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  }

  /** Renders journal entry cards, optionally filtered by a search term. */
  function renderJournalList() {
    const term = journalSearch.value.trim().toLowerCase();
    let entries = getJournalEntries().slice().sort((a, b) => (a.date < b.date ? 1 : -1));

    if (term) {
      entries = entries.filter((entry) => {
        const mood = getMoodById(entry.mood).label.toLowerCase();
        return (
          entry.title.toLowerCase().includes(term) ||
          entry.content.toLowerCase().includes(term) ||
          entry.date.includes(term) ||
          mood.includes(term)
        );
      });
    }

    if (entries.length === 0) {
      const isSearching = term.length > 0;
      journalList.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid ${isSearching ? "fa-magnifying-glass" : "fa-feather-pointed"}" aria-hidden="true"></i>
          <p>${isSearching
            ? "No entries match your search. Try a different word, mood, or date."
            : "No journal entries yet. Whenever you're ready, write your first one above."}</p>
        </div>
      `;
      return;
    }

    journalList.innerHTML = entries.map((entry) => {
      const mood = getMoodById(entry.mood);
      return `
        <article class="journal-card">
          <div class="journal-card-top">
            <h4 class="journal-card-title">${escapeHtml(entry.title)}</h4>
            <span class="journal-mood-badge">${mood.emoji} ${escapeHtml(mood.label)}</span>
          </div>
          <p class="journal-card-date">${formatDisplayDate(entry.date)}</p>
          <p class="journal-card-content">${escapeHtml(entry.content)}</p>
          <div class="journal-card-actions">
            <button type="button" class="edit-btn" data-id="${entry.id}">
              <i class="fa-solid fa-pen" aria-hidden="true"></i> Edit
            </button>
            <button type="button" class="delete-btn" data-id="${entry.id}">
              <i class="fa-solid fa-trash" aria-hidden="true"></i> Delete
            </button>
          </div>
        </article>
      `;
    }).join("");
  }

  journalSearch.addEventListener("input", renderJournalList);

  // Event delegation for Edit / Delete buttons on journal cards
  journalList.addEventListener("click", function (event) {
    const editBtn = event.target.closest(".edit-btn");
    const deleteBtn = event.target.closest(".delete-btn");

    if (editBtn) {
      const entry = getJournalEntries().find((e) => e.id === editBtn.dataset.id);
      if (!entry) return;
      journalEditId.value = entry.id;
      journalTitle.value = entry.title;
      journalDate.value = entry.date;
      journalMood.value = entry.mood;
      journalContent.value = entry.content;
      journalSubmitBtn.innerHTML = `<i class="fa-solid fa-check" aria-hidden="true"></i> Update Entry`;
      journalCancelEditBtn.hidden = false;
      journalForm.scrollIntoView({ behavior: "smooth", block: "start" });
      journalTitle.focus();
    }

    if (deleteBtn) {
      const id = deleteBtn.dataset.id;
      const confirmed = window.confirm("Delete this journal entry? This can't be undone.");
      if (!confirmed) return;
      const remaining = getJournalEntries().filter((e) => e.id !== id);
      saveJournalEntries(remaining);
      renderJournalList();
      showToast("Journal entry deleted.");
      // If the deleted entry was mid-edit, reset the form
      if (journalEditId.value === id) resetJournalForm();
    }
  });

  /* =========================================================
     7. FAQ ACCORDION
     ========================================================= */
  document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
    trigger.addEventListener("click", function () {
      const panel = trigger.parentElement.nextElementSibling;
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      // Close any other open accordion items for a clean single-open behavior
      document.querySelectorAll(".accordion-trigger").forEach((other) => {
        if (other !== trigger) {
          other.setAttribute("aria-expanded", "false");
          other.parentElement.nextElementSibling.style.maxHeight = null;
        }
      });

      trigger.setAttribute("aria-expanded", String(!isOpen));
      panel.style.maxHeight = isOpen ? null : panel.scrollHeight + "px";
    });
  });

  /* =========================================================
     8. CONTACT FORM — client-side only validation & feedback
     ========================================================= */
  const contactForm = document.getElementById("contactForm");
  const contactName = document.getElementById("contactName");
  const contactEmail = document.getElementById("contactEmail");
  const contactSubject = document.getElementById("contactSubject");
  const contactMessage = document.getElementById("contactMessage");
  const contactFormMessage = document.getElementById("contactFormMessage");

  function setFieldError(id, message) {
    document.getElementById(id).textContent = message || "";
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();
    let valid = true;

    setFieldError("contactNameError", "");
    setFieldError("contactEmailError", "");
    setFieldError("contactSubjectError", "");
    setFieldError("contactMessageError", "");

    if (!contactName.value.trim()) {
      setFieldError("contactNameError", "Please tell us your name.");
      valid = false;
    }
    if (!contactEmail.value.trim() || !isValidEmail(contactEmail.value.trim())) {
      setFieldError("contactEmailError", "Please enter a valid email address.");
      valid = false;
    }
    if (!contactSubject.value.trim()) {
      setFieldError("contactSubjectError", "Please add a short subject.");
      valid = false;
    }
    if (!contactMessage.value.trim() || contactMessage.value.trim().length < 10) {
      setFieldError("contactMessageError", "Please write at least a short sentence (10+ characters).");
      valid = false;
    }

    if (!valid) {
      contactFormMessage.textContent = "Please fix the highlighted fields.";
      contactFormMessage.className = "form-message error";
      return;
    }

    // No backend exists — we simply confirm receipt locally.
    contactFormMessage.textContent = "Message sent! We'll get back to you soon.";
    contactFormMessage.className = "form-message success";
    contactForm.reset();
    setTimeout(() => { contactFormMessage.textContent = ""; }, 4000);
  });

  /* =========================================================
     9. SCROLL-REVEAL ANIMATIONS (single IntersectionObserver, reused)
     ========================================================= */
  function initRevealAnimations() {
    const targets = document.querySelectorAll(
      ".feature-card, .testimonial-card, .journal-card, .mood-history-panel, .mood-chart-panel, .suggestion-box, .quote-card"
    );
    targets.forEach((el) => el.classList.add("reveal"));

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach((el) => observer.observe(el));
  }

  /* =========================================================
     10. STICKY HEADER SHADOW ON SCROLL
     ========================================================= */
  function initHeaderShadow() {
    const header = document.getElementById("siteHeader");
    window.addEventListener("scroll", function () {
      if (window.scrollY > 8) {
        header.style.boxShadow = "0 6px 20px rgba(73, 60, 140, 0.10)";
      } else {
        header.style.boxShadow = "none";
      }
    });
  }

  /* =========================================================
     INIT — run everything once the DOM is ready
     ========================================================= */
  function init() {
    initTheme();
    renderMoodOptions();
    refreshMoodUI();
    renderSuggestion(suggestionMoodSelect.value);
    showRandomQuote();
    renderJournalList();
    initHeaderShadow();
    initRevealAnimations();
    document.getElementById("footerYear").textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
