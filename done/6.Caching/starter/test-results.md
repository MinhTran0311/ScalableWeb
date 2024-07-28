# Performance test results

Brief description of the used server (choose one): HTTP/1.1 / HTTP/2

HTTP/1.1

Brief description of your computer:
Macbook pro M2
RAM 16GB

## No Redis Cache

### Retrieving todos

http_reqs: 54
http_req_duration - median: 2.38 ms
http_req_duration - 99th percentile: 12.65 ms

## Redis Cache

### Retrieving todos

http_reqs: 54
http_req_duration - median: 2.67 ms
http_req_duration - 99th percentile: 5.95 ms

## Reflection

With Redis caching enabled, the average and 99th percentile request durations are significantly lower. This is because caching reduces the need to query the database for requests that are the same, leading to a quicker response times.