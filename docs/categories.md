---
layout: default
title: Categories
permalink: /categories/
---

<h1 class="page-title">Categories</h1>

{% for category in site.categories %}
<div class="category-section">
  <h2>{{ category[0] }}</h2>
  <ul>
    {% for post in category[1] %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <span class="date">{{ post.date | date: "%Y-%m-%d" }}</span>
    </li>
    {% endfor %}
  </ul>
</div>
{% endfor %}
