/* Аккордеон: простая, без зависимостей */
function setMaxHeight(el, open){ el.style.maxHeight = open ? el.scrollHeight + 'px' : '0px'; }
function scrollToPanel(panel){ try{ panel.scrollIntoView({behavior:'smooth', block:'start'}); }catch(e){} }

document.addEventListener('DOMContentLoaded', function(){
  document.querySelectorAll('.acc-item').forEach(function(item){
    var btn = item.querySelector('.menu-btn');
    var panel = item.querySelector('.content-section');
    if(!btn || !panel) return;
    btn.addEventListener('click', function(){
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      document.querySelectorAll('.acc-item .menu-btn[aria-expanded="true"]').forEach(function(b){
        b.setAttribute('aria-expanded','false');
      });
      document.querySelectorAll('.acc-item .content-section').forEach(function(p){ setMaxHeight(p, false); });
      if(!isOpen){
        btn.setAttribute('aria-expanded','true');
        setMaxHeight(panel, true);
        scrollToPanel(panel);
      }
    });
    // Начальное состояние
    btn.setAttribute('aria-expanded','false');
    setMaxHeight(panel, false);
  });
  // Авто-открытие первого раздела
  var first = document.querySelector('.acc-item .menu-btn');
  if(first){
    first.click();
  }
});

window.addEventListener('resize', function(){
  document.querySelectorAll('.content-section').forEach(function(panel){
    if(panel && panel.style.maxHeight && panel.style.maxHeight !== '0px'){
      panel.style.maxHeight = panel.scrollHeight + 'px';
    }
  });
});
