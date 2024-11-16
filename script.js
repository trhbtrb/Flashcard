// script.js

// Data Structures
let shelves = [];
let flashcards = [];

// Define maximum lengths for inputs
const MAX_SHELF_NAME_LENGTH = 50;
const MAX_FLASHCARD_QUESTION_LENGTH = 150;
const MAX_FLASHCARD_ANSWER_LENGTH = 500;

// Utility Function to Escape HTML to Prevent XSS
function escapeHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// Initialize Data from Local Storage
function initializeData() {
    const storedShelves = JSON.parse(localStorage.getItem('shelves'));
    const storedFlashcards = JSON.parse(localStorage.getItem('flashcards'));
    if (storedShelves) shelves = storedShelves;
    if (storedFlashcards) flashcards = storedFlashcards;
    renderAllShelves();
}

// Save Data to Local Storage
function saveData() {
    try {
        localStorage.setItem('shelves', JSON.stringify(shelves));
        localStorage.setItem('flashcards', JSON.stringify(flashcards));
    } catch (error) {
        alert("Failed to save data. Please try again.");
        console.error("Save Data Error:", error);
    }
}

// Render All Shelves and Flashcards
function renderAllShelves() {
    const library = document.querySelector('.library');
    // Clear existing shelves except the "Add New Subject Shelf" button
    library.querySelectorAll('.shelf').forEach(shelf => shelf.remove());

    shelves.forEach(shelf => {
        renderShelf(shelf.id, shelf.title);
        const shelfFlashcards = flashcards.filter(card => card.shelfId === shelf.id);
        shelfFlashcards.forEach(card => {
            renderCard(shelf.id, card.id, card.question, card.answer);
        });
    });
}

// Function to Rename Subject (Deprecated in HTML, kept for legacy)
function renameSubject(shelfId) {
    const newName = prompt("Enter the new subject name:");
    if (newName) {
        document.querySelector(`.shelf[data-shelf-id="${shelfId}"] .shelf-title`).textContent = newName;
    }
}

// Function to Remove Subject (Deprecated in HTML, kept for legacy)
function removeSubject(shelfId) {
    const confirmRemove = confirm("Are you sure you want to remove this subject?");
    if (confirmRemove) {
        document.querySelector(`.shelf[data-shelf-id="${shelfId}"]`).remove();
    }
}

// Render a Single Shelf
function renderShelf(shelfId, title) {
    const library = document.querySelector('.library');

    const shelf = document.createElement('div');
    shelf.className = 'shelf';
    shelf.setAttribute('data-shelf-id', shelfId);
    shelf.innerHTML = `
        <div class="shelf-header">
            <h2 class="shelf-title">${escapeHTML(title)}</h2>
            <div class="shelf-actions">
                <button class="add-card" onclick="openAddCardModal('${shelfId}')">Add New Flashcard</button>
                <button class="rename-subject" onclick="openRenameShelfModal('${shelfId}')">Rename Subject</button>
                <button class="remove-subject" onclick="openRemoveShelfModal('${shelfId}')">Remove Subject</button>
            </div>
        </div>
        <div class="cards-container" data-shelf-id="${shelfId}"></div>
    `;

    library.appendChild(shelf);
}

// Render a Single Flashcard
function renderCard(shelfId, cardId, question, answer) {
    const cardsContainer = document.querySelector(`.cards-container[data-shelf-id="${shelfId}"]`);

    const flashcard = document.createElement('div');
    flashcard.className = 'flashcard';
    flashcard.setAttribute('data-card-id', cardId);
    flashcard.innerHTML = `
        <div class="flashcard-actions">
            <button class="action-btn rename-card-btn" onclick="openRenameCardModal('${cardId}')" title="Rename Flashcard" aria-label="Rename Flashcard">
                <i class="fa-solid fa-pencil"></i>
            </button>
            <button class="action-btn delete-card-btn" onclick="openRemoveCardModal('${cardId}')" title="Delete Flashcard" aria-label="Delete Flashcard">
                <i class="fa-regular fa-xmark"></i>
            </button>
        </div>
        <div class="flashcard-inner" onclick="flipCard(this)">
            <div class="flashcard-front">
                <h3>${escapeHTML(question)}</h3>
            </div>
            <div class="flashcard-back">
                <p>${escapeHTML(answer)}</p>
            </div>
        </div>
    `;
    
    cardsContainer.appendChild(flashcard);
}

// Modal Elements
const addShelfModal = document.getElementById('addShelfModal');
const openAddShelfModalBtn = document.getElementById('openAddShelfModal');
const closeAddShelfModalBtn = document.getElementById('closeAddShelfModal');

