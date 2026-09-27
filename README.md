# 📡 Distributed Telemetry & Logistics System (Omnichannel Ecosystem)

Este repositório contém uma solução de arquitetura distribuída, resiliente e de alta performance voltada para o rastreamento, ingestão de dados geográficos em tempo real e telemetria de frotas logísticas. 

O foco central deste projeto é demonstrar a aplicação prática de padrões de projeto (*Design Patterns*), separação estrita de responsabilidades (*SoC*) e o uso cirúrgico do melhor ecossistema de cada linguagem para resolver problemas de negócio complexos.

---

## 🏗️ Arquitetura do Ecossistema

A solução adota uma abordagem de microsserviços integrados através de uma base de dados relacional compartilhada (PostgreSQL) com isolamento de concorrência.

```text
[React Native App] (Motorista) 
       │ (Streaming de Coordenadas / Offline-First)
       ▼
[Node.js Ingestion API] (Porta 3000)
       │ (Alta concorrência com I/O não-bloqueante via Express & Driver PG)
       ▼
[PostgreSQL Database] (Porta 5433 - Docker Container)
       ▲
       │ (Polling Assíncrono com Lock 'FOR UPDATE SKIP LOCKED')
[Python Worker Engine] (Cálculo Geográfico Pesado / Fórmula de Haversine)
       ▲
       │ (Leitura / Geração de Relatórios Financeiros B2B)
 [PHP 8 + Laravel Dashboard] (Painel de Gestão da Transportadora)
```

---

## 🎯 Por que usar uma linguagem só se você pode tirar o melhor de cada ecossistema?

A senioridade na engenharia de software está em saber escolher as ferramentas corretas para cada tipo de carga de trabalho, em vez de forçar um único ecossistema a resolver problemas para os quais não foi projetado:

* **🛜 Node.js na Ingestão:** Utilizado na API de entrada por causa de seu *Event Loop* eficiente e arquitetura orientada a eventos. Ele consegue receber milhares de requisições de localização por segundo em tempo real sem abrir múltiplas threads pesadas, descarregando os dados no banco imediatamente.
* **🐍 Python no Processamento de Dados:** Atua como um worker assíncrono isolado para executar processamento matemático geo-espacial denso (Fórmula de Haversine e lógicas de *Geofencing*). Isolar essa computação pesada fora da API principal garante que o servidor Node.js nunca sofra de travamentos por bloqueio de CPU.
* **🐘 PHP 8 + Laravel no Core Core:** Responsável pelo gerenciamento do painel administrativo B2B, controle estrito de permissões (ACL), faturamento, auditoria e geração de relatórios consolidados para a diretoria das empresas de transporte.
* **📱 React Native no Front Mobile:** Garante uma única base de código para iOS e Android para o app do motorista, aplicando uma estratégia robusta de *Offline-First* com buffer local para acumular posições quando o celular passar por zonas de sombra ou falta de sinal celular.

---

## ⚡ Abordagem Sênior de Engenharia (Resiliência do Banco)

Para evitar os custos e a complexidade desnecessária de injetar sistemas de mensageria pesados (como Redis ou RabbitMQ) no estágio inicial de desenvolvimento, o sistema adota uma **Arquitetura Enxuta Baseada em Banco de Dados**:

1. A API Node.js faz gravações rápidas de staging no PostgreSQL marcando o registro como pendente (`published = true`).
2. O Worker Python consome esses dados utilizando o padrão sênior **`FOR UPDATE SKIP LOCKED`**. Isso garante que múltiplas instâncias paralelas do Python consigam ler o banco simultaneamente sem gerar condições de corrida (*Race Conditions*) e sem que dois trabalhadores processem a mesma coordenada.

---

## 🛠️ Como Executar o Projeto Localmente

### 1. Pré-requisitos (A infraestrutura no Docker)
Suba a instância limpa e isolada do PostgreSQL rodando:
```bash
docker run --name pg-telemetria -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=root -e POSTGRES_DB=telemetria -p 5433:5432 -d postgres:latest
```

### 2. Executando o Backend (Node.js)
Navegue até a pasta da API, instale as dependências e inicie o servidor:
```bash
cd api-ingestion-node
npm install
npx ts-node --esm src/server.ts
```

### 3. Executando o Processador (Python)
Navegue até a pasta do Worker, instale o driver nativo do Postgres e inicie o monitoramento:
```bash
cd worker-python
pip install psycopg2-binary
python worker.py
```

### 4. Simulando o Teste de Telemetria
Envie um payload de teste via terminal simulando o envio contínuo do aplicativo:
```bash
curl -X POST http://localhost:3000/api/v1/telemetry \
  -H "Content-Type: application/json" \
  -d '{"driverId": "vitor_senior_final", "latitude": -23.5505, "longitude": -46.6333}'
```

---

## 📈 Próximos Passos de Evolução do Repositório
- [ ] Implementar a interface gráfica offline-first no diretório `mobile-driver-react`.
- [ ] Construir as views de faturamento e o controller de relatórios gerenciais no `dashboard-core-php`.
- [ ] Adicionar testes de carga para avaliar o throughput de ingestão do Node.js.
