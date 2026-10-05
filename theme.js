(function () {
  var who = new URLSearchParams(location.search).get("for");
  if (who !== "juliana") return;
  document.documentElement.classList.add("theme-juliana");

  var chick = '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
    + '<ellipse cx="40" cy="53" rx="23" ry="20" fill="#FFD23F"/>'
    + '<path d="M18 53 q-7 2 -3 9 q6 0 7 -6 z" fill="#FFC53F"/>'
    + '<path d="M62 53 q7 2 3 9 q-6 0 -7 -6 z" fill="#FFC53F"/>'
    + '<circle cx="40" cy="32" r="17" fill="#FFDE59"/>'
    + '<circle cx="34" cy="31" r="2.6" fill="#333"/><circle cx="46" cy="31" r="2.6" fill="#333"/>'
    + '<path d="M37 36 l3 4 l3 -4 z" fill="#FF8A1E"/>'
    + '<path d="M44 20 q3 -7 8 -5 q-1 5 -6 7 z" fill="#FF9BC4"/>'
    + '<path d="M31 72 l-3 6 M40 74 v6 M49 72 l3 6" stroke="#FF8A1E" stroke-width="3" stroke-linecap="round" fill="none"/>'
    + '</svg>';

  var css = ''
    + '.theme-juliana{--teal:#FF8FC7;--teal-dim:#C76A99;--green:#FF8FC7}'
    + '.theme-juliana body{background-image:linear-gradient(rgba(255,143,199,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,143,199,.05) 1px,transparent 1px)}'
    + '.theme-juliana .glow{background:radial-gradient(circle,rgba(255,143,199,.18),transparent 60%)!important}'
    + '.theme-juliana ::selection{background:#FF8FC7;color:#2a0d1c}'
    + '.jl-chick{position:fixed;width:52px;height:52px;z-index:2;opacity:.55;pointer-events:none;animation:jlbob 3.4s ease-in-out infinite}'
    + '@keyframes jlbob{0%,100%{transform:translateY(0) rotate(-4deg)}50%{transform:translateY(-9px) rotate(4deg)}}'
    + '@media(max-width:600px){.jl-chick{width:40px;height:40px;opacity:.45}}'
    + '@media(prefers-reduced-motion:reduce){.jl-chick{animation:none}}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  function place(styleStr, delay) {
    var d = document.createElement("div"); d.className = "jl-chick";
    d.style.cssText = styleStr; d.style.animationDelay = delay; d.innerHTML = chick;
    document.body.appendChild(d);
  }
  function go() {
    place("left:14px;bottom:86px;", "0s");
    place("right:16px;top:88px;", ".7s");
    place("left:46%;bottom:14px;opacity:.32;", "1.3s");
  }
  if (document.readyState !== "loading") go();
  else document.addEventListener("DOMContentLoaded", go);
})();
