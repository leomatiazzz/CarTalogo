# ADR 0001: Adoção do Padrão Service/Repository com ASP.NET Core Minimal APIs e Front-end Desacoplado

* **Status:** Aceito (Accepted)
* **Decisores:** Léo Matias Araújo ([leomatiazzz](https://github.com/leomatiazzz))
* **Data:** 2026-11-16
* **Origem da Decisão:** Requisito M1 / M4 do Projeto B (SOLID e 1 Design Pattern justificado)

---

## Contexto e Definição do Problema

O sistema **CarTálogo** necessita de uma arquitetura limpa, manutenível e de alto desempenho para gerenciar o catálogo de veículos e o controle de acesso de usuários (*Admin* e *Editor*). O projeto original possuía acoplamento entre regras de negócio, persistência de dados direta nos endpoints e falta de separação de responsabilidades.

Precisávamos definir:
1. O modelo de exposição de rotas na API (Controllers tradicionais vs. Minimal APIs).
2. O padrão arquitetural para isolamento de regras de negócio e acesso a dados (Active Record vs. Service/Repository Pattern).
3. A camada de apresentação (Monólito com templates Razor/MVC vs. Single-Page Application desacoplada em React).

---

## Critérios de Decisão (Decision Drivers)

* **Aderência aos princípios SOLID:**
  * *Single Responsibility Principle (SRP):* Separar transporte HTTP, validação de regras de negócio e persistência.
  * *Dependency Inversion Principle (DIP):* Módulos de alto nível devem depender de abstrações (interfaces), facilitando testes com mocks/in-memory.
* **Testabilidade:** Capacidade de testar 100% da lógica de negócio e regras de validação sem depender de banco de dados físico ativo.
* **Performance e Baixo Overhead:** Tempo de inicialização rápido e baixo consumo de memória.
* **Clareza de Contratos:** Facilidade de documentação OpenAPI/Swagger e consumo pelo front-end.

---

## Opções Consideradas

* **Opção 1:** Monólito tradicional ASP.NET Core MVC com Controllers e Views Razor.
* **Opção 2:** ASP.NET Core Minimal APIs com lógica embutida diretamente nos delegates de rota (Fat Endpoints).
* **Opção 3 (Escolhida):** **ASP.NET Core Minimal APIs modularizadas + Service/Repository Pattern via Injeção de Dependência + React SPA desacoplada**.

---

## Decisão Tomada

Escolhemos a **Opção 3**, adotando o **Service Pattern (com abstração de repositório/serviço)** orquestrado por Minimal APIs e consumido por um cliente React independente.

### Justificativa Técnica do Pattern

1. **Abstração por Interfaces (`IVehicleService`, `IAdminService`, `IPasswordService`, `ITokenService`):**
   * Os endpoints Minimal API (`VehicleEndpoints.cs`, `AdminEndpoints.cs`) atuam estritamente como a camada de transporte HTTP (recebem DTOs, delegam ao serviço correspondente e retornam `IResult` padronizado).
   * As regras de negócio e consultas ao `DbContexto` residem isoladas nos serviços (`VehicleService`, `AdminService`), garantindo o princípio da responsabilidade única.
2. **Inversão de Controle e Injeção de Dependência:**
   * A API registra os serviços no container nativo do .NET com escopo (`AddScoped<IVehicleService, VehicleService>()`).
   * No projeto de testes (`TEST/`), o `WebApplicationFactory` e os testes unitários conseguem substituir ou rodar contra `Microsoft.EntityFrameworkCore.InMemory` sem alterar nenhuma linha de código de produção.
3. **Desacoplamento Front-end / Back-end:**
   * A API comunica-se via JSON padronizado com autenticação JWT (RBAC). O front-end React pode ser versionado, testado e construído independentemente, inclusive rodando em servidores Nginx ou CDNs em contêineres isolados.

---

## Consequências

### Pontos Positivos
* **Alta Cobertura de Testes:** Viabilizou a criação de 29 testes automatizados (unitários e de integração) rápidos e sem dependências de infraestrutura externa.
* **Organização Modular:** Eliminação de arquivos gigantescos (`Program.cs` ou `Startup.cs` monolíticos). Rotas organizadas por domínio com métodos de extensão (`MapVehicleEndpoints`, `MapAdminEndpoints`).
* **Segurança Forte:** Senhas hasheadas com PBKDF2 e salting criptográfico (`IPasswordService`), tokens assinados via HMAC-SHA256 (`ITokenService`).
* **Pronto para Observabilidade:** Facilidade de injetar middlewares de telemetria, métricas (`/metrics`) e health checks (`/health`).

### Pontos Negativos / Trade-offs
* **Maior quantidade de arquivos:** Necessidade de manter interfaces e classes de serviço separadas dos endpoints. No entanto, para manutenibilidade e crescimento sustentável do projeto, esse custo é largamente compensado.
* **Gerenciamento de CORS:** Por rodar o front-end em porta/origem separada em desenvolvimento, requer política CORS explícita na API (já configurada no `Program.cs`).

---

## Pros e Contras das Opções

### Opção 1: MVC Clássico com Controllers
* *Pró:* Estrutura conhecida e convencional no ecossistema .NET legado.
* *Contra:* Maior overhead de memória e tempo de inicialização; forte acoplamento do front-end com o runtime do servidor C#.

### Opção 2: Minimal APIs com lógica inline nos Handlers
* *Pró:* Menor número de arquivos e código inicial muito curto.
* *Contra:* Violação severa de SRP (transporte HTTP misturado com queries de banco); impossibilidade de reaproveitar regras de negócio ou testá-las isoladamente sem levantar o pipeline HTTP completo.

### Opção 3: Minimal APIs + Service Pattern + React SPA (Adotada)
* *Pró:* Combina a velocidade e leveza das Minimal APIs com a robustez e testabilidade do Service Pattern.
* *Pró:* Atende integralmente aos requisitos de SOLID e qualidade de código exigidos na rubrica do curso.
