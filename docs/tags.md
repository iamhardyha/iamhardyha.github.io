---
layout: page
title: Tags
permalink: /tags/
---

<div class="kakao-tags-page">
  <div class="kakao-tags-cloud">
    {% assign sorted_tags = site.tags | sort %}
    {% for tag in sorted_tags %}
    <a href="#{{ tag[0] }}" class="kakao-tag" onclick="filterTag('{{ tag[0] }}', this)">
      {{ tag[0] }} <span style="opacity:0.6">({{ tag[1].size }})</span>
    </a>
    {% endfor %}
  </div>

  {% assign sorted_tags = site.tags | sort %}
  {% for tag in sorted_tags %}
  <div class="kakao-tag-section" id="{{ tag[0] }}">
    <div class="kakao-tag-section-title">{{ tag[0] }}</div>
    <div class="kakao-tag-posts">
      {% for post in tag[1] %}
      <div class="kakao-post-card">
        <div class="kakao-post-thumb">
          {% if post.thumbnail %}
            <a href="{{ post.url | relative_url }}">
              <img src="{{ post.thumbnail }}" alt="{{ post.title }}">
            </a>
          {% else %}
            <a href="{{ post.url | relative_url }}">
              <div class="thumb-placeholder">&#128196;</div>
            </a>
          {% endif %}
        </div>
        <div class="kakao-post-body">
          <h2 class="kakao-post-title">
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          </h2>
          <p class="kakao-post-excerpt">
            {{ post.excerpt | strip_html | truncate: 150 }}
          </p>
          <div class="kakao-post-meta">
            <span class="kakao-post-date">{{ post.date | date: "%Y.%m.%d" }}</span>
            <div class="kakao-post-tags">
              {% for t in post.tags %}
              <a href="#{{ t }}" class="kakao-tag">{{ t }}</a>
              {% endfor %}
            </div>
          </div>
        </div>
      </div>
      {% endfor %}
    </div>
  </div>
  {% endfor %}
</div>

<script>
function filterTag(tag, el) {
  // Toggle active state on tag pills
  document.querySelectorAll('.kakao-tags-cloud .kakao-tag').forEach(function(t) {
    t.classList.remove('active');
  });
  el.classList.add('active');

  // Show/hide tag sections
  document.querySelectorAll('.kakao-tag-section').forEach(function(section) {
    if (section.id === tag) {
      section.style.display = 'block';
    } else {
      section.style.display = 'none';
    }
  });
}

// Check URL hash on load
(function() {
  var hash = window.location.hash.replace('#', '');
  if (hash) {
    var el = document.querySelector('.kakao-tags-cloud .kakao-tag[href="#' + hash + '"]');
    if (el) filterTag(hash, el);
  }
})();
</script>
