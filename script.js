function showSection(id){document.querySelectorAll('.content-section').forEach(sec=>sec.classList.remove('active'));const el=document.getElementById(id);if(el)el.classList.add('active');}
document.getElementById('theme-toggle').addEventListener('click',()=>{document.body.classList.toggle('dark');});
