// src/server.ts
import express from 'express';
import type { Request, Response } from 'express';
import { db as prisma } from './prisma/db.ts'; 

const app = express();
app.use(express.json());

interface TelemetryPayload {
  driverId: string;
  latitude: number;
  longitude: number;
}

app.post('/api/v1/telemetry', async (req: Request, res: Response): Promise<void> => {
  const { driverId, latitude, longitude }: TelemetryPayload = req.body;

  if (!driverId || latitude === undefined || longitude === undefined) {
    res.status(400).json({ error: 'Payload inválido.' });
    return;
  }

  try {
    // Sintaxe oficial e direta do Prisma 8 para inserção bruta no PostgreSQL
    await (prisma as any).raw.execute(
      'INSERT INTO "Post" (title, content, published, "authorId", "createdAt", "updatedAt") VALUES (\$1, \$2, \$3, \$4, NOW(), NOW());',
      `Telemetria - Motorista ${driverId}`,
      `Lat: ${latitude} | Long: ${longitude}`,
      true,
      1
    );

    res.status(201).json({ success: true, message: 'Telemetria salva com sucesso!' });
  } catch (error: any) {
    console.error("❌ Erro:", error.message);
    res.status(500).json({ error: 'Erro no banco' });
  }
});

app.listen(3000, () => console.log('🚀 Node.js Ingestion API online na porta 3000'));
