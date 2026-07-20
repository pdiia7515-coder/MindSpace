console.log("Welcome to MindSpace!");
alert("Welcome to MindSpace!");

const startButton = document.getElementById("startBtn");

startButton.addEventListener("click", function () 
    {
        alert("Welcome to your Mental Wellness Journey! 🌿");
    });

    const moods = document.querySelectorAll(".mood-card");
    const message = document.getElementById("message");

    moods.forEach(function(mood){

        mood.addEventListener("click", function(){

            moods.forEach(function(item){
                item.classList.remove("selected");
            });

            mood.classList.add("selected");

            message.textContent = "Your mood is " + mood.textContent + " today 💙";
                localStorage.setItem("selectedMood", mood.textContent);
        });

    });

const savedMood = localStorage.getItem("selectedMood");

if(savedMood){

    moods.forEach(function(mood){

        if(mood.textContent === savedMood){

            mood.classList.add("selected");

            message.textContent = "Your mood is " + savedMood + " today 💙";

        }

    });

}
const resetButton = document.getElementById("resetMood");

resetButton.addEventListener("click",function(){

    localStorage.removeItem("selectedMood");

    moods.forEach(function(mood){
        mood.classList.remove("selected");
    });

    message.textContent="Mood Reset Successfully!";
});

const journalInput = document.getElementById("journalInput");
const saveJournal = document.getElementById("saveJournal");
const journalList = document.getElementById("journalList");

let journals = JSON.parse(localStorage.getItem("journals")) || [];

displayJournals();

saveJournal.addEventListener("click", function(){

    if(journalInput.value.trim() === ""){
        alert("Please write something!");
        return;
    }

    const journal = {

        date: new Date().toLocaleDateString(),

        text: journalInput.value

    };

    journals.push(journal);

    localStorage.setItem("journals", JSON.stringify(journals));

    journalInput.value="";

    displayJournals();

});

function displayJournals(){

    journalList.innerHTML += `
        <div class="entry">

        <strong>${entry.date}</strong>

        <p>${entry.text}</p>

        <button onclick="deleteJournal(${index})">
        Delete
        </button>

        </div>
        `;

    function deleteJournal(index){

        journals.splice(index,1);

        localStorage.setItem("journals",
        JSON.stringify(journals));
        displayJournals();

    }
};

const themeBtn = document.getElementById("themeBtn");

if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
}

themeBtn.addEventListener("click", function(){

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");
        themeBtn.textContent = "☀️";

    }else{

        localStorage.setItem("theme","light");
        themeBtn.textContent = "🌙";

    }

});

const quotes = [
    "Believe in yourself. 🌸",
    "Every small step counts. 💙",
    "Your mental health matters. 🌿",
    "Be kind to yourself today. 😊",
    "You are stronger than you think. 💪",
    "Progress is better than perfection. ⭐"
];

const quote = document.getElementById("quote");
const quoteBtn = document.getElementById("quoteBtn");

quoteBtn.addEventListener("click", function(){

    const randomIndex = Math.floor(Math.random() * quotes.length);

    quote.textContent = quotes[randomIndex];

});

const suggestions = {

    "😊":"Keep smiling and spread positivity! 🌞",

    "😀":"Great day! Try helping someone today. ❤️",

    "😐":"Take a short break and relax. ☕",

    "😔":"Talk to someone you trust and remember tomorrow is a new day. 💙",

    "😡":"Take deep breaths and go for a short walk. 🌿"

};

const aiSuggestion = document.getElementById("aiSuggestion");

aiSuggestion.textContent = suggestions[mood.textContent];

const searchJournal = document.getElementById("searchJournal");

searchJournal.addEventListener("input",function(){

const search = this.value.toLowerCase();

const entries = document.querySelectorAll(".entry");

entries.forEach(function(entry){

if(entry.textContent.toLowerCase().includes(search)){

entry.style.display="block";

}else{

entry.style.display="none";

}

});

});

function editJournal(index){

journalInput.value=journals[index].text;

journals.splice(index,1);

displayJournals();

}

const stats=document.getElementById("stats");

let moodCount={};

journals.forEach(function(item){

moodCount[item.mood]=(moodCount[item.mood]||0)+1;

});

const form = document.getElementById("registerForm");

form.addEventListener("submit", function(event){

    event.preventDefault();

    alert("Form Submitted!");

    let valid=true;

    if(name===""){

        document.getElementById("nameError").textContent="Name is required";

        valid=false;

    }else{

        document.getElementById("nameError").textContent="";

    }

});

const name=document.getElementById("name").value;

const email=document.getElementById("email").value;

const phone=document.getElementById("phone").value;

const password=document.getElementById("password").value;

const confirmPassword=document.getElementById("confirmPassword").value;

if(valid){

alert("Registration Successful! 🎉");

}

button.addEventListener("click",function(){

});

let valid=true;
valid=false;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if(email===""){
    document.getElementById("emailError").textContent="Email is required";
    valid=false;

}else if(!emailPattern.test(email)){

    document.getElementById("emailError").textContent="Enter a valid email";

    valid=false;

}else{

    document.getElementById("emailError").textContent="";

}

const phonePattern=/^[0-9]{10}$/;
if(phone===""){

document.getElementById("phoneError").textContent="Phone number is required";

valid=false;

}else if(!phonePattern.test(phone)){

document.getElementById("phoneError").textContent="Phone number must contain exactly 10 digits";

valid=false;

}else{

document.getElementById("phoneError").textContent="";

}

const passwordPattern =
/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
if(password===""){

document.getElementById("passwordError").textContent="Password is required";

valid=false;

}else if(!passwordPattern.test(password)){

document.getElementById("passwordError").textContent="Password must contain uppercase, lowercase, number, special character and be at least 8 characters.";

valid=false;

}else{

document.getElementById("passwordError").textContent="";

}
if(confirmPassword===""){

document.getElementById("confirmPasswordError").textContent="Confirm Password is required";

valid=false;

}else if(password!==confirmPassword){

document.getElementById("confirmPasswordError").textContent="Passwords do not match";

valid=false;

}else{

document.getElementById("confirmPasswordError").textContent="";

}
alert("Registration Successful!");
document.getElementById("successMessage").textContent =
"🎉 Registration Successful! Welcome " + name + ".";

form.reset();
const nameInput = document.getElementById("name");

if(name===""){
    nameError.textContent="Name is required";
    nameInput.classList.add("error");
    nameInput.classList.remove("success");
}else{
    nameError.textContent="";
    nameInput.classList.remove("error");
    nameInput.classList.add("success");
}
document.getElementById("email").addEventListener("input", function(){

    if(emailPattern.test(this.value)){
        emailError.textContent="";
        this.classList.add("success");
        this.classList.remove("error");
    }

});
emailInput.setAttribute("aria-invalid","true");
emailInput.setAttribute("aria-invalid","false");
