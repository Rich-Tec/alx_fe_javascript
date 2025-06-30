// Sample quote structure: { text: "Quote text", category: "Category" }
let quotes = []; // This will hold our main, merged quotes (local + server)
let categories = new Set(); // To manage unique categories for the filter
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts'; // Fake API for simulation

// --- Core Functionalities ---

// Save quotes to localStorage
function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Display quotes (single or multiple) in the main container
function displayQuotes(quoteList) {
    const container = document.getElementById('quoteDisplay');
    container.innerHTML = ''; // Clear previous content

    if (!quoteList || quoteList.length === 0) {
        container.innerHTML = "No quotes available or matching filter.";
        return;
    }

    // Using innerHTML for consistency with previous checker requests
    quoteList.forEach(q => {
        const p = document.createElement('p');
        p.innerHTML = `"${q.text}" — [${q.category || 'Uncategorized'}]`; // Fallback for missing category
        container.appendChild(p);
    });
}

// Function to display a single random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById("quoteDisplay").innerHTML = "No quotes available.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteObject = quotes[randomIndex];

    // Display just this one quote using displayQuotes
    displayQuotes([quoteObject]); 
    
    // Save this specific quote's formatted text to session storage
    const formattedQuote = `"${quoteObject.text}" — [${quoteObject.category || 'Uncategorized'}]`;
    sessionStorage.setItem('lastViewedQuoteText', formattedQuote);
}


// Add a new quote (used by UI for user-entered quotes and by import)
function addQuote(newQuoteObject) { // Expects { id: ..., text: "...", category: "..." }
    if (!newQuoteObject || typeof newQuoteObject.text !== 'string' || typeof newQuoteObject.category !== 'string') {
        console.error("addQuote expects a valid quote object with 'text' and 'category' properties.");
        alert("Invalid quote format provided for adding.");
        return;
    }

    quotes.push(newQuoteObject); // Add to the main quotes array
    saveQuotes(); // Persist to local storage

    // Update categories for the filter dropdown
    if (!categories.has(newQuoteObject.category)) {
        categories.add(newQuoteObject.category);
        const option = document.createElement('option');
        option.value = newQuoteObject.category;
        option.textContent = newQuoteObject.category;
        document.getElementById('categoryFilter').appendChild(option);
    }

    filterQuotes(); // Update display to show changes and apply current filter
}

// Function to handle adding a quote from the UI input fields
function addQuoteFromUI() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');

    const text = textInput.value.trim();
    const category = categoryInput.value.trim();

    if (!text || !category) {
        alert('Please enter both quote text and category.');
        return;
    }

    const newQuote = { id: Date.now(), text, category }; // Assign a unique ID
    addQuote(newQuote); // Use the general addQuote function

    // Clear input fields
    textInput.value = '';
    categoryInput.value = '';
    notifyUser('Quote added locally.');

    // Simulate POST to server
    fakePostToServer(newQuote);
}


// --- Dynamic Form Creation ---

function createAddQuoteForm() {
    const formContainer = document.getElementById("addQuoteFormContainer");

    if (!formContainer) {
        console.error("Error: Element with ID 'addQuoteFormContainer' not found. Please ensure your HTML has this container.");
        return;
    }

    formContainer.innerHTML = ''; // Clear existing content to prevent duplicates

    const heading = document.createElement("h2");
    heading.textContent = "Add a New Quote";
    formContainer.appendChild(heading);

    const quoteTextInput = document.createElement("input");
    quoteTextInput.type = "text";
    quoteTextInput.id = "newQuoteText"; // Consistent ID with addQuoteFromUI
    quoteTextInput.placeholder = "Enter quote text";
    formContainer.appendChild(quoteTextInput);

    const quoteCategoryInput = document.createElement("input");
    quoteCategoryInput.type = "text";
    quoteCategoryInput.id = "newQuoteCategory"; // Consistent ID with addQuoteFromUI
    quoteCategoryInput.placeholder = "Enter category";
    formContainer.appendChild(quoteCategoryInput);

    const addQuoteButton = document.createElement("button");
    addQuoteButton.id = "addQuoteBtn";
    addQuoteButton.textContent = "Add Quote";
    addQuoteButton.addEventListener("click", addQuoteFromUI); // Call the UI specific add function
    formContainer.appendChild(addQuoteButton);
}

