# Declaração de Uso de Inteligência Artificial (`docs/ia.md`)

* **Projeto:** CarTálogo (Projeto B – O Sistema)
* **Autor:** Léo Matias Araújo ([leomatiazzz](https://github.com/leomatiazzz))
* **Contexto Acadêmico:** Cumprimento da exigência de transparência e integridade sobre o uso de IA Generativa no desenvolvimento de software.

---

## 1. Visão Geral e Filosofia de Uso

Conforme orientado no curso, a Inteligência Artificial foi utilizada ativamente como **copiloto de engenharia e consultora técnica**. A premissa central mantida pelo autor ao longo de todo o ciclo de desenvolvimento foi:

> *"A IA sugere alternativas; a decisão de arquitetura e o domínio sobre o código continuam sendo meus."*

Cada sugestão, refatoração e componente gerado foi inspecionado, testado localmente, depurado e validado pelo autor antes de ser aceito e integrado ao repositório.

---

## 2. Prompts Estratégicos que Importaram

Abaixo estão os principais comandos e interações que guiaram o desenvolvimento e a modernização do projeto:

### Prompt 1: Migração de Versão e Modernização do Backend
> *"Eu utilizava a versão .NET 9.0 ano passado quando fiz esse projeto inicial com o professor. Precisei instalar novamente o .NET e agora estou na versão 10.0.404. Analise a solução e execute a modernização completa do backend para o .NET 10, substituindo o Program/Startup antigo pelo padrão WebApplication moderno, modularizando os endpoints e corrigindo as quebras de compilação."*
* **Impacto:** Eliminação do arquivo legado `Startup.cs`, adoção do `WebApplication.CreateBuilder` do C# 13 / .NET 10, separação de endpoints em classes estáticas (`AdminEndpoints.cs`, `VehicleEndpoints.cs`) e atualização das dependências do EF Core 9 e MySqlConnector 3.0.

### Prompt 2: Refatoração de Segurança e Princípios SOLID
> *"Quero reforçar a segurança do sistema. A senha original estava salva em texto puro. Implemente um serviço de criptografia robusto com salt aleatório e PBKDF2, e isole a lógica de geração de tokens JWT em uma interface dedicada para podermos testar sem acoplamento."*
* **Impacto:** Criação de `IPasswordService` e `ITokenService`, desacoplando transporte HTTP da criptografia. Implementação do PBKDF2 com HMAC-SHA512 e salting criptográfico com chave de 576 bits.

### Prompt 3: Identidade Visual e Arquitetura do Front-end
> *"Gerei uma imagem com logo e paleta de cores (Figma.jpg) e coloquei assets de imagem na raiz. Proponha e implemente um front-end moderno, simples e direto para o projeto em React com TypeScript, integrando ao catálogo e à autenticação da API."*
* **Impacto:** Criação da SPA em React 19 + TypeScript + Tailwind CSS v4, consumindo a Minimal API via Axios, com gerenciamento de sessão no `AuthContext` e proteção de rotas por perfis (*Admin* e *Editor*).

### Prompt 4: Fluxo de Auto-Cadastro de Novos Usuários
> *"Percebi que a página de login não tem opção de cadastro. Como novos usuários podem se registrar? Vamos implementar o auto-cadastro público com perfil de Editor e o modal de esqueci minha senha."*
* **Impacto:** Criação do endpoint `POST /admins/register` com validação de duplicidade de e-mail e concessão segura do perfil `Editor`, além da interface com abas na tela de login e validação de senhas coincidentes.

### Prompt 5: Padronização Textual (Sentence Case)
> *"Corrija o Title Case no front-end, deixando em padrão normal de português, principalmente em botões de ação e títulos."*
* **Impacto:** Padronização ergonômica de todos os textos, botões e modais para a convenção em português brasileiro.

---

## 3. Domínio Técnico e Capacidade de Explicação do Código

O autor domina e sabe explicar cada parte da aplicação:

1. **Como a autenticação funciona?**
   O cliente envia e-mail e senha para `/admins/login`. O `AdminService` busca o usuário pelo e-mail com índice único no banco. O `PasswordService` extrai o salt embutido no hash armazenado e recalcula o hash da senha enviada usando PBKDF2 com 100.000 iterações. Se coincidirem, o `TokenService` monta o payload com claims (`name`, `role`, `jti`) e assina com chave simétrica HMAC-SHA256, gerando um token JWT com validade de 2 horas em UTC.

2. **Como os testes rodam sem depender do MySQL?**
   O projeto de testes (`TEST/`) utiliza `Microsoft.EntityFrameworkCore.InMemory`. O `WebApplicationFactory<Program>` customiza o container de DI via `ConfigureTestServices`, substituindo o provedor Pomelo MySQL por um banco em memória isolado para cada execução de teste, permitindo que a suíte de 29 testes rode em milissegundos e passe 100% verde no GitHub Actions.

3. **Como o Front-end lida com permissões (RBAC)?**
   Ao logar, o token JWT e os dados do usuário são salvos no `localStorage` sob a chave `cartalogo_session`. O componente `<ProtectedRoute allowedRoles={['Admin']}>` intercepta o acesso a rotas restritas (como `/admins`). Se um usuário com perfil *Editor* tentar acessar, é redirecionado silenciosamente para o catálogo de veículos (`/vehicles`), e no catálogo os botões de edição e exclusão são renderizados condicionalmente com base na flag `isAdmin`.

4. **Por que Minimal APIs em vez de Controllers?**
   Minimal APIs oferecem inicialização mais rápida, menor consumo de memória (*cold start* reduzido em contêineres) e eliminam o overhead de reflexão dos Controllers tradicionais, sem abrir mão de injeção de dependência e validação padronizada.
