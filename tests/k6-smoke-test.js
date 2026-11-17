import http from 'k6/http';
import { check, sleep } from 'k6';

// Configuração do Smoke Test no k6
export const options = {
  vus: 5,               // 5 usuários virtuais simultâneos
  duration: '30s',      // Duração de 30 segundos
  thresholds: {
    // SLO: 95% das requisições devem responder em menos de 200ms
    http_req_duration: ['p(95)<200'],
    // Taxa de falhas deve ser inferior a 1%
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5231';

export default function () {
  // 1. Smoke test do endpoint de Health
  const healthRes = http.get(`${BASE_URL}/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
  });

  // 2. Smoke test do endpoint de Métricas & SLO
  const metricsRes = http.get(`${BASE_URL}/metrics`);
  check(metricsRes, {
    'metrics status is 200': (r) => r.status === 200,
  });

  // 3. Smoke test do endpoint de Catálogo de Veículos (Endpoint Principal)
  const vehiclesRes = http.get(`${BASE_URL}/vehicles?pagina=1`);
  check(vehiclesRes, {
    'vehicles endpoint status is 200 or 401 (auth guard)': (r) =>
      r.status === 200 || r.status === 401,
    'latency is within acceptable threshold': (r) => r.timings.duration < 200,
  });

  sleep(1);
}
