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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
  typeText('motto-text', '" 어제의 나보다 개발을 더 잘하자 "', 80);
});
