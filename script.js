function toggleBlock(id) {
    const block = document.getElementById(id);
    block.style.display = block.style.display === "block" ? "none" : "block";
}

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light');
    body.classList.toggle('dark');
});
