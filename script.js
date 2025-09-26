document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('calcBtn');
  const sq = document.getElementById('sqInput');
  const h = document.getElementById('hInput');
  const out = document.getElementById('calcResult');

  function fmt(num, digits=2){ return Number(num).toFixed(digits).replace('.', ','); }

  function calc(){
    const S = parseFloat((sq.value||'').replace(',', '.'));
    const H = parseFloat((h.value||'').replace(',', '.'));
    if(!S || !H || S<=0 || H<=0){ out.textContent='Введите корректные значения площади и высоты.'; return; }
    const kW = S * H * 35 * 1.2 / 1000;
    const BTU = kW * 3412;
    out.innerHTML = '<b>Необходимая мощность:</b> ' + fmt(kW) + ' кВт · ' + Math.round(BTU).toLocaleString('ru-RU') + ' BTU/h';
  }

  if(btn){ btn.addEventListener('click', calc); }
  [sq,h].forEach(i => i && i.addEventListener('keypress', e=>{ if(e.key==='Enter'){ e.preventDefault(); calc(); }}));
});
/* v1.111 */
