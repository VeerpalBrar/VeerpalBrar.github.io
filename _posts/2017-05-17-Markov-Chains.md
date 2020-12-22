---
published: true
layout: post
date: 17 May 2017
---
At the end of last year, I developed a Markov chain generator, which generates new text based on a provided corpus. Here is an overview of the project. 

### Purpose 
I was interested in using the Markov chain to generate poetry. Given an input of Emily Dickison poems, I wanted to see if new a poem could be generated. 

### Methodology
The program reads in the provided source text and uses the NTLK python library to break the text into n-grams of an indicated length. It then finds all the unique words in the text and generates a transition matrix. 

The transition matrix is n x m matrix, where n is a total number of n-grams found and m is the total number of unique words. The elements of the matrix indicate the likely hood that a unique word 'i',  will follow a unique n-gram 'j'. 

To generate the new text, the program randomly selects a starting n-gram to begin the chain. It generates a random number between 0 and 1. Then it finds the row of the transition matrix that is connected to the starting n-gram. It adds up the probabilities of the elements in this row until the sum is greater than the random number.  Therefore, words with a high probability, will increase the sum the most and have a higher chance of being chosen. 

Once, the word is found, a new n-gram with the new word appended is created. A new random number is generated and the process repeats. 

In the end, the Markov chain is printed. 

### Design Limitations
This design implementation has a couple of limitations. 

First, the matrix is created using a numpy matrix. The size of the matrix is limited by the amount of memory available. I found that while the transition matrix can hold the n-grams for 'Alice in Wonderland' (about 15 000 words ) anything longer will end up causing an error. 

Another limitation is that longer text also has a longer runtime. So, having large text is not ideal either. Overall, the length of 'Alice in Wonderland' was sufficient for my needs and so the numpy matrix was my implementation of choice. 

Another limitation is that while the program takes punctuation into account, the punctuation is treated as a word and so placed randomly. Therefore the text is not grammatically correct. As I am generating poetry, this is not a huge drawback for the project. 

Finally, the Markov does not format the text but rather prints out a long line of text that needs to be formatted manually. 

### Results
In response to the purpose, I found that this method was not the best way to generate poetry. However, it works well for narrative text  - punctuation ignored. I found that since narrative prose contains a lot of structure which leads to a variety of n-grams, the generator was better at generating unique text. For example, the n-gram "I walked", can be proceeded with "there", "here", "quickly" and so on. In a narrative text, you will have many instances of common n-grams, leading to a larger range of possible text generations. This leads to text which does not match the source text by more than a couple of words. 

Consider this example output based on 'Alice in Wonderland':

>Get up! 'said Alice; but I'm here!' the March Hare. 'I don't believe it -- once more the pig-baby was
>sneezing and howling alternately without a cat without a cat! It means much the same as the question, it
>wouldn't squeeze so.' 'They were obliged to say 'creatures,' said the March Hare. Alice felt dreadfully
>puzzled by the little glass table as before, but the three gardeners, or at any rate he might answer
>questions. 


This output does not match the source text by more than about four words at a time, leading to unique outputs (that are interesting if not entirely comprehensible). 

On the other hand, poetry contains many unique descriptions without repetition. This leads to fewer possible words that can follow a particular n-gram. This caused the program to generate text that matched the source by 8 or more words (ie the generator will copy a line of a poem, word for word). 

Below, is a sample output based on Emily Dickenson Poetry (line formatting added for clarity).  
>can see But Microscopes are prudent

>In an Emergency.

>Faith is the Pierless Bridge Supporting what We see Unto the East,  Yet they are won, 

>And not enough of me. 

>Houses so the Wise Men tell me, Oh Last Communion in the midst  so fair a Forehead Garland be indeed 

>Fitter Feet-of Her before us 

>Than whatever Brow Art of Boards Sufficiently developed

Note that the first three lines are taken directly from the source text before it changes on line 4.

Finally, 2-grams and 3-grams worked best in terms of creating understandable text that is still unique. 

### Future Work
In terms of poetry, different avenues for generating unique poetry need to be considered such as a Context-Free grammar generator which would account for punctuation and structure of a poem and avoid copying existing poetry. 

In terms of Markov chains, different implementations can also be considered.  Some ideas which can are explored are: Is runtime decreased with the use of python dictionaries instead of a matrix? Is there a way to take punctuation into account when generating text?
