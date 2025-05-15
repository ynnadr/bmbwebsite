document.addEventListener('DOMContentLoaded', () => {
    // === BAGIAN BILINGUAL DARI app.js SEBELUMNYA ===
    const defaultLang = 'en';
    let currentLang = localStorage.getItem('selectedLang') || defaultLang;
    let translations = {};

    const langSwitcher = document.getElementById('language-switcher');
    // Periksa null untuk langButtons jika switcher tidak ada di halaman tertentu (meski seharusnya ada)
    const langButtons = langSwitcher ? langSwitcher.querySelectorAll('.lang-btn') : [];

    async function loadTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for lang ${lang}`);
            }
            translations[lang] = await response.json();
            // console.log(`Translations loaded for ${lang}:`, translations[lang]);
        } catch (error) {
            console.error(`Could not load translations for ${lang}:`, error);
            if (lang !== defaultLang && !translations[defaultLang]) {
                await loadTranslations(defaultLang);
            }
        }
    }

    function applyTranslations(lang) {
        if (!translations[lang]) {
            console.warn(`No translations found for ${lang}. Using default.`);
            if (lang !== defaultLang && translations[defaultLang]) {
                lang = defaultLang;
            } else if (!translations[defaultLang]) {
                console.error("Default language translations also not available. Cannot apply translations.");
                return;
            }
        }

        const data = translations[lang];

        document.getElementById('pageTitle').textContent = data.meta.pageTitle;
        document.getElementById('metaDescription').setAttribute('content', data.meta.metaDescription);
        document.documentElement.lang = lang;

        setTextContent('navPopularRoutes', data.menu.popularRoutes);
        setTextContent('navTipsGuides', data.menu.tipsGuides);
        setTextContent('navBlog', data.menu.blog);
        setTextContent('navAboutUs', data.menu.aboutUs);
        setTextContent('navContact', data.menu.contact);
        // setTextContent('logoText', 'Your Logo Text if dynamic');


        // --- Logika untuk Hero Backgrounds (Contoh lebih baik) ---
        const heroSectionDefault = document.getElementById('hero');
        const heroSectionAltA = document.getElementById('hero-alt-a');
        const heroSectionAltB = document.getElementById('hero-alt-b');

        if (heroSectionDefault && data.sections.hero) {
            setTextContent('heroTitle', data.sections.hero.title);
            setTextContent('heroParagraph', data.sections.hero.paragraph);
            setTextContent('heroButton', data.sections.hero.buttonText);
            // Pastikan path benar dan gambar ada
            heroSectionDefault.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('images/${data.sections.hero.backgroundImage}')`;
        } else if (heroSectionAltA && data.sections.hero) { // Asumsi Alt A pakai data hero yang sama
            const heroContentAltA = heroSectionAltA.querySelector('.hero-content');
            if (heroContentAltA) {
                setTextContent(heroContentAltA.querySelector('h1'), data.sections.hero.title); // Lebih spesifik
                setTextContent(heroContentAltA.querySelector('p'), data.sections.hero.paragraph);
                setTextContent(heroContentAltA.querySelector('.btn-primary'), data.sections.hero.buttonText);
            }
            heroSectionAltA.style.backgroundImage = `linear-gradient(rgba(42, 157, 143, 0.8), rgba(38, 70, 83, 0.8)), url('images/${data.sections.hero.backgroundImage}')`;
        } else if (heroSectionAltB && data.sections.hero_altB) {
            const heroTextAltB = heroSectionAltB.querySelector('.hero-text');
            if (heroTextAltB) {
                setTextContent(heroTextAltB.querySelector('h1'), data.sections.hero_altB.title);
                setTextContent(heroTextAltB.querySelector('p'), data.sections.hero_altB.paragraph);
                setTextContent(heroTextAltB.querySelector('.btn-primary'), data.sections.hero_altB.buttonText);
            }
            heroSectionAltB.style.backgroundImage = `url('images/${data.sections.hero_altB.backgroundImage}')`;
        }
        // --- Akhir Logika Hero Backgrounds ---


        if (document.getElementById('routesGridContainer') && data.sections.featuredRoutes) {
            setTextContent('featuredRoutesTitle', data.sections.featuredRoutes.title);
            populateGrid('routesGridContainer', data.sections.featuredRoutes.routes, createRouteCardHTML);
        } else if (document.getElementById('routesGridContainer_altA') && data.sections.featuredRoutes) { // Untuk Alt A
            setTextContent('featuredRoutesTitle_altA', data.sections.featuredRoutes.title);
            populateGrid('routesGridContainer_altA', data.sections.featuredRoutes.routes, createRouteCardHTML);
        }


        if (document.getElementById('tipsGridContainer_default') && data.sections.tipsGuides_default) {
            setTextContent('tipsGuidesTitle_default', data.sections.tipsGuides_default.title);
            populateGrid('tipsGridContainer_default', data.sections.tipsGuides_default.items, createTipItemHTML_default);
        }
        if (document.getElementById('tipsGridContainer_altA') && data.sections.tipsGuides_altA) {
            setTextContent(document.querySelector('#tips-guides-alt-a h2'), data.sections.tipsGuides_altA.title);
            populateGrid('tipsGridContainer_altA', data.sections.tipsGuides_altA.items, createTipCardHTML_altA);
        }


        if (document.getElementById('blogGridContainer_default') && data.sections.latestNews_default) {
            setTextContent('latestNewsTitle_default', data.sections.latestNews_default.title);
            populateGrid('blogGridContainer_default', data.sections.latestNews_default.posts, createBlogPostSnippetHTML_default);
            setTextContent('latestNewsViewAll_default', data.sections.latestNews_default.viewAllButton);
        }
        if (document.querySelector('#latest-news-alt-a .blog-grid-cards') && data.sections.latestNews_altA) {
            setTextContent(document.querySelector('#latest-news-alt-a h2'), data.sections.latestNews_altA.title);
            const blogGridAltAContainer = document.querySelector('#latest-news-alt-a .blog-grid-cards');
            if (blogGridAltAContainer) {
                 populateGrid(blogGridAltAContainer, data.sections.latestNews_altA.posts, createBlogCardHTML_altA);
            }
            const viewAllBtnAltA = document.querySelector('#latest-news-alt-a .text-center .btn-secondary');
            if(viewAllBtnAltA) setTextContent(viewAllBtnAltA, data.sections.latestNews_altA.viewAllButton);
        }

        if (document.getElementById('route-highlight') && data.sections.routeHighlight_altB) {
            const sectionData = data.sections.routeHighlight_altB;
            setTextContent(document.querySelector('#route-highlight h2'), sectionData.title);
            setImageSrc(document.querySelector('#route-highlight .split-image img'), `images/${sectionData.image}`, sectionData.alt);
            setTextContent(document.querySelector('#route-highlight .route-difficulty'), sectionData.difficultyText);
            document.querySelector('#route-highlight .route-difficulty').className = `route-difficulty ${sectionData.difficultyClass}`;
            setTextContent(document.querySelector('#route-highlight .split-content p'), sectionData.description);
            setTextContent(document.querySelector('#route-highlight .split-content .btn-secondary'), sectionData.buttonText);
        }
        if (document.getElementById('essential-tips') && data.sections.essentialTips_altB) {
            const sectionData = data.sections.essentialTips_altB;
            setTextContent(document.querySelector('#essential-tips h2'), sectionData.title);
            setImageSrc(document.querySelector('#essential-tips .split-image img'), `images/${sectionData.image}`, sectionData.alt);
            const tipsListContainer = document.querySelector('#essential-tips .split-content ul');
            if(tipsListContainer) {
                tipsListContainer.innerHTML = '';
                sectionData.tips.forEach(tipText => {
                    const li = document.createElement('li');
                    li.textContent = tipText;
                    tipsListContainer.appendChild(li);
                });
            }
            setTextContent(document.querySelector('#essential-tips .split-content .btn-secondary'), sectionData.buttonText);
        }
        if (document.getElementById('latest-news-alt-b') && data.sections.latestNews_altB) {
            setTextContent(document.querySelector('#latest-news-alt-b h2'), data.sections.latestNews_altB.title);
            const blogListContainerAltB = document.querySelector('#latest-news-alt-b .blog-list');
            if(blogListContainerAltB) {
                populateGrid(blogListContainerAltB, data.sections.latestNews_altB.posts, createBlogListItemHTML_altB);
            }
            const viewAllBtnAltB = document.querySelector('#latest-news-alt-b .text-center .btn-secondary');
            if(viewAllBtnAltB) setTextContent(viewAllBtnAltB, data.sections.latestNews_altB.viewAllButton);
        }

        const copyrightElem = document.getElementById('copyrightText');
        if (copyrightElem && data.sections.footer) {
            const yearSpanHTML = document.getElementById('current-year') ? `<span id="current-year">${new Date().getFullYear()}</span> ` : `${new Date().getFullYear()} `;
            copyrightElem.innerHTML = `© ${yearSpanHTML}${data.sections.footer.copyrightText}`;
        } else if (copyrightElem) { // Jika footer ada tapi data.sections.footer tidak
             copyrightElem.innerHTML = `© <span id="current-year">${new Date().getFullYear()}</span> Default Copyright Text`;
        }


        updateLanguageSwitcherUI(lang);
    }

    function setTextContent(elementOrSelector, text) {
        let element;
        if (typeof elementOrSelector === 'string') {
            element = document.getElementById(elementOrSelector) || document.querySelector(elementOrSelector);
        } else { element = elementOrSelector; }
        if (element) { element.textContent = text; }
        // else { console.warn(`Element not found for setTextContent: ${elementOrSelector}`); }
    }
    function setImageSrc(elementOrSelector, src, altText) {
        let element;
        if (typeof elementOrSelector === 'string') {
            element = document.getElementById(elementOrSelector) || document.querySelector(elementOrSelector);
        } else { element = elementOrSelector; }
        if (element) { element.src = src; if (altText) element.alt = altText; }
        // else { console.warn(`Image element not found for setImageSrc: ${elementOrSelector}`); }
    }
    function populateGrid(containerIdOrElement, items, itemHTMLGenerator) {
        let container;
        if (typeof containerIdOrElement === 'string') {
            container = document.getElementById(containerIdOrElement);
        } else { container = containerIdOrElement; }
        if (container && items) {
            container.innerHTML = '';
            items.forEach(item => {
                container.insertAdjacentHTML('beforeend', itemHTMLGenerator(item));
            });
        }
        // else if (!container) { console.warn(`Container not found for populateGrid: ${containerIdOrElement}`);}
        // else if (!items) { console.warn(`Items not provided for populateGrid on: ${containerIdOrElement}`);}

    }
    function createRouteCardHTML(route) { return ` <article class="route-card"> <img src="images/${route.image}" alt="${route.alt || route.title}" loading="lazy"> <div class="card-content"> <h3>${route.title}</h3> <span class="route-difficulty ${route.difficultyClass}">${route.difficultyText}</span> <p>${route.description}</p> <a href="#" class="btn btn-secondary">${route.buttonText}</a> </div> </article> `; }
    function createTipItemHTML_default(tip) { return ` <div class="tip-item"> <h4>${tip.title}</h4> <p>${tip.description}</p> <a href="#">${tip.linkText}</a> </div> `; }
    function createTipCardHTML_altA(tip) { return ` <article class="tip-card"> <div class="card-content"> <h4>${tip.title}</h4> <p>${tip.description}</p> <a href="#" class="card-link">${tip.linkText}</a> </div> </article> `; }
    function createBlogPostSnippetHTML_default(post) { return ` <article class="blog-post-snippet"> <time datetime="${post.datetime}">${post.date}</time> <h3>${post.title}</h3> <p>${post.snippet} <a href="#">${post.linkText}</a></p> </article> `; }
    function createBlogCardHTML_altA(post) { return ` <article class="blog-card"> <img src="images/${post.image}" alt="${post.alt || post.title}" loading="lazy"> <div class="card-content"> <time datetime="${post.datetime}">${post.date}</time> <h3>${post.title}</h3> <p>${post.snippet}</p> <a href="#" class="card-link">${post.linkText}</a> </div> </article> `; }
    function createBlogListItemHTML_altB(post) { return ` <article class="blog-list-item"> <time datetime="${post.datetime}">${post.date}</time> <h3><a href="${post.link || '#'}">${post.title}</a></h3> <p>${post.snippet}</p> </article> `; }

    function updateLanguageSwitcherUI(selectedLang) {
        if (langButtons && langButtons.length > 0) {
            langButtons.forEach(button => {
                button.classList.remove('active');
                if (button.dataset.lang === selectedLang) {
                    button.classList.add('active');
                }
            });
        }
    }

    if (langSwitcher) { // Hanya tambahkan event listener jika switcher ada
        langSwitcher.addEventListener('click', (event) => {
            const targetButton = event.target.closest('.lang-btn');
            if (targetButton) {
                const lang = targetButton.dataset.lang;
                if (lang !== currentLang) {
                    currentLang = lang;
                    localStorage.setItem('selectedLang', currentLang);
                    if (translations[currentLang]) {
                        applyTranslations(currentLang);
                    } else {
                        loadTranslations(currentLang).then(() => {
                            applyTranslations(currentLang);
                        });
                    }
                }
            }
        });
    }

    async function initializeLocalization() {
        await loadTranslations(currentLang);
        if (!translations[currentLang] && currentLang !== defaultLang) {
            console.warn(`Initial language ${currentLang} failed to load, trying default ${defaultLang}.`);
            await loadTranslations(defaultLang);
            if(translations[defaultLang]){ // Pastikan default berhasil dimuat
                currentLang = defaultLang;
                localStorage.setItem('selectedLang', currentLang);
            } else {
                console.error("FATAL: Default language also failed to load. Site may not render correctly.");
                return; // Hentikan jika default juga gagal
            }
        }
        applyTranslations(currentLang);
        const otherLang = (currentLang === 'en') ? 'id' : 'en';
        if (!translations[otherLang]) { loadTranslations(otherLang); }
    }

    // === FUNGSI DARI script.js LAMA ===
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.main-nav .nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            const isExpanded = navLinks.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isExpanded);
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Pastikan itu adalah ID selector yang valid dan elemennya ada
            if (href !== '#' && href.startsWith('#') && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    if(menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Update Copyright Year (dipindahkan ke dalam applyTranslations untuk update saat ganti bahasa juga jika perlu,
    // tapi bisa juga tetap di sini untuk set awal)
    // Fungsi copyright sudah ditangani di dalam applyTranslations agar lebih dinamis dengan teksnya.
    // Jika Anda ingin tahun saja yang diupdate di sini:
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    // Atau biarkan applyTranslations yang mengaturnya


    // === AKHIR FUNGSI DARI script.js LAMA ===


    // Inisialisasi bilingual
    initializeLocalization();
});
