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

    const statsUrlPreSeason = 'public/202526_preseason_hcstats.json';
    const statsUrlPlayoffsHalfFinals = 'public/202526_playoffs_hcstats.json';
    const statsUrlPlayoffs = 'public/hcstats.json';
    const liveTickerContent = document.getElementById('live-ticker-content');
    const liveTickerUpdated = document.getElementById('live-ticker-updated');
    const liveGamesBigUpdated = document.getElementById('live-games-big-updated');
    const pageLoadTimeLabel = new Date().toLocaleString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    if (liveGamesBigUpdated) {
        liveGamesBigUpdated.textContent = `Stand: ${pageLoadTimeLabel}`;
    }
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
    const scoreSignatureKey = 'hct-score-signature';
    const hctTeamId = 11;
    let previousGameScores = new Map();
    const liveGameDefaultLogoSize = 'w-20 h-20 md:w-28 md:h-28';
    const liveGameHctLogoSize = 'w-28 h-28 md:w-40 md:h-40';

    const getGameId = game => String(game?.game_id ?? game?.id ?? `${game?.date || ''}-${game?.home_team_id || ''}-${game?.away_team_id || ''}`);
    const parseScore = value => {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    };
    const getLiveGameLogoSize = teamId => (Number(teamId) === hctTeamId ? liveGameHctLogoSize : liveGameDefaultLogoSize);

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

    const renderLiveGamesBig = (data, goalEvents = new Map()) => {
        const wrapper = document.getElementById('live-games-big-wrapper');
        const container = document.getElementById('live-games-big-container');
        if (!container) {
            return;
        }

        if (liveGamesBigUpdated) {
            liveGamesBigUpdated.textContent = `Stand: ${pageLoadTimeLabel}`;
        }

        const games = data?.games || [];
        const liveStatuses = new Set(['live', 'active']);
        const liveGames = games.filter(game => {
            const status = normalizeStatus(game.status);
            return liveStatuses.has(status) || status.includes('live');
        });

        container.innerHTML = '';
        if (wrapper) {
            wrapper.classList.add('hidden');
        }

        if (liveGames.length === 0) {
            return;
        }

        if (wrapper) {
            wrapper.classList.remove('hidden');
        }

        liveGames.forEach(game => {
            const gameId = getGameId(game);
            const goalEvent = goalEvents.get(gameId);

            const gameDiv = document.createElement('article');
            gameDiv.className = 'rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 md:p-6 shadow-sm';
            if (goalEvent) {
                gameDiv.classList.add('goal-game-highlight');
            }

            const meta = document.createElement('div');
            meta.className = 'mb-4 flex flex-wrap items-center justify-between gap-2';

            if (goalEvent) {
                const goalBadge = document.createElement('span');
                goalBadge.className = 'goal-burst-badge';
                goalBadge.textContent = goalEvent.goalsAdded > 1 ? `TOOOOR HCT x${goalEvent.goalsAdded}` : 'TOOOOR HCT!';
                meta.appendChild(goalBadge);
            }

            const liveBadge = document.createElement('span');
            liveBadge.className = 'inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-hc-red';

            const badgeDot = document.createElement('span');
            badgeDot.className = 'h-2 w-2 rounded-full bg-hc-red animate-pulse';
            liveBadge.appendChild(badgeDot);
            liveBadge.appendChild(document.createTextNode('Live'));

            const details = document.createElement('span');
            details.className = 'text-sm font-medium text-gray-600';
            const timeLabel = game.time ? game.time.slice(0, 5) : '--:--';
            const arenaLabel = (game.arena_name || '').trim();
            details.textContent = arenaLabel ? `${timeLabel} Uhr, ${arenaLabel}` : `${timeLabel} Uhr`;

            meta.appendChild(liveBadge);
            meta.appendChild(details);

            const teamsRow = document.createElement('div');
            teamsRow.className = 'grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6';

            const homeTeamDiv = document.createElement('div');
            homeTeamDiv.className = 'flex min-w-0 flex-col items-center gap-3 text-center';
            const homeLogo = createLogoNode(game.home_team_id, game.home_team_name, getLiveGameLogoSize(game.home_team_id));
            const homeName = document.createElement('div');
            homeName.className = 'text-base md:text-xl font-semibold text-gray-900 leading-tight';
            homeName.textContent = game.home_team_name || '';
            if (goalEvent && goalEvent.teamSide === 'home') {
                homeLogo.classList.add('goal-logo-pop');
            }
            homeTeamDiv.appendChild(homeLogo);
            homeTeamDiv.appendChild(homeName);

            const scoreDiv = document.createElement('div');
            scoreDiv.className = 'whitespace-nowrap rounded-xl bg-hc-red px-4 py-2 text-2xl md:text-4xl font-black text-white shadow-lg';
            scoreDiv.textContent = `${formatScore(game.score_home)} : ${formatScore(game.score_away)}`;
            if (goalEvent) {
                scoreDiv.classList.add('goal-score-pop');
            }

            const awayTeamDiv = document.createElement('div');
            awayTeamDiv.className = 'flex min-w-0 flex-col items-center gap-3 text-center';
            const awayLogo = createLogoNode(game.away_team_id, game.away_team_name, getLiveGameLogoSize(game.away_team_id));
            const awayName = document.createElement('div');
            awayName.className = 'text-base md:text-xl font-semibold text-gray-900 leading-tight';
            awayName.textContent = game.away_team_name || '';
            if (goalEvent && goalEvent.teamSide === 'away') {
                awayLogo.classList.add('goal-logo-pop');
            }
            awayTeamDiv.appendChild(awayLogo);
            awayTeamDiv.appendChild(awayName);

            teamsRow.appendChild(homeTeamDiv);
            teamsRow.appendChild(scoreDiv);
            teamsRow.appendChild(awayTeamDiv);

            gameDiv.appendChild(meta);
            gameDiv.appendChild(teamsRow);
            container.appendChild(gameDiv);
        });
    };

    const detectHctGoalEvents = data => {
        const games = Array.isArray(data?.games) ? data.games : [];
        const liveStatuses = new Set(['live', 'active']);
        const nextScores = new Map();
        const goalEvents = new Map();

        games.forEach(game => {
            const gameId = getGameId(game);
            const homeScore = parseScore(game.score_home);
            const awayScore = parseScore(game.score_away);
            nextScores.set(gameId, { home: homeScore, away: awayScore });

            const previous = previousGameScores.get(gameId);
            if (!previous) {
                return;
            }

            const status = normalizeStatus(game.status);
            const isLive = liveStatuses.has(status) || status.includes('live');
            if (!isLive) {
                return;
            }

            if (Number(game.home_team_id) === hctTeamId && homeScore > previous.home) {
                goalEvents.set(gameId, { teamSide: 'home', goalsAdded: homeScore - previous.home });
            } else if (Number(game.away_team_id) === hctTeamId && awayScore > previous.away) {
                goalEvents.set(gameId, { teamSide: 'away', goalsAdded: awayScore - previous.away });
            }
        });

        previousGameScores = nextScores;
        return goalEvents;
    };

    const buildScoreSignature = data => {
        const games = Array.isArray(data?.games) ? data.games : [];
        return games
            .map(game => {
                const gameId = game.id ?? game.game_id ?? `${game.date || ''}-${game.home_team_id || ''}-${game.away_team_id || ''}`;
                return `${gameId}:${formatScore(game.score_home)}-${formatScore(game.score_away)}`;
            })
            .sort()
            .join('|');
    };

    const maybeReloadOnScoreChange = (data, suppressReload = false) => {
        const signature = buildScoreSignature(data);
        if (!signature) {
            return;
        }

        try {
            const previousSignature = sessionStorage.getItem(scoreSignatureKey);
            if (!previousSignature) {
                sessionStorage.setItem(scoreSignatureKey, signature);
                return;
            }

            if (previousSignature !== signature) {
                sessionStorage.setItem(scoreSignatureKey, signature);
                if (!suppressReload) {
                    window.location.reload();
                }
            }
        } catch (error) {
            console.warn('[Score Reload]', error);
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

    const fetchNoStoreJson = url => {
        const cacheBustedUrl = `${url}?_=${Date.now()}`;
        return fetch(cacheBustedUrl, { cache: 'no-store' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            });
    };

    const updateTopGameResults = () => {
        fetchNoStoreJson(statsUrlPreSeason)
            .then(data => {
                renderGameResultBanner(data.games || []);
            })
            .catch(error => {
                console.error('[Top Game Result Banner]', error);
            });
    };

    const updateLiveGamesSection = () => {
        fetchNoStoreJson(statsUrlPlayoffs)
            .then(data => {
                const hctGoalEvents = detectHctGoalEvents(data);
                maybeReloadOnScoreChange(data, hctGoalEvents.size > 0);
                renderLiveTicker(data);
                renderLiveGamesBig(data, hctGoalEvents);
            })
            .catch(error => {
                console.error('[Live Games Big]', error);
                if (liveTickerContent) {
                    liveTickerContent.innerHTML = '<span class="text-white/90">Live-Ergebnisse nicht verfügbar.</span>';
                }
                if (liveTickerUpdated) {
                    liveTickerUpdated.textContent = 'Stand: --:--';
                }
                if (liveGamesBigUpdated) {
                    liveGamesBigUpdated.textContent = `Stand: ${pageLoadTimeLabel}`;
                }
                const liveGamesWrapper = document.getElementById('live-games-big-wrapper');
                const liveGamesContainer = document.getElementById('live-games-big-container');
                if (liveGamesContainer) {
                    liveGamesContainer.innerHTML = '';
                }
                if (liveGamesWrapper) {
                    liveGamesWrapper.classList.add('hidden');
                }
            });
    };

    const updateBanner = () => {
        updateTopGameResults();
        updateLiveGamesSection();
    };

    updateBanner();
    setInterval(updateBanner, 60000);

    const standingsBody = document.getElementById('standings-table-body');
    const gamesCarousel = document.getElementById('hc-games-carousel');
    const gamesStatus = document.getElementById('hc-games-status');

    const playoffSectionUpdated = document.getElementById('news-playoff-updated');
    const playoffGamesCarousel = document.getElementById('news-playoff-games-carousel');
    const playoffGamesStatus = document.getElementById('news-playoff-games-status');
    const playoffSeriesStats = document.getElementById('news-playoff-series-stats');
    const playoffTopScorer = document.getElementById('news-playoff-topscorer');
    const playoffStandingsBody = document.getElementById('news-playoff-standings-body');
    const playoffFinalUpdated = document.getElementById('news-playoff-final-updated');
    const playoffFinalStatus = document.getElementById('news-playoff-final-status');
    const playoffFinalCountdown = document.getElementById('news-playoff-final-countdown');
    const playoffFinalCard = document.getElementById('news-playoff-final-card');
    let playoffFinalCountdownIntervalId = null;

    if (standingsBody || gamesCarousel || playoffGamesCarousel || playoffSeriesStats || playoffTopScorer || playoffStandingsBody || playoffFinalCard) {

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

        const getGamePhaseId = game => {
            if (!game || typeof game !== 'object') {
                return null;
            }
            const candidates = [
                game.phase_id,
                game.phaseId,
                game.phase?.id,
                game.phase?.phase_id,
                game.phase?.phaseId
            ];
            for (const candidate of candidates) {
                const parsed = Number(candidate);
                if (Number.isFinite(parsed)) {
                    return parsed;
                }
            }
            return null;
        };

        const getPlayoffGames = games => {
            const safeGames = Array.isArray(games) ? games : [];
            const hasPhaseMetadata = safeGames.some(game => getGamePhaseId(game) !== null);
            if (!hasPhaseMetadata) {
                return safeGames;
            }
            return safeGames.filter(game => getGamePhaseId(game) === 2);
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

        const clearPlayoffFinalCountdown = () => {
            if (playoffFinalCountdownIntervalId) {
                clearInterval(playoffFinalCountdownIntervalId);
                playoffFinalCountdownIntervalId = null;
            }
        };

        const setPlayoffFinalStatus = message => {
            if (!playoffFinalStatus) {
                return;
            }
            playoffFinalStatus.textContent = message;
        };

        const setPlayoffFinalCountdown = message => {
            if (!playoffFinalCountdown) {
                return;
            }
            const match = /^Faceoff in\s+(.+)$/.exec(message);
            if (match) {
                playoffFinalCountdown.innerHTML = `<span class="text-white">Faceoff in </span><span class="text-hc-red">${match[1]}</span>`;
                return;
            }
            playoffFinalCountdown.textContent = message;
        };

        const toGameDate = game => {
            if (!game?.date) {
                return null;
            }
            const timeValue = game.time ? game.time : '00:00:00';
            const parsed = new Date(`${game.date}T${timeValue}`);
            if (!Number.isNaN(parsed.getTime())) {
                return parsed;
            }
            const fallback = new Date(game.date);
            return Number.isNaN(fallback.getTime()) ? null : fallback;
        };

        const formatCountdown = targetDate => {
            const diffMs = targetDate.getTime() - Date.now();
            if (diffMs <= 0) {
                return 'Spiel läuft oder hat bereits begonnen.';
            }
            const totalSeconds = Math.floor(diffMs / 1000);
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;
            return `Faceoff in ${days}T ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
        };

        const getLastUpcomingGame = games => {
            const upcomingStatuses = new Set(['upcoming', 'active', 'live']);
            const now = Date.now();
            const safeGames = Array.isArray(games) ? games : [];
            const candidates = safeGames.filter(game => {
                const status = normalizeStatus(game.status);
                const timestamp = getGameTimestamp(game);
                return upcomingStatuses.has(status) || timestamp >= now;
            });
            const source = candidates.length ? candidates : safeGames;
            if (!source.length) {
                return null;
            }
            return [...source].sort((a, b) => getGameTimestamp(b) - getGameTimestamp(a))[0];
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
            const normalizedStatus = normalizeStatus(game.status);
            status.textContent = statusLabel(normalizedStatus);
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
            const shouldHideScore = hideScoreStatuses.has(normalizedStatus)
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

        const setPlayoffGamesStatus = message => {
            if (!playoffGamesStatus) {
                return;
            }
            playoffGamesStatus.textContent = message;
            playoffGamesStatus.classList.remove('hidden');
        };

        const clearPlayoffGamesStatus = () => {
            if (!playoffGamesStatus) {
                return;
            }
            playoffGamesStatus.textContent = '';
            playoffGamesStatus.classList.add('hidden');
        };

        const setPlayoffStandingsEmpty = message => {
            if (!playoffStandingsBody) {
                return;
            }
            playoffStandingsBody.innerHTML = '';
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 5;
            cell.className = 'px-4 py-4 text-gray-500';
            cell.textContent = message;
            row.appendChild(cell);
            playoffStandingsBody.appendChild(row);
        };

        const renderPlayoffStandings = (standings, highlightTeamId) => {
            if (!playoffStandingsBody) {
                return;
            }
            playoffStandingsBody.innerHTML = '';
            if (!standings.length) {
                setPlayoffStandingsEmpty('Keine Tabellendaten verfügbar.');
                return;
            }

            const sortedStandings = [...standings].sort((a, b) => {
                const aRank = Number(a.rank);
                const bRank = Number(b.rank);
                if (Number.isFinite(aRank) && Number.isFinite(bRank) && aRank !== bRank) {
                    return aRank - bRank;
                }
                return Number(b.points || 0) - Number(a.points || 0);
            });

            sortedStandings.forEach((team, index) => {
                const row = document.createElement('tr');
                const isHighlighted = highlightTeamId !== null && highlightTeamId !== undefined
                    && Number(team.team_id) === Number(highlightTeamId);
                if (isHighlighted) {
                    row.className = 'bg-hc-red text-white font-semibold';
                } else {
                    row.className = index % 2 === 1 ? 'bg-gray-50' : 'bg-white';
                }

                appendCell(row, team.rank, true);
                appendCell(row, team.team_name);
                appendCell(row, team.points);
                appendCell(row, team.games_played);
                appendCell(row, team.goal_diff);
                playoffStandingsBody.appendChild(row);
            });
        };

        const renderPlayoffSeriesStats = (games, teamId) => {
            if (!playoffSeriesStats) {
                return;
            }
            const completedStatuses = new Set(['completed', 'closed', 'scorekeeper_signed', 'referee_signed']);
            const completedGames = games.filter(game => completedStatuses.has(normalizeStatus(game.status)));
            const openGames = games.length - completedGames.length;

            let wins = 0;
            let losses = 0;
            let goalsFor = 0;
            let goalsAgainst = 0;

            completedGames.forEach(game => {
                const isHome = Number(game.home_team_id) === Number(teamId);
                const ownGoals = parseScore(isHome ? game.score_home : game.score_away);
                const oppGoals = parseScore(isHome ? game.score_away : game.score_home);
                goalsFor += ownGoals;
                goalsAgainst += oppGoals;
                if (ownGoals > oppGoals) {
                    wins += 1;
                } else if (ownGoals < oppGoals) {
                    losses += 1;
                }
            });

            const statCards = [
                { label: 'Spiele', value: games.length },
                { label: 'Siege', value: wins },
                { label: 'Niederlagen', value: losses },
                { label: 'Offen', value: openGames },
                { label: 'Tore', value: goalsFor },
                { label: 'Gegentore', value: goalsAgainst }
            ];

            playoffSeriesStats.innerHTML = '';
            statCards.forEach(card => {
                const node = document.createElement('div');
                node.className = 'rounded-lg bg-white border border-gray-200 px-3 py-2';
                const label = document.createElement('p');
                label.className = 'text-xs uppercase tracking-wide text-gray-500';
                label.textContent = card.label;
                const value = document.createElement('p');
                value.className = 'text-xl font-black text-gray-900';
                value.textContent = String(card.value);
                node.appendChild(label);
                node.appendChild(value);
                playoffSeriesStats.appendChild(node);
            });
        };

        const renderPlayoffTopScorer = players => {
            if (!playoffTopScorer) {
                return;
            }
            playoffTopScorer.innerHTML = '';
            if (!players.length) {
                const empty = document.createElement('p');
                empty.className = 'text-sm text-gray-500';
                empty.textContent = 'Keine Spielerstatistik verfügbar.';
                playoffTopScorer.appendChild(empty);
                return;
            }

            const sortedPlayers = [...players]
                .sort((a, b) => Number(b.total_points || 0) - Number(a.total_points || 0))
                .slice(0, 8);

            sortedPlayers.forEach((player, index) => {
                const row = document.createElement('div');
                row.className = 'flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3';

                const goals = parseScore(player.goals);
                const assists = parseScore(player.assists);
                const totalPoints = parseScore(player.total_points) || (goals + assists);
                const barTotal = goals + assists;
                const goalsPct = barTotal > 0 ? (goals / barTotal) * 100 : 0;
                const assistsPct = barTotal > 0 ? 100 - goalsPct : 0;

                const name = document.createElement('span');
                name.className = 'sm:w-1/3 text-sm font-semibold text-gray-700 text-center sm:text-left';
                name.textContent = `${index + 1}. ${`${player.player_name || ''} ${player.player_surname || ''}`.trim()}`;

                const barsWrap = document.createElement('div');
                barsWrap.className = 'flex-1 flex flex-col gap-2';

                const barTrack = document.createElement('div');
                barTrack.className = 'w-full h-4 bg-gray-100 border border-gray-200 rounded-full overflow-hidden shadow-sm flex';

                const goalsBar = document.createElement('div');
                goalsBar.className = 'bar-goals h-full';
                goalsBar.style.width = `${goalsPct}%`;

                const assistsBar = document.createElement('div');
                assistsBar.className = 'bar-assists h-full';
                assistsBar.style.width = `${assistsPct}%`;

                barTrack.appendChild(goalsBar);
                barTrack.appendChild(assistsBar);

                const counts = document.createElement('div');
                counts.className = 'flex justify-between text-xs text-gray-600';

                const goalsLabel = document.createElement('span');
                goalsLabel.className = 'font-medium text-gray-700';
                goalsLabel.textContent = `${goals} Tore`;

                const assistsLabel = document.createElement('span');
                assistsLabel.className = 'font-medium text-gray-700';
                assistsLabel.textContent = `${assists} Assists`;

                counts.appendChild(goalsLabel);
                counts.appendChild(assistsLabel);

                barsWrap.appendChild(barTrack);
                barsWrap.appendChild(counts);

                const points = document.createElement('span');
                points.className = 'sm:w-14 text-sm font-bold text-gray-800 text-center sm:text-right';
                points.textContent = `${totalPoints} Pkt`;

                row.appendChild(name);
                row.appendChild(barsWrap);
                row.appendChild(points);
                playoffTopScorer.appendChild(row);
            });

            const legend = document.createElement('div');
            legend.className = 'flex flex-col items-center justify-center gap-3 pt-2 text-xs text-gray-600 sm:flex-row sm:justify-end sm:gap-6';

            const goalsLegend = document.createElement('div');
            goalsLegend.className = 'flex items-center gap-2';
            goalsLegend.innerHTML = '<div class="w-4 h-4 rounded-full bar-goals border"></div><span>Tore</span>';

            const assistsLegend = document.createElement('div');
            assistsLegend.className = 'flex items-center gap-2';
            assistsLegend.innerHTML = '<div class="w-4 h-4 rounded-full bar-assists border"></div><span>Assists</span>';

            legend.appendChild(goalsLegend);
            legend.appendChild(assistsLegend);
            playoffTopScorer.appendChild(legend);
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

        const renderPlayoffGames = (games, teamId) => {
            if (!playoffGamesCarousel) {
                return;
            }
            playoffGamesCarousel.innerHTML = '';
            if (!games.length) {
                setPlayoffGamesStatus('Keine Playoff-Spiele (phase_id = 2) verfügbar.');
                return;
            }
            clearPlayoffGamesStatus();

            const sortedGames = [...games].sort((a, b) => getGameTimestamp(a) - getGameTimestamp(b));
            sortedGames.forEach(game => {
                playoffGamesCarousel.appendChild(createGameCard(game, teamId));
            });
        };

        const renderPlayoffFinale = data => {
            if (!playoffFinalCard) {
                return;
            }

            clearPlayoffFinalCountdown();
            playoffFinalCard.innerHTML = '';

            const game = getLastUpcomingGame(data?.games || []);
            if (!game) {
                setPlayoffFinalStatus('Kein kommendes Finalspiel gefunden.');
                setPlayoffFinalCountdown('Faceoff in --T --h --m --s');
                playoffFinalCard.innerHTML = '<p class="text-sm text-white/75">Bitte public/hcstats.json prüfen.</p>';
                return;
            }

            setPlayoffFinalStatus('Das Finalspiel der Playoffs');

            const gameDate = toGameDate(game);
            const arena = (game.arena_name || '').trim() || 'Arena wird noch bekanntgegeben';
            const timeLabel = formatTime(game.time) || '--:--';

            const content = document.createElement('div');
            content.className = 'relative z-10 grid grid-cols-1 gap-6 md:gap-8';

            const topRow = document.createElement('div');
            topRow.className = 'flex flex-col gap-3';

            const meta = document.createElement('div');
            meta.className = 'text-xs md:text-sm text-white/80 uppercase tracking-wider';
            meta.textContent = `${formatDate(game.date)} | ${timeLabel} Uhr | ${arena}`;

            topRow.appendChild(meta);

            const matchup = document.createElement('div');
            matchup.className = 'grid grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-6';

            const buildTeam = (teamId, teamName) => {
                const team = document.createElement('div');
                team.className = 'flex flex-col items-center gap-3 text-center min-w-0';
                const isHct = Number(teamId) === Number(hctTeamId);
                const logoSizeClass = isHct
                    ? 'playoff-final-logo w-28 h-28 md:w-44 md:h-44'
                    : 'playoff-final-logo w-20 h-20 md:w-28 md:h-28';
                const logo = createLogoNode(teamId, teamName, logoSizeClass);
                const name = document.createElement('p');
                name.className = 'text-sm md:text-xl font-black leading-tight text-white';
                name.textContent = teamName || 'Team';
                team.appendChild(logo);
                team.appendChild(name);
                return team;
            };

            const home = buildTeam(game.home_team_id, game.home_team_name);
            const away = buildTeam(game.away_team_id, game.away_team_name);
            const versus = document.createElement('div');
            versus.className = 'playoff-final-vs text-3xl md:text-5xl font-black tracking-widest';
            versus.textContent = 'VS';

            matchup.appendChild(home);
            matchup.appendChild(versus);
            matchup.appendChild(away);

            content.appendChild(topRow);
            content.appendChild(matchup);
            playoffFinalCard.appendChild(content);

            if (gameDate) {
                const updateCountdown = () => {
                    setPlayoffFinalCountdown(formatCountdown(gameDate));
                };
                updateCountdown();
                playoffFinalCountdownIntervalId = setInterval(updateCountdown, 1000);
            } else {
                setPlayoffFinalCountdown('Startzeit folgt');
            }
        };

        const loadPlayoffSection = () => {
            fetchNoStoreJson(statsUrlPlayoffsHalfFinals)
                .then(data => {
                    const playoffGames = getPlayoffGames(data.games || []);
                    renderPlayoffGames(playoffGames, data.team_id);
                    renderPlayoffSeriesStats(playoffGames, data.team_id);
                    renderPlayoffTopScorer(data.players || []);
                    renderPlayoffStandings(data.standings || [], data.team_id);
                    if (playoffSectionUpdated) {
                        const formatted = formatUpdateTime(data?.updated_at);
                        playoffSectionUpdated.textContent = formatted ? `Stand: ${formatted}` : `Stand: ${pageLoadTimeLabel}`;
                    }
                })
                .catch(error => {
                    console.error('[Playoff Hub]', error);
                    if (playoffStandingsBody) {
                        setPlayoffStandingsEmpty('Tabellendaten konnten nicht geladen werden.');
                    }
                    if (playoffSeriesStats) {
                        playoffSeriesStats.innerHTML = '<div class="rounded-lg bg-white border border-gray-200 px-3 py-2 text-sm text-gray-500">Statistik konnte nicht geladen werden.</div>';
                    }
                    if (playoffTopScorer) {
                        playoffTopScorer.innerHTML = '<p class="text-sm text-gray-500">Spielerstatistik konnte nicht geladen werden.</p>';
                    }
                    if (playoffSectionUpdated) {
                        playoffSectionUpdated.textContent = `Stand: ${pageLoadTimeLabel}`;
                    }
                });

            fetchNoStoreJson(statsUrlPlayoffs)
                .then(data => {
                    renderPlayoffFinale(data);
                    if (playoffFinalUpdated) {
                        const formatted = formatUpdateTime(data?.updated_at);
                        playoffFinalUpdated.textContent = formatted ? `Stand: ${formatted}` : `Stand: ${pageLoadTimeLabel}`;
                    }
                })
                .catch(error => {
                    console.error('[Playoff Finale]', error);
                    clearPlayoffFinalCountdown();
                    setPlayoffFinalStatus('Finalspiel konnte nicht geladen werden.');
                    setPlayoffFinalCountdown('Faceoff in --T --h --m --s');
                    if (playoffFinalCard) {
                        playoffFinalCard.innerHTML = '<p class="text-sm text-white/75">Daten konnten nicht geladen werden.</p>';
                    }
                    if (playoffFinalUpdated) {
                        playoffFinalUpdated.textContent = `Stand: ${pageLoadTimeLabel}`;
                    }
                });
        };

        loadPlayoffSection();
        setInterval(loadPlayoffSection, 60000);

        fetch(statsUrlPreSeason, { cache: 'no-store' })
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
