// Тема
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  try { localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light'); } catch(e){}
});
// Восстановить тему
try {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') document.body.classList.remove('dark');
} catch(e){}

// Аккордеон
function setMaxHeight(el, open) {
  if (open) el.style.maxHeight = el.scrollHeight + 'px';
  else el.style.maxHeight = '0px';
}

function scrollToPanel(panel){
  // Прокрутка к началу панели с учётом scroll-margin-top
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function saveState() {
  try {
    const openIds = Array.from(document.querySelectorAll('.content-section.open')).map(p => p.id);
    localStorage.setItem('openPanels', JSON.stringify(openIds));
  } catch(e){}
}

function restoreState() {
  try {
    const openIds = JSON.parse(localStorage.getItem('openPanels') || '[]');
    openIds.forEach(id => {
      const panel = document.getElementById(id);
      const btn = panel?.previousElementSibling;
      if (panel && btn) {
        panel.classList.add('open');
        setMaxHeight(panel, true);
        btn.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  } catch(e){}
}

document.querySelectorAll('.acc-item').forEach(item => {
  const btn = item.querySelector('.menu-btn');
  const panel = item.querySelector('.content-section');

  // Инициализация в закрытом состоянии
  setMaxHeight(panel, false);

  btn.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    setMaxHeight(panel, isOpen);
    saveState();
    if (isOpen) scrollToPanel(panel);
  });
});

// При изменении размера корректируем высоту открытых панелей
window.addEventListener('resize', () => {
  document.querySelectorAll('.content-section.open').forEach(panel => {
    panel.style.maxHeight = panel.scrollHeight + 'px';
  });
});

// Восстановить открытые панели
restoreState();
