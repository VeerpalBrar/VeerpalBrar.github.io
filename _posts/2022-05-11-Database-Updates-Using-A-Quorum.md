---
published: true
layout: post
date: 11 May 2022
tags: ["System Design", "Dev Journal"]
---

This past week I learned how to have consistent read and writes in a distributed database using a quorum algorithm. 

### Problem Statement
In a distributed system, you want many replica's of your database to ensure that data is never lost. The challenge with database replica's is ensuring the data stay's consistent across replica's. If you update the data in one database, all the replica's should also get updated. 

One approach is to update all the replica's on write but this can cause your system to become unreliable. If one replica is unavailable, the replica's would be out of sync. When even one replica is unavailable, the system can not write to the database.  The more database replica's there are, the more likely it is that a replica will be unavailable. 

One solution to the database consistency problem is to use a quorum. 

### What is a quorum?
A quorum is the minimum number of nodes that need to perform an operation for it to be considered a success. Usually, the quorum will be a number that represents a majority. By not requiring all nodes to accept an operation, we make our system more fault tolerant. You can continue to perform read and write operations as long as most of the replica's are available. This is reliable because it's unlikely many replica's will be unavailable at the same time. 

### Example execution of a write operation
Consider the case where we want to update to a row in our database. We need a majority of the replica's to agree to the update for it to be considered successful.

If we have 5 replica's (`N1`, `N2`, `N3`, `N4`, `N5`), we would push the update to all the replica's. We need to have three replica's  to form a quorum. Meaning three replica's need to respond and say the update was successful. For example, if  `N1`, `N3`, and `N4`  respond to the update request, we have formed a quorum. We can tell the client the write was successful without waiting for a response from `N2` and `N5`. Note that `N2` and `N5` will still process the update if they are available. 

You can see a simple example of this below. In `wait_for_result`, we wait for a response from the different "nodes".  Once we have enough responses to form a quorum we return and consider the write successful. 

> Aside: I use threads and the `sleep` function to represent how nodes take varying amounts of time to respond. I also kill threads early to mimic how some replica's can be unavailable and not receive the update. 

```
class Quorum
  attr_reader :nodes

  def initialize(nodes)
    @nodes = nodes
  end

  def write(key, value)
    wait_for_result(:write, key, value, Time.now)
  end

  private

  def quorum_size
    @size ||= (@nodes.length / 2.to_f).ceil
  end

  def wait_for_result(action, *args)
    responses = []
    tasklist = []

    # Set the threads going
    puts "STARTING #: #{action} #{args}"
    nodes.each do |node|
      task = Thread.new do
        sleep(rand(3)); #mimic the variable response times from the network
        result = node.send(action, *args)
        responses.push(result)
      end
      tasklist << task
    end

    # Wait for quorum to be formed
    sleep 0.1 while responses.length < quorum_size

    # thread clean up
    tasklist.each { |task|
      task.kill if task.alive?
    }

    puts "FINISHED #: #{action} #{args}"
    responses
  end
end
```

Even if some nodes are unavailable, the other nodes successfully process the update. A quorum is formed and the operation is considered a success. Now, this could lead to some unavailable nodes not having the latest data. I'll show how we handle conflicts later on. 

### Example execution of a read operation
Similar to how we have a quorum for the write operation, we need to form a quorum for reading data. If we were to only read from one replica, we risk returning outdated data if the replica is not up to date. 

Instead, we send the read request to all the replica's and wait for enough responses to form a quorum. If all the replica's in the quorum return the same data, we can assume the data is up to date and return it to the client. 

```
class quorum
  attr_reader :nodes

  def initialize(nodes)
    @nodes = nodes
  end

  def read(key)
    results = wait_for_result(:read, key)
    if read_conflicts?(results)
      raise "Conflicting reads"
    end

    puts "No conflicts"
    results.first[:value]
  end
end
```
#### Conflict Resolution in Reads 
Sometimes, the replica's  in the quorum may not have the same data. If one of the replica's was unavailable during a previous update, it will have outdated data. 

That is why we have to check if all the replica's return the same result for the read operation. If the result is different, it means that some of the replica's have outdated data. 

In this case, we should return the result of the most recent update. If you look at the code for the write operation, you can see we save a timestamp with each write. We can use the timestamp to see which replica has the most recent update. This is the result we will return to the client.  

Once we resolve a read conflict, we should update all the replica's to ensure they are  up-to-date. 

```
class quorum
  attr_reader :nodes

  def initialize(nodes)
    @nodes = nodes
  end

  def read(key)
    results = wait_for_result(:read, key)
    if read_conflicts?(results)
      puts "Conflicting reads: #{results.map{|r| r ? r[:value] : nil}.uniq}"
      
      latest_value = latest_value(results)
      wait_for_result(:write, key, latest_value[:value], latest_value[:time])
      
      return latest_value[:value]
    end

    puts "No conflicts"
    results.first[:value]
  end

  private


  def read_conflicts?(results)
    results.map { |result| result ? result[:value] : nil }.uniq.size > 1
  end

  def latest_value(results)
    results.reduce(nil) do |latest, result|
      if result && (!latest || result[:time] > latest[:time])
        result
      else
        latest
      end
    end
  end
end

### SAMPLE OUTOUT 
STARTING #: write [:foo, "bar", 2022-05-10 15:35:52 -0400]
FINISHED #: write [:foo, "bar", 2022-05-10 15:35:52 -0400]
STARTING #: read [:foo]
FINISHED #: read [:foo]
Conflicting reads: ["bar", nil]
STARTING #: write [:foo, "bar", 2022-05-10 15:35:52 -0400]
FINISHED #: write [:foo, "bar", 2022-05-10 15:35:52 -0400]
```

### Achieving consistency

How can we be certain that one of the read results will be the most recent data? What if all the replica's in the quorum are out of data? Well, remember that we need a majority to form a write quorum. Likewise, when we read data, we need a response from a majority of the replica's. Thus, there will be an overlap between the replica's that are part of the write quorum and the read quorum. So we will see at least one response from a replica that was part of the last update. Thus, we can be certain that we will see the most recent result returned by at least one replica.

### Conclusion
In conclusion, when you have many database replica's, you need a system to keep the replica's in sync. Using a quorum is one way to ensure you provide consistent results while having a reliable and fault tolerant system. 

### Code 
View the code from this post in [github](https://gist.github.com/VeerpalBrar/9481931b396d89767e6b4aeca97715ec). 
### Sources
- Educative Grokking the System Design Interview course. 
- [Distributed Systems 5.2: Quorums by Martin Kleppmann](https://www.youtube.com/watch?v=uNxl3BFcKSA)
