/* ECSCW 2027 theme scripts: menu, program schedule, in-page navigation. */
(function () {
	'use strict';

	/* ---------- Sticky header: shadow once the page is scrolled ---------- */
	var header = document.querySelector('.site-header');
	if (header) {
		var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 4); };
		window.addEventListener('scroll', onScroll, { passive: true });
		onScroll();
	}

	/* ---------- Main menu ---------- */
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

	if (toggle && menu) {
		toggle.addEventListener('click', function () {
			var on = menu.classList.toggle('open');
			toggle.setAttribute('aria-expanded', on);
		});
	}

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

	/* ---------- Program schedule: day tabs, type filters, search, bookmarks ---------- */
	var schedule = document.querySelector('[data-schedule]');
	if (schedule) {
		var tabList = document.querySelector('.day-tabs');
		var tabs = document.querySelectorAll('.day-tab');
		var panels = schedule.querySelectorAll('.day-panel');
		var sessions = schedule.querySelectorAll('.session');
		var dayTitle = schedule.querySelector('[data-day-title]');
		var filters = schedule.querySelectorAll('.filter');
		var searchForm = schedule.querySelector('[data-schedule-search]');
		var searchInput = searchForm ? searchForm.querySelector('input') : null;
		var clearBtn = schedule.querySelector('[data-search-clear]');
		var emptyMsg = schedule.querySelector('[data-search-empty]');
		var state = { day: 0, type: '', query: '' };

		var fold = function (str) {
			return (str || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
		};
		var esc = function (str) {
			return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		};

		// Remember each session's searchable text (time, type, title, room, day) and original labels.
		sessions.forEach(function (s) {
			var panel = s.closest('.day-panel');
			var parts = ['.session-time', '.session-type', '.session-title', '.session-room'].map(function (sel) {
				var el = s.querySelector(sel);
				if (el && (sel === '.session-title' || sel === '.session-room')) el.setAttribute('data-text', el.textContent);
				return el ? el.textContent : '';
			});
			parts.push(panel ? panel.getAttribute('data-title') : '');
			s.setAttribute('data-search', fold(parts.join(' ')));
		});

		var highlight = function (el, words) {
			var text = el.getAttribute('data-text');
			if (!words.length) { el.textContent = text; return; }
			var folded = fold(text);
			var marks = [];
			words.forEach(function (w) {
				var i = folded.indexOf(w);
				while (i !== -1) { marks.push([i, i + w.length]); i = folded.indexOf(w, i + w.length); }
			});
			if (!marks.length) { el.textContent = text; return; }
			marks.sort(function (a, b) { return a[0] - b[0]; });
			var html = '', pos = 0;
			marks.forEach(function (m) {
				if (m[0] < pos) return;
				html += esc(text.slice(pos, m[0])) + '<mark class="hit">' + esc(text.slice(m[0], m[1])) + '</mark>';
				pos = m[1];
			});
			el.innerHTML = html + esc(text.slice(pos));
		};

		var render = function () {
			var words = fold(state.query).split(/\s+/).filter(Boolean);
			var searching = words.length > 0;
			var total = 0;
			schedule.classList.toggle('is-searching', searching);
			if (tabList) tabList.classList.toggle('is-searching', searching);

			panels.forEach(function (p, n) {
				var shown = 0;
				p.querySelectorAll('.session').forEach(function (s) {
					var hay = s.getAttribute('data-search');
					var ok = (!state.type || s.getAttribute('data-type') === state.type) &&
						words.every(function (w) { return hay.indexOf(w) !== -1; });
					s.hidden = !ok;
					if (ok) shown++;
					s.querySelectorAll('[data-text]').forEach(function (el) { highlight(el, words); });
				});
				p.hidden = searching ? shown === 0 : n !== state.day;
				if (searching) total += shown;
			});

			if (dayTitle) {
				if (searching) {
					dayTitle.textContent = total + (total === 1 ? ' session' : ' sessions') + ' matching “' + state.query.trim() + '”';
				} else if (panels[state.day]) {
					dayTitle.textContent = panels[state.day].getAttribute('data-title');
				}
			}
			if (emptyMsg) emptyMsg.hidden = !(searching && total === 0);
			if (clearBtn) clearBtn.hidden = !searching;
		};

		var selectDay = function (i, focus) {
			state.day = i;
			tabs.forEach(function (t, n) {
				var on = n === i;
				t.setAttribute('aria-selected', on);
				t.tabIndex = on ? 0 : -1;
				if (on && focus) t.focus();
			});
			// Picking a day leaves search mode.
			if (searchInput && state.query) { searchInput.value = ''; state.query = ''; }
			render();
		};

		tabs.forEach(function (t, i) {
			t.addEventListener('click', function () { selectDay(i, false); });
			t.addEventListener('keydown', function (e) {
				var n = null;
				if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
				if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
				if (e.key === 'Home') n = 0;
				if (e.key === 'End') n = tabs.length - 1;
				if (n !== null) { e.preventDefault(); selectDay(n, true); }
			});
		});

		filters.forEach(function (f) {
			f.addEventListener('click', function () {
				state.type = f.getAttribute('data-filter');
				filters.forEach(function (o) { o.setAttribute('aria-pressed', o === f); });
				render();
			});
		});

		if (searchInput) {
			searchInput.addEventListener('input', function () { state.query = searchInput.value; render(); });
			searchInput.addEventListener('keydown', function (e) {
				if (e.key === 'Escape' && searchInput.value) { e.preventDefault(); searchInput.value = ''; state.query = ''; render(); }
			});
			searchForm.addEventListener('submit', function (e) { e.preventDefault(); });
			// Allow links like /program/?q=keynote
			var q = new URLSearchParams(window.location.search).get('q');
			if (q) { searchInput.value = q; state.query = q; }
		}
		if (clearBtn) {
			clearBtn.addEventListener('click', function () {
				searchInput.value = ''; state.query = ''; render(); searchInput.focus();
			});
		}

		// Bookmarks ("my schedule"), remembered in this browser.
		var store = {};
		try { store = JSON.parse(localStorage.getItem('ecscwSchedule') || '{}') || {}; } catch (err) { store = {}; }
		schedule.querySelectorAll('.bookmark').forEach(function (b) {
			var key = b.getAttribute('data-key');
			if (store[key]) b.setAttribute('aria-pressed', 'true');
			b.addEventListener('click', function () {
				var on = b.getAttribute('aria-pressed') !== 'true';
				b.setAttribute('aria-pressed', on);
				if (on) { store[key] = 1; } else { delete store[key]; }
				try { localStorage.setItem('ecscwSchedule', JSON.stringify(store)); } catch (err) { /* storage unavailable */ }
			});
		});

		render();
	}

	/* ---------- Times in the visitor's own time zone ---------- */
	(function () {
		var L = window.ecscwL10n || {};
		var userTz = '';
		try { userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (err) { return; }
		if (!userTz) return;
		var city = userTz.split('/').pop().replace(/_/g, ' ');
		var fmt = function (date, tz, opts) {
			var o = { timeZone: tz };
			for (var k in opts) { o[k] = opts[k]; }
			return new Intl.DateTimeFormat(undefined, o).format(date);
		};
		var dayKey = { year: 'numeric', month: '2-digit', day: '2-digit' };
		var hm = { hour: '2-digit', minute: '2-digit' };

		// Deadlines (AoE): always show when they end for this visitor.
		document.querySelectorAll('[data-aoe]').forEach(function (el) {
			var d = new Date(el.getAttribute('data-aoe'));
			if (isNaN(d)) return;
			var when = fmt(d, userTz, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
			el.textContent = (L.aoeLocal || 'Ends %s your time').replace('%s', when);
			el.title = L.aoeTitle || '';
			el.hidden = false;
		});

		// Program sessions: optional second time line, switched on by the visitor.
		var schedule = document.querySelector('[data-schedule]');
		var toggle = document.querySelector('[data-tz-toggle]');
		if (!schedule || !toggle) return;
		var confTz = schedule.getAttribute('data-conf-tz') || 'UTC';
		var times = schedule.querySelectorAll('.session-time[data-start]');
		if (!times.length) return;

		// Nothing to convert if the visitor is in the conference's time zone.
		var differs = Array.prototype.some.call(times, function (t) {
			var d = new Date(t.getAttribute('data-start'));
			return fmt(d, userTz, hm) !== fmt(d, confTz, hm) || fmt(d, userTz, dayKey) !== fmt(d, confTz, dayKey);
		});
		if (!differs) return;

		times.forEach(function (t) {
			var start = new Date(t.getAttribute('data-start'));
			var end = new Date(t.getAttribute('data-end'));
			var label = fmt(start, userTz, hm);
			if (!isNaN(end) && t.querySelector('.session-time-main').textContent.match(/[–—-]/)) {
				label += '–' + fmt(end, userTz, hm);
			}
			// Mention the weekday when the visitor's date differs from the conference date.
			if (fmt(start, userTz, dayKey) !== fmt(start, confTz, dayKey)) {
				label = fmt(start, userTz, { weekday: 'short' }) + ' ' + label;
			}
			t.querySelector('.session-local').textContent = (L.yourTime || '%s your time').replace('%s', label);
		});

		var label = toggle.querySelector('[data-tz-label]');
		if (label) label.textContent = (L.showLocal || 'Show times in my time zone (%s)').replace('%s', city);
		var set = function (on) {
			toggle.setAttribute('aria-pressed', on);
			schedule.querySelectorAll('.session-local').forEach(function (s) { s.hidden = !on || !s.textContent; });
			try { localStorage.setItem('ecscwLocalTimes', on ? '1' : '0'); } catch (err) { /* storage unavailable */ }
		};
		toggle.addEventListener('click', function () { set(toggle.getAttribute('aria-pressed') !== 'true'); });
		toggle.hidden = false;
		var saved = null;
		try { saved = localStorage.getItem('ecscwLocalTimes'); } catch (err) { saved = null; }
		set(saved === '1');
	})();

	/* ---------- In-page navigation: highlight the section in view ---------- */
	document.querySelectorAll('.toc, .pill-nav').forEach(function (nav) {
		var links = Array.prototype.filter.call(nav.querySelectorAll('a[href^="#"]'), function (a) {
			return a.getAttribute('href').length > 1 && document.getElementById(a.getAttribute('href').slice(1));
		});
		if (!links.length || !('IntersectionObserver' in window)) return;
		var setActive = function (id) {
			links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + id); });
		};
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (en) { if (en.isIntersecting) setActive(en.target.id); });
		}, { rootMargin: '-20% 0px -70% 0px' });
		links.forEach(function (a) { observer.observe(document.getElementById(a.getAttribute('href').slice(1))); });
	});
})();
