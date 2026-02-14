---
layout: page
title: Tags
permalink: /tags/
---

<h1 class="page-title">Tags</h1>

{% for tag in site.tags %}
<div class="tag-section">
  <h2>{{ tag[0] }}</h2>
  <ul>
    {% for post in tag[1] %}
    <li>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
      <span class="date">{{ post.date | date: "%Y-%m-%d" }}</span>
    </li>
    {% endfor %}
  </ul>
</div>
{% endfor %}
