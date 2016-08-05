---
published: false
---
I recently needed to parse a CSV file and decided it would be a good idea to automate the process. Since I didn't need to do heavy  data analysis , I decided to use pythons native csv library rather then panda's or numpy.  

The csv library has a lot of methods that make reading from and writing to CSV files simple and easy. It handles all the nuances of reading and writing to a csv file, leaving you to work with the data.

I noticed that the csv library offers two methods for reading a csv file: reader and DictReader. Both read the file row by row and return the data from each row. What vary's is how they return the data. The reader method returns a list, where each element is a data value from the row. The DictReader returns a dictionary where the column headings are the keys, and the values are the data values of the row.

I decided to test out both to see which was best for my needs. I came across an [article by Benjamin Bengfort](https://districtdatalabs.silvrback.com/simple-csv-data-wrangling-with-python) stating to use DictReader, but it did not explain why. I decided to do some investigating to figure out which would be better for my needs. 

To figure out which method was more efficient, I ran a test to see how long it took for each method to read the file. Since observing run time is not the most accurate measurement of efficiency, I repeated this test 1000 times. Here is the code I used for the test: 

```

count_reader = 0
count_dict = 0
tie = 0
for i in range(1000):
    start   = time.time()
    with open(f) as file:
        read = csv.reader(file, delimiter = ",", quotechar = '"')
        write_file = open('owner_sort.csv', 'wb')
        writer = csv.writer(write_file, dialect="excel")  
        
        for row in read:
            print row  
    finish = time.time()
    csv_reader = finish - start

    start = time.time()   
    with open(f) as file:
        read = csv.DictReader(file, delimiter = ',', quotechar = '"')
        write_file = open('owner_sort.csv', 'wb')
        writer = csv.writer(write_file, dialect="excel")
        
        for row in read:
            print row 
            
    finish = time.time()
    dict_reader = finish - start
   
    if csv_reader > dict_reader:
        count_reader += 1
    elif csv_reader < dict_reader:
        count_dict+=1
    else:
        tie+=1

print 'final: '   
print countnt
print countobj
print tie
```

My final results were that csv.reader was faster 995 times, while DictReader was only faster 5 times. I repeated this test a couple more times, and found that these numbers did not vary much.

In terms of speed, the reader method is a clear winner. Though to be fair, for my file, both csv.reader and csv.DictReader ran in under a second. The reader method tended to finish around a thousandth of a second faster than the DictReader method.

If you were planning on reading  large CSV files,  those few extra thousandths of a second could make a big difference for efficiency. On the other hand, if the CSV file is not large its probably better to use DictReader as it provides better readability.

Say, for example, you want to print the first column of every row, which holds the data ID. Then you have to do the following with csv.reader:

```
read = csv.reader(file, delimiter = ',', quotechar = '"')
for row in read:
    print row[0]
```

Compare this to csv.DictReader:

```
read = csv.DictReader(file, delimiter = ',', quotechar = '"')
for row in read:
    print row['ID']
```

As you can see, with DictReader you have to use key's rather then indexes. This makes the code more readable as it is clear what data you are accessing. Furthermore, if the order of the columns changed than the DictReader code would still function without any modification. The csv.reader code would have to be changed though, as the row indexes would now be incorrect.

In the end, both csv.reader and csv.DictReader have their advantages and disadvantages. It just comes down to whether you want efficiency or readibilty.

(Alternativly, you could do as [Benjamin Bengfort says in his article](https://districtdatalabs.silvrback.com/simple-csv-data-wrangling-with-python) and used namedtuples, which are faster than DictReader but still maintain readability.) 
