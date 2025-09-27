/* Аккордеон + калькулятор мощности */
function setMaxHeight(el, open){ el.style.maxHeight = open ? (el.scrollHeight + 'px') : '0px'; }
function scrollToPanel(panel){ try{ panel.scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){} }
function saveState(){
  try{
    const openIds = Array.from(document.querySelectorAll('.content-section.open')).map(p=>p.id).filter(Boolean);
    localStorage.setItem('openPanels', JSON.stringify(openIds));
  }catch(e){}
}
function restoreState(){
  try{
    const openIds = JSON.parse(localStorage.getItem('openPanels')||'[]');
    openIds.forEach(id=>{
      const panel = document.getElementById(id);
      if(panel){
        const btn = panel.parentElement && panel.parentElement.querySelector ? panel.parentElement.querySelector('.menu-btn') : null;
        panel.classList.add('open');
        setMaxHeight(panel, true);
        if(btn) btn.setAttribute('aria-expanded','true');
      }
    });
  }catch(e){}
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.acc-item').forEach(item => {
    const btn = item.querySelector('.menu-btn');
    const panel = item.querySelector('.content-section');
    if(!btn || !panel) return;
    setMaxHeight(panel, panel.classList.contains('open') || btn.getAttribute('aria-expanded')==='true');
    btn.addEventListener('click', () => {
      const isOpen = panel.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      setMaxHeight(panel, isOpen);
      saveState();
      if(isOpen) scrollToPanel(panel);
    });
  });
  restoreState();

  // Калькулятор
  const sq = document.getElementById('sqInput');
  const h = document.getElementById('hInput');
  const btn = document.getElementById('calcBtn');
  const out = document.getElementById('calcResult');

  function fmt(num, digits=2){ return Number(num).toFixed(digits).replace('.', ','); }

  function calc(){
    const S = parseFloat((sq && sq.value || '').replace(',', '.'));
    const H = parseFloat((h && h.value || '').replace(',', '.'));
    if(!S || !H || S <= 0 || H <= 0){
      out.textContent = 'Введите корректные значения площади и высоты.';
      return;
    }
    // 35 Вт на 1 м³
    const kW = S * H * 0.035;
    const BTU = kW * 3412;
    out.innerHTML = '<b>Необходимая мощность:</b> ' + fmt(kW) + ' кВт · ' + Math.round(BTU).toLocaleString('ru-RU') + ' BTU';
  }

  if(btn){ btn.addEventListener('click', calc); }
  [sq,h].forEach(i => i && i.addEventListener('keypress', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); calc(); } }));
});

window.addEventListener('resize', () => {
  document.querySelectorAll('.content-section.open').forEach(panel => setMaxHeight(panel, true));
});

/* v1.109 */
