---
layout: page
title: Categories
permalink: /categories/
---

<div class="kakao-categories-page">
  {% assign category_list = "Backend,Frontend,Infra,CS" | split: "," %}

  <div class="kakao-category-tabs">
    <a href="javascript:void(0)" class="kakao-category-tab active" onclick="filterCategory('all', this)">All</a>
    {% for cat in category_list %}
    <a href="javascript:void(0)" class="kakao-category-tab" onclick="filterCategory('{{ cat | downcase }}', this)">{{ cat }}</a>
    {% endfor %}
  </div>

  <div class="kakao-post-list" id="category-post-list">
    {% for post in site.posts %}
    <div class="kakao-post-card" data-category="{{ post.categories | first | downcase }}">
      <div class="kakao-post-thumb">
        {% if post.thumbnail %}
          <a href="{{ post.url | relative_url }}">
            <img src="{{ post.thumbnail }}" alt="{{ post.title }}">
          </a>
        {% else %}
          <a href="{{ post.url | relative_url }}">
            <div class="thumb-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
          </a>
        {% endif %}
      </div>
      <div class="kakao-post-body">
        <div class="kakao-post-category">{{ post.categories | first | upcase }}</div>
        <h2 class="kakao-post-title">
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        </h2>
        <p class="kakao-post-excerpt">
          {{ post.excerpt | strip_html | truncate: 150 }}
        </p>
        <div class="kakao-post-meta">
          <span class="kakao-post-date">{{ post.date | date: "%Y.%m.%d" }}</span>
          {% if post.tags.size > 0 %}
          <div class="kakao-post-tags">
            {% for tag in post.tags %}
            <span class="kakao-tag-inline">{{ tag }}</span>
            {% endfor %}
          </div>
          {% endif %}
        </div>
      </div>
    </div>
    {% endfor %}
  </div>

  <div class="kakao-no-posts" id="category-no-posts" style="display:none;">
    해당 카테고리의 포스트가 없습니다.
  </div>
</div>

<script>
function filterCategory(cat, el) {
  document.querySelectorAll('.kakao-category-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  if (el) el.classList.add('active');

  var cards = document.querySelectorAll('#category-post-list .kakao-post-card');
  var visibleCount = 0;
  cards.forEach(function(card) {
    if (cat === 'all' || card.getAttribute('data-category') === cat) {
      card.style.display = 'flex';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  document.getElementById('category-no-posts').style.display = visibleCount === 0 ? 'block' : 'none';
}
</script>
