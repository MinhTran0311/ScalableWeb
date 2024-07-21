import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

export const errorRate = new Rate("errors");

export let options = {
  stages: [{ duration: "10s", target: 10 }],
  thresholds: {
    http_req_duration: ["p(99)<2000"], // 99% of requests must complete below 2s
  },
};

export default function () {
  const res = http.get("http://localhost:7800/todos");

  const result = check(res, {
    "status is 200": (r) => r.status === 200,
  });

  errorRate.add(!result);
  sleep(1);
}
