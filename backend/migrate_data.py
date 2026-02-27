import sqlite3
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# --- CONFIGURAÇÃO ---
# COLE AQUI a sua EXTERNAL DATABASE URL do Render
# Ela começa com postgres://...
POSTGRES_URL = "postgresql://raiz_solar_db_user:TqaPU57L3OnRDDJvNZSb981gJylgJd5j@dpg-d6g9of95pdvs73c7qlcg-a.oregon-postgres.render.com/raiz_solar_db"

# Ajuste automático caso comece com postgres://
if POSTGRES_URL.startswith("postgres://"):
    POSTGRES_URL = POSTGRES_URL.replace("postgres://", "postgresql://", 1)

# Caminho do banco de dados local
SQLITE_DB_PATH = "sql_app.db"

def migrate():
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"Erro: Arquivo {SQLITE_DB_PATH} não encontrado!")
        return

    if "SUA_EXTERNAL" in POSTGRES_URL:
        print("Erro: Você precisa colar a sua URL do Render no script!")
        return

    print("--- Iniciando Migração de Dados ---")
    
    # Conectar ao SQLite (Local)
    sqlite_conn = sqlite_connection = sqlite3.connect(SQLITE_DB_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()

    # Conectar ao PostgreSQL (Render)
    pg_engine = create_engine(POSTGRES_URL)
    PgSession = sessionmaker(bind=pg_engine)
    pg_session = PgSession()

    try:
        # Ordem de tabelas para manter integridade (Chaves Estrangeiras)
        tables = [
            "operators",
            "generation_plants",
            "clients",
            "plant_distributions",
            "production",
            "invoices",
            "credit_adjustments"
        ]

        for table in tables:
            print(f"Migrando tabela: {table}...")
            
            # Pega dados do SQLite
            sqlite_cursor.execute(f"SELECT * FROM {table}")
            rows = sqlite_cursor.fetchall()
            
            if not rows:
                print(f"  Tabela {table} está vazia ou não existe no local. Pulando...")
                continue

            # Limpa tabela no Postgres (opcional, use com cuidado)
            # pg_session.execute(text(f"DELETE FROM {table}"))
            
            # Insere dados no Postgres
            for row in rows:
                cols = row.keys()
                data = dict(row)
                
                # Conversão de tipos: SQLite usa 1/0 para Booleans, Postgres exige True/False
                for key in data:
                    if key == 'is_active' or key == 'status_cobrado' or key == 'status_pago' or key == 'status_recebido':
                        data[key] = bool(data[key])
                
                # Cria o comando de inserção dinâmico
                placeholders = ", ".join([f":{col}" for col in cols])
                col_names = ", ".join(cols)
                stmt = text(f"INSERT INTO {table} ({col_names}) VALUES ({placeholders}) ON CONFLICT DO NOTHING")
                
                # Executa com os dados da linha
                pg_session.execute(stmt, data)
            
            print(f"  {len(rows)} registros processados na tabela {table}.")

        pg_session.commit()
        print("\n--- MIGRACAO CONCLUIDA COM SUCESSO! ---")
        print("Agora atualize o site no navegador.")

    except Exception as e:
        pg_session.rollback()
        print(f"\nERRO DURANTE A MIGRACAO: {e}")
    finally:
        sqlite_conn.close()
        pg_session.close()

if __name__ == "__main__":
    migrate()
