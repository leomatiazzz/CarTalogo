# 🚀 Minimal API (.NET 10) - Gerenciamento de Veículos & Administradores

[![.NET](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![C#](https://img.shields.io/badge/C%23-13.0-239120?logo=csharp&logoColor=white)](https://docs.microsoft.com/dotnet/csharp/)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-Minimal%20APIs-blue?logo=dotnet)](https://learn.microsoft.com/aspnet/core/fundamentals/minimal-apis)
[![Entity Framework Core](https://img.shields.io/badge/EF%20Core-9.0-6C257E?logo=nuget)](https://learn.microsoft.com/ef/core/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/Auth-JWT%20Bearer-black?logo=jsonwebtokens)](https://jwt.io/)
[![MSTest](https://img.shields.io/badge/Tests-27%20Passing-success?logo=visualstudio)](https://learn.microsoft.com/visualstudio/test/unit-testing-mstest-runner)

Uma API REST moderna, escalável e segura desenvolvida com **C# 13**, **.NET 10** e **ASP.NET Core Minimal APIs**, utilizando **Entity Framework Core (Pomelo MySQL)**, arquitetura modular baseada em rotas com `RouteGroupBuilder`, autenticação e autorização por papéis (**RBAC** via JWT), hash criptográfico de senhas e suíte de testes de integração determinística.

---

## 🏛️ Arquitetura e Design de Software

O projeto adota os princípios de **Clean Architecture**, **SOLID** e separação estrita de responsabilidades:

```mermaid
flowchart TD
    subgraph Client["Clientes HTTP"]
        Browser["Swagger UI / Web App"]
        Mobile["Mobile / API Consumer"]
    end

    subgraph Pipeline["ASP.NET Core Middleware (.NET 10)"]
        Cors["CORS"]
        Authn["JWT Authentication"]
        Authz["RBAC Authorization (Admin / Editor)"]
        Health["Health Checks (/health)"]
        ProbDetails["ProblemDetails (RFC 7807)"]
    end

    subgraph Endpoints["Camada de Apresentação (Minimal APIs)"]
        AdminEp["AdminEndpoints (/admins)"]
        VehicleEp["VehicleEndpoints (/vehicles)"]
        HomeEp["HomeEndpoints (/)"]
    end

    subgraph Domain["Camada de Domínio & Serviços"]
        AdminSvc["AdminService (IAdminService)"]
        VehicleSvc["VehicleService (IVehicleService)"]
        TokenSvc["TokenService (ITokenService)"]
        PassSvc["PasswordService (IPasswordService - PBKDF2)"]
    end

    subgraph Infrastructure["Camada de Infraestrutura & Dados"]
        EF["Entity Framework Core (DbContexto)"]
        MySQL[("MySQL 8.0 Database")]
    end

    Client --> Pipeline
    Pipeline --> Endpoints
    Endpoints --> Domain
    Domain --> Infrastructure
    Infrastructure --> MySQL
```

### Principais Destaques Arquiteturais:
1. **Minimal APIs Idiomáticas:** Sem o arquivo monolítico legado `Startup.cs`. Inicialização via `WebApplication.CreateBuilder(args)` e agrupamento modular com `app.MapGroup()`.
2. **Desacoplamento de Contrato com ViewModels/DTOs:** Nenhuma entidade interna do EF Core é exposta diretamente na API. Todas as respostas utilizam `record` imutáveis (`VehicleModelView`, `AdminModelView`).
3. **I/O 100% Assíncrono (`async/await` com `CancellationToken`):** Todas as operações de banco de dados são não-bloqueantes, prevenindo *ThreadPool Starvation*.
4. **Otimização de Consultas:** Consultas somente-leitura utilizam `.AsNoTracking()` e filtros SARGable (sem `.ToLower()` que invalidem índices do MySQL).

---

## 🔒 Segurança da Informação

* **Hash Criptográfico de Senhas (PBKDF2):** As senhas de administradores nunca são salvas ou comparadas em texto puro. Utiliza-se derivação de chave com HMAC-SHA512 e *salt* randômico por usuário (`PasswordHasher<T>` nativo do ASP.NET Core).
* **JWT Bearer Conforme RFC 7519:**
  * Assinatura com chave de alta entropia (≥ 256 bits).
  * Validação estrita de tempo de vida em UTC (`DateTime.UtcNow`), `Issuer`, `Audience` e `ClockSkew = TimeSpan.Zero`.
* **Controle de Acesso Baseado em Papéis (RBAC):**
  * `Admin`: Acesso administrativo irrestrito (CRUD de administradores e veículos).
  * `Editor`: Acesso operacional (cadastro, leitura e consulta de veículos; sem permissão de exclusão ou gestão de usuários).
* **Índices e Integridade:** Constraint `UNIQUE` na coluna `Email` de administradores para impedir cadastros duplicados.
* **Segredos Fora do Repositório:** Chaves e dados sensíveis gerenciados via variáveis de ambiente e `.gitignore` higienizado contra dumps de banco de dados.

---

## 📋 Endpoints da API

| Método | Rota | Autenticação / Role | Descrição | Status HTTP |
|---|---|:---:|---|:---:|
| `GET` | `/` | Pública | Informações da API e link da documentação | `200 OK` |
| `GET` | `/health` | Pública | Verificação de integridade (*liveness/readiness*) | `200 OK` |
| `POST` | `/admins/login` | Pública | Autenticação e emissão de Token JWT | `200 OK`, `401 Unauthorized` |
| `GET` | `/admins` | `Admin` | Listagem paginada de administradores | `200 OK`, `401`, `403 Forbidden` |
| `GET` | `/admins/{id}` | `Admin` | Busca de administrador por ID | `200 OK`, `404 Not Found` |
| `POST` | `/admins` | `Admin` | Cadastro de novo administrador | `201 Created`, `400 Bad Request` |
| `GET` | `/vehicles` | `Admin, Editor` | Listagem de veículos com filtros (`name`, `brand`, `page`) | `200 OK`, `401` |
| `GET` | `/vehicles/{id}` | `Admin, Editor` | Busca de veículo por ID | `200 OK`, `404 Not Found` |
| `POST` | `/vehicles` | `Admin, Editor` | Cadastro de novo veículo | `201 Created`, `400 Bad Request` |
| `PUT` | `/vehicles/{id}` | `Admin` | Atualização cadastral de veículo | `200 OK`, `400`, `403`, `404` |
| `DELETE` | `/vehicles/{id}` | `Admin` | Exclusão de veículo | `204 NoContent`, `403`, `404` |

---

## 🛠️ Como Executar

### Pré-requisitos
* [.NET 10.0 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) ou [Docker](https://www.docker.com/)

---

### Opção 1: Execução com Docker Compose (Recomendado)

Suba a API e o banco de dados MySQL com um único comando:

```bash
docker compose up -d --build
```

A API estará disponível em:
* **Base URL:** `http://localhost:5231`
* **Swagger UI:** `http://localhost:5231/swagger`
* **Health Check:** `http://localhost:5231/health`

Para encerrar o ambiente:
```bash
docker compose down -v
```

---

### Opção 2: Execução Local (.NET CLI)

1. **Configurar a Connection String:**
   No arquivo `API/appsettings.json`, configure a conexão com a sua instância do MySQL:
   ```json
   "ConnectionStrings": {
     "MySql": "Server=localhost;Database=minimal_api;Uid=root;Pwd=sua_senha;"
   }
   ```

2. **Aplicar as Migrações do EF Core:**
   ```bash
   dotnet ef database update --project API/minimal-api.csproj
   ```

3. **Iniciar a Aplicação:**
   ```bash
   dotnet run --project API/minimal-api.csproj
   ```

---

## 🧪 Suíte de Testes Automatizados

O projeto conta com testes unitários e de integração desenvolvidos com **MSTest**, **WebApplicationFactory** e **Entity Framework Core In-Memory Provider**. Os testes são **100% determinísticos e isolados**, rodando sem necessidade de infraestrutura externa ou MySQL local.

Execute toda a suíte de testes:

```bash
dotnet test
```

### Cobertura dos Testes:
* ✅ **Testes Unitários de Segurança:** Validação de hashing PBKDF2 e comparação com salt randômico.
* ✅ **Testes Unitários de Serviços:** Operações CRUD, paginação segura e filtros de busca em `VehicleService` e `AdminService`.
* ✅ **Testes de Integração HTTP:**
  * Fluxo de autenticação (`/admins/login`) com credenciais válidas e inválidas.
  * Validação de payloads e regras de domínio (ex: ano do veículo entre 1886 e ano vigente + 1).
  * **Testes de Autorização RBAC:** Confirmação de que o perfil `Editor` recebe `403 Forbidden` ao tentar excluir veículos ou acessar dados de administradores.
  * Verificação do endpoint de integridade operacional (`/health`).

---

## 📂 Estrutura de Diretórios

```
minimal-api/
├── API/                               # Projeto Principal da API
│   ├── Domain/                        # Regras de Negócio e Domínio
│   │   ├── DTOs/                      # Data Transfer Objects de Entrada
│   │   ├── Entities/                  # Entidades do EF Core (Admin, Vehicle)
│   │   ├── Enums/                     # Enumerações (Profile: Admin, Editor)
│   │   ├── Interfaces/                # Contratos de Serviços (IAdmin, IVehicle, etc.)
│   │   ├── ModelViews/                # DTOs de Saída / ViewModels (Record)
│   │   └── Services/                  # Implementações com async/await e PBKDF2
│   ├── Endpoints/                     # Módulos Minimal API (RouteGroupBuilder)
│   │   ├── AdminEndpoints.cs
│   │   ├── VehicleEndpoints.cs
│   │   └── HomeEndpoints.cs
│   ├── Infrastructure/                # Persistência de Dados
│   │   └── Db/DbContexto.cs
│   ├── Migrations/                    # Histórico de Migrações do EF Core
│   ├── Program.cs                     # Inicialização Idiomática .NET 10
│   └── appsettings.json
│
├── TEST/                              # Suíte de Testes Automatizados
│   ├── Domain/                        # Testes Unitários de Domínio e Serviços
│   ├── Helpers/Setup.cs               # WebApplicationFactory e Gerador de Tokens JWT
│   ├── Mocks/                         # Mocks em Memória para Testes de Integração
│   └── Requests/                      # Testes de Requisições HTTP (RBAC, CRUD)
│
├── Dockerfile                         # Multi-stage build otimizado para .NET 10
├── docker-compose.yml                 # Orquestração da API e MySQL com Healthcheck
├── .dockerignore
├── .gitignore
└── minimal-api.sln                    # Solução Principal Unificada
```

---

## 📜 Licença

Distribuído sob a licença MIT. Consulte `LICENSE` para mais informações.
