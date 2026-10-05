(function () {
  var API = "/api/comments";
  var curSec = null, poll = null, counts = {};

  // --- estilos ---
  var css = ''
    + '.cw-chip{position:absolute;top:34px;right:18px;z-index:6;display:inline-flex;align-items:center;gap:6px;'
    + 'font-family:Archivo,sans-serif;font-weight:700;font-size:.72rem;letter-spacing:.03em;color:var(--teal);'
    + 'background:rgba(19,28,49,.7);border:1px solid var(--line);border-radius:100px;padding:6px 13px;cursor:pointer;'
    + 'backdrop-filter:blur(6px);transition:border-color .18s,background .18s}'
    + '.cw-chip:hover{border-color:var(--teal);background:rgba(51,225,196,.12)}'
    + '.cw-chip .cw-ct{font-weight:800;opacity:.85}'
    + '@media(max-width:600px){.cw-chip{top:22px;right:14px;font-size:.64rem;padding:5px 10px}}'
    + '#cw-modal{position:fixed;inset:0;z-index:400;background:rgba(5,8,16,.74);backdrop-filter:blur(6px);display:none;align-items:flex-end;justify-content:center}'
    + '#cw-modal.open{display:flex}'
    + '#cw-box{width:100%;max-width:540px;max-height:90vh;display:flex;flex-direction:column;background:var(--ink-2,#0D1322);border:1px solid var(--line);border-radius:20px 20px 0 0;padding:22px;padding-bottom:calc(22px + env(safe-area-inset-bottom,0px))}'
    + '@media(min-width:560px){#cw-modal{align-items:center}#cw-box{border-radius:18px}}'
    + '.cw-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:6px}'
    + '.cw-head h3{font-family:Archivo,sans-serif;font-weight:800;font-size:1.15rem;margin:0;color:var(--bone)}'
    + '.cw-head h3 span{color:var(--teal)}'
    + '#cw-x{flex:none;background:transparent;border:none;color:var(--mute);font-size:1.3rem;cursor:pointer;line-height:1;padding:2px 6px}'
    + '.cw-sb{color:var(--mute);font-size:.82rem;margin:0 0 14px}'
    + '.cw-list{flex:1;overflow-y:auto;display:flex;flex-direction:column;gap:10px;margin-bottom:14px;min-height:60px}'
    + '.cw-item{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:12px 14px}'
    + '.cw-m{font-size:.94rem;margin:0 0 5px;white-space:pre-wrap;color:var(--bone)}'
    + '.cw-meta{font-size:.72rem;color:var(--mute-2)}'
    + '.cw-empty{color:var(--mute-2);font-size:.88rem;text-align:center;padding:16px 0}'
    + '#cw-name,#cw-text{width:100%;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:11px 14px;color:var(--bone);font-family:Inter,sans-serif;font-size:.95rem;margin-bottom:10px}'
    + '#cw-text{min-height:80px;resize:vertical}'
    + '#cw-send{width:100%;font-family:Archivo,sans-serif;font-weight:800;font-size:.95rem;color:#07110E;background:var(--teal);border:none;border-radius:10px;padding:13px;cursor:pointer}'
    + '#cw-send:disabled{opacity:.6;cursor:default}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // --- modal ---
  var modal = document.createElement("div"); modal.id = "cw-modal";
  modal.innerHTML =
    '<div id="cw-box">'
    + '<div class="cw-head"><h3>Comentarios · <span id="cw-title"></span></h3><button id="cw-x" aria-label="Cerrar">&times;</button></div>'
    + '<p class="cw-sb">Deja aquí tus notas de qué mejorar. Se guardan y se ven en vivo.</p>'
    + '<div class="cw-list" id="cw-list"></div>'
    + '<input id="cw-name" type="text" placeholder="Tu nombre (opcional)" autocomplete="off">'
    + '<textarea id="cw-text" placeholder="Escribe tu comentario sobre esta sección..."></textarea>'
    + '<button id="cw-send">Publicar</button>'
    + '</div>';
  document.body.appendChild(modal);

  var elTitle = modal.querySelector("#cw-title");
  var elList = modal.querySelector("#cw-list");
  var elName = modal.querySelector("#cw-name");
  var elText = modal.querySelector("#cw-text");
  var elSend = modal.querySelector("#cw-send");

  try { elName.value = localStorage.getItem("cw_name") || ""; } catch (e) {}

  modal.querySelector("#cw-x").addEventListener("click", close);
  modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
  elSend.addEventListener("click", send);

  // --- chips por sección ---
  var secs = document.querySelectorAll("section[id]");
  Array.prototype.forEach.call(secs, function (sec) {
    var h = sec.querySelector("h2.big") || sec.querySelector("h2");
    var title = (h ? h.textContent : sec.id).trim();
    var chip = document.createElement("button");
    chip.type = "button"; chip.className = "cw-chip";
    chip.innerHTML = '\uD83D\uDCAC Comentar <b class="cw-ct" data-sec="' + sec.id + '"></b>';
    chip.addEventListener("click", function () { open(sec.id, title); });
    sec.appendChild(chip);
  });

  loadCounts();

  function loadCounts() {
    fetch(API).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.ok) return;
      counts = {};
      d.comments.forEach(function (c) { counts[c.section] = (counts[c.section] || 0) + 1; });
      Array.prototype.forEach.call(document.querySelectorAll(".cw-ct"), function (b) {
        var n = counts[b.getAttribute("data-sec")] || 0;
        b.textContent = n ? ("· " + n) : "";
      });
    }).catch(function () {});
  }

  function open(sec, title) {
    curSec = sec; elTitle.textContent = title; elText.value = "";
    modal.classList.add("open");
    fetchList();
    if (poll) clearInterval(poll);
    poll = setInterval(fetchList, 7000);
  }
  function close() { modal.classList.remove("open"); if (poll) { clearInterval(poll); poll = null; } }

  function fetchList() {
    fetch(API + "?section=" + encodeURIComponent(curSec)).then(function (r) { return r.json(); }).then(function (d) {
      if (!d || !d.ok) { elList.innerHTML = '<p class="cw-empty">No se pudieron cargar los comentarios.</p>'; return; }
      if (!d.comments.length) { elList.innerHTML = '<p class="cw-empty">Sé la primera en comentar esta sección.</p>'; return; }
      elList.innerHTML = "";
      d.comments.forEach(function (c) {
        var it = document.createElement("div"); it.className = "cw-item";
        var p = document.createElement("p"); p.className = "cw-m"; p.textContent = c.text;
        var mt = document.createElement("div"); mt.className = "cw-meta"; mt.textContent = (c.name || "Anónimo") + " · " + fmt(c.created);
        it.appendChild(p); it.appendChild(mt); elList.appendChild(it);
      });
    }).catch(function () { elList.innerHTML = '<p class="cw-empty">Sin conexión con los comentarios.</p>'; });
  }

  function fmt(iso) { try { return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }); } catch (e) { return ""; } }

  function send() {
    var name = elName.value.trim(), text = elText.value.trim();
    if (!text) return;
    try { localStorage.setItem("cw_name", name); } catch (e) {}
    elSend.disabled = true; elSend.textContent = "Enviando...";
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: curSec, name: name, text: text }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        elSend.disabled = false; elSend.textContent = "Publicar";
        if (d && d.ok) { elText.value = ""; fetchList(); loadCounts(); }
        else { elList.innerHTML = '<p class="cw-empty">No se pudo publicar. Revisa la conexión.</p>'; }
      })
      .catch(function () { elSend.disabled = false; elSend.textContent = "Publicar"; elList.innerHTML = '<p class="cw-empty">Sin conexión. Intenta de nuevo.</p>'; });
  }
})();
