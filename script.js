function showSection(id) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});


// ---- Калькулятор мощности (по площади и высоте) ----
function pcClassFromKw(kw){
  // Подбор ближайшего стандартного класса
  if (kw <= 2.3) return {btu:7000,  label:'07', kw:2.1};
  if (kw <= 2.9) return {btu:9000,  label:'09', kw:2.6};
  if (kw <= 4.0) return {btu:12000, label:'12', kw:3.5};
  if (kw <= 5.6) return {btu:18000, label:'18', kw:5.0};
  if (kw <= 7.0) return {btu:24000, label:'24', kw:7.0};
  return {btu:30000, label:'30', kw:8.8};
}
function pcCalc(){
  const a = document.getElementById('pc-area');
  const h = document.getElementById('pc-height');
  const res = document.getElementById('pc-result');
  const out = document.getElementById('pc-summary');
  if (!a || !h || !res || !out) return;
  const area = parseFloat((a.value||'').replace(',','.'));
  const height = parseFloat((h.value||'').replace(',','.'));
  if (!area || !height){ out.innerHTML = '<span class="kicker">Введите площадь и высоту.</span>'; res.style.display='block'; return; }
  // Базовое правило: 1 кВт на 10 м² при 2.7 м. Масштабируем по высоте.
  const baseKwPerM2 = 0.1; // кВт на м² при 2.7 м
  const coeffH = height / 2.7;
  const needKw = +(area * baseKwPerM2 * coeffH).toFixed(2);
  const cls = pcClassFromKw(needKw);
  const needBTU = Math.round(needKw * 3412);
  out.innerHTML =
    `<p><b>Оценочная требуемая мощность:</b> ~ ${needKw.toLocaleString('ru-RU')} кВт (${needBTU.toLocaleString('ru-RU')} BTU)</p>
     <p><b>Рекомендованный класс кондиционера:</b> ${cls.label} (${cls.btu.toLocaleString('ru-RU')} BTU, ≈ ${cls.kw.toLocaleString('ru-RU')} кВт)</p>
     <p class="kicker">Примечание: реальные теплопритоки зависят от солнца, остекления, людей и техники. При сомнениях выбирайте класс на ступень выше.</p>`;
  res.style.display='block';
}
function pcWire(){
  const btn = document.getElementById('pc-run');
  const clr = document.getElementById('pc-clear');
  if (btn){ btn.addEventListener('click', pcCalc); }
  if (clr){ clr.addEventListener('click', () => {
    const a = document.getElementById('pc-area');
    const h = document.getElementById('pc-height');
    const res = document.getElementById('pc-result');
    if (a) a.value = '';
    if (h) h.value = '';
    if (res) res.style.display = 'none';
  }); }
}
document.addEventListener('DOMContentLoaded', pcWire);
