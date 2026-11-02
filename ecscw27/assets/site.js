(function () {
var menu = document.getElementById('main-menu');
var toggle = document.querySelector('.menu-toggle');
var subs = document.querySelectorAll('.submenu-toggle');

function closeSubs(except) {
subs.forEach(function (b) {
if (b === except) return;
b.setAttribute('aria-expanded', 'false');
b.parentNode.classList.remove('open');
});
}

toggle.addEventListener('click', function () {
var on = menu.classList.toggle('open');
toggle.setAttribute('aria-expanded', on);
});

subs.forEach(function (b) {
b.addEventListener('click', function () {
var on = b.getAttribute('aria-expanded') !== 'true';
closeSubs(b);
b.setAttribute('aria-expanded', on);
b.parentNode.classList.toggle('open', on);
});
});

document.addEventListener('click', function (e) {
if (!e.target.closest('.menu-item') || e.target.closest('.submenu a')) closeSubs();
});

document.addEventListener('keydown', function (e) {
if (e.key !== 'Escape') return;
var open = document.querySelector('.submenu-toggle[aria-expanded="true"]');
if (open) { closeSubs(); open.focus(); }
});
})();
