from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# Initialize database
def init_db():
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            text TEXT NOT NULL,
            completed INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

# Get all tasks
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute('SELECT id, text, completed FROM tasks ORDER BY id DESC')
    tasks = cursor.fetchall()
    conn.close()
    
    task_list = []
    for task in tasks:
        task_list.append({
            'id': task[0],
            'text': task[1],
            'completed': bool(task[2])
        })
    return jsonify(task_list)

# Add a new task
@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.json
    text = data.get('text')
    
    if not text:
        return jsonify({'error': 'Task text is required'}), 400
    
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute('INSERT INTO tasks (text) VALUES (?)', (text,))
    conn.commit()
    task_id = cursor.lastrowid
    conn.close()
    
    return jsonify({
        'id': task_id,
        'text': text,
        'completed': False
    }), 201

# Update a task
@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.json
    text = data.get('text')
    completed = data.get('completed')
    
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    
    if text is not None:
        cursor.execute('UPDATE tasks SET text = ? WHERE id = ?', (text, task_id))
    if completed is not None:
        cursor.execute('UPDATE tasks SET completed = ? WHERE id = ?', (1 if completed else 0, task_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Task updated successfully'})

# Delete a task
@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Task deleted successfully'})

# Clear all tasks
@app.route('/api/tasks/all', methods=['DELETE'])
def clear_all_tasks():
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks')
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'All tasks cleared successfully'})

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)