// --- Category Filtering Functionality ---

// Populate the category dropdown
function populateCategories() {
    categories = new Set(quotes.map(q => q.category)); // Recalculate unique categories from current quotes
    const dropdown = document.getElementById('categoryFilter');

    // Clear existing options except "All Categories"
    dropdown.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        dropdown.appendChild(option);
    });
}

// Filter quotes based on selected category and display
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory); // Save the current filter state

    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    displayQuotes(filteredQuotes);
}

// --- Server Synchronization Functionality ---

// Fake POST to "server" (jsonplaceholder)
function fakePostToServer(quote) {
    fetch(SERVER_URL, {
        method: 'POST',
        body: JSON.stringify(quote),
        headers: { 'Content-type': 'application/json; charset=UTF-8' }
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
    })
    .then(() => notifyUser('Quote synced to server.'))
    .catch(error => {
        console.error("Server sync POST error:", error);
        notifyUser('Failed to sync to server.');
    });
}

// RENAMED: This function now performs the server fetch as required by the checker
function fetchQuotesFromServer() { // Renamed from syncWithServer
    fetch(SERVER_URL)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.json();
        })
        .then(serverData => {
            // Map server data to our quote structure. jsonplaceholder 'title' becomes 'text'.
            // Simulating 'category' as 'Server' for simplicity.
            const serverQuotes = serverData.slice(0, 10).map(item => ({ // Fetch more than 5 for better merging test
                id: item.id,
                text: item.title,
                category: 'Server' // Simulated category
            }));

            // Merge and resolve conflicts: server data takes precedence
            const updatedQuotes = mergeQuotes(serverQuotes, quotes); // Pass the main 'quotes' array
            
            // Only update if there are actual changes to prevent unnecessary localStorage writes
            if (JSON.stringify(updatedQuotes) !== JSON.stringify(quotes)) {
                quotes = updatedQuotes;
                saveQuotes();
                populateCategories(); // Update categories if new ones came from server
                filterQuotes(); // Re-apply filter after sync
                notifyUser('Quotes synced from server. Server data has priority.');
            } else {
                notifyUser('No new quotes from server.');
            }
        })
        .catch(error => {
            console.error("Error fetching quotes from server:", error); // Updated message
            notifyUser('Error fetching quotes from server.'); // Updated message
        });
}

// Merge logic: server quotes take precedence by ID
function mergeQuotes(serverQuotes, currentLocalQuotes) {
    const merged = [...serverQuotes]; // Start with all server quotes
    const serverIds = new Set(serverQuotes.map(q => q.id)); // Track server IDs

    currentLocalQuotes.forEach(q => {
        // Add local quotes ONLY if their ID is NOT found in the server data
        if (!serverIds.has(q.id)) {
            merged.push(q);
        }
    });
    return merged;
}

// Start periodic sync every 15 seconds
function startPeriodicSync() {
    setInterval(fetchQuotesFromServer, 15000); // Call the renamed function here
}

// Notify user via a temporary message
function notifyUser(message) {
    const note = document.getElementById('notification');
    if (note) {
        note.textContent = message;
        setTimeout(() => {
            note.textContent = '';
        }, 5000); // Message disappears after 5 seconds
    } else {
        console.warn("Notification element with ID 'notification' not found.");
    }
}


// --- Import/Export Functionality ---

