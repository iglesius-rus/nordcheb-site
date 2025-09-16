
/* ==== v020 core (no optional chaining, relative-safe) ==== */
function format(n){ return (n||0).toLocaleString('ru-RU'); }
function _parseMoney(t){
  if (!t) return 0;
  var s = String(t).replace(/[^\d.,-]/g,'').replace(/[ \u00A0]/g,'').replace(/,/,'.');
  var n = Number(s); return isNaN(n) ? 0 : n;
}
function _get(el, sel){ var x = el.querySelector(sel); return x ? x : null; }

function renderTable(id, data){
  var tbody = document.querySelector(id + ' tbody');
  if (!tbody || !Array.isArray(data)) return;
  var out = data.map(function(row){
    var min = (row.min != null) ? row.min : 0;
    var max = (row.max != null) ? ('max="'+row.max+'"') : '';
    var step = row.step || 1;
    var priceCell = row.discount ? '—' : format(row.price) + ' ₽';
    return '\
    <tr data-discount="'+(row.discount ? '1':'0')+'">\
      <td>'+row.name+'</td>\
      <td><input type="number" min="'+min+'" '+max+' step="'+step+'" value="0" data-name="'+row.name.replace(/"/g,'&quot;')+'"></td>\
      <td>'+(row.unit || '')+'</td>\
      <td class="num price">'+priceCell+'</td>\
      <td class="num sum">0 ₽</td>\
    </tr>';
  }).join('');
  tbody.innerHTML = out;
}

function recalcAll(){
  var subTotal = 0;
  var rows = document.querySelectorAll('#table-main tbody tr, #table-extra tbody tr');
  for (var i=0;i<rows.length;i++){
    var tr = rows[i];
    var isDiscount = tr.getAttribute('data-discount') === '1';
    var inp = _get(tr, 'input');
    var qty = parseFloat(inp && inp.value ? String(inp.value).replace(',', '.') : '0') || 0;
    var priceEl = _get(tr, '.price');
    var unitPrice = isDiscount ? 0 : _parseMoney(priceEl ? priceEl.textContent : '');
    var sum = isDiscount ? 0 : Math.max(0, qty) * unitPrice;
    var sumCell = _get(tr, '.sum');
    if (sumCell){
      sumCell.textContent = format(isDiscount ? 0 : sum) + ' ₽';
      sumCell.dataset.sum = String(isDiscount ? 0 : sum);
    }
    if (!isDiscount) subTotal += sum || 0;
  }
  var discountTotal = 0;
  var drows = document.querySelectorAll('#table-extra tbody tr[data-discount="1"]');
  for (var j=0;j<drows.length;j++){
    var dtr = drows[j];
    var inp2 = _get(dtr, 'input');
    var pct = Math.min(100, Math.max(0, parseFloat(inp2 && inp2.value ? String(inp2.value).replace(',', '.') : '0') || 0));
    var amount = Math.round(subTotal * pct) / 100;
    var sumCell2 = _get(dtr, '.sum');
    if (sumCell2){
      sumCell2.textContent = '−' + format(amount || 0) + ' ₽';
      sumCell2.dataset.sum = String(-(amount || 0));
    }
    discountTotal += amount || 0;
  }
  var total = Math.max(0, subTotal - discountTotal);
  var grand = document.getElementById('grand-total');
  if (grand) grand.textContent = format(total || 0);
}

function buildEstimate(){
  recalcAll();
  var rows = [];
  var subTotal = 0;
  var discountPct = 0;
  var discountAmount = 0;
  var trs = document.querySelectorAll('#table-main tbody tr, #table-extra tbody tr');
  for (var i=0;i<trs.length;i++){
    var tr = trs[i];
    var nameEl = _get(tr, 'td:nth-child(1)');
    var name = nameEl ? nameEl.textContent.trim() : '';
    var inp = _get(tr, 'input');
    var qty = parseFloat(inp && inp.value ? String(inp.value).replace(',', '.') : '0') || 0;
    var unitEl = _get(tr, 'td:nth-child(3)');
    var unit = unitEl ? unitEl.textContent.trim() : '';
    var priceEl = _get(tr, '.price');
    var unitPrice = _parseMoney(priceEl ? priceEl.textContent : '');
    var isDiscount = tr.getAttribute('data-discount') === '1';
    if (isDiscount){
      discountPct = Math.min(100, Math.max(0, qty));
      discountAmount = Math.round(subTotal * discountPct) / 100;
    } else {
      var sumEl = _get(tr, '.sum');
      var sum = _parseMoney(sumEl ? sumEl.textContent : '');
      if (qty > 0 && sum > 0) rows.push({name:name, qty:qty, unit:unit, unitPrice:unitPrice, sum:sum});
      subTotal += sum || 0;
    }
  }
  var wrap = document.getElementById('estimate-body');
  if (!wrap) return;
  if (!rows.length && discountPct <= 0){
    wrap.innerHTML = '<p class="kicker">Пока ничего не выбрано. Укажите количество и нажмите «Рассчёт».</p>';
  } else {
    var items = rows.map(function(r){
      return '\
      <tr>\
        <td>'+r.name+'</td>\
        <td style="text-align:center;">'+r.qty+' '+r.unit+'</td>\
        <td style="white-space:nowrap;">'+format(r.unitPrice)+' ₽</td>\
        <td style="white-space:nowrap; text-align:right;"><b>'+format(r.sum)+' ₽</b></td>\
      </tr>';
    }).join('');
    var discRow = discountPct > 0 ? ('\
      <tr>\
        <td colspan="3" style="text-align:right;">Скидка '+discountPct+'%</td>\
        <td style="white-space:nowrap; text-align:right; color:#a3e635;">−'+format(discountAmount)+' ₽</td>\
      </tr>') : '';
    var final = Math.max(0, subTotal - discountAmount);
    wrap.innerHTML = '\
      <div class="kicker" style="margin-bottom:8px;">Автосформированный расчёт</div>\
      <div style="overflow:auto;">\
        <table class="calc-table">\
          <thead><tr><th>Позиция</th><th>Кол-во</th><th>Цена ед.</th><th>Сумма</th></tr></thead>\
          <tbody>'+items+'\
            <tr><td colspan="3" style="text-align:right;"><b>Итого</b></td><td style="text-align:right;"><b>'+format(subTotal)+' ₽</b></td></tr>\
            '+discRow+'\
            <tr><td colspan="3" style="text-align:right;"><b>Итого со скидкой</b></td><td style="text-align:right;"><b>'+format(final)+' ₽</b></td></tr>\
          </tbody>\
        </table>\
      </div>';
  }
  var est = document.getElementById('estimate'); if (est) est.classList.remove('hidden');
}

function attachCalc(){
  try {
    if (typeof MAIN !== 'undefined') renderTable('#table-main', MAIN);
    if (typeof EXTRA !== 'undefined') renderTable('#table-extra', EXTRA);
  } catch(e) {}
  var nums = document.querySelectorAll('input[type="number"]');
  for (var i=0;i<nums.length;i++){
    nums[i].addEventListener('input', recalcAll);
    nums[i].addEventListener('change', recalcAll);
  }
  var br = document.getElementById('btn-recalc');
  if (br) br.addEventListener('click', function(){ recalcAll(); buildEstimate(); });
  var bc = document.getElementById('btn-copy');
  if (bc) bc.addEventListener('click', function(){
    recalcAll(); buildEstimate();
    var txt = (document.getElementById('estimate-body')||{}).innerText || '';
    if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(txt); }
  });
  var bp = document.getElementById('btn-pdf');
  if (bp) bp.addEventListener('click', function(){
    recalcAll(); buildEstimate();
    var win = window.open('', '_blank'); if (!win) return;
    var html = (document.getElementById('estimate-body')||{}).innerHTML || '<p>Смета пуста</p>';
    win.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Расчёт</title>\
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Arial,sans-serif;padding:20px;}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px;}th{text-align:left}</style></head><body><h2>Расчёт</h2>'+html+'</body></html>');
    win.document.close(); setTimeout(function(){ win.print(); }, 300);
  });
  recalcAll();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachCalc); else attachCalc();
