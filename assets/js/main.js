// ===== Typing Animation =====
function typeText(elementId, text, speed) {
  speed = speed || 100;
  var element = document.getElementById(elementId);
  if (!element) return;

  var index = 0;

  function type() {
    if (index < text.length) {
      element.textContent += text.charAt(index);
      index++;
      setTimeout(type, speed);
    }
  }

  setTimeout(type, 1200);
}

// ===== Scroll Fade-In (Intersection Observer) =====
function initScrollFadeIn() {
  var elements = document.querySelectorAll('.fade-in');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elements.forEach(function (el) {
      el.classList.add('visible');
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(function (el) {
    observer.observe(el);
  });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  typeText('motto-text', '" 어제의 나보다 개발을 더 잘하자 "', 80);
  initScrollFadeIn();
});
