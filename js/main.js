// ===== CAROUSEL =====
document.querySelectorAll('.carousel').forEach(carousel => {
  const track   = carousel.querySelector('.carousel-track');
  const slides  = carousel.querySelectorAll('.carousel-slide');
  const dots    = carousel.querySelectorAll('.carousel-dot');
  const caption = carousel.parentElement.querySelector('.carousel-caption');
  const labels  = (track.dataset.labels || '').split(',');
  const total   = slides.length;
  let current   = 0;

  const goTo = (idx) => {
    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    if (caption) caption.textContent = labels[current] || '';
  };

  carousel.querySelector('.carousel-prev')?.addEventListener('click', (e) => {
    e.stopPropagation();
    goTo(current - 1);
  });
  carousel.querySelector('.carousel-next')?.addEventListener('click', (e) => {
    e.stopPropagation();
    goTo(current + 1);
  });
  dots.forEach((dot, i) => dot.addEventListener('click', (e) => {
    e.stopPropagation();
    goTo(i);
  }));
});

// ===== LIGHTBOX =====
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxProj  = document.getElementById('lightbox-project');
const lightboxLabel = document.getElementById('lightbox-label');
const lbClose       = document.getElementById('lightbox-close');
const lbPrev        = document.getElementById('lightbox-prev');
const lbNext        = document.getElementById('lightbox-next');

const allLightboxImages = [];
let lbCurrent = 0;

document.querySelectorAll('.carousel-slide img').forEach((img) => {
  const slide      = img.closest('.carousel-slide');
  const track      = slide.closest('.carousel-track');
  const slides     = [...track.querySelectorAll('.carousel-slide')];
  const slideIdx   = slides.indexOf(slide);
  const labels     = (track.dataset.labels || '').split(',');
  const label      = (labels[slideIdx] || '').trim();
  const card       = img.closest('.project-card');
  const title      = card?.querySelector('.card-title')?.textContent?.trim() || '';

  const idx = allLightboxImages.length;
  allLightboxImages.push({ src: img.src, alt: img.alt, label, title });

  img.style.cursor = 'pointer';
  img.addEventListener('click', (e) => {
    e.stopPropagation();
    openLightbox(idx);
  });
});

// Zoom state
let lbScale = 1;
let lbTX = 0, lbTY = 0;
let lbDragging = false;
let lbDragX, lbDragY;
const LB_MAX_SCALE = 5;

function applyLbTransform() {
  lightboxImg.style.transform = `scale(${lbScale}) translate(${lbTX}px, ${lbTY}px)`;
  lightboxImg.style.cursor = lbScale > 1 ? (lbDragging ? 'grabbing' : 'grab') : 'zoom-in';
}

function resetLbZoom() {
  lbScale = 1; lbTX = 0; lbTY = 0;
  applyLbTransform();
}

lightboxImg.addEventListener('wheel', (e) => {
  e.preventDefault();
  const delta = e.deltaY < 0 ? 0.25 : -0.25;
  lbScale = Math.min(Math.max(1, lbScale + delta), LB_MAX_SCALE);
  if (lbScale === 1) { lbTX = 0; lbTY = 0; }
  applyLbTransform();
}, { passive: false });

lightboxImg.addEventListener('dblclick', resetLbZoom);

lightboxImg.addEventListener('mousedown', (e) => {
  const isRightClick = e.button === 2;
  if (lbScale === 1 && !isRightClick) return;
  e.preventDefault();
  lbDragging = true;
  lbDragX = e.clientX - lbTX * lbScale;
  lbDragY = e.clientY - lbTY * lbScale;
  applyLbTransform();
});

lightboxImg.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('mousemove', (e) => {
  if (!lbDragging) return;
  lbTX = (e.clientX - lbDragX) / lbScale;
  lbTY = (e.clientY - lbDragY) / lbScale;
  applyLbTransform();
});

document.addEventListener('mouseup', () => {
  if (lbDragging) { lbDragging = false; applyLbTransform(); }
});

function openLightbox(idx) {
  lbCurrent = (idx + allLightboxImages.length) % allLightboxImages.length;
  const { src, alt, label, title } = allLightboxImages[lbCurrent];
  lightboxImg.src = src;
  lightboxImg.alt = alt;
  lightboxProj.textContent  = title;
  lightboxLabel.textContent = label;
  resetLbZoom();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lightboxImg.src = '';
  resetLbZoom();
}

lbClose.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', () => openLightbox(lbCurrent - 1));
lbNext.addEventListener('click', () => openLightbox(lbCurrent + 1));

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')     closeLightbox();
  if (lbScale > 1) return;
  if (e.key === 'ArrowLeft')  openLightbox(lbCurrent - 1);
  if (e.key === 'ArrowRight') openLightbox(lbCurrent + 1);
});