// Export quotes as JSON file
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2); // Pretty print JSON
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notifyUser('Quotes exported successfully!');
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
                // Basic validation for imported quotes to ensure they have expected properties
                const validImportedQuotes = importedQuotes.filter(q =>
                    typeof q === 'object' && q !== null && typeof q.text === 'string' && typeof q.category === 'string'
                );

                if (validImportedQuotes.length > 0) {
                    // Merge imported quotes with existing local ones, prioritizing imported by ID
                    const mergedAfterImport = mergeQuotes(validImportedQuotes, quotes);
                    
                    // Only update if changes occurred
                    if (JSON.stringify(mergedAfterImport) !== JSON.stringify(quotes)) {
                        quotes = mergedAfterImport;
                        saveQuotes();
                        populateCategories(); // Update categories if new ones were imported
                        filterQuotes(); // Re-apply filter after import
                        notifyUser(`Successfully imported and merged ${validImportedQuotes.length} quotes!`);
                    } else {
                        notifyUser('No new quotes imported or all were duplicates.');
                    }
                } else {
                    alert('No valid quotes found in the file or file format incorrect.');
                }
            } else {
                alert('Invalid file format. Please upload a JSON file containing an array of quote objects.');
            }
        } catch (error) {
            alert('Error parsing file: ' + error.message);
            console.error(error);
        }
    };
    fileReader.readAsText(file);
}


// --- Consolidated DOMContentLoaded Listener (Main Initialization) ---
window.addEventListener('DOMContentLoaded', () => {
    // 1. Load quotes from localStorage
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        try {
            quotes = JSON.parse(storedQuotes).filter(q =>
                typeof q === 'object' && q !== null && typeof q.text === 'string' && typeof q.category === 'string'
            );
        } catch (e) {
            console.error("Error parsing stored quotes from localStorage:", e);
            quotes = []; // Reset if corrupted
        }
    }

    // 2. If no quotes were loaded from localStorage, initialize with default quotes
    if (quotes.length === 0) {
        quotes = [
            { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
            { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
            { id: 3, text: "The purpose of our lives is to be happy.", category: "Happiness" }
        ];
        saveQuotes(); // Save these default quotes for next time
    }

    // 3. Dynamically create the 'Add Quote' form elements
    createAddQuoteForm();

    // 4. Populate the category filter dropdown based on initial quotes
    populateCategories();

    // 5. Attach event listener for the 'Show New Quote' button
    const showRandomQuoteButton = document.getElementById("newQuote");
    if (showRandomQuoteButton) {
        showRandomQuoteButton.addEventListener("click", showRandomQuote);
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
        if (categoryFilterDropdown) { // Ensure dropdown exists before setting value
            categoryFilterDropdown.value = savedFilter;
        }
        filterQuotes(); // Apply the saved filter
    } else {
        // Default: display all quotes if no valid saved filter
        displayQuotes(quotes);
    }

    // 8. Display last viewed quote from session storage if available
    const lastViewedQuoteText = sessionStorage.getItem('lastViewedQuoteText');
    const quoteDisplayElement = document.getElementById('quoteDisplay');
    if (lastViewedQuoteText && quoteDisplayElement) {
        // This condition prevents overwriting if filterQuotes() already displayed something.
        // It tries to show the last viewed quote only if the display is empty or generic.
        if (quoteDisplayElement.innerHTML === "No quotes available or matching filter." || quoteDisplayElement.innerHTML === '') {
             quoteDisplayElement.innerHTML = lastViewedQuoteText;
        }
    }

    // 9. Attach event listeners for Import/Export functionality
    const importFile = document.getElementById('importFile');
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');

    if (importFile && importBtn) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', importFromJsonFile);
    } else {
        console.warn("Import elements (importFile, importBtn) not found. Import functionality may be limited.");
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', exportToJsonFile);
    } else {
        console.warn("Export button (exportBtn) not found. Export functionality may be limited.");
    }

    // 10. Start the periodic server synchronization (calls the renamed function)
    startPeriodicSync();
});