const addFlashcardModal = document.getElementById('addFlashcardModal');
const closeAddFlashcardModalBtn = document.getElementById('closeAddFlashcardModal');

const removeShelfModal = document.getElementById('removeShelfModal');
const confirmRemoveShelfBtn = document.getElementById('confirmRemoveShelfBtn');
const cancelRemoveShelfBtn = document.getElementById('cancelRemoveShelfBtn');

const removeCardModal = document.getElementById('removeCardModal');
const confirmRemoveCardBtn = document.getElementById('confirmRemoveCardBtn');
const cancelRemoveCardBtn = document.getElementById('cancelRemoveCardBtn');

const renameShelfModal = document.getElementById('renameShelfModal');
const closeRenameShelfModalBtn = document.getElementById('closeRenameShelfModal');
const cancelRenameShelfBtn = document.getElementById('cancelRenameShelfBtn');
const renameShelfForm = document.getElementById('renameShelfForm');

const renameCardModal = document.getElementById('renameCardModal');
const closeRenameCardModalBtn = document.getElementById('closeRenameCardModal');
const cancelRenameCardBtn = document.getElementById('cancelRenameCardBtn');
const renameCardForm = document.getElementById('renameCardForm');

let currentShelfIdToRemove = null; // To keep track of which shelf to remove
let currentCardIdToRemove = null;   // To keep track of which card to remove

let currentShelfId = null; // To keep track of which shelf we're adding a flashcard to

let currentShelfIdToRename = null; // To keep track of which shelf to rename
let currentCardIdToRename = null;   // To keep track of which card to rename

// Open Add Shelf Modal
openAddShelfModalBtn.onclick = function() {
    addShelfModal.style.display = "block";
    document.getElementById('shelfName').focus(); // Focus on input for accessibility
}

// Close Add Shelf Modal
closeAddShelfModalBtn.onclick = function() {
    addShelfModal.style.display = "none";
    document.getElementById('addShelfForm').reset();
    resetCharCounter('shelfName', 'shelfNameCounter');
}

// Open Add Flashcard Modal
function openAddCardModal(shelfId) {
    addFlashcardModal.style.display = "block";
    currentShelfId = shelfId;
    document.getElementById('flashcardQuestion').focus(); // Focus on question textarea
}

// Close Add Flashcard Modal
closeAddFlashcardModalBtn.onclick = function() {
    addFlashcardModal.style.display = "none";
    document.getElementById('addFlashcardForm').reset();
    resetCharCounter('flashcardQuestion', 'flashcardQuestionCounter');
    resetCharCounter('flashcardAnswer', 'flashcardAnswerCounter');
    currentShelfId = null;
}

// Open Remove Shelf Confirmation Modal
function openRemoveShelfModal(shelfId) {
    removeShelfModal.style.display = "block";
    currentShelfIdToRemove = shelfId;
}

// Confirm Remove Shelf
confirmRemoveShelfBtn.onclick = function() {
    if (currentShelfIdToRemove) {
        removeShelf(currentShelfIdToRemove);
        currentShelfIdToRemove = null;
        removeShelfModal.style.display = "none";
    }
}

// Cancel Remove Shelf
cancelRemoveShelfBtn.onclick = function() {
    currentShelfIdToRemove = null;
    removeShelfModal.style.display = "none";
}

// Open Remove Flashcard Confirmation Modal
function openRemoveCardModal(cardId) {
    removeCardModal.style.display = "block";
    currentCardIdToRemove = cardId;
}

// Confirm Remove Flashcard
confirmRemoveCardBtn.onclick = function() {
    if (currentCardIdToRemove) {
        removeCard(currentCardIdToRemove);
        currentCardIdToRemove = null;
        removeCardModal.style.display = "none";
    }
}

// Cancel Remove Flashcard
cancelRemoveCardBtn.onclick = function() {
    currentCardIdToRemove = null;
    removeCardModal.style.display = "none";
}

// Open Rename Shelf Modal
function openRenameShelfModal(shelfId) {
    renameShelfModal.style.display = "block";
    currentShelfIdToRename = shelfId;
    const shelf = shelves.find(s => s.id === shelfId);
    if (shelf) {
        document.getElementById('newShelfName').value = shelf.title;
        document.getElementById('newShelfName').focus(); // Focus on input for accessibility
        updateCharCounter('newShelfName', 'newShelfNameCounter');
    }
}

// Close Rename Shelf Modal
closeRenameShelfModalBtn.onclick = function() {
    renameShelfModal.style.display = "none";
    renameShelfForm.reset();
    resetCharCounter('newShelfName', 'newShelfNameCounter');
    currentShelfIdToRename = null;
}

