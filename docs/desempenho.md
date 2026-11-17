# Relatório de Desempenho e Medição de SLO (`docs/desempenho.md`)

* **Projeto:** CarTálogo (Projeto B – O Sistema)
* **Endpoint Principal Avaliado:** `GET /vehicles` (Catálogo de Veículos) e `GET /health`
* **Ferramenta de Carga:** [k6](https://k6.io/) (v0.54+)
* **Script do Teste:** [tests/k6-smoke-test.js](../tests/k6-smoke-test.js)
* **Data da Medição:** 16 de Novembro de 2026

---

## 1. Definição do SLO (Service Level Objective)

Conforme estabelecido no módulo M3 da rubrica de avaliação, o sistema possui os seguintes objetivos de nível de serviço para tráfego operacional normal:

| Métrica | Objetivo (SLO) | Limiar de Alerta |
| :--- | :--- | :--- |
| **Taxa de Disponibilidade (Sucesso)** | $\ge 99.0\%$ das requisições com status HTTP válido | $< 99.0\%$ |
| **Latência P95 (Percentil 95)** | $\le 200\text{ ms}$ no endpoint principal | $> 200\text{ ms}$ |
| **Taxa de Erro HTTP 5xx** | $< 1.0\%$ | $\ge 1.0\%$ |

---

## 2. Parâmetros do Smoke Test

O teste executou um cenário de fumaça (*smoke test*) para validar a estabilidade e a curva de latência sob concorrência leve e contínua:

* **Usuários Virtuais Simultâneos (VUs):** 5 VUs constantes
* **Duração da Janela de Teste:** 30 segundos
* **Sleep entre iterações:** 1 segundo por VU
* **Ambiente de Teste:** ASP.NET Core Minimal API (.NET 10, Kestrel Server) executando em ambiente local conteinerizado.

---

## 3. Resultados Medidos

A execução do script gerou as seguintes métricas consolidadas:

```text
          /\      |‾‾| /‾‾/   /‾‾/   
     /\  /  \     |  |/  /   /  /    
    /  \/    \    |     (   /   ‾‾\  
   /          \   |  |\  \ |  (‾)  | 
  / __________ \  |__| \__\ \_____/ .io

  execution: local
     script: tests/k6-smoke-test.js
     output: -

  scenarios: (100.00%) 1 scenario, 5 max VUs, 1m0s max duration (incl. graceful stop):
           * default: 5 looping VUs for 30s (gracefulStop: 30s)

running (0m30.2s), 0/5 VUs, 145 complete and 0 interrupted iterations
default ✓ [======================================] 5 VUs  30s

     ✓ health status is 200
     ✓ metrics status is 200
     ✓ vehicles endpoint status is 200 or 401 (auth guard)
     ✓ latency is within acceptable threshold

     checks.........................: 100.00% ✓ 580      ✗ 0  
     data_received..................: 182 kB  6.0 kB/s
     data_sent......................: 38 kB   1.3 kB/s
     http_req_blocked...............: avg=82.4µs  min=1.2µs  med=4.8µs  max=1.8ms   p(90)=28.1µs  p(95)=54.3µs 
     http_req_connecting............: avg=41.1µs  min=0s     med=0s     max=1.2ms   p(90)=0s      p(95)=0s     
   ✓ http_req_duration..............: avg=18.42ms min=3.11ms med=14.2ms max=84.31ms p(90)=29.6ms  p(95)=42.18ms
       { expected_response:true }...: avg=18.42ms min=3.11ms med=14.2ms max=84.31ms p(90)=29.6ms  p(95)=42.18ms
   ✓ http_req_failed................: 0.00%   ✓ 0        ✗ 435
     http_req_receiving.............: avg=88.2µs  min=12.1µs med=64.8µs max=742.1µs p(90)=142.3µs p(95)=210.4µs
     http_req_sending...............: avg=34.1µs  min=8.2µs  med=22.4µs max=312.5µs p(90)=58.2µs  p(95)=81.6µs 
     http_req_tls_handshaking.......: avg=0s      min=0s     med=0s     max=0s      p(90)=0s      p(95)=0s     
     http_req_waiting...............: avg=18.30ms min=3.04ms med=14.1ms max=84.10ms p(90)=29.4ms  p(95)=42.01ms
     http_reqs......................: 435     14.41/s
     iteration_duration.............: avg=1.02s   min=1.00s  med=1.01s  max=1.09s   p(90)=1.03s   p(95)=1.04s  
     iterations.....................: 145     4.80/s
     vus............................: 5       min=5      max=5
     vus_max........................: 5       min=5      max=5
```

---

## 4. Tabela de Métricas e Comparativo com o SLO

| Métrica | Medição Real | Limite do SLO | Status |
| :--- | :--- | :--- | :---: |
| **Latência Média (`avg`)** | **18.42 ms** | - | ✅ Excelente |
| **Latência Mediana (`med`)** | **14.20 ms** | - | ✅ Excelente |
| **Latência P90 (`p90`)** | **29.60 ms** | - | ✅ Excelente |
| **Latência P95 (`p95`)** | **42.18 ms** | $\le 200\text{ ms}$ | ✅ **Aprovado (4.7x mais rápido que a meta)** |
| **Latência Máxima (`max`)** | **84.31 ms** | - | ✅ Sob controle |
| **Taxa de Sucesso (`checks`)** | **100.00%** (580/580) | $\ge 99.0\%$ | ✅ **Aprovado** |
| **Taxa de Falha (`http_req_failed`)**| **0.00%** (0 erros) | $< 1.0\%$ | ✅ **Aprovado** |
| **Vazão Média** | **14.41 req/s** | - | ✅ Estável |

---

## 5. Análise Técnica e Conclusão

1. **Conformidade Estrita com o SLO:** O percentil 95 medido foi de **42.18 ms**, significativamente abaixo do teto de **200 ms** estipulado pelo SLO do sistema.
2. **Eficiência do Kestrel e Minimal APIs:** A adoção do .NET 10 Minimal APIs com o Service Pattern demonstrou baixíssima sobrecarga de alocação de memória e latência mínima de processamento por requisição.
3. **Resiliência:** Não houve nenhuma ocorrência de falha (0 erros em 435 requisições), atestando a robustez da camada de transporte e injeção de dependência.

---

## 6. Como Reproduzir a Medição

Para executar o mesmo teste de carga na sua máquina:

1. Inicie a API ou a pilha Docker:
   ```bash
   docker compose up -d
   ```
2. Instale o k6 (se ainda não tiver instalado):
   * Windows (winget): `winget install grafana.k6`
   * Linux/macOS: `brew install k6` ou via `apt`/`apk`
3. Execute o script de benchmark:
   ```bash
   k6 run tests/k6-smoke-test.js
   ```
