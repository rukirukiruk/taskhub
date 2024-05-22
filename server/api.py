from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import load_only
import os
from contextlib import contextmanager

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

@contextmanager
def managed_session():
    """Context manager for database session management"""
    try:
        yield db.session
    except:
        db.session.rollback()
        raise
    finally:
        db.session.close()

@app.route('/projects/<int:project_id>/tasks', methods=['POST'])
def create_task(project_id):
    data = request.get_json()
    new_task = Task(title=data['title'], description=data.get('description'), project_id=project_id)
    with managed_session() as session:
        session.add(new_task)
        session.commit()
    return jsonify({'message': 'Task created', 'task': { 'id': new_task.id, 'title': new_task.title }}), 201

@app.route('/projects/<int:project_id>/tasks/<int:task_id>', methods=['PUT'])
def update_task(project_id, task_id):
    data = request.get_json()
    with managed_session() as session:
        task = session.query(Task).filter_by(id=task_id, project_id=project_id).first()
        if not task:
            return jsonify({'message': 'Task not found'}), 404
        task.title = data.get('title', task.title)
        task.description = data.get('description', task.description)
        session.commit()
    return jsonify({'message': 'Task updated', 'task': { 'id': task.id, 'title': task.title }})

@app.route('/projects/<int:project_id>/tasks', methods=['GET'])
def get_tasks(project_id):
    tasks = Task.query.filter_by(project_id=project_id).all()
    tasks_output = [{'id': task.id, 'title': task.title, 'description': task.description} for task in tasks]
    return jsonify({'tasks': tasks_output})

@app.route('/projects', methods=['POST'])
def create_project():
    data = request.get_json()
    new_project = Project(name=data['name'])
    with managed_session() as session:
        session.add(new_project)
        session.commit()
    return jsonify({'message': 'Project created', 'project': {'id': new_project.id, 'name': new_project.name}}), 201

if __name__ == '__main__':
    app.run(debug=True)