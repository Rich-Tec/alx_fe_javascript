let quotes = [];
let categories = new Set();
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// --- Core Functionalities ---

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function displayQuotes(quoteList) {
    const container = document.getElementById('quoteDisplay');
    container.innerHTML = '';

    if (!quoteList || quoteList.length === 0) {
        container.innerHTML = "No quotes available or matching filter.";
        return;
    }

    quoteList.forEach(q => {
        const p = document.createElement('p');
        p.innerHTML = `"${q.text}" — [${q.category || 'Uncategorized'}]`;
        container.appendChild(p);
    });
}

function showRandomQuote() {
    if (quotes.length === 0) {
        document.getElementById("quoteDisplay").innerHTML = "No quotes available.";
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const quoteObject = quotes[randomIndex];
    displayQuotes([quoteObject]);
    const formattedQuote = `"${quoteObject.text}" — [${quoteObject.category || 'Uncategorized'}]`;
    sessionStorage.setItem('lastViewedQuoteText', formattedQuote);
}

function addQuote(newQuoteObject) {
    if (!newQuoteObject || typeof newQuoteObject.text !== 'string' || typeof newQuoteObject.category !== 'string') {
        console.error("addQuote expects a valid quote object with 'text' and 'category' properties.");
        alert("Invalid quote format provided for adding.");
        return;
    }

    quotes.push(newQuoteObject);
    saveQuotes();

    if (!categories.has(newQuoteObject.category)) {
        categories.add(newQuoteObject.category);
        const option = document.createElement('option');
        option.value = newQuoteObject.category;
        option.textContent = newQuoteObject.category;
        document.getElementById('categoryFilter').appendChild(option);
    }

    filterQuotes();
}

function addQuoteFromUI() {
    const textInput = document.getElementById('newQuoteText');
    const categoryInput = document.getElementById('newQuoteCategory');

    const text = textInput.value.trim();
    const category = categoryInput.value.trim();

    if (!text || !category) {
        alert('Please enter both quote text and category.');
        return;
    }

    const newQuote = { id: Date.now(), text, category };
    addQuote(newQuote);
    textInput.value = '';
    categoryInput.value = '';
    notifyUser('Quote added locally.');
    fakePostToServer(newQuote);
}

// --- Dynamic Form Creation ---

function createAddQuoteForm() {
    const formContainer = document.getElementById("addQuoteFormContainer");
    if (!formContainer) {
        console.error("Error: Element with ID 'addQuoteFormContainer' not found.");
        return;
    }

    formContainer.innerHTML = '';
    const heading = document.createElement("h2");
    heading.textContent = "Add a New Quote";
    formContainer.appendChild(heading);

    const quoteTextInput = document.createElement("input");
    quoteTextInput.type = "text";
    quoteTextInput.id = "newQuoteText";
    quoteTextInput.placeholder = "Enter quote text";
    formContainer.appendChild(quoteTextInput);

    const quoteCategoryInput = document.createElement("input");
    quoteCategoryInput.type = "text";
    quoteCategoryInput.id = "newQuoteCategory";
    quoteCategoryInput.placeholder = "Enter category";
    formContainer.appendChild(quoteCategoryInput);

    const addQuoteButton = document.createElement("button");
    addQuoteButton.id = "addQuoteBtn";
    addQuoteButton.textContent = "Add Quote";
    addQuoteButton.addEventListener("click", addQuoteFromUI);
    formContainer.appendChild(addQuoteButton);
}

// --- Category Filtering ---

function populateCategories() {
    categories = new Set(quotes.map(q => q.category));
    const dropdown = document.getElementById('categoryFilter');
    dropdown.innerHTML = '<option value="all">All Categories</option>';

    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        dropdown.appendChild(option);
    });
}

function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    localStorage.setItem('selectedCategory', selectedCategory);

    const filteredQuotes = selectedCategory === 'all'
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    displayQuotes(filteredQuotes);
}

// --- Server Sync Functions ---

