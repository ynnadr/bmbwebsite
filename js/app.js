document.addEventListener('DOMContentLoaded', () => {
    const defaultLang = 'en';
    let currentLang = localStorage.getItem('selectedLang') || defaultLang;
    let translations = {};

    const langSwitcher = document.getElementById('language-switcher');
    const langButtons = langSwitcher.querySelectorAll('.lang-btn');

    // Fungsi untuk memuat file JSON bahasa
    async function loadTranslations(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for lang ${lang}`);
            }
            translations[lang] = await response.json();
            console.log(`Translations loaded for ${lang}:`, translations[lang]);
        } catch (error) {
            console.error(`Could not load translations for ${lang}:`, error);
            // Fallback jika bahasa gagal dimuat, coba muat default lang jika belum
            if (lang !== defaultLang && !translations[defaultLang]) {
                await loadTranslations(defaultLang);
            }
        }
    }

    // Fungsi untuk menerapkan terjemahan ke halaman
    function applyTranslations(lang) {
        if (!translations[lang]) {
            console.warn(`No translations found for ${lang}. Using default.`);
            if (lang !== defaultLang && translations[defaultLang]) {
                lang = defaultLang; // Fallback ke default jika bahasa saat ini tidak ada
            } else if (!translations[defaultLang]) {
                console.error("Default language translations also not available. Cannot apply translations.");
                return; // Tidak bisa lanjut jika default pun tidak ada
            }
        }

        const data = translations[lang];

        // Meta
        document.getElementById('pageTitle').textContent = data.meta.pageTitle;
        document.getElementById('metaDescription').setAttribute('content', data.meta.metaDescription);
        document.documentElement.lang = lang; // Set atribut lang di <html>

        // Menu
        setTextContent('navPopularRoutes', data.menu.popularRoutes);
        setTextContent('navTipsGuides', data.menu.tipsGuides);
        setTextContent('navBlog', data.menu.blog);
        setTextContent('navAboutUs', data.menu.aboutUs);
        setTextContent('navContact', data.menu.contact);
        // setTextContent('logoText', 'Your Logo Text'); // Jika logo berupa teks

        // Hero Section (semua varian punya ID sama atau handle per varian)
        // Varian Default & Alt A
        const heroSection = document.getElementById('hero');
        const heroSectionAltA = document.getElementById('hero-alt-a');
        if (heroSection && data.sections.hero) {
            setTextContent('heroTitle', data.sections.hero.title);
            setTextContent('heroParagraph', data.sections.hero.paragraph);
            setTextContent('heroButton', data.sections.hero.buttonText);
            heroSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('images/${data.sections.hero.backgroundImage}')`;
        } else if (heroSectionAltA && data.sections.hero) { // Asumsi data hero sama untuk Alt A
             setTextContent(heroSectionAltA.querySelector('h1'), data.sections.hero.title);
             setTextContent(heroSectionAltA.querySelector('p'), data.sections.hero.paragraph);
             setTextContent(heroSectionAltA.querySelector('.btn-primary'), data.sections.hero.buttonText);
            heroSectionAltA.style.backgroundImage = `linear-gradient(rgba(42, 157, 143, 0.8), rgba(38, 70, 83, 0.8)), url('images/${data.sections.hero.backgroundImage}')`;
        }

        // Hero Section Alt B
        const heroSectionAltB = document.getElementById('hero-alt-b');
        if (heroSectionAltB && data.sections.hero_altB) {
            setTextContent(heroSectionAltB.querySelector('.hero-text h1'), data.sections.hero_altB.title);
            setTextContent(heroSectionAltB.querySelector('.hero-text p'), data.sections.hero_altB.paragraph);
            setTextContent(heroSectionAltB.querySelector('.hero-text .btn-primary'), data.sections.hero_altB.buttonText);
            heroSectionAltB.style.backgroundImage = `url('images/${data.sections.hero_altB.backgroundImage}')`;
             // Re-apply overlay for Alt B hero if it was defined via ::before
            // This might need a class toggle if ::before is language specific or just ensure text color is always contrasting
        }


        // Featured Routes (ada di index.html & indexa.html)
        if (document.getElementById('routesGridContainer') && data.sections.featuredRoutes) {
            setTextContent('featuredRoutesTitle', data.sections.featuredRoutes.title);
            populateGrid('routesGridContainer', data.sections.featuredRoutes.routes, createRouteCardHTML);
        }

        // Tips & Guides - Default (index.html)
        if (document.getElementById('tipsGridContainer_default') && data.sections.tipsGuides_default) {
            setTextContent('tipsGuidesTitle_default', data.sections.tipsGuides_default.title);
            populateGrid('tipsGridContainer_default', data.sections.tipsGuides_default.items, createTipItemHTML_default);
        }
        // Tips & Guides - Alt A (indexa.html)
        if (document.getElementById('tipsGridContainer_altA') && data.sections.tipsGuides_altA) {
            setTextContent(document.querySelector('#tips-guides-alt-a h2'), data.sections.tipsGuides_altA.title); // Atau ID spesifik
            populateGrid('tipsGridContainer_altA', data.sections.tipsGuides_altA.items, createTipCardHTML_altA);
        }


        // Latest News - Default (index.html)
        if (document.getElementById('blogGridContainer_default') && data.sections.latestNews_default) {
            setTextContent('latestNewsTitle_default', data.sections.latestNews_default.title);
            populateGrid('blogGridContainer_default', data.sections.latestNews_default.posts, createBlogPostSnippetHTML_default);
            setTextContent('latestNewsViewAll_default', data.sections.latestNews_default.viewAllButton);
        }
        // Latest News - Alt A (indexa.html)
        if (document.querySelector('#latest-news-alt-a .blog-grid-cards') && data.sections.latestNews_altA) {
            setTextContent(document.querySelector('#latest-news-alt-a h2'), data.sections.latestNews_altA.title);
            const blogGridAltAContainer = document.querySelector('#latest-news-alt-a .blog-grid-cards');
            if (blogGridAltAContainer) {
                 populateGrid(blogGridAltAContainer, data.sections.latestNews_altA.posts, createBlogCardHTML_altA);
            }
            const viewAllBtnAltA = document.querySelector('#latest-news-alt-a .text-center .btn-secondary');
            if(viewAllBtnAltA) setTextContent(viewAllBtnAltA, data.sections.latestNews_altA.viewAllButton);
        }

        // Sections for Alt B (indexb.html)
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
                tipsListContainer.innerHTML = ''; // Clear
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


        // Footer
        const copyrightElem = document.getElementById('copyrightText');
        if (copyrightElem && data.sections.footer) {
             // Preserve the year span if it exists
            const yearSpan = copyrightElem.querySelector('#current-year') ? `<span id="current-year">${new Date().getFullYear()}</span> ` : `${new Date().getFullYear()} `;
            copyrightElem.innerHTML = `© ${yearSpan}${data.sections.footer.copyrightText}`;
        }
        if (!document.getElementById('current-year') && copyrightElem) { // If year span wasn't there, but we want it
             copyrightElem.innerHTML = `© <span id="current-year">${new Date().getFullYear()}</span> ${data.sections.footer.copyrightText}`;
        }

        updateLanguageSwitcherUI(lang);
    }

    // Helper untuk set text content jika elemen ada
    function setTextContent(elementOrSelector, text) {
        let element;
        if (typeof elementOrSelector === 'string') {
            element = document.getElementById(elementOrSelector) || document.querySelector(elementOrSelector);
        } else {
            element = elementOrSelector; // Assume it's already an element
        }
        if (element) {
            element.textContent = text;
        } else {
            // console.warn(`Element not found for selector/ID: ${elementOrSelector}`);
        }
    }
     // Helper untuk set image src dan alt jika elemen ada
    function setImageSrc(elementOrSelector, src, altText) {
        let element;
        if (typeof elementOrSelector === 'string') {
            element = document.getElementById(elementOrSelector) || document.querySelector(elementOrSelector);
        } else {
            element = elementOrSelector;
        }

        if (element) {
            element.src = src;
            if (altText) element.alt = altText;
        } else {
            // console.warn(`Image element not found: ${elementOrSelector}`);
        }
    }


    // Helper untuk populate grid/list
    function populateGrid(containerIdOrElement, items, itemHTMLGenerator) {
        let container;
        if (typeof containerIdOrElement === 'string') {
            container = document.getElementById(containerIdOrElement);
        } else {
            container = containerIdOrElement; // Assume it's already an element
        }

        if (container && items) {
            container.innerHTML = ''; // Clear existing items
            items.forEach(item => {
                container.insertAdjacentHTML('beforeend', itemHTMLGenerator(item));
            });
        } else if (!container) {
            // console.warn(`Container not found: ${containerIdOrElement}`);
        }
    }

    // HTML Generator Functions (buat satu untuk tiap tipe kartu/item)
    function createRouteCardHTML(route) {
        return `
            <article class="route-card">
                <img src="images/${route.image}" alt="${route.alt}" loading="lazy">
                <div class="card-content">
                    <h3>${route.title}</h3>
                    <span class="route-difficulty ${route.difficultyClass}">${route.difficultyText}</span>
                    <p>${route.description}</p>
                    <a href="#" class="btn btn-secondary">${route.buttonText}</a>
                </div>
            </article>
        `;
    }

    function createTipItemHTML_default(tip) {
        return `
            <div class="tip-item">
                <h4>${tip.title}</h4>
                <p>${tip.description}</p>
                <a href="#">${tip.linkText}</a>
            </div>
        `;
    }
     function createTipCardHTML_altA(tip) {
        return `
            <article class="tip-card">
                 <div class="card-content">
                    <h4>${tip.title}</h4>
                    <p>${tip.description}</p>
                    <a href="#" class="card-link">${tip.linkText}</a>
                 </div>
             </article>
        `;
    }

    function createBlogPostSnippetHTML_default(post) {
        return `
            <article class="blog-post-snippet">
                 <time datetime="${post.datetime}">${post.date}</time>
                 <h3>${post.title}</h3>
                 <p>${post.snippet} <a href="#">${post.linkText}</a></p>
             </article>
        `;
    }
     function createBlogCardHTML_altA(post) {
        return `
            <article class="blog-card">
                 <img src="images/${post.image}" alt="${post.alt}" loading="lazy">
                 <div class="card-content">
                     <time datetime="${post.datetime}">${post.date}</time>
                     <h3>${post.title}</h3>
                     <p>${post.snippet}</p>
                     <a href="#" class="card-link">${post.linkText}</a>
                 </div>
             </article>
        `;
    }
    function createBlogListItemHTML_altB(post) {
        return `
            <article class="blog-list-item">
                 <time datetime="${post.datetime}">${post.date}</time>
                 <h3><a href="${post.link || '#'}">${post.title}</a></h3>
                 <p>${post.snippet}</p>
             </article>
        `;
    }


    // Update UI Switcher Bahasa
    function updateLanguageSwitcherUI(selectedLang) {
        langButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.lang === selectedLang) {
                button.classList.add('active');
            }
        });
    }

    // Event Listener untuk Switcher Bahasa
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
                    // Jika bahasa belum dimuat, muat dulu baru terapkan
                    loadTranslations(currentLang).then(() => {
                        applyTranslations(currentLang);
                    });
                }
            }
        }
    });

    // Fungsi untuk memuat dan menerapkan bahasa awal
    async function initializeLocalization() {
        // Muat bahasa saat ini (dari localStorage atau default)
        await loadTranslations(currentLang);

        // Jika bahasa saat ini gagal dimuat dan bukan default, coba muat default
        if (!translations[currentLang] && currentLang !== defaultLang) {
            console.warn(`Initial language ${currentLang} failed to load, trying default ${defaultLang}.`);
            await loadTranslations(defaultLang);
            currentLang = defaultLang; // Set currentLang ke default jika fallback berhasil
            localStorage.setItem('selectedLang', currentLang);
        }
        
        // Terapkan terjemahan
        applyTranslations(currentLang);

        // Preload bahasa lain di background (opsional)
        const otherLang = (currentLang === 'en') ? 'id' : 'en';
        if (!translations[otherLang]) { // Hanya muat jika belum ada
            loadTranslations(otherLang);
        }
    }

    // Inisialisasi
    initializeLocalization();

    // Copyright year
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});
