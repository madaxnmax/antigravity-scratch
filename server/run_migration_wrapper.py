import run_sql
import sys
import os

# Ensure we are in the right directory or use absolute path
sql_path = os.path.join(os.path.dirname(__file__), 'migration_refactor_drafts_synonyms.sql')

with open(sql_path, 'r') as f:
    sql = f.read()
    print(f"Executing SQL from {sql_path}...")
    run_sql.run_query(sql)
