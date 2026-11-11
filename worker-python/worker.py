# worker.py
import psycopg2
from psycopg2.extras import RealDictCursor
import time
from math import radians, cos, sin, asin, sqrt


def haversine_distance(lon1, lat1, lon2, lat2):
    """Calcula a distância em km entre dois pontos geográficos (Fórmula de Haversine)"""
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    return 6371 * 2 * asin(sqrt(a))


def process_pending_telemetry():
    try:
        db = psycopg2.connect(
            host="localhost",
            port="5433",
            user="postgres",
            password="root",
            database="telemetria",
            cursor_factory=RealDictCursor,
        )
        db.autocommit = False
        cursor = db.cursor()
    except Exception as e:
        print(f"❌ Error connecting to PostgreSQL: {e}")
        return

    print("🐍 Python PostgreSQL Worker started... Monitoring table 'Post'.")

    while True:
        try:
            db.rollback()

            # Adjusted to "published" in lowercase and in quotes for PostgreSQL.
            cursor.execute("""
                SELECT id, title, content 
                FROM "Post" 
                WHERE "published" = true 
                LIMIT 10 
                FOR UPDATE SKIP LOCKED;
            """)
            rows = cursor.fetchall()

            if not rows:
                time.sleep(2)
                continue

            for row in rows:
                driver_id = row["title"].replace("Telemetry - Driver", "").strip()
                lat, lon = parse_telemetry_content(row["content"])

                if lat is None or lon is None:
                    continue

                distance = haversine_distance(-46.63, -23.55, lon, lat)

                # The UPDATE has also been adjusted to use "published" in lowercase.
                cursor.execute(
                    'UPDATE "Post" SET "published" = false WHERE id = %s;', (row["id"],)
                )
                db.commit()

                print(
                    f"✅ Record {row['id']} processed. Driver: {driver_id}. Distance from Hub: {distance:.2f} km"
                )

                if distance > 50.0:
                    print(
                        f"⚠️ WARNING: Driver {driver_id} has deviated {distance:.2f}km from the route!"
                    )

        except Exception as e:
            print(f"⚠️ An error occurred in the Worker loop.: {e}")
            db.rollback()
            time.sleep(5)


if __name__ == "__main__":
    process_pending_telemetry()
