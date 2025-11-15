/* =================================================
  (جديد) دالة السحب اللانهائي (لأي شريط)
=================================================
*/
function initInfiniteScroller(sliderSelector) {
    const slider = document.querySelector(sliderSelector);
    if (!slider) return; // إذا الشريط مش موجود، بوقف

    let itemSetWidth = 0; 
    let isDown = false;
    let startX;
    let scrollLeft_var; 

    // 1. نسخ كل العناصر
    const items = Array.from(slider.children);
    items.forEach(item => {
        const clone = item.cloneNode(true);
        slider.appendChild(clone);
    });

    // 2. تحديد العرض ونقطة البداية
    function setInitialPosition() {
        requestAnimationFrame(() => {
            let originalWidth = 0;
            items.forEach(item => {
                // بنحسب العرض + المارجن اليمين
                originalWidth += item.offsetWidth + parseInt(getComputedStyle(item).marginRight);
            });
            itemSetWidth = originalWidth;

            if (itemSetWidth > 0 && !isDown) { // تأكد أن العرض تم حسابه وإنه المستخدم مش ساحب
                slider.scrollLeft = itemSetWidth; 
            }
        });
    }

    setInitialPosition(); 
    window.addEventListener('resize', setInitialPosition); 


    // --- 3. أوامر السحب بالماوس ---
    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.style.cursor = 'grabbing';
        startX = e.pageX - slider.offsetLeft;
        scrollLeft_var = slider.scrollLeft; 
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.style.cursor = 'grab';
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return; 
        e.preventDefault(); 
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 2; 
        slider.scrollLeft = scrollLeft_var - walk;
    });
    
    // --- 4. أوامر اللف الدائم ---
    slider.addEventListener('scroll', () => {
        if (itemSetWidth === 0) return; 
        
        if (slider.scrollLeft < 1 && !isDown) { 
             requestAnimationFrame(() => {
                slider.scrollLeft = itemSetWidth;
             });
             return; 
        }

        if (slider.scrollLeft >= itemSetWidth * 2 - slider.clientWidth - 1) { 
            const newScroll = slider.scrollLeft - itemSetWidth;
            slider.scrollLeft = newScroll;
            if (isDown) {
                scrollLeft_var = newScroll;
            }
        }

        if (slider.scrollLeft <= 0) {
            const newScroll = slider.scrollLeft + itemSetWidth;
            slider.scrollLeft = newScroll;
            if (isDown) {
                scrollLeft_var = newScroll;
            }
        }
    });
}

// 1. تشغيل السحب اللانهائي على شريط الصور
initInfiniteScroller('.scroller-container');

// 2. تشغيل السحب اللانهائي على شريط المسابقات
initInfiniteScroller('.competitions-scroller');


/* =================================================
  كود ديناميكي الظهور (Fade in on Scroll) - (معدّل)
=================================================
*/
const hiddenElements = document.querySelectorAll('.hidden-on-scroll');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            
            // (جديد) إضافة تأخير (delay) إذا كان موجوداً
            // بنجيب التأخير من data-delay اللي بالـ HTML
            const delay = entry.target.dataset.delay || 0;
            
            // (جديد) تطبيق التأخير كـ CSS variable
            entry.target.style.transitionDelay = `${delay}ms`;

            // إضافة كلاس الظهور
            entry.target.classList.add('is-visible');
            
            // إيقاف المراقبة عن العنصر
            observer.unobserve(entry.target); 
        }
    });
}, {
    threshold: 0.1 
});
hiddenElements.forEach((el) => observer.observe(el));


/* =================================================
  كود تحريك الماركي عند السكرول
=================================================
*/
const marqueeContent1 = document.querySelector('#marquee-content-1');
const marqueeContent2 = document.querySelector('#marquee-content-2');

