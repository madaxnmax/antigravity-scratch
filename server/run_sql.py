import psycopg2
import sys
import json
import datetime

# Connection string provided by user (updated with reset password)
DB_URL = "postgresql://postgres:VVGefPLMT6NpIJmT@db.lbderouteefxjkzufqkj.supabase.co:5432/postgres?sslmode=require"

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime.datetime, datetime.date)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

def run_query(query):
    conn = None
    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()
        
        # Check if it's a SELECT query to return data
        if query.strip().upper().startswith("SELECT") or "RETURNING" in query.upper():
            cur.execute(query)
            columns = [desc[0] for desc in cur.description]
            results = []
            for row in cur.fetchall():
                results.append(dict(zip(columns, row)))
            print(json.dumps(results, default=json_serial, indent=2))
        else:
            cur.execute(query)
            conn.commit()
            print(json.dumps({"status": "success", "message": "Query executed successfully"}, indent=2))
            
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(json.dumps({"status": "error", "message": str(error)}, indent=2))
    finally:
        if conn is not None:
            conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "error", "message": "No query provided"}))
    else:
        run_query(sys.argv[1])
