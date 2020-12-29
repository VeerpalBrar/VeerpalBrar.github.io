---
published: true
layout: post
date: 29 December 2020
tags:
  - Jekyll
  - Projects
  - Dev Journal
---
Unfortunately, Jekyll hosted with Github pages does not have [built-in support](https://pages.github.com/versions/) to implement tags on your blog. Luckily, it is easy to implement the tag functionality from scratch. 

### Background 

I wanted to implement a tag page that lists all blog posts by tag rather than the publication date. You can do this with [jekyll collections](http://www.minddust.com/post/alternative-tags-and-categories-on-github-pages/), however, I did not want to manually keep track of tags. I wanted the page to be automatically be generated based on the tags added to posts.  

I found some [tutorials from 2015](https://codinfox.github.io/dev/2015/03/06/use-tags-and-categories-in-your-jekyll-based-github-pages/) that accomplished this already.  However, the existing code had a complicated method to collect a list of tags and then filtering out duplicates. By relying on the [liquid `uniq` filter](https://shopify.github.io/liquid/filters/uniq/) I was able to simplify this code.

### Implementation
First, we need to iterate through all the posts on the site and create a list of tags. Then we let `uniq` and `sort` do the heavy lifting for removing duplicates and sorting the list.  I store this information in a variable called `tags` for later use. 

```
{% for post in site.posts %}
  {% assign tags = tags | concat:post.tags %}
{% endfor %}
{% assign tags = tags | uniq | sort %}
```

Once I had a list of `tags`, I used the following code to create a page that sorts all my posts by tag. 

```
<div>
  {% for tag in tags %}
	<h3 id="{{ tag | slugify }}">{{ tag }}</h3>
	<ul>
    {% for post in site.posts %}
      {% if post.tags contains tag %}
      <li>
        <a href="{{ post.url }}"> {{ post.title }} </a>
        <small>{{ post.date | date: "%B %-d, %Y" }}</small>
      </li>
      {% endif %}
    {% endfor %}
	</ul>
{% endfor %}
</div>
```

I use the `slugify`  filter that comes with Jekyll to convert space-separated strings I can use as `id` attributes for each tag. This lets me link directly to a tag on the page. 

Finally, to add tags to a post, I simplify specify the tags in the metadata for a post, like so:

```
published: true
layout: post
date: 10 July 2020
tags: \["Ruby on Rails", "Web Development"\]
---
```

### Scalability 
I don't have many posts on my blog (yet), so this is relatively fast. However, as I add more blog posts over time, it may be too slow to iterate over all the posts multiple times for each tag. I'll probably come back to this in the future to search for a more efficient implementation. 