if (marqueeContent1 && marqueeContent2) {
    let baseOffset2 = -marqueeContent2.offsetWidth / 2;
    const handleScrollMarquee = () => {
        const scrollPos = window.scrollY;
        const speed = 0.2; 
        const moveLeft = scrollPos * -speed;
        const moveRight = scrollPos * speed;

        requestAnimationFrame(() => {
            marqueeContent1.style.transform = `translateX(${moveLeft}px)`;
            marqueeContent2.style.transform = `translateX(${baseOffset2 + moveRight}px)`;
        });
    };
    window.addEventListener('scroll', handleScrollMarquee);
    window.addEventListener('resize', () => {
        setTimeout(() => {
            baseOffset2 = -marqueeContent2.offsetWidth / 2;
        }, 100);
    });
}

/* =================================================
  (جديد) كود تشغيل القائمة المنبثقة (Modal)
=================================================
*/
// 1. اختيار العناصر
const modalOverlay = document.getElementById('modal-overlay');
const modalContainer = document.getElementById('modal-container');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDetails = document.getElementById('modal-details');

// (تعديل) بنختار البطاقات من شريط المسابقات (الأصلي والمنسوخ)
const allCompetitionCards = document.querySelectorAll('.competitions-scroller .competition-card');

// 2. دالة فتح المودال
function openModal(image, title, details) {
    modalImage.src = image;
    modalTitle.textContent = title;
    modalDetails.textContent = details;
    
    modalOverlay.classList.add('visible');
    modalContainer.classList.add('visible');
}

// 3. دالة إغلاق المودال
function closeModal() {
    modalOverlay.classList.remove('visible');
    modalContainer.classList.remove('visible');
}

// 4. ربط كبسة الكليك على البطاقات
allCompetitionCards.forEach(card => {
    card.addEventListener('click', () => {
        // (جديد) نتأكد إنه ما عنا نص مختار (عشان السحب ما يفتح المودال بالغلط)
        if (window.getSelection().toString() === '') {
            const image = card.dataset.image;
            const title = card.dataset.title;
            const details = card.dataset.details;
            openModal(image, title, details);
        }
    });
});

// 5. ربط أزرار الإغلاق
if (modalCloseBtn) { // التأكد من وجود العناصر قبل الربط
    modalCloseBtn.addEventListener('click', closeModal);
}
if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
}


/* =================================================
   (جديد) كود تأثير الآلة الكاتبة (Typewriter)
================================================= */
const typewriterElement = document.querySelector('.hero-title.typewriter');
let charIndex = 0;
let textToType = '';

if (typewriterElement) {
    textToType = typewriterElement.getAttribute('data-text');
}

function typeCharacter() {
    if (charIndex < textToType.length) {
        typewriterElement.textContent += textToType.charAt(charIndex);
        charIndex++;
        setTimeout(typeCharacter, 150); // سرعة الكتابة (150ms)
    } else {
        // (اختياري) إعادة التشغيل بعد فترة
        setTimeout(() => {
            typewriterElement.textContent = '';
            charIndex = 0;
            typeCharacter();
        }, 5000); // الانتظار 5 ثواني قبل الإعادة
    }
}

/* =================================================
   (معدّل) كود شاشة التحميل (Preloader)
   (مدمج معه بدء تشغيل الآلة الكاتبة وتفعيل Scrollspy)
================================================= */
window.addEventListener('load', () => {
    
    // 1. إخفاء شاشة التحميل
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('fade-out');
        setTimeout(() => {
            preloader.style.display = 'none';
        }, 500); // 500ms (نفس مدة الأنيميشن)
    }
    
    // 2. (جديد) بدء تشغيل الآلة الكاتبة بعد انتهاء تحميل الصفحة
    if (typewriterElement) {
        setTimeout(typeCharacter, 1000); // بدء الكتابة بعد ثانية
    }

    // 3. (معدّل) تفعيل رابط الـ Scrollspy عند تحميل الصفحة
    if (linkFound) {
         activateNavLinkOnScroll();
    }
});

/* =================================================
   (جديد) 2. كود زر العودة للأعلى (Back to Top)
================================================= */
const backToTopBtn = document.getElementById('back-to-top-btn');