// Cancel Rename Shelf
cancelRenameShelfBtn.onclick = function() {
    renameShelfModal.style.display = "none";
    renameShelfForm.reset();
    resetCharCounter('newShelfName', 'newShelfNameCounter');
    currentShelfIdToRename = null;
}

// Handle Rename Shelf Form Submission
renameShelfForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const newName = document.getElementById('newShelfName').value.trim();
    
    // Validate input length
    if (newName.length === 0) {
        alert("Subject name cannot be empty.");
        return;
    }
    if (newName.length > MAX_SHELF_NAME_LENGTH) {
        alert(`Subject name cannot exceed ${MAX_SHELF_NAME_LENGTH} characters.`);
        return;
    }
    
    renameShelf(currentShelfIdToRename, newName);
    renameShelfModal.style.display = "none";
    renameShelfForm.reset();
    resetCharCounter('newShelfName', 'newShelfNameCounter');
    currentShelfIdToRename = null;
});

// Open Rename Flashcard Modal
function openRenameCardModal(cardId) {
    renameCardModal.style.display = "block";
    currentCardIdToRename = cardId;
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
        document.getElementById('newFlashcardQuestion').value = card.question;
        document.getElementById('newFlashcardAnswer').value = card.answer;
        document.getElementById('newFlashcardQuestion').focus(); // Focus on question textarea
        updateCharCounter('newFlashcardQuestion', 'newFlashcardQuestionCounter');
        updateCharCounter('newFlashcardAnswer', 'newFlashcardAnswerCounter');
    }
}

// Close Rename Flashcard Modal
closeRenameCardModalBtn.onclick = function() {
    renameCardModal.style.display = "none";
    renameCardForm.reset();
    resetCharCounter('newFlashcardQuestion', 'newFlashcardQuestionCounter');
    resetCharCounter('newFlashcardAnswer', 'newFlashcardAnswerCounter');
    currentCardIdToRename = null;
}

// Cancel Rename Flashcard
cancelRenameCardBtn.onclick = function() {
    renameCardModal.style.display = "none";
    renameCardForm.reset();
    resetCharCounter('newFlashcardQuestion', 'newFlashcardQuestionCounter');
    resetCharCounter('newFlashcardAnswer', 'newFlashcardAnswerCounter');
    currentCardIdToRename = null;
}

// Handle Rename Flashcard Form Submission
renameCardForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const newQuestion = document.getElementById('newFlashcardQuestion').value.trim();
    const newAnswer = document.getElementById('newFlashcardAnswer').value.trim();
    
    // Validate input lengths
    if (newQuestion.length === 0 || newAnswer.length === 0) {
        alert("Both question and answer are required.");
        return;
    }
    if (newQuestion.length > MAX_FLASHCARD_QUESTION_LENGTH) {
        alert(`Question cannot exceed ${MAX_FLASHCARD_QUESTION_LENGTH} characters.`);
        return;
    }
    if (newAnswer.length > MAX_FLASHCARD_ANSWER_LENGTH) {
        alert(`Answer cannot exceed ${MAX_FLASHCARD_ANSWER_LENGTH} characters.`);
        return;
    }
    
    renameFlashcard(currentCardIdToRename, newQuestion, newAnswer);
    renameCardModal.style.display = "none";
    renameCardForm.reset();
    resetCharCounter('newFlashcardQuestion', 'newFlashcardQuestionCounter');
    resetCharCounter('newFlashcardAnswer', 'newFlashcardAnswerCounter');
    currentCardIdToRename = null;
});

// Close modals when clicking outside of the modal content
window.onclick = function(event) {
    if (event.target == addShelfModal) {
        addShelfModal.style.display = "none";
        document.getElementById('addShelfForm').reset();
        resetCharCounter('shelfName', 'shelfNameCounter');
    }
    if (event.target == addFlashcardModal) {
        addFlashcardModal.style.display = "none";
        document.getElementById('addFlashcardForm').reset();
        resetCharCounter('flashcardQuestion', 'flashcardQuestionCounter');
        resetCharCounter('flashcardAnswer', 'flashcardAnswerCounter');
        currentShelfId = null;
    }
    if (event.target == removeShelfModal) {
        removeShelfModal.style.display = "none";
        currentShelfIdToRemove = null;
    }
    if (event.target == removeCardModal) {
        removeCardModal.style.display = "none";
        currentCardIdToRemove = null;
    }
    if (event.target == renameShelfModal) {
        renameShelfModal.style.display = "none";
        renameShelfForm.reset();
        resetCharCounter('newShelfName', 'newShelfNameCounter');
        currentShelfIdToRename = null;
    }
    if (event.target == renameCardModal) {
        renameCardModal.style.display = "none";
        renameCardForm.reset();
        resetCharCounter('newFlashcardQuestion', 'newFlashcardQuestionCounter');
        resetCharCounter('newFlashcardAnswer', 'newFlashcardAnswerCounter');
        currentCardIdToRename = null;
    }
}

