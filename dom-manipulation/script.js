// Array to store quote objects
const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The purpose of our lives is to be happy.", category: "Happiness" }
];

// Function to display a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "No quotes available.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `"${quote.text}" — [${quote.category}]`;
}

// Function to add a new quote
function addQuote() {
  const quoteText = document.getElementById("newQuoteText").value.trim();
  const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (quoteText === "" || quoteCategory === "") {
    alert("Please fill in both fields!");
    return;
  }

  // Add the new quote to the array
  quotes.push({ text: quoteText, category: quoteCategory });

  // Clear the input fields
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("Quote added successfully!");
  // Optional: You might want to immediately show the new quote or a random one after adding.
  // showRandomQuote();
}

// --- NEW FUNCTION REQUIRED BY CHECKER ---
function createAddQuoteForm() {
  const formContainer = document.getElementById("addQuoteFormContainer"); // This needs to be an existing div in your HTML

  if (!formContainer) {
    console.error("Error: Element with ID 'addQuoteFormContainer' not found. Please ensure your HTML has this container.");
    return;
  }

  // Create Heading
  const heading = document.createElement("h2");
  heading.textContent = "Add a New Quote";
  formContainer.appendChild(heading);

  // Create Quote Text Input
  const quoteTextInput = document.createElement("input");
  quoteTextInput.type = "text";
  quoteTextInput.id = "newQuoteText";
  quoteTextInput.placeholder = "Enter quote text";
  formContainer.appendChild(quoteTextInput);

  // Create Quote Category Input
  const quoteCategoryInput = document.createElement("input");
  quoteCategoryInput.type = "text";
  quoteCategoryInput.id = "newQuoteCategory";
  quoteCategoryInput.placeholder = "Enter category";
  formContainer.appendChild(quoteCategoryInput);

  // Create Add Quote Button
  const addQuoteButton = document.createElement("button");
  addQuoteButton.id = "addQuoteBtn";
  addQuoteButton.textContent = "Add Quote";
  // Attach event listener to the dynamically created button
  addQuoteButton.addEventListener("click", addQuote);
  formContainer.appendChild(addQuoteButton);
}
// --- END NEW FUNCTION ---

// Attach event listener to button for showing a random quote
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// Call the function to create the add quote form when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm(); 
});