window.addEventListener('scroll', () => {
    if (backToTopBtn) {
        if (window.scrollY > 300) { // إظهار الزر بعد النزول 300px
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
});

/* =================================================
   (جديد) 3. كود قائمة الموبايل (Hamburger Menu)
================================================= */
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileNav = document.getElementById('mobile-nav-links');

if (mobileMenuBtn && mobileNav) {
    // 1. فتح القائمة
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        // (اختياري) تغيير شكل الزر من همبرغر إلى X
        if (mobileNav.classList.contains('active')) {
            mobileMenuBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
        } else {
            mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        }
    });

    // 2. إغلاق القائمة عند الضغط على أي رابط
    const mobileNavLinks = mobileNav.querySelectorAll('a');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
        });
    });
}


/* =================================================
   (جديد) 4. كود تفعيل الرابط (Scrollspy)
================================================= */

// --- هذا الكود سيعمل فقط على الصفحة الرئيسية ---

// 1. اختيار كل الروابط في القائمة الرئيسية التي تشير إلى أقسام (تبدأ بـ #)
const mainNavLinks = document.querySelectorAll('nav.main-nav a[href^="#"]');

// 2. تحويل الروابط إلى مصفوفة من الأقسام المقابلة لها
const sections = [];
let linkFound = false; // للتأكد أننا في الصفحة الرئيسية

mainNavLinks.forEach(link => {
    // التأكد أن الرابط ليس مجرد #
    if (link.getAttribute('href').length > 1) { 
        const section = document.querySelector(link.getAttribute('href'));
        if (section) {
            sections.push(section);
            linkFound = true; // وجدنا رابط يؤدي لقسم، إذاً نحن في index.html
        }
    }
});

// 3. دالة تفعيل الرابط المناسب
function activateNavLinkOnScroll() {
    let currentSectionId = "";
    // حساب ارتفاع الهيدر + مسافة بسيطة
    const headerElement = document.getElementById('main-header');
    const headerHeight = headerElement ? headerElement.offsetHeight + 20 : 80; 

    // المرور على الأقسام من الأسفل للأعلى
    for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const sectionTop = section.offsetTop - headerHeight;

        if (window.scrollY >= sectionTop) {
            currentSectionId = section.id;
            break; // وجدنا القسم المناسب
        }
    }

    // 4. إضافة كلاس "active" للرابط الصحيح (في القائمة الرئيسية وقائمة الموبايل)
    const allNavLinks = document.querySelectorAll('.main-nav a[href^="#"], .mobile-nav a[href^="#"]');
    
    allNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
            link.classList.add('active');
        }
    });
}

// 5. تشغيل الدالة عند السكرول (فقط إذا كنا في الصفحة الرئيسية)
if (linkFound) {
    window.addEventListener('scroll', activateNavLinkOnScroll);
}

/* =================================================
   (جديد) 6. كود مؤشر الماوس المخصص (Custom Cursor)
================================================= */
const cursorDot = document.querySelector('.cursor-dot');
const cursorOutline = document.querySelector('.cursor-outline');

if (cursorDot && cursorOutline) {
    // 1. تحديث موقع المؤشر
    window.addEventListener('mousemove', (e) => {
        const posX = e.clientX;
        const posY = e.clientY;
        
        // استخدام requestAnimationFrame لأداء أفضل
        requestAnimationFrame(() => {
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;
            
            cursorOutline.style.left = `${posX}px`;
            cursorOutline.style.top = `${posY}px`;
        });
    });

    // 2. إضافة تأثير الهوفر
    // (مهم) قمنا بجمع كل العناصر القابلة للتفاعل في الموقع
    const interactiveElements = document.querySelectorAll('a, button, .team-card, .competition-card, .scroll-item, .find-us-card, .category-card, .resource-card');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseover', () => {
            cursorOutline.classList.add('hover');
        });
        el.addEventListener('mouseout', () => {
            cursorOutline.classList.remove('hover');
        });
    });
}