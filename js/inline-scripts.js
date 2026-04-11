/**
 * inline-scripts.js  (v2.0.0)
 *
 * Previously these three blocks lived as <script> tags scattered inside
 * index.html.  Extracted here so the HTML stays clean.  All code runs
 * after DOMContentLoaded.
 *
 *  1. Video intersection observer  (review-video auto-play)
 *  2. Training attendance CSV renderer
 *  3. Training / friendly-games iCal calendar renderer
 */

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. Video intersection observer
    //    Plays / pauses the review-video element as it enters
    //    or leaves the viewport.
    // =========================================================
    const video = document.getElementById('review-video');
    if (video) {
        const videoObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    video.play().catch(e => console.log('Autoplay prevented', e));
                } else {
                    video.pause();
                }
            });
        }, { threshold: 0.25 });
        videoObserver.observe(video);
    }


    // =========================================================
    // 2. Training attendance CSV renderer
    // =========================================================
    (() => {
        const CSV_URL   = 'public/202526_season/gold/202526_attendance_report.csv';
        const container = document.getElementById('attendance-rows');
        if (!container) return;

        const parseCsv = (text) => {
            const rows = [];
            let current = '';
            let inQuotes = false;
            const lines = [];
            for (let i = 0; i < text.length; i += 1) {
                const char = text[i];
                const next = text[i + 1];
                if (char === '"' && inQuotes && next === '"') { current += '"'; i += 1; continue; }
                if (char === '"') { inQuotes = !inQuotes; continue; }
                if (char === '\n' && !inQuotes) { lines.push(current); current = ''; continue; }
                current += char;
            }
            if (current.trim().length) lines.push(current);
            if (!lines.length) return rows;

            const headers = lines[0].split(',').map(h => h.trim());
            for (let li = 1; li < lines.length; li += 1) {
                const line = lines[li];
                if (!line.trim()) continue;
                const values = [];
                let value = '';
                let quoted = false;
                for (let i = 0; i < line.length; i += 1) {
                    const char = line[i];
                    const next = line[i + 1];
                    if (char === '"' && quoted && next === '"') { value += '"'; i += 1; continue; }
                    if (char === '"') { quoted = !quoted; continue; }
                    if (char === ',' && !quoted) { values.push(value); value = ''; continue; }
                    value += char;
                }
                values.push(value);
                const entry = {};
                headers.forEach((h, idx) => { entry[h] = values[idx] ? values[idx].trim() : ''; });
                rows.push(entry);
            }
            return rows;
        };

        const inferTotalSessions = (rows) => {
            const totals = new Map();
            rows.forEach(row => {
                const count   = Number(row.attendance_count);
                const percent = Number(row.attendance_in_percent);
                if (!Number.isFinite(count) || !Number.isFinite(percent) || percent <= 0) return;
                const total = Math.round((count * 100) / percent);
                if (!Number.isFinite(total) || total <= 0) return;
                totals.set(total, (totals.get(total) || 0) + 1);
            });
            let bestTotal = null, bestCount = -1;
            totals.forEach((count, total) => {
                if (count > bestCount || (count === bestCount && total > bestTotal)) {
                    bestTotal = total; bestCount = count;
                }
            });
            return bestTotal;
        };

        const renderRows = (rows) => {
            if (!rows.length) {
                container.innerHTML = '<div class="text-sm text-gray-500 text-center">Keine Daten verfügbar.</div>';
                return;
            }
            const totalSessions = inferTotalSessions(rows);
            container.innerHTML = '';

            rows.forEach(row => {
                const count      = Number(row.attendance_count);
                const percent    = Number(row.attendance_in_percent);
                const safePercent = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;
                const countLabel  = totalSessions ? `${count}/${totalSessions}` : `${count}/--`;

                const wrapper = document.createElement('div');
                wrapper.className = 'flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4';

                const name = document.createElement('span');
                name.className = 'sm:w-1/4 md:w-1/5 text-sm font-semibold text-gray-300 text-center sm:text-left';
                name.textContent = row.name || '-';

                const barWrap = document.createElement('div');
                barWrap.className = 'flex-1';
                barWrap.innerHTML = `
                    <div class="bar-container relative">
                        <div class="tooltip">${safePercent.toFixed(1)}% (${countLabel})</div>
                        <div class="w-full h-4 bg-[#2a2a35] rounded-full overflow-hidden shadow-inner">
                            <div class="bar-trainings h-full rounded-full transition-all duration-700"
                                 style="width:${safePercent}%"></div>
                        </div>
                    </div>`;

                const countEl = document.createElement('span');
                countEl.className = 'sm:w-20 text-sm font-bold text-gray-300 text-center sm:text-right';
                countEl.textContent = `${safePercent.toFixed(0)}% (${countLabel})`;

                wrapper.appendChild(name);
                wrapper.appendChild(barWrap);
                wrapper.appendChild(countEl);
                container.appendChild(wrapper);
            });
        };

        const initAttendance = async () => {
            try {
                const r = await fetch(`${CSV_URL}?_=${Date.now()}`, { cache: 'no-store' });
                if (!r.ok) throw new Error(`HTTP ${r.status}`);
                const text = await r.text();
                const rows = parseCsv(text);
                const sorted = rows
                    .filter(row => Number.isFinite(Number(row.attendance_in_percent)))
                    .sort((a, b) => {
                        const pctDiff = Number(b.attendance_in_percent) - Number(a.attendance_in_percent);
                        if (pctDiff !== 0) return pctDiff;
                        const countDiff = Number(b.attendance_count) - Number(a.attendance_count);
                        if (countDiff !== 0) return countDiff;
                        return String(a.name).localeCompare(String(b.name));
                    })
                    .slice(0, 10);
                renderRows(sorted);
            } catch (error) {
                console.error('Fehler beim Laden der Trainingsdaten:', error);
                container.innerHTML = '<div class="text-sm text-gray-500 text-center">Daten konnten nicht geladen werden.</div>';
            }
        };

        initAttendance();
    })();


    // =========================================================
    // 3. Training & friendly-games iCal calendar renderer
    // =========================================================
    (() => {
        const FEED_URL_BASE = 'https://api.vereinsplaner.at/v1/public/ical/eac54836-9dc4-4c99-9f12-b0f16985ea4d.ics';
        const cardsEl  = document.getElementById('trainings-cards');
        const statusEl = document.getElementById('trainings-status');
        if (!cardsEl || !statusEl) return;

        const DEFAULT_TIME_ZONE = 'Europe/Vienna';
        const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
        const pad = v => String(v).padStart(2, '0');

        const getTimeZoneOffset = (date, timeZone) => {
            const formatter = new Intl.DateTimeFormat('en-US', {
                timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
            });
            const parts = formatter.formatToParts(date);
            const v = {};
            for (const p of parts) { if (p.type !== 'literal') v[p.type] = p.value; }
            const utc = Date.UTC(+v.year, +v.month - 1, +v.day, +v.hour, +v.minute, +v.second);
            return utc - date.getTime();
        };

        const toTimeZoneDate = (c, tz) => {
            if (!tz) return new Date(c.year, c.month, c.day, c.hour, c.minute, c.second);
            const utcDate = new Date(Date.UTC(c.year, c.month, c.day, c.hour, c.minute, c.second));
            const offset  = getTimeZoneOffset(utcDate, tz);
            let adj = new Date(utcDate.getTime() - offset);
            const adjOffset = getTimeZoneOffset(adj, tz);
            if (adjOffset !== offset) adj = new Date(utcDate.getTime() - adjOffset);
            return adj;
        };

        const parseTimestamp = field => {
            if (!field || !field.value) return null;
            const raw = field.value;
            const params = field.params || {};
            const isUtc = raw.slice(-1).toUpperCase() === 'Z';
            const cleanRaw = isUtc ? raw.slice(0, -1) : raw;
            const match = cleanRaw.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?/);
            if (!match) return null;
            const year = +match[1], month = +match[2] - 1, day = +match[3];
            const hasTime = Boolean(match[4]) && params.VALUE !== 'DATE';
            const hour = hasTime ? +match[4] : 0;
            const minute = hasTime ? +match[5] : 0;
            const second = hasTime ? +(match[6] || '0') : 0;
            const timeZone = params.TZID || DEFAULT_TIME_ZONE;
            const local = { year, month, day, hour, minute, second };
            const date = isUtc
                ? new Date(Date.UTC(year, month, day, hour, minute, second))
                : toTimeZoneDate({ year, month, day, hour, minute, second }, timeZone);
            return { date, hasTime, timeZone, local };
        };

        const formatDate = ts => {
            if (!ts || !ts.local) return '';
            const { year, month, day } = ts.local;
            const weekday = dayNames[new Date(Date.UTC(year, month, day)).getUTCDay()];
            return `${weekday}, ${pad(day)}.${pad(month + 1)}.${year}`;
        };

        const formatTimeRange = (start, end) => {
            if (!start) return '';
            if (!start.hasTime) return 'Ganztägig';
            const sl = start.local;
            const startStr = `${pad(sl.hour)}:${pad(sl.minute)}`;
            if (end && end.hasTime) {
                const el = end.local;
                const sameDay = sl.year === el.year && sl.month === el.month && sl.day === el.day;
                if (sameDay) return `${startStr} - ${pad(el.hour)}:${pad(el.minute)} Uhr`;
            }
            return `${startStr} Uhr`;
        };

        const unfoldLines = text => {
            const rawLines = text.replace(/\r\n/g, '\n').split('\n');
            const lines = [];
            for (const line of rawLines) {
                if (/^[ \t]/.test(line) && lines.length) lines[lines.length - 1] += line.slice(1);
                else lines.push(line);
            }
            return lines;
        };

        const parseICS = text => {
            const lines = unfoldLines(text);
            const events = [];
            let current = null;
            for (const line of lines) {
                if (line === 'BEGIN:VEVENT') { current = {}; continue; }
                if (line === 'END:VEVENT') { if (current) events.push(current); current = null; continue; }
                if (!current) continue;
                const sep = line.indexOf(':');
                if (sep === -1) continue;
                const rawKey = line.slice(0, sep);
                const value  = line.slice(sep + 1);
                const [key, ...paramParts] = rawKey.split(';');
                const params = {};
                for (const part of paramParts) {
                    const [pk, pv] = part.split('=');
                    if (pk) params[pk] = pv;
                }
                current[key] = { value, params };
            }
            return events.map(ev => {
                const start = parseTimestamp(ev.DTSTART);
                const end   = parseTimestamp(ev.DTEND);
                const categories = ev.CATEGORIES ? ev.CATEGORIES.value.split(',').map(c => c.trim()) : [];
                return {
                    summary: ev.SUMMARY ? ev.SUMMARY.value : '',
                    description: ev.DESCRIPTION ? ev.DESCRIPTION.value : '',
                    location: ev.LOCATION ? ev.LOCATION.value : '',
                    url: ev.URL ? ev.URL.value : '',
                    start, end, categories
                };
            }).filter(ev => ev.start);
        };

        const normaliseText = input => (input || '')
            .replace(/\\n/g, ' ').replace(/\\\\,/g, ',').replace(/\\,/g, ',')
            .replace(/\\;/g, ';').replace(/\\:/g, ':').replace(/\\\\/g, '\\').trim();

        const buildSearchText = ev =>
            `${ev.summary} ${ev.description} ${ev.categories.join(' ')} ${ev.location}`.toLowerCase();

        const trainingGroups = {
            minis:   { label: 'Training Minis',     shortLabel: 'Minis',     labelClass: 'text-blue-400',  borderClass: 'border-blue-500',  groupClass: 'text-blue-400'  },
            juniors: { label: 'Training Juniors',    shortLabel: 'Juniors',   labelClass: 'text-green-400', borderClass: 'border-green-500', groupClass: 'text-green-400' },
            adults:  { label: 'Training Erwachsene', shortLabel: 'Erwachsene',labelClass: 'text-hc-red',    borderClass: 'border-hc-red',    groupClass: 'text-hc-red'    }
        };

        const getLocalMinutes = ts =>
            ts && ts.hasTime && ts.local ? ts.local.hour * 60 + ts.local.minute : null;

        const inferGroup = ev => {
            const text = buildSearchText(ev);
            if (/\btraining\s*minis\b|\bminis?\b/.test(text)) return 'minis';
            if (/\btraining\s*juniors\b|\bjuniors?\b|\btraining\s*teenies\b|\bteenies?\b/.test(text)) return 'juniors';
            if (/\btraining\s*erwachsene\b|\berwachsene\b/.test(text)) return 'adults';
            if (['erwachsene','kampfmannschaft','senior','herren','damen'].some(k => text.includes(k))) return 'adults';
            const loc = (ev.location || '').toLowerCase();
            const isThaur = /thaur|sportplatzweg/.test(loc);
            const isTelfs = /telfs|franz-?rimm/.test(loc);
            const mins = getLocalMinutes(ev.start);
            if (isTelfs) return 'adults';
            if (isThaur && mins !== null) {
                if (mins < 18 * 60) return 'minis';
                if (mins < 19 * 60) return 'juniors';
                return 'adults';
            }
            if (mins !== null) {
                if (mins < 18 * 60) return 'minis';
                if (mins < 19 * 60) return 'juniors';
            }
            return 'adults';
        };

        const classifyEvent = ev => {
            const text = buildSearchText(ev);
            const groupKey = inferGroup(ev);
            const group = trainingGroups[groupKey] || trainingGroups.adults;
            if (text.includes('freund')) return { label: 'Freundschaft', labelClass: 'text-gray-300', borderClass: 'border-gray-600', group: null };
            if ((text.includes('spiel') && !text.includes('training')) || text.includes('meisterschaft'))
                return { label: 'Meisterschaft', labelClass: 'text-gray-300', borderClass: 'border-gray-600', group: null };
            return { label: group.label, labelClass: group.labelClass, borderClass: group.borderClass, group: groupKey, groupLabel: group.shortLabel, groupClass: group.groupClass };
        };

        const buildCard = (ev, now) => {
            const { label, labelClass, borderClass, group, groupLabel, groupClass } = classifyEvent(ev);
            const card = document.createElement('div');
            card.className = `event-card flex-none w-64 p-4 rounded-xl border-t-4 snap-center bg-[#1a1a20] border border-[#2a2a35] ${borderClass}`;

            const header = document.createElement('div');
            header.className = 'flex justify-between items-center text-sm font-semibold mb-2';

            const labelEl = document.createElement('span');
            labelEl.className = `${labelClass} uppercase text-xs`;
            labelEl.textContent = label;

            const dateEl = document.createElement('span');
            dateEl.className = 'text-gray-500 text-xs';
            dateEl.textContent = formatDate(ev.start);

            header.appendChild(labelEl);
            header.appendChild(dateEl);
            card.appendChild(header);

            const titleEl = document.createElement('p');
            titleEl.className = 'event-title text-sm font-bold text-gray-100 mb-2 text-center';
            titleEl.textContent = ev.summary || 'Ohne Titel';
            card.appendChild(titleEl);

            const timeEl = document.createElement('p');
            timeEl.className = 'event-time text-xs text-gray-400 text-center mb-2';
            timeEl.textContent = formatTimeRange(ev.start, ev.end) || 'Zeit folgt';
            card.appendChild(timeEl);

            if (group) {
                const groupEl = document.createElement('p');
                groupEl.className = `event-group text-xs font-semibold text-center mb-2 uppercase ${groupClass}`;
                groupEl.textContent = groupLabel;
                card.appendChild(groupEl);
            }

            const locationEl = document.createElement('p');
            locationEl.className = 'event-location text-xs text-gray-500 text-center';
            locationEl.textContent = normaliseText(ev.location) || 'Ort folgt';
            card.appendChild(locationEl);

            const eventEnd = ev.end ? ev.end.date : ev.start.date;
            if (eventEnd < now) card.classList.add('past-event');

            return card;
        };

        const now = new Date();
        const feedUrl = `${FEED_URL_BASE}?_=${Date.now()}`;

        fetch(feedUrl, { cache: 'no-store' })
            .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text(); })
            .then(text => {
                const events = parseICS(text)
                    .map(ev => ({
                        ...ev,
                        summary:     normaliseText(ev.summary),
                        description: normaliseText(ev.description),
                        location:    normaliseText(ev.location),
                        categories:  ev.categories.map(normaliseText).filter(Boolean)
                    }))
                    .filter(ev => /(training|freund|spiel|\btr\b)/i.test(buildSearchText(ev)))
                    .sort((a, b) => a.start.date - b.start.date);

                const upcoming = events.filter(ev => {
                    const endDate = ev.end ? ev.end.date : ev.start.date;
                    return endDate >= now;
                });

                if (!upcoming.length) { statusEl.textContent = 'Derzeit sind keine Einträge verfügbar.'; return; }

                statusEl.remove();
                cardsEl.innerHTML = '';
                upcoming.forEach(ev => cardsEl.appendChild(buildCard(ev, now)));
            })
            .catch(error => {
                statusEl.textContent = 'Termine konnten nicht geladen werden.';
                console.error('[Trainings Feed]', error);
            });
    })();

}); // end DOMContentLoaded
