---
layout: page
title: Categories
permalink: /categories/
---

<div class="kakao-categories-page">
  {% assign category_list = "Backend,Frontend,Infra,CS" | split: "," %}

  <div class="cat-pills">
    {% for cat in category_list %}
      {% assign cat_lower = cat | downcase %}
      {% assign post_count = 0 %}
      {% for post in site.posts %}
        {% assign post_cat = post.categories | first | downcase %}
        {% if post_cat == cat_lower %}
          {% assign post_count = post_count | plus: 1 %}
        {% endif %}
      {% endfor %}
      <div class="cat-pill {% if post_count == 0 %}cat-pill--disabled{% endif %}" {% if post_count > 0 %}onclick="toggleCategory('cat-{{ cat_lower }}')"{% endif %}>
        <div class="cat-pill-header">
          <div class="cat-pill-info">
            <span class="cat-pill-name">{{ cat }}</span>
            <span class="cat-pill-count">{{ post_count }}</span>
          </div>
          {% if post_count > 0 %}
          <span class="cat-pill-arrow" id="arrow-cat-{{ cat_lower }}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
          {% endif %}
        </div>
      </div>

      {% if post_count > 0 %}
      <div class="cat-dropdown" id="cat-{{ cat_lower }}">
        {% assign shown = 0 %}
        {% for post in site.posts %}
          {% assign post_cat = post.categories | first | downcase %}
          {% if post_cat == cat_lower and shown < 5 %}
          <a href="{{ post.url | relative_url }}" class="cat-dropdown-item">
            <div class="cat-dropdown-item-left">
              <span class="cat-dropdown-title">{{ post.title }}</span>
              <span class="cat-dropdown-excerpt">{{ post.excerpt | strip_html | truncate: 80 }}</span>
            </div>
            <span class="cat-dropdown-date">{{ post.date | date: "%Y.%m.%d" }}</span>
          </a>
          {% assign shown = shown | plus: 1 %}
          {% endif %}
        {% endfor %}
      </div>
      {% endif %}
    {% endfor %}
  </div>
</div>

<script>
function toggleCategory(id) {
  var dropdown = document.getElementById(id);
  var arrow = document.getElementById('arrow-' + id);
  var isOpen = dropdown.classList.contains('open');

  // Close all
  document.querySelectorAll('.cat-dropdown').forEach(function(d) {
    d.classList.remove('open');
  });
  document.querySelectorAll('.cat-pill-arrow').forEach(function(a) {
    a.classList.remove('rotated');
  });
  document.querySelectorAll('.cat-pill').forEach(function(p) {
    p.classList.remove('cat-pill--active');
  });

  // Toggle clicked
  if (!isOpen) {
    dropdown.classList.add('open');
    if (arrow) arrow.classList.add('rotated');
    dropdown.previousElementSibling.classList.add('cat-pill--active');
  }
}
</script>