// Handle Add Shelf Form Submission
document.getElementById('addShelfForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const subject = document.getElementById('shelfName').value.trim();
    
    // Validate input length
    if (subject.length === 0) {
        alert("Subject name cannot be empty.");
        return;
    }
    if (subject.length > MAX_SHELF_NAME_LENGTH) {
        alert(`Subject name cannot exceed ${MAX_SHELF_NAME_LENGTH} characters.`);
        return;
    }
    
    addShelf(subject);
    addShelfModal.style.display = "none";
    this.reset();
    resetCharCounter('shelfName', 'shelfNameCounter');
});

// Handle Add Flashcard Form Submission
document.getElementById('addFlashcardForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const question = document.getElementById('flashcardQuestion').value.trim();
    const answer = document.getElementById('flashcardAnswer').value.trim();
    
    // Validate input lengths
    if (question.length === 0 || answer.length === 0) {
        alert("Both question and answer are required.");
        return;
    }
    if (question.length > MAX_FLASHCARD_QUESTION_LENGTH) {
        alert(`Question cannot exceed ${MAX_FLASHCARD_QUESTION_LENGTH} characters.`);
        return;
    }
    if (answer.length > MAX_FLASHCARD_ANSWER_LENGTH) {
        alert(`Answer cannot exceed ${MAX_FLASHCARD_ANSWER_LENGTH} characters.`);
        return;
    }
    if (!currentShelfId) {
        alert("No shelf selected.");
        return;
    }
    addCard(currentShelfId, question, answer);
    addFlashcardModal.style.display = "none";
    this.reset();
    resetCharCounter('flashcardQuestion', 'flashcardQuestionCounter');
    resetCharCounter('flashcardAnswer', 'flashcardAnswerCounter');
    currentShelfId = null;
});

// Function to Add a New Shelf
function addShelf(subject) {
    const shelfId = Date.now().toString(); // Unique ID based on timestamp
    shelves.push({ id: shelfId, title: subject });
    saveData();
    renderShelf(shelfId, subject);
}

// Function to Add a New Flashcard
function addCard(shelfId, question, answer) {
    const cardId = Date.now().toString(); // Unique ID based on timestamp
    flashcards.push({ id: cardId, shelfId: shelfId, question: question, answer: answer });
    saveData();
    renderCard(shelfId, cardId, question, answer);
}

// Function to Remove a Shelf
function removeShelf(shelfId) {
    // Remove shelf from shelves array
    shelves = shelves.filter(shelf => shelf.id !== shelfId);
    
    // Remove associated flashcards
    flashcards = flashcards.filter(card => card.shelfId !== shelfId);
    
    // Save updated data
    saveData();
    
    // Remove shelf from DOM
    const shelfElement = document.querySelector(`.shelf[data-shelf-id="${shelfId}"]`);
    if (shelfElement) shelfElement.remove();
}

// Function to Remove a Flashcard
function removeCard(cardId) {
    // Remove flashcard from flashcards array
    flashcards = flashcards.filter(card => card.id !== cardId);
    
    // Save updated data
    saveData();
    
    // Remove flashcard from DOM
    const flashcardElement = document.querySelector(`.flashcard[data-card-id="${cardId}"]`);
    if (flashcardElement) flashcardElement.remove();
}

// Function to Rename a Shelf
function renameShelf(shelfId, newName) {
    const shelf = shelves.find(s => s.id === shelfId);
    if (shelf) {
        shelf.title = newName;
        saveData();
        // Update DOM
        const shelfTitleElement = document.querySelector(`.shelf[data-shelf-id="${shelfId}"] .shelf-title`);
        if (shelfTitleElement) {
            shelfTitleElement.innerHTML = escapeHTML(newName);
        }
    }
}

// Function to Rename a Flashcard
function renameFlashcard(cardId, newQuestion, newAnswer) {
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
        card.question = newQuestion;
        card.answer = newAnswer;
        saveData();
        // Update DOM
        const flashcardElement = document.querySelector(`.flashcard[data-card-id="${cardId}"]`);
        if (flashcardElement) {
            flashcardElement.querySelector('.flashcard-front h3').innerHTML = escapeHTML(newQuestion);
            flashcardElement.querySelector('.flashcard-back p').innerHTML = escapeHTML(newAnswer);
        }
    }
}

