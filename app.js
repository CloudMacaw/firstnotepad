let notes = JSON.parse(localStorage.getItem('notes')) || [];
let bin = JSON.parse(localStorage.getItem('bin')) || [];
let currentNoteId = null;
let viewingBin = false;

// --- Theme Toggle ---
const themeToggle = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);

themeToggle.addEventListener('click', () => {
    const newTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// --- Render Notes ---
function renderNotes() {
    const list = document.getElementById('note-list');
    list.innerHTML = '';
    const source = viewingBin ? bin : notes;

    source.forEach(note => {
        const div = document.createElement('div');
        div.className = 'note-card';
        div.innerHTML = `<h3>${note.title || 'Untitled'}</h3><p>${note.body ? note.body.substring(0, 50) : ''}</p>`;
        div.onclick = () => openNote(note.id);
        list.appendChild(div);
    });
}

function openNote(id) {
    const source = viewingBin ? bin : notes;
    const note = source.find(n => n.id === id);
    if (!note) return;
    currentNoteId = id;
    document.getElementById('note-title').value = note.title || '';
    document.getElementById('note-body').value = note.body || '';
    document.getElementById('note-list').classList.add('hidden');
    document.getElementById('editor').classList.remove('hidden');
}

// --- Save, Delete, Restore ---
document.getElementById('save-btn').onclick = () => {
    if (!currentNoteId) return;
    const source = viewingBin ? bin : notes;
    const note = source.find(n => n.id === currentNoteId);
    note.title = document.getElementById('note-title').value;
    note.body = document.getElementById('note-body').value;
    saveData();
    goBack();
};

document.getElementById('delete-btn').onclick = () => {
    if (!currentNoteId) return;
    if (viewingBin) {
        bin = bin.filter(n => n.id !== currentNoteId); // Permanently delete
    } else {
        const note = notes.find(n => n.id === currentNoteId);
        notes = notes.filter(n => n.id !== currentNoteId);
        bin.push(note); // Move to recycle bin
    }
    saveData();
    goBack();
};

function goBack() {
    currentNoteId = null;
    document.getElementById('editor').classList.add('hidden');
    document.getElementById('note-list').classList.remove('hidden');
    renderNotes();
}

function saveData() {
    localStorage.setItem('notes', JSON.stringify(notes));
    localStorage.setItem('bin', JSON.stringify(bin));
}

// --- Navigation ---
document.getElementById('new-note-btn').onclick = () => {
    viewingBin = false;
    const newNote = { id: Date.now(), title: '', body: '' };
    notes.push(newNote);
    saveData();
    renderNotes();
    openNote(newNote.id);
};

document.getElementById('bin-btn').onclick = () => {
    viewingBin = true;
    renderNotes();
};

// Initial render
renderNotes();

// Register service worker for offline/install support (relative path for GitHub Pages)
navigator.serviceWorker.register('sw.js').catch(err => console.log('SW registration skipped:', err));
