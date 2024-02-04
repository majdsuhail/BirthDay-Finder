
from flask import Flask, request
import mysql.connector
import json
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
import os
from flask_cors import CORS

# Initializing flask app
app = Flask(__name__)
CORS(app)

def addAge(data):

      for entry in data:
        birthdate = entry["birthdate"]
        birthdate_obj = datetime.strptime(str(birthdate), "%Y-%m-%d").date()
        current_date = date.today()
        age = relativedelta(current_date, birthdate_obj).years
        entry["age"] = age

      return [
        {
            "id":entry["id"],
            "name": entry["Name"],
            "age": entry["age"],
            "birthdate": entry["birthdate"],
            "contact": entry["contact"],
        }
        for entry in data
    ]

@app.route('/search', methods=['POST'])
def search():

    data= datetime.strptime(request.form['birthdate'], "%d-%m-%Y")

    if len(str(data))==0 or str(data).isspace():
         return "Internal Server Error", 500

    conn = mysql.connector.connect(
    host=os.environ['HOST_KEY'],
    user=os.environ['USER_KEY'],
    password=os.environ['PASSWORD_KEY'],
    database=os.environ['DATABASE_KEY']
)
    cursor = conn.cursor()

    sql="SELECT * FROM data WHERE birthdate = %s"
    cursor.execute(sql,[data])
    results = cursor.fetchall()

    columns = [desc[0] for desc in cursor.description]
    data = [dict(zip(columns, row)) for row in results]

    conn.close()
    formatted_data=addAge(data)
    print(json.dumps(formatted_data, indent=2, default=str))
    return json.dumps(formatted_data, indent=2, default=str)

@app.route('/insert', methods=['POST'])
def insert():

    data= (request.form['name'],datetime.strptime(request.form['birthdate'], "%d-%m-%Y"),request.form['contact'])

    if any(len(str(i))==0 for i in data) or any(str(i).isspace() for i in data):
         return "Internal Server Error", 500

    conn = mysql.connector.connect(
    host=os.environ['HOST_KEY'],
    user=os.environ['USER_KEY'],
    password=os.environ['PASSWORD_KEY'],
    database=os.environ['DATABASE_KEY']
)
    cursor = conn.cursor()

    sql= "INSERT INTO data (name, birthdate, contact) VALUES (%s,%s,%s);"
    cursor.execute(sql,data)
    conn.commit()

    conn.close()
    return "success"

# Route for seeing a data
@app.route('/index')
def index():

    conn = mysql.connector.connect(
    host=os.environ['HOST_KEY'],
    user=os.environ['USER_KEY'],
    password=os.environ['PASSWORD_KEY'],
    database=os.environ['DATABASE_KEY']
)
    cursor = conn.cursor()

    table_creation_query = """
    CREATE TABLE IF NOT EXISTS data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        Name TEXT,
        birthdate DATE NOT NULL,
        contact TEXT NOT NULL
    )
"""
    cursor.execute(table_creation_query)
    conn.commit()

    cursor.execute("SELECT * FROM data ORDER BY id DESC")
    result = cursor.fetchall()
    
    columns = [desc[0] for desc in cursor.description]
    data = [dict(zip(columns, row)) for row in result]

    formatted_data=addAge(data)

    conn.close()

    return json.dumps(formatted_data, indent=2, default=str)