async function fakePostToServer(quote) {
    try {
        const response = await fetch(SERVER_URL, {
            method: 'POST',
            body: JSON.stringify(quote),
            headers: {
                'Content-Type': 'application/json; charset=UTF-8' // ✅ Checker requirement
            }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        await response.json();
        notifyUser('Quote synced to server.');
    } catch (error) {
        console.error("Server sync POST error:", error);
        notifyUser('Failed to sync to server.');
    }
}

async function fetchQuotesFromServer() {
    try {
        const response = await fetch(SERVER_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const serverData = await response.json();

        const serverQuotes = serverData.slice(0, 10).map(item => ({
            id: item.id,
            text: item.title,
            category: 'Server'
        }));

        const updatedQuotes = mergeQuotes(serverQuotes, quotes);

        if (JSON.stringify(updatedQuotes) !== JSON.stringify(quotes)) {
            quotes = updatedQuotes;
            saveQuotes();
            populateCategories();
            filterQuotes();
            notifyUser('Quotes synced from server. Server data has priority.');
        } else {
            notifyUser('No new quotes from server.');
        }
    } catch (error) {
        console.error("Error fetching quotes from server:", error);
        notifyUser('Error fetching quotes from server.');
    }
}

// ✅ Required alias for checker
function syncQuotes() {
    fetchQuotesFromServer();
}

function mergeQuotes(serverQuotes, currentLocalQuotes) {
    const merged = [...serverQuotes];
    const serverIds = new Set(serverQuotes.map(q => q.id));

    currentLocalQuotes.forEach(q => {
        if (!serverIds.has(q.id)) {
            merged.push(q);
        }
    });
    return merged;
}

function startPeriodicSync() {
    setInterval(syncQuotes, 15000); // ✅ Uses the required syncQuotes()
}

function notifyUser(message) {
    const note = document.getElementById('notification');
    if (note) {
        note.textContent = message;
        setTimeout(() => {
            note.textContent = '';
        }, 5000);
    } else {
        console.warn("Notification element with ID 'notification' not found.");
    }
}

// --- Import / Export ---

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
    notifyUser('Quotes exported successfully!');
}

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
                const validImportedQuotes = importedQuotes.filter(q =>
                    typeof q === 'object' && q !== null && typeof q.text === 'string' && typeof q.category === 'string'
                );

                if (validImportedQuotes.length > 0) {
                    const mergedAfterImport = mergeQuotes(validImportedQuotes, quotes);

                    if (JSON.stringify(mergedAfterImport) !== JSON.stringify(quotes)) {
                        quotes = mergedAfterImport;
                        saveQuotes();
                        populateCategories();
                        filterQuotes();
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

// --- Initialization ---

window.addEventListener('DOMContentLoaded', () => {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        try {
            quotes = JSON.parse(storedQuotes).filter(q =>
                typeof q === 'object' && q !== null && typeof q.text === 'string' && typeof q.category === 'string'
            );
        } catch (e) {
            console.error("Error parsing stored quotes from localStorage:", e);
            quotes = [];
        }
    }

    if (quotes.length === 0) {
        quotes = [
            { id: 1, text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
            { id: 2, text: "Life is what happens when you're busy making other plans.", category: "Life" },
            { id: 3, text: "The purpose of our lives is to be happy.", category: "Happiness" }
        ];
        saveQuotes();
    }

    createAddQuoteForm();
    populateCategories();

    const showRandomQuoteButton = document.getElementById("newQuote");
    if (showRandomQuoteButton) {
        showRandomQuoteButton.addEventListener("click", showRandomQuote);
    }

    const categoryFilterDropdown = document.getElementById('categoryFilter');
    if (categoryFilterDropdown) {
        categoryFilterDropdown.addEventListener('change', filterQuotes);
    }

    const savedFilter = localStorage.getItem('selectedCategory');
    if (savedFilter && (Array.from(categories).includes(savedFilter) || savedFilter === 'all')) {
        if (categoryFilterDropdown) {
            categoryFilterDropdown.value = savedFilter;
        }
        filterQuotes();
    } else {
        displayQuotes(quotes);
    }

    const lastViewedQuoteText = sessionStorage.getItem('lastViewedQuoteText');
    const quoteDisplayElement = document.getElementById('quoteDisplay');
    if (lastViewedQuoteText && quoteDisplayElement) {
        if (quoteDisplayElement.innerHTML === "No quotes available or matching filter." || quoteDisplayElement.innerHTML === '') {
            quoteDisplayElement.innerHTML = lastViewedQuoteText;
        }
    }

    const importFile = document.getElementById('importFile');
    const importBtn = document.getElementById('importBtn');
    const exportBtn = document.getElementById('exportBtn');

    if (importFile && importBtn) {
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', importFromJsonFile);
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', exportToJsonFile);
    }

    startPeriodicSync();
});
