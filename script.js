// Тема
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  try { localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light'); } catch(e){}
});
try { const savedTheme = localStorage.getItem('theme'); if (savedTheme === 'light') document.body.classList.remove('dark'); } catch(e){}

/* Аккордеон */
function setMaxHeight(el, open) { if (open) el.style.maxHeight = el.scrollHeight + 'px'; else el.style.maxHeight = '0px'; }
function scrollToPanel(panel){ panel.scrollIntoView({ behavior:'smooth', block:'start' }); }
function saveState(){ try { const openIds = Array.from(document.querySelectorAll('.content-section.open')).map(p => p.id); localStorage.setItem('openPanels', JSON.stringify(openIds)); } catch(e){} }
function restoreState(){ try { const openIds = JSON.parse(localStorage.getItem('openPanels') || '[]'); openIds.forEach(id => { const panel = document.getElementById(id); const btn = panel?.previousElementSibling; if (panel && btn) { panel.classList.add('open'); setMaxHeight(panel, true); btn.classList.add('active'); btn.setAttribute('aria-expanded', 'true'); } }); } catch(e){} }

document.querySelectorAll('.acc-item').forEach(item => {
  const btn = item.querySelector('.menu-btn');
  const panel = item.querySelector('.content-section');
  if (!btn || !panel) return;
  setMaxHeight(panel, false);
  btn.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    btn.classList.toggle('active', isOpen);
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    setMaxHeight(panel, isOpen);
    try { saveState(); } catch(e) {}
    if (isOpen) scrollToPanel(panel);
  });
});
window.addEventListener('resize', () => {
  document.querySelectorAll('.content-section.open').forEach(panel => {
    panel.style.maxHeight = panel.scrollHeight + 'px';
  });
});
restoreState();

// ===== Калькулятор стоимости =====
function format(n) { return n.toLocaleString('ru-RU'); }
function _parseMoney(text){ const d = String(text||'').replace(/[^\d]/g,''); return d?parseInt(d,10):0; }

function rowHTML(r){
  return `
    <tr>
      <td data-label="Наименование работ">${r.name}</td>
      <td data-label="Кол-во"><input type="number" inputmode="numeric" pattern="[0-9]*" min="0" step="1" value=""></td>
      <td data-label="Ед. изм.">${r.unit}</td>
      <td class="price" data-label="Цена ед.">${format(r.price)} ₽</td>
      <td class="sum" data-sum="0" data-label="Цена">0 ₽</td>
    </tr>`;
}

function buildMainWithExtras(MAIN){
  const tbody = document.querySelector('#table-main tbody');
  const EXTRA_MAP = {
    '07-09': { name:'Дополнительная трасса (за 1 м) 07–09', unit:'п.м.', price:1500 },
    '12':    { name:'Дополнительная трасса (за 1 м) 12',     unit:'п.м.', price:1700 },
    '18':    { name:'Дополнительная трасса (за 1 м) 18',     unit:'п.м.', price:1700 }
  };
  const keyOf = (name)=> name.includes('07-09') ? '07-09' : (name.includes('12') && !name.includes('012')) ? '12' : '18';
  const rows = [];
  MAIN.forEach(m => { rows.push(m); rows.push(EXTRA_MAP[keyOf(m.name)]); });
  tbody.innerHTML = rows.map(r => rowHTML(r)).join('');
}

function buildTable(id, rows){ const tbody = document.querySelector(id + ' tbody'); tbody.innerHTML = rows.map(r=>rowHTML(r)).join(''); }

function recalc(){
  let total = 0;
  document.querySelectorAll('#table-main tbody tr, #table-extra tbody tr').forEach(tr => {
    const inp = tr.querySelector('input[type="number"]');
    if (!inp) return;
    const qty = parseInt(inp.value || '0', 10) || 0;
    const unit = tr.querySelector('td:nth-child(3)')?.textContent.trim() || '';
    const unitPrice = _parseMoney(tr.querySelector('.price')?.textContent);
    const sum = _parseMoney(tr.querySelector('.sum')?.textContent);
    if (qty > 0 && sum > 0) rows.push({name, qty, unitPrice, sum});
  });
  const wrap = document.getElementById('estimate-body');
  if (!wrap) return;
  if (!rows.length){
    wrap.innerHTML = '<p class="kicker">Пока ничего не выбрано. Укажите количество и нажмите «Рассчёт».</p>';
  } else {
    let total = 0;
    const items = rows.map(r => { total += r.sum; return (
      `<tr>
        <td>${r.name}</td>
        <td style="text-align:center;">${r.qty}</td>
        <td style="white-space:nowrap;">${r.unitPrice.toLocaleString('ru-RU')} ₽</td>
        <td style="white-space:nowrap; text-align:right;"><b>${r.sum.toLocaleString('ru-RU')} ₽</b></td>
      </tr>`);
    }).join('');
    wrap.innerHTML = `
      <div class="kicker" style="margin-bottom:8px;">Автосформированный расчёт</div>
      <div style="overflow:auto;">
        <table class="calc-table">
          <thead><tr><th>Позиция</th><th>Кол-во</th><th>Цена ед.</th><th>Сумма</th></tr></thead>
          <tbody>${items}</tbody>
        </table>
      </div>
      <div class="total-line" style="margin-top:10px;"><b>Итого по смете:</b> ${total.toLocaleString('ru-RU')} ₽</div>`;
  }
  document.getElementById('estimate')?.classList.remove('hidden');
}

