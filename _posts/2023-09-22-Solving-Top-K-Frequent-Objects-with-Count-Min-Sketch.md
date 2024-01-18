---
published: true
layout: post
date: 22 September 2023
title: Solving Top K Frequent Objects with Count-Min Sketch
tags: ["System Design"]
permalink: /blog/:title/
---
A recent system design problem I came across is how to calculate top-K items at a high scale. For instance, determining the top 100 videos on a streaming site.

In the "leetcode" version of a top K problem, a hash or a heap track the count of an item. However, both hash and heap have a space complexity of `O(n)`. For 1 billion videos, that equates to 4GB of data – 8GB if you consider the need to store both video ID and count. Additionally, a heap has a `log(n)` insertion time, so as more videos are tracked, updates will slow down. 

There's an alternative for counting a large number of items: the Count-Min Sketch.

### Enter the Count-Min Sketch
The Count-Min Sketch (CMS) is a probabilistic data structure. It provides approximate counts for large-scale data streams using limited memory.

A CMS comprises many arrays of a fixed size `n`. This `n` can be smaller than the total number of items you're tracking. Each array has an associated hash function.

When you want to increment the count of an item, iterate over each array. For each array, compute the item's hash. The resulting value is an index. To raise the count, you increment the value at that index.

To find out the final count for an item, repeat the hashing process for each row. Instead of increasing the count, get the current value at the index. The item's count is the minimum value across all rows.

Let's walk through an example for clarity.

### Walkthrough
Suppose we have a CMS with three arrays, each of size 4.

| 0   | 0   | 0   | 0   |
| 0   | 0   | 0   | 0   |
| 0   | 0   | 0   | 0   |

Now, let's say we want to increment the count for videoOne. After hashing the video ID for each row, assume:
- hash_row_1(video_1) = 0
- hash_row_2(video_1) = 3
- hash_row_3(video_1) = 2

Our CMS would then be:

| <span style="color: green">1</span>   | 0   | 0   | 0   |
| 0   | 0   | 0   | <span style="color: green">1</span>   |
| 0   | 0   | <span style="color: green">1</span>   | 0   |

Now, suppose we increment the count of another video, videoTwo. Using our hashing, the CMS would be:

| 1   | <span style="color: green">1</span>   | 0   | 0   |
| 0   | 0   | 0   | <span style="color: red">2</span>   |
| <span style="color: green">1</span>   | 0   | 1   | 0   |

### Collisions 
Note the collision in row 2, where both videos hashed to the same index. That's why when determining the count for an item, we take the minimum value across all arrays. For example, the count for videoOne is the minimum of (1, 2, 1), which is 1. It's improbable for two videos to hash identically across all rows. Hence, even if some rows have collisions, we use the minimum across all rows to determine the count.

This makes the CMS an "approximation" algorithm. It does not guarantee an accurate count. It may overestimate but will never underestimate the real count.

> [This blog](https://redis.com/blog/count-min-sketch-the-art-and-science-of-estimating-stuff/) mentions that with a "depth of 10 and a width of 2,000, the probability of not having an error is 99.9%" Increasing the depth of the CMS can further reduce the error rate.

### Why Use an Approximation Algorithm?
Why would we use an approximation algorithm that might not return precise results? CMS is memory-efficient since it uses fixed space for estimates. Regardless of how many items we track, its size remains constant. For instance, a 10x4000 CMS uses only 160KB, considerably less than the 4GB required for a heap.

Additionally, a CMS has constant-time update and lookup, compared to the `log(n)` update in a heap. This makes the CMS a faster solution, crucial when dealing with millions or billions of items.

> A min heap of size K is still used to track the final `K` videos. For each item, update the sketch, estimate the count, and check if this estimate surpasses the heap's minimum. If so, the heap is updated. The computational cost of updating the min heap remains O(log(k)). A heap of a size like 100 remains manageable in memory compared to one of a million.

The primary trade-off with a CMS is accuracy for space and speed. In most high-scale systems, accuracy is vital. Therefore, a CMS can be paired with a more precise solution, such as MapReduce.

### Using Count-Min Sketch with MapReduce

The overarching strategy is to utilize CMS for instant, estimated updates on the top k videos. In the background, run more time-intensive calculations with MapReduce to achieve an accurate top k. Periodically, the count min estimates are refreshed with the precise calculations from MapReduce.

#### Workflow
1. **Real-time Updates:** Utilize Count-Min Sketch for immediate top k video estimates.
2. **Batch Processing:** Periodically employ MapReduce for precise counts.
3. **Refinement:** Refresh the CMS using the exact MapReduce values.

The result is the best of both worlds: immediate insights with gradually improved precision.

### Conclusion

Approximation algorithms, like the CMS, are effective for managing vast amounts of data without excessive storage requirements. If accuracy matters, such algorithms can be supplemented with more extended, accurate calculations, providing precise counts at intervals. 

### Code 
You can view a simple implementation of a CMS in this [github gist](https://gist.github.com/VeerpalBrar/9fb5cb9b0963a1396f4e961f6be69922). 

### Source
- [Count-Min Sketch: The Art and Science of Estimating Stuff](https://redis.com/blog/count-min-sketch-the-art-and-science-of-estimating-stuff/)
- [Big Data with Sketchy Structures, Part 1 — the Count-Min Sketch](https://towardsdatascience.com/big-data-with-sketchy-structures-part-1-the-count-min-sketch-b73fb3a33e2a#:~:text=Properties%20of%20Count%2DMin%20Sketch&text=We%20increment%20some%20counters%2C%20but,in%20both%20time%20and%20space)