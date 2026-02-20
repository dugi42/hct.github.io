document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        document.querySelectorAll('#mobile-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    const tabNext = document.getElementById('tab-next');
    const tabLast = document.getElementById('tab-last');
    const tabSchedule = document.getElementById('tab-schedule');
    const contentNext = document.getElementById('content-next');
    const contentLast = document.getElementById('content-last');
    const contentSchedule = document.getElementById('content-schedule');

    const switchTab = (activeTab, activeContent) => {
        [contentNext, contentLast, contentSchedule].forEach(content => {
            if (content) {
                content.classList.add('hidden');
            }
        });

        [tabNext, tabLast, tabSchedule].forEach(tab => {
            if (tab) {
                tab.classList.remove('bg-white', 'border-hc-red', 'text-gray-800');
                tab.classList.add('bg-gray-50', 'text-gray-500');
            }
        });

        if (activeContent) {
            activeContent.classList.remove('hidden');
        }
        if (activeTab) {
            activeTab.classList.add('bg-white', 'border-hc-red', 'text-gray-800');
            activeTab.classList.remove('bg-gray-50', 'text-gray-500');
        }
    };

    if (tabNext && tabLast && tabSchedule && contentNext && contentLast && contentSchedule) {
        tabNext.addEventListener('click', () => switchTab(tabNext, contentNext));
        tabLast.addEventListener('click', () => switchTab(tabLast, contentLast));
        tabSchedule.addEventListener('click', () => switchTab(tabSchedule, contentSchedule));
    }

    const galleryFilters = document.querySelectorAll('.gallery-filter');
    const galleryItems = document.querySelectorAll('.gallery-item');

    if (galleryFilters.length && galleryItems.length) {
        galleryFilters.forEach(filter => {
            filter.addEventListener('click', () => {
                const filterValue = filter.getAttribute('data-filter');

                galleryFilters.forEach(btn => {
                    btn.classList.remove('bg-hc-red', 'text-white');
                    btn.classList.add('text-gray-600');
                });

                filter.classList.add('bg-hc-red', 'text-white');
                filter.classList.remove('text-gray-600');

                galleryItems.forEach(item => {
                    if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    const galleryModal = document.getElementById('gallery-modal');
    const galleryModalImg = document.getElementById('gallery-modal-img');
    const galleryModalTitle = document.getElementById('gallery-modal-title');
    const galleryModalSubtitle = document.getElementById('gallery-modal-subtitle');
    const galleryModalClose = document.getElementById('gallery-modal-close');

    if (galleryModal && galleryModalClose && galleryItems.length) {
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                const title = item.querySelector('h3')?.textContent ?? '';
                const subtitle = item.querySelector('p')?.textContent ?? '';

                if (img) {
                    galleryModalImg.src = img.src;
                }
                if (galleryModalTitle) {
                    galleryModalTitle.textContent = title;
                }
                if (galleryModalSubtitle) {
                    galleryModalSubtitle.textContent = subtitle;
                }
                galleryModal.classList.add('active');
            });
        });

        galleryModalClose.addEventListener('click', () => {
            galleryModal.classList.remove('active');
        });

        galleryModal.addEventListener('click', event => {
            if (event.target === galleryModal) {
                galleryModal.classList.remove('active');
            }
        });
    }

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };

    const animateCounter = counter => {
        const target = parseInt(counter.getAttribute('data-target') ?? '0', 10);
        if (Number.isNaN(target) || target === 0) {
            return;
        }
        const increment = target / 100;
        let current = 0;

        const updateCounter = () => {
            if (current < target) {
                current += increment;
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };

        updateCounter();
    };

    const statsObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            }
            entry.target.querySelectorAll('.counter').forEach(counter => {
                if (counter.textContent === '0') {
                    animateCounter(counter);
                }
            });
        });
    }, observerOptions);

    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        statsObserver.observe(statsContainer);
    }

    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    const carousel = document.getElementById('sponsor-grid');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (carousel && prevBtn && nextBtn) {
        const sponsors = Array.from(document.querySelectorAll('.sponsor-card'));
        if (sponsors.length) {
            let currentCardIndex = 0;

            const getCardWidth = () => {
                const styles = getComputedStyle(carousel);
                const gap = parseFloat(styles.columnGap || styles.gap) || 0;
                return sponsors[0].offsetWidth + gap;
            };

            const scrollToIndex = index => {
                const width = getCardWidth();
                carousel.scroll({
                    left: index * width,
                    behavior: 'smooth'
                });
            };

            const updateIndex = () => {
                const width = getCardWidth();
                if (width > 0) {
                    currentCardIndex = Math.round(carousel.scrollLeft / width);
                }
            };

            nextBtn.addEventListener('click', event => {
                event.preventDefault();
                currentCardIndex = (currentCardIndex + 1) % sponsors.length;
                scrollToIndex(currentCardIndex);
            });

            prevBtn.addEventListener('click', event => {
                event.preventDefault();
                currentCardIndex = (currentCardIndex - 1 + sponsors.length) % sponsors.length;
                scrollToIndex(currentCardIndex);
            });

            let isDragging = false;
            let startX = 0;
            let startScrollLeft = 0;
            let activePointerId = null;

            carousel.addEventListener('pointerdown', event => {
                if (event.pointerType === 'mouse' && event.button !== 0) {
                    return;
                }
                isDragging = true;
                activePointerId = event.pointerId;
                startX = event.clientX;
                startScrollLeft = carousel.scrollLeft;
                carousel.setPointerCapture(activePointerId);
            });

            const endDrag = () => {
                if (!isDragging) {
                    return;
                }
                isDragging = false;
                if (activePointerId !== null) {
                    carousel.releasePointerCapture(activePointerId);
                    activePointerId = null;
                }
                updateIndex();
            };

            carousel.addEventListener('pointermove', event => {
                if (!isDragging) {
                    return;
                }
                const delta = event.clientX - startX;
                carousel.scrollLeft = startScrollLeft - delta;
            });

            carousel.addEventListener('pointerup', endDrag);
            carousel.addEventListener('pointercancel', endDrag);
            carousel.addEventListener('pointerleave', endDrag);
            carousel.addEventListener('scroll', updateIndex);

            const sponsorObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                    }
                });
            }, {
                root: carousel,
                rootMargin: '0px',
                threshold: 0.5
            });

            sponsors.forEach(card => {
                sponsorObserver.observe(card);
            });
        }
    }

    const statsUrl = 'public/202526_preseason_hcstats.json';
    const liveTickerContent = document.getElementById('live-ticker-content');
    const liveTickerUpdated = document.getElementById('live-ticker-updated');
    const logoMap = new Map([
        [3, 'images/cup_logos/ec_aschauer_eisbaeren.jpg'],
        [6, 'images/cup_logos/ec_sellraintal_wolves.jpg'],
        [8, 'images/cup_logos/ehc_black_scorpions.jpg'],
        [10, 'images/cup_logos/ehc_white_hawks_volders.jpg'],
        [11, 'images/cup_logos/hockey_club_thaur.png'],
        [15, 'images/cup_logos/tyrolean_ice_kings.jpg'],
        [29, 'images/cup_logos/ec_newcomer_2.jpg']
    ]);

    const formatDate = value => {
        if (!value) {
            return '--';
        }
        const parts = value.split('-');
        if (parts.length !== 3) {
            return value;
        }
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    };

    const formatScore = value => {
        if (value === null || value === undefined) {
            return '-';
        }
        return value;
    };

    const normalizeStatus = status => (status ? status.toLowerCase() : '');

    const createLogoNode = (teamId, teamName, sizeClass = 'w-12 h-12') => {
        const logoSrc = logoMap.get(Number(teamId));
        if (!logoSrc) {
            const placeholder = document.createElement('div');
            placeholder.className = sizeClass;
            return placeholder;
        }
        const img = document.createElement('img');
        img.src = logoSrc;
        img.alt = teamName ? `${teamName} Logo` : 'Team Logo';
        img.className = `${sizeClass} object-contain`;
        return img;
    };

    const formatUpdateTime = value => {
        if (!value) {
            return null;
        }
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return null;
        }
        return date.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    const renderLiveTicker = (data) => {
        if (!liveTickerContent) {
            return;
        }

        const games = data?.games || [];
        const liveStatuses = new Set(['live', 'active']);
        const liveGames = games.filter(game => {
            const status = normalizeStatus(game.status);
            return liveStatuses.has(status) || status.includes('live');
        });

        liveTickerContent.innerHTML = '';

        if (liveGames.length === 0) {
            const empty = document.createElement('span');
            empty.className = 'text-white/90';
            empty.textContent = 'Derzeit keine Live-Spiele.';
            liveTickerContent.appendChild(empty);
        } else {
            liveGames.forEach(game => {
                const item = document.createElement('div');
                item.className = 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10';

                const homeLogo = createLogoNode(game.home_team_id, game.home_team_name, 'w-6 h-6');
                const awayLogo = createLogoNode(game.away_team_id, game.away_team_name, 'w-6 h-6');

                const homeName = document.createElement('span');
                homeName.className = 'font-semibold';
                homeName.textContent = game.home_team_name || '';

                const awayName = document.createElement('span');
                awayName.className = 'font-semibold';
                awayName.textContent = game.away_team_name || '';

                const score = document.createElement('span');
                score.className = 'text-sm font-bold';
                score.textContent = `${formatScore(game.score_home)} : ${formatScore(game.score_away)}`;

                item.appendChild(homeLogo);
                item.appendChild(homeName);
                item.appendChild(score);
                item.appendChild(awayName);
                item.appendChild(awayLogo);
                liveTickerContent.appendChild(item);
            });
        }

        if (liveTickerUpdated) {
            const formatted = formatUpdateTime(data?.updated_at);
            liveTickerUpdated.textContent = formatted ? `Stand: ${formatted}` : 'Stand: --:--';
        }
    };

    const renderGameResultBanner = (games) => {
        const banner = document.getElementById('game-result-banner');
        if (!banner) {
            return;
        }
        banner.innerHTML = '';
        const completedGames = games.filter(game => {
            return new Set(['completed', 'closed', 'scorekeeper_signed', 'referee_signed']).has(game.status);
        });

        if (completedGames.length === 0) {
            return;
        }

        // Duplicate games to ensure smooth scrolling
        const bannerContent = [...completedGames, ...completedGames];

        bannerContent.forEach(game => {
            const item = document.createElement('div');
            item.className = 'game-result-item';
            
            const scoreAndLogos = document.createElement('div');
            scoreAndLogos.className = 'flex items-center gap-4';

            const homeLogo = createLogoNode(game.home_team_id, game.home_team_name);
            const awayLogo = createLogoNode(game.away_team_id, game.away_team_name);
            
            const score = document.createElement('span');
            score.className = 'text-xl font-bold';
            score.textContent = `${formatScore(game.score_home)} : ${formatScore(game.score_away)}`;

            scoreAndLogos.appendChild(homeLogo);
            scoreAndLogos.appendChild(score);
            scoreAndLogos.appendChild(awayLogo);

            const date = document.createElement('div');
            date.className = 'text-sm text-gray-400';
            date.textContent = formatDate(game.date);

            item.appendChild(scoreAndLogos);
            item.appendChild(date);
            banner.appendChild(item);
        });
        startGameResultBannerAnimation(banner);
    };

    let bannerAnimationId = null;

    const startGameResultBannerAnimation = (banner) => {
        if (bannerAnimationId) {
            cancelAnimationFrame(bannerAnimationId);
        }

        let startTime = null;
        const scrollSpeed = 0.05; // pixels per millisecond
        
        // Use a slight delay to ensure the browser has calculated the width
        setTimeout(() => {
            const bannerWidth = banner.scrollWidth / 2; // Since we doubled the content
            if (bannerWidth === 0) return;

            const animate = (timestamp) => {
                if (!startTime) {
                    startTime = timestamp;
                }

                const elapsedTime = timestamp - startTime;
                let scrollPosition = (elapsedTime * scrollSpeed) % bannerWidth;

                banner.style.transform = `translateX(-${scrollPosition}px)`;

                bannerAnimationId = requestAnimationFrame(animate);
            };

            bannerAnimationId = requestAnimationFrame(animate);
        }, 100);
    };

    const updateBanner = () => {
        const cacheBustedUrl = `${statsUrl}?_=${Date.now()}`;
        fetch(cacheBustedUrl, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                renderGameResultBanner(data.games || []);
                renderLiveTicker(data);
            })
            .catch(error => {
                console.error('[Game Result Banner]', error);
                if (liveTickerContent) {
                    liveTickerContent.innerHTML = '<span class="text-white/90">Live-Ergebnisse nicht verfügbar.</span>';
                }
                if (liveTickerUpdated) {
                    liveTickerUpdated.textContent = 'Stand: --:--';
                }
            });
    };

    updateBanner();
    setInterval(updateBanner, 60000);

    const standingsBody = document.getElementById('standings-table-body');
    const gamesCarousel = document.getElementById('hc-games-carousel');
    const gamesStatus = document.getElementById('hc-games-status');

    if (standingsBody || gamesCarousel) {

        const formatValue = value => (value ?? '--');

        const appendCell = (row, value, isRank = false) => {
            const cell = document.createElement('td');
            cell.className = `px-4 py-3${isRank ? ' font-semibold' : ''}`;
            cell.textContent = formatValue(value);
            row.appendChild(cell);
        };

        const setStandingsEmpty = message => {
            if (!standingsBody) {
                return;
            }
            standingsBody.innerHTML = '';
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 11;
            cell.className = 'px-4 py-4 text-gray-500';
            cell.textContent = message;
            row.appendChild(cell);
            standingsBody.appendChild(row);
        };

        const renderStandings = (standings, highlightTeamId) => {
            if (!standingsBody) {
                return;
            }
            standingsBody.innerHTML = '';
            if (!standings.length) {
                setStandingsEmpty('Keine Tabellendaten verfügbar.');
                return;
            }

            standings.forEach((team, index) => {
                const row = document.createElement('tr');
                const isHighlighted = highlightTeamId !== null && highlightTeamId !== undefined
                    && team.team_id === highlightTeamId;

                if (isHighlighted) {
                    row.className = 'bg-hc-red text-white font-semibold';
                } else {
                    row.className = index % 2 === 1 ? 'bg-gray-50' : 'bg-white';
                }

                appendCell(row, team.rank, true);
                appendCell(row, team.team_name);
                appendCell(row, team.points);
                appendCell(row, team.games_played);
                appendCell(row, team.wins);
                appendCell(row, team.losses);
                appendCell(row, team.overtime_wins);
                appendCell(row, team.overtime_losses);
                appendCell(row, team.goals_for);
                appendCell(row, team.goals_against);
                appendCell(row, team.goal_diff);
                standingsBody.appendChild(row);
            });
        };

        const formatTime = value => {
            if (!value) {
                return '';
            }
            return value.slice(0, 5);
        };

        const statusLabel = status => {
            const labels = {
                live: 'Live',
                active: 'Geplant',
                upcoming: 'Geplant',
                completed: 'Abgeschlossen',
                scorekeeper_signed: 'Schreiber signiert',
                referee_signed: 'Schiedsrichter signiert',
                closed: 'Abgeschlossen'
            };
            return labels[status] || 'Unbekannt';
        };

        const getGameTimestamp = game => {
            if (!game?.date) {
                return Number.POSITIVE_INFINITY;
            }
            const timeValue = game.time ? game.time : '00:00:00';
            const timestamp = new Date(`${game.date}T${timeValue}`).getTime();
            if (!Number.isNaN(timestamp)) {
                return timestamp;
            }
            const fallback = new Date(game.date).getTime();
            return Number.isNaN(fallback) ? Number.POSITIVE_INFINITY : fallback;
        };

        const setGamesStatus = message => {
            if (!gamesStatus) {
                return;
            }
            gamesStatus.textContent = message;
            gamesStatus.classList.remove('hidden');
        };

        const clearGamesStatus = () => {
            if (!gamesStatus) {
                return;
            }
            gamesStatus.textContent = '';
            gamesStatus.classList.add('hidden');
        };

        const createGameCard = (game, teamId) => {
            const card = document.createElement('div');
            const isHomeGame = Number(game.home_team_id) === Number(teamId);
            const borderClass = isHomeGame ? 'border-hc-red' : 'border-gray-500';
            card.className = `flex-none w-64 p-4 rounded-xl shadow bg-white border-t-4 snap-center ${borderClass}`;

            const header = document.createElement('div');
            header.className = 'flex justify-between items-center text-sm font-semibold mb-2';

            const location = document.createElement('span');
            location.className = `${isHomeGame ? 'text-hc-red' : 'text-gray-600'} uppercase`;
            location.textContent = isHomeGame ? 'HEIM' : 'AUSWÄRTS';

            const date = document.createElement('span');
            date.className = 'text-gray-500';
            date.textContent = formatDate(game.date);

            header.appendChild(location);
            header.appendChild(date);
            card.appendChild(header);

            const status = document.createElement('div');
            status.className = 'text-xs text-gray-500 font-semibold uppercase text-center mb-2';
            status.textContent = statusLabel(game.status);
            card.appendChild(status);

            const homeName = document.createElement('p');
            homeName.className = 'text-lg font-bold text-gray-900 mb-1 text-center';
            homeName.textContent = game.home_team_name || '';
            card.appendChild(homeName);

            const logos = document.createElement('div');
            logos.className = 'flex items-center justify-between mb-2';

            const homeLogo = createLogoNode(game.home_team_id, game.home_team_name);
            const awayLogo = createLogoNode(game.away_team_id, game.away_team_name);

            const vsWrap = document.createElement('div');
            vsWrap.className = 'flex flex-col items-center';

            const vs = document.createElement('span');
            vs.className = 'text-lg text-gray-500 leading-none';
            vs.textContent = 'vs';

            const score = document.createElement('span');
            score.className = 'text-sm font-semibold text-gray-700';
            const hideScoreStatuses = new Set(['upcoming', 'active']);
            const shouldHideScore = hideScoreStatuses.has(game.status)
                && Number(game.score_home) === 0
                && Number(game.score_away) === 0;
            if (shouldHideScore) {
                score.classList.add('hidden');
            } else {
                score.textContent = `${formatScore(game.score_home)} : ${formatScore(game.score_away)}`;
            }

            vsWrap.appendChild(vs);
            vsWrap.appendChild(score);

            logos.appendChild(homeLogo);
            logos.appendChild(vsWrap);
            logos.appendChild(awayLogo);
            card.appendChild(logos);

            const awayName = document.createElement('p');
            awayName.className = 'text-lg font-bold text-gray-900 mb-1 text-center';
            awayName.textContent = game.away_team_name || '';
            card.appendChild(awayName);

            const details = document.createElement('p');
            details.className = 'text-sm text-gray-600 text-center';
            const timeLabel = formatTime(game.time);
            const arenaLabel = (game.arena_name || '').trim();
            const timeText = timeLabel ? `${timeLabel} Uhr` : '--';
            details.textContent = arenaLabel ? `${timeText}, ${arenaLabel}` : timeText;
            card.appendChild(details);

            return card;
        };

        const renderGames = (games, teamId) => {
            if (!gamesCarousel) {
                return;
            }
            gamesCarousel.innerHTML = '';
            if (!games.length) {
                setGamesStatus('Keine Spiele verfügbar.');
                return;
            }
            clearGamesStatus();
            const sortedGames = [...games].sort((a, b) => getGameTimestamp(a) - getGameTimestamp(b));
            sortedGames.forEach(game => {
                gamesCarousel.appendChild(createGameCard(game, teamId));
            });
        };

        fetch(statsUrl, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                renderStandings(data.standings || [], data.team_id);
                renderGames(data.games || [], data.team_id);
            })
            .catch(error => {
                console.error('[Standings Table]', error);
                setStandingsEmpty('Tabellendaten konnten nicht geladen werden.');
                setGamesStatus('Spiele konnten nicht geladen werden.');
            });
    }

    const bookletPopup = document.getElementById('bookletPopup');
    if (bookletPopup) {
        const closePopup = () => {
            bookletPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        window.openBookletPopup = () => {
            bookletPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };

        window.closeBookletPopup = closePopup;

        bookletPopup.addEventListener('click', event => {
            if (event.target === bookletPopup) {
                closePopup();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closePopup();
            }
        });
    }

    const teamStatsPopup = document.getElementById('teamStatsPopup');
    if (teamStatsPopup) {
        const closeTeamStatsPopup = () => {
            teamStatsPopup.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        window.openTeamStatsPopup = () => {
            teamStatsPopup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };

        window.closeTeamStatsPopup = closeTeamStatsPopup;

        teamStatsPopup.addEventListener('click', event => {
            if (event.target === teamStatsPopup) {
                closeTeamStatsPopup();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeTeamStatsPopup();
            }
        });
    }

    const review202601Popup = document.getElementById('review202601Popup');
    if (review202601Popup) {
        const closeReview202601Popup = () => {
            review202601Popup.style.display = 'none';
            document.body.style.overflow = 'auto';
        };

        window.openReview202601Popup = () => {
            review202601Popup.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };

        window.closeReview202601Popup = closeReview202601Popup;

        review202601Popup.addEventListener('click', event => {
            if (event.target === review202601Popup) {
                closeReview202601Popup();
            }
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeReview202601Popup();
            }
        });
    }
});
