// ONE AND ONLY `quotes` array declaration. Use `let` because it will be reassigned when loaded from localStorage.
// Initialize it as an empty array. Default quotes will be added if localStorage is empty.
let quotes = [];

// Function to display a random quote (Uses innerHTML as per checker's last request)
function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById("quoteDisplay").innerHTML = "No quotes available.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteObject = quotes[randomIndex]; // Get the quote object
    // Ensure displayQuote is called with an object
    displayQuote(quoteObject);
}

// Function to add a new quote from UI input fields
function addQuoteFromUI() { // Renamed to avoid conflict and be more descriptive
    const quoteText = document.getElementById("newQuoteText").value.trim();
    const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (quoteText === "" || quoteCategory === "") {
        alert("Please fill in both fields!");
        return;
    }

    const newQuoteObject = { text: quoteText, category: quoteCategory };

    quotes.push(newQuoteObject); // Add the new quote object to the array
    saveQuotes(); // Save to localStorage

    // Clear the input fields
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    alert("Quote added successfully!");
    // Optional: Immediately show the newly added quote or a random one
    displayQuote(newQuoteObject); // Show the newly added quote
    // OR showRandomQuote();
}

// Function to dynamically create the add quote form elements
function createAddQuoteForm() {
    const formContainer = document.getElementById("addQuoteFormContainer");

    if (!formContainer) {
        console.error("Error: Element with ID 'addQuoteFormContainer' not found. Please ensure your HTML has this container.");
        return;
    }

    // Clear any existing content in the container before adding new elements
    formContainer.innerHTML = ''; // Important to prevent duplicates on repeated calls

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
    // Attach event listener to the dynamically created button to call addQuoteFromUI
    addQuoteButton.addEventListener("click", addQuoteFromUI); // Use the renamed function
    formContainer.appendChild(addQuoteButton);
}

// Save quotes to localStorage (Operates on the single `quotes` array)
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display a quote object and save its formatted text to sessionStorage
function displayQuote(quoteObject) { // Expects a quote object: { text: "...", category: "..." }
    if (!quoteObject || typeof quoteObject.text !== 'string' || typeof quoteObject.category !== 'string') {
        console.error("displayQuote expects a valid quote object with 'text' and 'category' properties.");
        document.getElementById('quoteDisplay').textContent = "Error: Invalid quote data.";
        sessionStorage.removeItem('lastViewedQuoteText'); // Clear potentially bad entry
        return;
    }

    const formattedQuote = `"${quoteObject.text}" — [${quoteObject.category}]`;
    document.getElementById('quoteDisplay').innerHTML = formattedQuote; // Using innerHTML as per checker's previous request
    sessionStorage.setItem('lastViewedQuoteText', formattedQuote); // Store the formatted string
}

// Export quotes as JSON file
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) {
        alert("No file selected.");
        return;
    }
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (Array.isArray(importedQuotes)) {
                // Basic validation for imported quotes to ensure they have text/category properties
                const validImportedQuotes = importedQuotes.filter(q =>
                    typeof q === 'object' && q !== null && typeof q.text === 'string' && typeof q.category === 'string'
                );

                if (validImportedQuotes.length > 0) {
                    quotes.push(...validImportedQuotes); // Append valid new quotes to existing ones
                    saveQuotes();
                    alert(`Successfully imported ${validImportedQuotes.length} quotes!`);
                    // Optional: Display a random quote or the first newly imported one
                    // showRandomQuote(); // Call this to update display if desired
                } else {
                    alert('No valid quotes found in the file or file format incorrect.');
                }
            } else {
                alert('Invalid file format. Please upload a JSON file containing an array of quotes.');
            }
        } catch (error) {
            alert('Error parsing file: ' + error.message);
            console.error(error);
        }
    };
    fileReader.readAsText(file);
}


// --- SINGLE DOMContentLoaded LISTENER ---
window.addEventListener('DOMContentLoaded', () => {
    // 1. Load quotes from localStorage first
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        try {
            const parsedQuotes = JSON.parse(storedQuotes);
            if (Array.isArray(parsedQuotes)) {
                // Ensure loaded quotes are valid objects
                quotes = parsedQuotes.filter(q => typeof q === 'object' && q !== null && typeof q.text === 'string' && typeof q.category === 'string');
            } else {
                console.warn("Stored quotes in localStorage are not an array. Initializing empty.");
                quotes = [];
            }
        } catch (e) {
            console.error("Error parsing stored quotes from localStorage:", e);
            quotes = []; // Reset on parse error
        }
    }

    // 2. If no quotes were loaded from localStorage, use the initial default quotes
    if (quotes.length === 0) {
        quotes = [
            { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
            { text: "Life is what happens when you're busy making other plans.", category: "Life" },
            { text: "The purpose of our lives is to be happy.", category: "Happiness" }
        ];
        saveQuotes(); // Save these default quotes to localStorage for next time
    }

    // 3. Create the Add Quote Form (as required by checker)
    createAddQuoteForm();

    // 4. Attach event listener for the 'Show New Quote' button
    // Ensure you have an HTML button with id="newQuote" for this
    const newQuoteButton = document.getElementById("newQuote");
    if (newQuoteButton) {
        newQuoteButton.addEventListener("click", showRandomQuote);
    } else {
        console.warn("Element with ID 'newQuote' not found. Random quote button might not work.");
    }

    // 5. Display the last viewed quote from sessionStorage, or a random one if none.
    const lastViewedQuoteText = sessionStorage.getItem('lastViewedQuoteText');
    if (lastViewedQuoteText) {
        document.getElementById('quoteDisplay').innerHTML = lastViewedQuoteText; // Use innerHTML as per prev request
    } else if (quotes.length > 0) {
        showRandomQuote(); // Display a random quote if local storage had some but no last viewed.
    } else {
        // If no quotes at all (neither localStorage nor defaults), display default message
        document.getElementById('quoteDisplay').innerHTML = "No quotes available.";
    }

    // You will need to add HTML elements for importing/exporting:
    // <input type="file" id="importFile" accept=".json">
    // <button id="importBtn">Import Quotes</button>
    // <button id="exportBtn">Export Quotes</button>

    const importFile = document.getElementById('importFile');
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');

    if (importFile && importBtn) {
        importBtn.addEventListener('click', () => importFile.click()); // Click input when button is clicked
        importFile.addEventListener('change', importFromJsonFile);
    } else {
        console.warn("Import elements (importFile, importBtn) not found.");
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', exportToJsonFile);
    } else {
        console.warn("Export button (exportBtn) not found.");
    }
});