// Function to Flip a Flashcard
function flipCard(element) {
    element.parentElement.classList.toggle('flipped');
}

// Utility Function to Prevent Pasting Excessive Characters
function enforceMaxLength(element, maxLength) {
    element.addEventListener('paste', function(e) {
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        if ((element.value.length + paste.length) > maxLength) {
            e.preventDefault();
            alert(`Input cannot exceed ${maxLength} characters.`);
        }
    });
}

// Utility Function to Update Character Counters
function updateCounter(element, counterElement, maxLength) {
    element.addEventListener('input', function() {
        const remaining = maxLength - element.value.length;
        counterElement.textContent = `${remaining} characters remaining`;
        
        // Optional: Add warning color when remaining characters are low
        if (remaining <= 10) {
            counterElement.classList.add('warning');
        } else {
            counterElement.classList.remove('warning');
        }
    });
}

// Utility Function to Reset Character Counters
function resetCharCounter(inputId, counterId) {
    const input = document.getElementById(inputId);
    const counter = document.getElementById(counterId);
    if (input && counter) {
        const maxLength = parseInt(input.getAttribute('maxlength'), 10);
        const remaining = maxLength - input.value.length;
        counter.textContent = `${remaining} characters remaining`;
        counter.classList.remove('warning');
    }
}

// Initialize Data and Apply Validations on Page Load
document.addEventListener('DOMContentLoaded', function() {
    initializeData();

    // Select relevant input fields and their counters
    const shelfNameInput = document.getElementById('shelfName');
    const shelfNameCounter = document.getElementById('shelfNameCounter');
    
    const flashcardQuestionTextarea = document.getElementById('flashcardQuestion');
    const flashcardQuestionCounter = document.getElementById('flashcardQuestionCounter');
    
    const flashcardAnswerTextarea = document.getElementById('flashcardAnswer');
    const flashcardAnswerCounter = document.getElementById('flashcardAnswerCounter');
    
    const newShelfNameInput = document.getElementById('newShelfName');
    const newShelfNameCounter = document.getElementById('newShelfNameCounter');
    
    const newFlashcardQuestionTextarea = document.getElementById('newFlashcardQuestion');
    const newFlashcardQuestionCounter = document.getElementById('newFlashcardQuestionCounter');
    
    const newFlashcardAnswerTextarea = document.getElementById('newFlashcardAnswer');
    const newFlashcardAnswerCounter = document.getElementById('newFlashcardAnswerCounter');
    
    // Apply maxlength enforcement and character counters
    if (shelfNameInput && shelfNameCounter) {
        enforceMaxLength(shelfNameInput, MAX_SHELF_NAME_LENGTH);
        updateCounter(shelfNameInput, shelfNameCounter, MAX_SHELF_NAME_LENGTH);
    }
    if (flashcardQuestionTextarea && flashcardQuestionCounter) {
        enforceMaxLength(flashcardQuestionTextarea, MAX_FLASHCARD_QUESTION_LENGTH);
        updateCounter(flashcardQuestionTextarea, flashcardQuestionCounter, MAX_FLASHCARD_QUESTION_LENGTH);
    }
    if (flashcardAnswerTextarea && flashcardAnswerCounter) {
        enforceMaxLength(flashcardAnswerTextarea, MAX_FLASHCARD_ANSWER_LENGTH);
        updateCounter(flashcardAnswerTextarea, flashcardAnswerCounter, MAX_FLASHCARD_ANSWER_LENGTH);
    }
    if (newShelfNameInput && newShelfNameCounter) {
        enforceMaxLength(newShelfNameInput, MAX_SHELF_NAME_LENGTH);
        updateCounter(newShelfNameInput, newShelfNameCounter, MAX_SHELF_NAME_LENGTH);
    }
    if (newFlashcardQuestionTextarea && newFlashcardQuestionCounter) {
        enforceMaxLength(newFlashcardQuestionTextarea, MAX_FLASHCARD_QUESTION_LENGTH);
        updateCounter(newFlashcardQuestionTextarea, newFlashcardQuestionCounter, MAX_FLASHCARD_QUESTION_LENGTH);
    }
    if (newFlashcardAnswerTextarea && newFlashcardAnswerCounter) {
        enforceMaxLength(newFlashcardAnswerTextarea, MAX_FLASHCARD_ANSWER_LENGTH);
        updateCounter(newFlashcardAnswerTextarea, newFlashcardAnswerCounter, MAX_FLASHCARD_ANSWER_LENGTH);
    }
});
