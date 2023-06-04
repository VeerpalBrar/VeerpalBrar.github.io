---
published: true
layout: post
date: 4 June 2023
tags: ["Kubernetes", "Minikube","Dev Journal"]
---
Over the past few months, I've been learning about Kubernetes through a side project. As I work with Minikube to run a local cluster with multiple services, I find myself just scratching the surface of Kubernetes. In this blog post, I aim to document my current understanding of the various ways applications in Minikube can connect to each other, the host machine, and the outside world.

First, here is the setup I'm working with currently: I am using Minikube to create my cluster on my local machine. My cluster is running different services which need to communicate with one another. Some of these services talk to a database running on my host machine, outside of the cluster. Finally, some of these services expose HTTP ports outside the cluster, where a "user" can make API requests to. 

### Connecting to the host machine's database
Within a Kubernetes cluster, services are isolated from the external environment. My database resides on my laptop outside of my cluster. I needed my services to connect to this database. Thankfully, Minikube offers a convenient solution by adding the host.minikube.internal hostname entry to the /etc/hosts file. This allows services to access the host's IP address and establish a connection with the database.

```
 > minikube ssh
Last login: Sat Mar 4 00:43:49 2023 from 192.168.49.1
docker@minikube:~$ cat /etc/hosts
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
192.168.49.2	minikube
192.168.65.2	host.minikube.internal
192.168.49.2	control-plane.minikube.internal
docker@minikube:~$
```

### Accessing Other Services:
With Kubernetes, each pod in a cluster has a unique IP and can connect to other pods without extra network configuration. This extends to services as well which are an abstraction layer around a group of pods.

To access a service within the cluster, you can utilize [the service name and port]((https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster-services/#manually-constructing-apiserver-proxy-urls). For example, if there's an authentication service named auth running on port 5000, other services can connect to it using http://auth:5000. It's important to note that this URL is not exposed outside the cluster and is limited to inter-cluster communication.

### Utilizing Ingress for Gateway Applications:
Ingress is a powerful tool for exposing HTTP and HTTPS routes externally in a Kubernetes cluster. By defining routing rules, Ingress allows external requests to be directed to different applications within the cluster. It's worth mentioning that Ingress supports only HTTP and HTTPS, while other protocols and ports require alternative services such as NodePort or LoadBalancer. (I only used ClusterIP services so far and so omit discussion about NodePort or LoadBalancer services from this post.)

To set up Ingress, you define URLs to be exposed and specify the service within the cluster that each URL should route to. Consider the following example:

```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: gateway-ingress
spec:
  rules:
    - host: my-public-url.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service: 
                name: gateway
                port:
                  number: 8080
```

In the above configuration, requests made to my-public-url will be automatically routed to the gateway service by Ingress.

When working with Minikube, running minikube tunnel is essential to enable external access. Once set up, accessing my-public-url in a browser will route the request to the cluster running on your computer.

### Conclusion:
In this blog post, I've shared my learnings from working with Minikube and exploring connectivity in Kubernetes. While I've only scratched the surface, I hope this article provides valuable insights. As I continue to learn and delve deeper into Kubernetes, I may update this post with new insights in the future.

### Resouces
- [Communication between Microservices in a Kubernetes cluster](https://dev.to/narasimha1997/communication-between-microservices-in-a-kubernetes-cluster-1n41)
- [Access Services Running on Clusters](https://kubernetes.io/docs/tasks/access-application-cluster/access-cluster-services/)
- [Set up Ingress on Minikube with the NGINX Ingress Controller](https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/)
- [Kubernetes — How does service network work in the cluster](https://medium.com/@zhaoyi0113/kubernetes-how-does-service-network-work-in-the-cluster-d235b69ff536)
- [Exposing Applications for Internal Access](https://kubebyexample.com/learning-paths/application-development-kubernetes/lesson-3-networking-kubernetes/exposing)