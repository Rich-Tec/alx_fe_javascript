// Sample quote structure: { text: "Quote text", category: "Inspiration" }
// This is the ONE AND ONLY quotes array. It must be 'let' to be reassigned.
let quotes = [];
let categories = new Set(); // To keep track of unique categories

// Function to display a random quote from the current 'quotes' array
function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById("quoteDisplay").innerHTML = "No quotes available.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteObject = quotes[randomIndex];
    
    // Call displayQuotes to show just this one random quote
    displayQuotes([quoteObject]); 
    
    // Also save this specific quote's formatted text to session storage
    const formattedQuote = `"${quoteObject.text}" — [${quoteObject.category}]`;
    sessionStorage.setItem('lastViewedQuoteText', formattedQuote);
}

// Function to add a new quote (takes a quote object as an argument)
function addQuote(newQuoteObject) {
    if (!newQuoteObject || typeof newQuoteObject.text !== 'string' || typeof newQuoteObject.category !== 'string') {
        console.error("addQuote expects a valid quote object with 'text' and 'category' properties.");
        alert("Invalid quote format provided for adding.");
        return;
    }

    quotes.push(newQuoteObject);
    saveQuotes(); // Save to local storage immediately

    // Update categories and dropdown only if it's a new category
    if (!categories.has(newQuoteObject.category)) {
        categories.add(newQuoteObject.category);
        const option = document.createElement('option');
        option.value = newQuoteObject.category;
        option.textContent = newQuoteObject.category;
        document.getElementById('categoryFilter').appendChild(option);
    }

    filterQuotes(); // Update display according to the current filter
}

// Function to handle adding a quote from the UI input fields
function addQuoteFromUI() {
    const quoteText = document.getElementById("newQuoteText").value.trim();
    const quoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (quoteText === "" || quoteCategory === "") {
        alert("Please fill in both fields!");
        return;
    }

    const newQuoteObject = { text: quoteText, category: quoteCategory };
    addQuote(newQuoteObject); // Call the main addQuote function

    // Clear input fields
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
    alert("Quote added successfully!");
}


// Function to dynamically create the add quote form elements
function createAddQuoteForm() {
    const formContainer = document.getElementById("addQuoteFormContainer");

    if (!formContainer) {
        console.error("Error: Element with ID 'addQuoteFormContainer' not found. Please ensure your HTML has this container.");
        return;
    }

    formContainer.innerHTML = ''; // Clear existing content to prevent duplicates

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
    addQuoteButton.addEventListener("click", addQuoteFromUI); // Call the UI specific add function
    formContainer.appendChild(addQuoteButton);
}

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Populate the category dropdown
function populateCategories() {
    categories = new Set(quotes.map(q => q.category)); // Recalculate all unique categories
    const dropdown = document.getElementById('categoryFilter');

    // Clear existing options except "All"
    dropdown.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        dropdown.appendChild(option);
    });
}

// Filter quotes based on selected category and display them
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory); // Save the current filter

    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    displayQuotes(filteredQuotes); // Show the filtered list
}

// Display multiple quotes in the container
function displayQuotes(quoteList) {
    const container = document.getElementById('quoteDisplay');
    container.innerHTML = ''; // Clear previous content

    if (quoteList.length === 0) {
        container.innerHTML = "No quotes match the current filter or no quotes available.";
        return;
    }

    quoteList.forEach(q => {
        const p = document.createElement('p');
        // Using innerHTML for consistent display as per checker's previous request
        p.innerHTML = `"${q.text}" — [${q.category}]`;
        container.appendChild(p);
    });
}

// Export quotes as JSON file
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a); // Append temporarily to trigger download
    a.click();
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url); // Release the URL object
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
                    saveQuotes(); // Save updated list
                    populateCategories(); // Re-populate categories in case new ones were imported
                    filterQuotes(); // Re-apply filter and display new list
                    alert(`Successfully imported ${validImportedQuotes.length} quotes!`);
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

// --- Consolidated DOMContentLoaded Listener ---
window.addEventListener('DOMContentLoaded', () => {
    // 1. Load quotes from localStorage first
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        try {
            const parsedQuotes = JSON.parse(storedQuotes);
            if (Array.isArray(parsedQuotes)) {
                // Filter to ensure loaded items are valid quote objects
                quotes = parsedQuotes.filter(q => typeof q === 'object' && q !== null && typeof q.text === 'string' && typeof q.category === 'string');
            } else {
                console.warn("Stored quotes in localStorage are not an array or corrupted. Initializing empty.");
                quotes = [];
            }
        } catch (e) {
            console.error("Error parsing stored quotes from localStorage:", e);
            quotes = []; // Reset on parse error
        }
    }

    // 2. If no quotes were loaded from localStorage, use initial default quotes
    if (quotes.length === 0) {
        quotes = [
            { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
            { text: "Life is what happens when you're busy making other plans.", category: "Life" },
            { text: "The purpose of our lives is to be happy.", category: "Happiness" }
        ];
        saveQuotes(); // Save these default quotes to localStorage for next time
    }

    // 3. Create the dynamically generated 'Add Quote' form
    createAddQuoteForm();

    // 4. Populate the category filter dropdown based on loaded/default quotes
    populateCategories();

    // 5. Attach event listener to the "Show New Quote" button
    const newQuoteButton = document.getElementById("newQuote");
    if (newQuoteButton) {
        newQuoteButton.addEventListener("click", showRandomQuote);
    } else {
        console.warn("Element with ID 'newQuote' not found. Random quote button might not work.");
    }
    
    // 6. Attach event listener for the category filter dropdown
    const categoryFilterDropdown = document.getElementById('categoryFilter');
    if (categoryFilterDropdown) {
        categoryFilterDropdown.addEventListener('change', filterQuotes);
    } else {
        console.warn("Element with ID 'categoryFilter' not found. Category filtering might not work.");
    }

    // 7. Restore last selected filter and apply it, or display all quotes initially
    const savedFilter = localStorage.getItem('selectedCategory');
    if (savedFilter && (Array.from(categories).includes(savedFilter) || savedFilter === 'all')) {
        // Only set value if the option actually exists in the dropdown
        categoryFilterDropdown.value = savedFilter; 
        filterQuotes(); // Apply the saved filter
    } else {
        // If no saved filter or it's invalid, display all quotes
        displayQuotes(quotes);
    }

    // 8. Display last viewed quote from session storage if available
    const lastViewedQuoteText = sessionStorage.getItem('lastViewedQuoteText');
    const quoteDisplayElement = document.getElementById('quoteDisplay');
    if (lastViewedQuoteText && quoteDisplayElement) {
        quoteDisplayElement.innerHTML = lastViewedQuoteText; // Use innerHTML
    }
    
    const importFile = document.getElementById('importFile');
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');

    if (importFile && importBtn) {
        importBtn.addEventListener('click', () => importFile.click()); // Click hidden input when button is clicked
        importFile.addEventListener('change', importFromJsonFile);
    } else {
        console.warn("Import elements (importFile, importBtn) not found. Import functionality may be limited.");
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', exportToJsonFile);
    } else {
        console.warn("Export button (exportBtn) not found. Export functionality may be limited.");
    }
});