// ===== CURSOR TOOLTIP =====
const cursorTip = document.getElementById('cursor-tip');

document.addEventListener('mousemove', (e) => {
  cursorTip.style.left = e.clientX + 'px';
  cursorTip.style.top  = e.clientY + 'px';
});

document.querySelectorAll('.carousel-slide img').forEach((img) => {
  img.addEventListener('mouseenter', () => cursorTip.classList.add('visible'));
  img.addEventListener('mouseleave', () => cursorTip.classList.remove('visible'));
});

// ===== CERT LIGHTBOX =====
document.querySelectorAll('.cert-card').forEach((card) => {
  const img = card.querySelector('.cert-img');
  const title = card.querySelector('h4')?.textContent?.trim() || '';
  const date  = card.querySelector('.cert-date')?.textContent?.trim() || '';
  const idx   = allLightboxImages.length;
  allLightboxImages.push({ src: img.src, alt: img.alt, label: date, title });
  card.addEventListener('click', () => openLightbox(idx));
  card.addEventListener('mouseenter', () => cursorTip.classList.add('visible'));
  card.addEventListener('mouseleave', () => cursorTip.classList.remove('visible'));
});

// ===== PROFILE PHOTO LIGHTBOX =====
const profilePhoto = document.querySelector('.about-photo-circle img');
if (profilePhoto) {
  const idx = allLightboxImages.length;
  allLightboxImages.push({ src: profilePhoto.src, alt: profilePhoto.alt, label: 'Lima, Perú', title: 'Diosdado Maykhol Jurado Mulato' });
  profilePhoto.addEventListener('click', () => openLightbox(idx));
  profilePhoto.closest('.about-photo-circle').addEventListener('mouseenter', () => cursorTip.classList.add('visible'));
  profilePhoto.closest('.about-photo-circle').addEventListener('mouseleave', () => cursorTip.classList.remove('visible'));
}

// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// ===== VERSION SWITCHER =====
document.querySelectorAll('.version-switcher').forEach(switcher => {
  const card = switcher.closest('.project-card');
  switcher.querySelectorAll('.version-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switcher.querySelectorAll('.version-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const version = btn.dataset.version;
      card.querySelectorAll('.version-carousel').forEach(vc => {
        vc.classList.toggle('active', vc.dataset.version === version);
      });
    });
  });
});

// ===== NAVBAR scroll effect =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  const isCompact = window.scrollY > 50;
  navbar.style.borderBottomColor = isCompact ? 'rgba(48,54,61,0.8)' : 'rgba(48,54,61,1)';
  navbar.style.background = isCompact ? 'rgba(13,17,23,0.94)' : 'rgba(13,17,23,0.86)';
});

// ===== HAMBURGER menu =====
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');

const closeMenu = () => {
  navLinks.classList.remove('open');
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
};

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  hamburger.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.nav-links a').forEach((link) => {
  link.addEventListener('click', closeMenu);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMenu();
  }
});

// ===== PROJECT FILTER =====
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.project-card');
const projectCount = document.getElementById('project-count');

const updateProjectCount = () => {
  const visibleCards = [...cards].filter((card) => !card.classList.contains('hidden')).length;
  projectCount.textContent = visibleCards;
};

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterBtns.forEach((button) => button.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    cards.forEach((card) => {
      const tags = card.dataset.tags || '';
      const shouldShow = filter === 'all' || tags.includes(filter);

      card.classList.toggle('hidden', !shouldShow);

      if (shouldShow) {
        card.style.animation = 'fadeIn 0.3s ease forwards';
      }
    });

    updateProjectCount();
  });
});

updateProjectCount();

// ===== SCROLL REVEAL =====
const revealItems = document.querySelectorAll('.project-card, .skill-card, .summary-card, .contact-card, .about-text');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => {
  item.style.opacity = '0';
  item.style.transform = 'translateY(22px)';
  item.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  observer.observe(item);
});

// ===== TYPEWRITER =====
const typingEl = document.getElementById('typing-text');
const words = [
  'Embedded Systems Engineer',
  'IoT Developer',
  'Hardware Designer',
  'Edge AI & Robotics',
];
let wordIdx = 0, charIdx = 0, deleting = false;

function type() {
  const word = words[wordIdx];
  if (!deleting) {
    typingEl.textContent = word.slice(0, ++charIdx);
    if (charIdx === word.length) {
      deleting = true;
      setTimeout(type, 1800);
      return;
    }
  } else {
    typingEl.textContent = word.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      wordIdx = (wordIdx + 1) % words.length;
      setTimeout(type, 400);
      return;
    }
  }
  setTimeout(type, deleting ? 45 : 80);
}

type();
