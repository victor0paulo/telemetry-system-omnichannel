# 📡 Distributed Telemetry & Logistics System (Omnichannel Ecosystem)

This repository contains a distributed, resilient, and high-performance architecture solution aimed at tracking, ingesting real-time geographic data, and telemetry of logistics fleets.

The central focus of this project is to demonstrate the practical application of design patterns, strict separation of responsibilities (SoC), and the strategic use of each language's best ecosystem to solve complex business problems.

---

##  Arquitetura do Ecossistema

The solution adopts an integrated microservices approach through a shared relational database (PostgreSQL) with concurrency isolation.

```text
[React Native App] (Driver)

│ (Coordinate Streaming / Offline-First)

▼
[Node.js Ingestion API] (Port 3000)

│ (High Concurrency with Non-Blocking I/O via Express & PG Driver)

▼
[PostgreSQL Database] (Port 5433 - Docker Container)

▲

│ (Asynchronous Polling with 'FOR UPDATE SKIP LOCKED' Lock)
[Python Worker Engine] (Heavy Geographic Calculation / Haversine Formula)

▲

│ (Reading / Generating B2B Financial Reports)

[PHP 8 + Laravel Dashboard] (Transportation Company Management Panel)

```

---

## 🎯 Why use only one language when you can get the best from each? Ecosystem?

Seniority in software engineering lies in knowing how to choose the right tools for each type of workload, rather than forcing a single ecosystem to solve problems it wasn't designed for:

* **🛜 Node.js in Ingestion:** Used in the input API because of its efficient *Event Loop* and event-driven architecture. It can handle thousands of location requests per second in real time without opening multiple heavy threads, offloading the data to the database immediately.

* **🐍 Python in Data Processing:** Acts as an isolated asynchronous worker to perform dense geospatial mathematical processing (Haversine formula and *Geofencing* logic). Isolating this heavy computation outside the main API ensures that the Node.js server never suffers from CPU lock-up crashes.

* **🐘 PHP 8 + Laravel Core:** Responsible for managing the B2B administrative panel, strict control of permissions (ACL), invoicing, auditing, and generating consolidated reports for the management of transportation companies.

* **📱 React Native Mobile Front-End:** Ensures a single codebase for iOS and Android for the driver app, applying a robust *Offline-First* strategy with local buffering to accumulate positions when the phone passes through dead zones or lacks cellular signal.
---

## Senior Engineering Approach (Bank Resilience)

To avoid the unnecessary costs and complexity of injecting heavy messaging systems (such as Redis or RabbitMQ) in the early stages of development, the system adopts a **Lean Database-Based Architecture**:

1. The Node.js API performs fast staging writes to PostgreSQL, marking the record as pending (`published = true`).

2. The Python worker consumes this data using the senior pattern **`FOR UPDATE SKIP LOCKED`**. This ensures that multiple parallel instances of Python can read the database simultaneously without generating race conditions and without two workers processing the same coordinate.

---

##  How to Run the Project Locally

1. Prerequisites (Infrastructure in Docker)
Start a clean and isolated PostgreSQL instance by running:
```bash
docker run --name pg-telemetria -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=root -e POSTGRES_DB=telemetria-teste -p 5433:5432 -d postgres:latest
```

### 2. Running the Backend (Node.js)
Navigate to the API folder, install the dependencies, and start the server:
```bash
cd api-ingestion-node
npm install
npx ts-node --esm src/server.ts
```

### 3. Running the Processor (Python)
Navigate to the Worker folder, install the native Postgres driver, and start monitoring:
```bash
cd worker-python
pip install psycopg2-binary
python worker.py
```

### 4. Simulating the Telemetry Test
Send a test payload via the terminal simulating continuous application transmission:
```bash
curl -X POST http://localhost:3000/api/v1/telemetry \
-H "Content-Type: application/json" \
-d '{"driverId": "vitor_senior_final", "latitude": -23.5505, "longitude": -46.6333}'
```

---

## 📈 Next Steps for Repository Evolution
- [ ] Implement the offline-first graphical interface in the `mobile-driver-react` directory.

- [ ] Build the billing views and the management reports controller in `dashboard-core-php`.

- [ ] Add load tests to evaluate the Node.js ingestion throughput.
