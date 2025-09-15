function showSection(id) {
  document.querySelectorAll('.content-section').forEach(sec => sec.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

/* ===== UX для числовых полей (v29) =====
   - Пустое поле/ноль: при фокусе выделяется целиком
   - Первая цифра заменяет ноль/пустое значение
   - Разрешаем только неотрицательные целые
*/
function enhanceNumberInputs(scope=document){
  const isDigit = (k) => /^[0-9]$/.test(k);
  scope.querySelectorAll('input[type="number"]').forEach(inp => {
    const selectIfZeroOrEmpty = () => {
      if (inp.value === "" || inp.value === "0") { try { inp.select(); } catch(e){} }
    };
    inp.addEventListener('focus', selectIfZeroOrEmpty);
    inp.addEventListener('click', selectIfZeroOrEmpty);

    inp.addEventListener('keydown', (e) => {
      if ((inp.value === "" || inp.value === "0") && isDigit(e.key)) {
        inp.value = "";
      }
    });

    inp.addEventListener('input', () => {
      // Оставляем пустое как пустое, иначе приводим к неотрицательному целому
      if (inp.value === "") return;
      let n = String(inp.value).replace(/[^0-9]/g, "");
      if (n === "") { inp.value = ""; return; }
      inp.value = String(Math.max(0, parseInt(n, 10)));
    });
  });
}
try { enhanceNumberInputs(document); } catch(e) {}
