(function () {
    const nav = document.querySelector('.site-nav');
    if (!nav) {
        return;
    }

    const links = Array.from(nav.querySelectorAll('a'));
    if (links.length === 0) {
        return;
    }

    const PAGE_ALIASES = {
        '': 'index.html',
        'index': 'index.html',
        'add-property': 'addproperty.html',
        'add-property.html': 'addproperty.html'
    };

    function normalizePage(page) {
        const normalized = (page || '').trim().toLowerCase();
        if (!normalized) {
            return 'index.html';
        }

        return PAGE_ALIASES[normalized] || normalized;
    }

    function getCurrentPage() {
        const page = window.location.pathname.split('/').pop();
        return normalizePage(page);
    }

    function resolveHref(link) {
        const href = link.getAttribute('href') || '';

        try {
            const url = new URL(href, window.location.href);
            const page = url.pathname.split('/').pop() || 'index.html';
            return {
                page: normalizePage(page),
                hash: url.hash || ''
            };
        } catch (error) {
            const split = href.split('#');
            return {
                page: normalizePage(split[0] || 'index.html'),
                hash: split[1] ? `#${split[1]}` : ''
            };
        }
    }

    function setActive(activeLink) {
        links.forEach((link) => link.classList.remove('active'));
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    function findInitialActiveLink() {
        const currentPage = getCurrentPage();
        const currentHash = window.location.hash || '';

        let exactMatch = links.find((link) => {
            const target = resolveHref(link);
            return target.page === currentPage && target.hash === currentHash;
        });
        if (exactMatch) {
            return exactMatch;
        }

        if (currentPage === 'index.html' && currentHash) {
            const hashMatch = links.find((link) => resolveHref(link).hash === currentHash);
            if (hashMatch) {
                return hashMatch;
            }
        }

        const pageMatch = links.find((link) => {
            const target = resolveHref(link);
            return target.page === currentPage && target.hash === '';
        });
        if (pageMatch) {
            return pageMatch;
        }

        return links[0];
    }

    links.forEach((link) => {
        link.addEventListener('click', () => {
            const target = resolveHref(link);
            if (target.page === getCurrentPage()) {
                setActive(link);
            }
        });
    });

    window.addEventListener('hashchange', () => {
        if (getCurrentPage() !== 'index.html') {
            return;
        }

        const currentHash = window.location.hash || '';
        const hashMatch = links.find((link) => resolveHref(link).hash === currentHash);
        if (hashMatch) {
            setActive(hashMatch);
            return;
        }

        const homeLink = links.find((link) => {
            const target = resolveHref(link);
            return target.page === 'index.html' && target.hash === '';
        });
        if (homeLink) {
            setActive(homeLink);
        }
    });

    setActive(findInitialActiveLink());
})();
