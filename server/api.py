from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///taskhub.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    tasks = db.relationship('Task', backref='project', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)

@app.before_first_request
def create_tables():
    db.create_all()

def validate_task_data(data):
    if 'title' not in data or not data['title'].strip():
        raise ValueError("Task 'title' is required and must not be empty.")
    return True

@app.route('/projects/<int:project_id>/tasks', methods=['POST'])
def create_task(project_id):
    try:
        data = request.get_json()
        validate_task_data(data)
        new_task = Task(title=data['title'], description=data.get('description', ''), project_id=project_id)
        db.session.add(new_task)
        db.session.commit()
        return jsonify({'message': 'Task created', 'task': { 'id': new_task.id, 'title': new_task.title }}), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create task due to an internal error.'}), 500

@app.route('/projects/<int:project_id>/tasks/<int:task_id>', methods=['PUT'])
def update_task(project_id, task_id):
    try:
        data = request.get_json()
        task = Task.query.filter_by(id=task_id, project_id=project_id).first()
        if not task:
            return jsonify({'message': 'Task not found'}), 404
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        db.session.commit()
        return jsonify({'message': 'Task updated', 'task': { 'id': task.id, 'title': task.title }})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update task due to an internal error.'}), 500

@app.route('/projects/<int:project_id>/tasks', methods=['GET'])
def get_tasks(project_id):
    try:
        tasks = Task.query.filter_by(project_id=project_id).all()
        tasks_output = [{'id': task.id, 'title': task.title, 'description': task.description} for task in tasks]
        return jsonify({'tasks': tasks_output})
    except Exception as e:
        return jsonify({'error': 'Failed to fetch tasks due to an internal error.'}), 500

@app.route('/projects', methods=['POST'])
def create_project():
    try:
        data = request.get_json()
        if not data.get('name'):
            return jsonify({'error': "Project 'name' is required"}), 400
        new_project = Project(name=data['name'])
        db.session.add(new_project)
        db.session.commit()
        return jsonify({'message': 'Project created', 'project': {'id': new_project.id, 'name': new_project.name}}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create project due to an internal error.'}), 500

if __name__ == '__main__':
    app.run(debug=True)