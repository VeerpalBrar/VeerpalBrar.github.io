---
published: false
---
I recently had to retrieve some data stored in csv files, and figuered it would be a good idea to automate the process rather then doing it by hand. 
I didn't required heavy analysis of the contents. I just wanted to extract certain information from the rows and group it together. 

For this reason, I decided not to develve into panda's and numpy installations and instead settle for pythons native csv library. 
The csv library has a lot of methods that make reading from and writing to csv files fairly simple. It handles all the nuances of reading and writing to a csv file, leaving you to work with the data. 

The first thing I noticed was that the csv library offers two ways of reading from a csv file: a csv.reader and csv.DictReader. Both read the file row by row and return the data from each row. What vary's is how they return the data. the csv.reader method returns a list containing all the comlumsn, and the csv.DictReader returns a dictionary where the column headings are the keys, and the values are the data values.

I decided to test out both to see which was best for my needs. I came across this ADD LINKS article telling me to use dictreader, but I wanted to know why it would be better.  

To figure out which was more efficient, I ran some quick tests, checking the time it took for each method to read the file. Since runtime is not the most accurate measurement of efficiency, I repeated this test 1000 times.

''' python

count_reader = 0
count_dict = 0
tie = 0
for i in range(1000):
    start   = time.time()
    with open(r'C:\Users\BrarVe\Documents\Content Owners\Internet-Content-Owners.csv') as file:
        read = csv.reader(file, delimiter = ',', quotechar = '"')
        write_file = open('owner_sort.csv', 'wb')
        writer = csv.writer(write_file, dialect="excel")  
        
        for row in read:
            print row  
    finish = time.time()
    csv_reader = finish - start

    start   = time.time()   
    with open(r'C:\Users\BrarVe\Documents\Content Owners\Internet-Content-Owners.csv') as file:
        read = csv.DictReader(file, delimiter = ',', quotechar = '"')
        write_file = open('owner_sort.csv', 'wb')
        writer = csv.writer(write_file, dialect="excel")
        
        owners={}
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
'''

My final results were that csv.reader was faster 995 times, while DictReader was only faster 5 times. I repeated this test a couple more times, and found that these numbers did not vary much. 

In terms of speed, csv.reader is a clear winner. Though to be fair, for my file, both csv.reader and csv.DictReader ran in under a second, with csv.reader tending to finish around a thousandth of a second faster.

If you were running this on