function estimateToPlainText(){
  const wrap = document.getElementById('estimate-body'); if (!wrap) return '';
  const rows = []; const table = wrap.querySelector('table'); if (!table) return '';
  table.querySelectorAll('tbody tr').forEach(tr => {
    const name = tr.children[0]?.textContent.trim() || '';
    const qty  = tr.children[1]?.textContent.trim() || '';
    const price= tr.children[2]?.textContent.trim() || '';
    const sum  = tr.children[3]?.textContent.trim() || '';
    rows.push(`${name} — ${qty} шт. × ${price} = ${sum}`);
  });
  const totalLine = wrap.querySelector('.total-line')?.textContent.replace(/\s+/g,' ').trim() || '';
  const address = document.getElementById('estimate-address')?.value?.trim();
  return (rows.join('\n') + (rows.length ? `\n${totalLine}` : '') + (address ? `\nАдрес: ${address}` : '')).trim();
}

function attachEstimateUI(){
  const btnEstimate = document.getElementById('btn-estimate');
  const btnCopy = document.getElementById('btn-copy-estimate');
  const btnPdf = document.getElementById('btn-estimate-pdf');
  if (btnEstimate){ btnEstimate.addEventListener('click', () => { buildEstimate(); }); }
  if (btnCopy){
    btnCopy.addEventListener('click', async () => {
      if (!document.querySelector('#estimate-body table')) buildEstimate();
      const text = estimateToPlainText();
      if (!text){ btnCopy.textContent='Нет данных'; setTimeout(()=>btnCopy.textContent='Скопировать',1200); return; }
      try { await navigator.clipboard.writeText(text); btnCopy.textContent='Скопировано ✅'; setTimeout(()=>btnCopy.textContent='Скопировать',1500); }
      catch(e){
        const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
        ta.select(); try { document.execCommand('copy'); } catch(e2){} document.body.removeChild(ta);
        btnCopy.textContent='Скопировано ✅'; setTimeout(()=>btnCopy.textContent='Скопировать',1500);
      }
    });
  }
  if (btnPdf){
    btnPdf.addEventListener('click', () => {
      if (!document.querySelector('#estimate-body table')) buildEstimate();
      const wrap = document.getElementById('estimate-body');
      const address = document.getElementById('estimate-address')?.value?.trim() || '';
      if (!wrap || !wrap.querySelector('table')) { btnPdf.textContent='Нет данных'; setTimeout(()=>btnPdf.textContent='Скачать PDF',1200); return; }
      const inner = wrap.innerHTML.replace(/<\/script>/ig, '<\\/script>');
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Смета</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 24px; }
          h1 { margin: 0 0 10px; font-size: 20px; }
          .meta { font-size: 12px; opacity: .8; margin-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; margin-top: 6px; }
          th, td { border-bottom: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background: #f5f5f5; }
        </style></head><body>
        <h1>Смета</h1>
        <div class="meta">Дата: ${new Date().toLocaleString('ru-RU')}</div>
        ${address ? `<div class="meta"><b>Адрес:</b> ${address}</div>` : ''}
        ${inner}
        <script>window.print();<\/script>
        </body></html>`;
      const w = window.open('', '_blank'); if (!w) return;
      w.document.open(); w.document.write(html); w.document.close();
    });
  }
}
document.addEventListener('DOMContentLoaded', attachEstimateUI);

// ---- Scroll FAB (умная) ----
function initScrollFab(){
  const fab = document.getElementById('scrollFab');
  if (!fab) return;
  const update = () => {
    const doc = document.documentElement;
    const maxScroll = Math.max(document.body.scrollHeight, doc.scrollHeight) - window.innerHeight;
    const y = window.scrollY || doc.scrollTop || 0;
    if (maxScroll < 200) { fab.style.display = 'none'; return; } else { fab.style.display = 'grid'; }
    const pos = y / (maxScroll || 1);
    if (pos < 0.20) { fab.dataset.mode = 'down'; fab.textContent = '↓'; fab.title = 'Вниз'; fab.setAttribute('aria-label','Прокрутить вниз'); }
    else { fab.dataset.mode = 'up'; fab.textContent = '↑'; fab.title = 'Вверх'; fab.setAttribute('aria-label','Прокрутить вверх'); }
  };
  update();
  window.addEventListener('scroll', update, {passive:true});
  window.addEventListener('resize', update);
  fab.addEventListener('click', () => {
    if (fab.dataset.mode === 'up'){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const doc = document.documentElement;
      const bottom = Math.max(document.body.scrollHeight, doc.scrollHeight) - window.innerHeight;
      window.scrollTo({ top: bottom, behavior: 'smooth' });
    }
  });
}
document.addEventListener('DOMContentLoaded', initScrollFab);
