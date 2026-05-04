'use strict';

// ===== 3D MAT MOUSE TRACKING =====
const mat3d    = document.getElementById('mat-3d');
const matGlare = document.getElementById('mat-glare');
const matShadow = document.getElementById('mat-shadow');

if (mat3d) {
  const BASE_X = 18;   // 기본 X 기울기 (위에서 내려다보는 각도)
  const BASE_Y = -14;  // 기본 Y 기울기
  const MAX_TILT = 22; // 최대 기울기 각도

  let targetX = BASE_X, targetY = BASE_Y;
  let currentX = BASE_X, currentY = BASE_Y;
  let rafId = null;
  let isHovered = false;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function animateMat() {
    const speed = isHovered ? 0.12 : 0.06;
    currentX = lerp(currentX, targetX, speed);
    currentY = lerp(currentY, targetY, speed);

    mat3d.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg)`;

    // 그림자: 기울기에 따라 위치/흐림 변화
    const shadowBlur = 8 + Math.abs(currentY) * 0.4;
    const shadowX = currentY * 1.2;
    if (matShadow) {
      matShadow.style.transform = `translateX(calc(-50% + ${shadowX}px))`;
      matShadow.style.filter = `blur(${shadowBlur}px)`;
    }

    const diff = Math.abs(currentX - targetX) + Math.abs(currentY - targetY);
    if (diff > 0.05) {
      rafId = requestAnimationFrame(animateMat);
    } else {
      rafId = null;
    }
  }

  function startAnim() {
    if (!rafId) rafId = requestAnimationFrame(animateMat);
  }

  // 마우스가 hero 영역 위에 있을 때 전체 섹션 기준으로 트래킹
  const heroSection = document.getElementById('hero');

  heroSection.addEventListener('mousemove', (e) => {
    isHovered = true;
    const rect = heroSection.getBoundingClientRect();
    // -1 ~ 1 범위로 정규화
    const nx = (e.clientX - rect.left) / rect.width  * 2 - 1;
    const ny = (e.clientY - rect.top)  / rect.height * 2 - 1;

    targetY = BASE_Y + nx * MAX_TILT;
    targetX = BASE_X - ny * MAX_TILT * 0.7;

    // 광택 위치 업데이트
    if (matGlare) {
      const gx = 30 + nx * 25;
      const gy = 25 + ny * 20;
      matGlare.style.background =
        `radial-gradient(ellipse 60% 40% at ${gx}% ${gy}%, rgba(255,255,255,0.1) 0%, transparent 70%)`;
    }

    startAnim();
  });

  heroSection.addEventListener('mouseleave', () => {
    isHovered = false;
    targetX = BASE_X;
    targetY = BASE_Y;
    if (matGlare) {
      matGlare.style.background =
        'radial-gradient(ellipse 60% 40% at 30% 25%, rgba(255,255,255,0.08) 0%, transparent 70%)';
    }
    startAnim();
  });

  // 터치 지원 (모바일)
  heroSection.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = heroSection.getBoundingClientRect();
    const nx = (touch.clientX - rect.left) / rect.width  * 2 - 1;
    const ny = (touch.clientY - rect.top)  / rect.height * 2 - 1;
    targetY = BASE_Y + nx * MAX_TILT;
    targetX = BASE_X - ny * MAX_TILT * 0.7;
    startAnim();
  }, { passive: true });
}

// ===== HEADER SCROLL =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
  document.getElementById('scroll-top').classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

// ===== MOBILE NAV =====
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  const isOpen = hamburger.classList.toggle('open');
  nav.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
  hamburger.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
});

nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    document.body.style.overflow = '';
    hamburger.setAttribute('aria-label', '메뉴 열기');
  });
});

// ===== FADE-UP ON SCROLL =====
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// Immediately reveal hero elements (above fold)
document.querySelectorAll('#hero .fade-up').forEach((el, i) => {
  setTimeout(() => el.classList.add('visible'), 200 + i * 130);
});

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, duration) {
  const isYear = target === 2016;
  const start = isYear ? 2000 : 0;
  const startTime = performance.now();

  const formatNum = (n) => {
    if (target === 350000 || target === 1200) return n.toLocaleString('ko-KR');
    return n.toString();
  };

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + (target - start) * eased);
    el.textContent = formatNum(current);
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      if (!isNaN(target)) {
        animateCounter(el, target, 1600);
        counterObserver.unobserve(el);
      }
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => counterObserver.observe(el));

// ===== CONTACT FORM =====
const form = document.getElementById('contact-form');
const formResult = document.getElementById('form-result');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formResult.textContent = '';
  formResult.className = 'form-result';

  const fields = ['name', 'phone', 'message'];
  let valid = true;

  fields.forEach(id => {
    const input = document.getElementById(id);
    input.classList.remove('error');
    if (!input.value.trim()) {
      input.classList.add('error');
      valid = false;
    }
  });

  if (!valid) {
    formResult.textContent = '필수 항목을 모두 입력해 주세요.';
    formResult.classList.add('error-msg');
    return;
  }

  // 전화번호 형식 검사
  const phoneVal = document.getElementById('phone').value.trim();
  if (!/^[0-9\-+\s()]{7,15}$/.test(phoneVal)) {
    document.getElementById('phone').classList.add('error');
    formResult.textContent = '올바른 연락처를 입력해 주세요.';
    formResult.classList.add('error-msg');
    return;
  }

  // 실제 서버 연동 전 UI 시뮬레이션
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = '전송 중...';
  btn.disabled = true;

  setTimeout(() => {
    form.reset();
    btn.textContent = '문의 보내기';
    btn.disabled = false;
    formResult.textContent = '문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.';
    formResult.classList.add('success');
  }, 1200);
});

// Remove error styling on input
form.querySelectorAll('input, textarea').forEach(input => {
  input.addEventListener('input', () => input.classList.remove('error'));
});

// ===== SMOOTH SCROLL (fallback for older browsers) =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const headerHeight = header.offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
