from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api, Resource, reqparse, fields, marshal_with
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()  # take environment variables from .env.

app = Flask(__name__)
api = Api(app)
# Assuming .env file has DATABASE_URL
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Project(db.Model):
    __tablename__ = 'projects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(120), nullable=True)
    tasks = db.relationship('Task', backref='project', lazy=True)

    def __repr__(self):
        return f'<Project {self.name}>'

class Task(db.Model):
    __tablename__ = 'tasks'
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(120), nullable=False)
    priority = db.Column(db.Integer, default=1)
    deadline = db.Column(db.Date, nullable=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)

    def __repr__(self):
        return f'<Task {self.description}>'

# Flask-RESTful Resources
project_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'description': fields.String,
    'tasks': fields.List(fields.Nested({
        'id': fields.Integer,
        'description': fields.String,
        'priority': fields.Integer,
        'deadline': fields.String,
        'project_id': fields.Integer,
    }))
}

task_fields = {
    'id': fields.Integer,
    'description': fields.String,
    'priority': fields.Integer,
    'deadline': fields.String,
    'project_id': fields.Integer,
}

class ProjectListResource(Resource):
    @marshal_with(project_fields)
    def get(self):
        projects = Project.query.all()
        return projects

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('name', required=True, help="Name cannot be blank!")
        parser.add_argument('description')
        args = parser.parse_args()
        
        project = Project(name=args['name'], description=args.get('description'))
        db.session.add(project)
        db.session.commit()
        return {'message': 'Project created', 'project': args}, 201

class ProjectResource(Resource):
    @marshal_with(project_fields)
    def get(self, id):
        project = Project.query.filter_by(id=id).first()
        if not project:
            return {'message': 'Project not found'}, 404
        db.session.refresh(project)  # Refresh the object to ensure tasks are loaded for serialization.
        return project

    def delete(self, id):
        project = Project.query.filter_by(id=id).first()
        if not project:
            return {'message': 'Project not found'}, 404
        db.session.delete(project)
        db.session.commit()
        return {'message': 'Project deleted'}, 200

class TaskListResource(Resource):
    @marshal_with(task_fields)
    def get(self, project_id):
        tasks = Task.query.filter_by(project_id=project_id).all()
        return tasks

    def post(self, project_id):
        parser = reqparse.RequestParser()
        parser.add_argument('description', required=True, help="Description cannot be blank!")
        parser.add_argument('priority', type=int)
        parser.add_argument('deadline', type=lambda x: datetime.strptime(x, '%Y-%m-%d') if x else None)
        args = parser.parse_args()
        
        task = Task(description=args['description'], priority=args.get('priority'), deadline=args.get('deadline'), project_id=project_id)
        db.session.add(task)
        db.session.commit()
        return {'message': 'Task created', 'task': args}, 201

# Adding routes
api.add_resource(ProjectListResource, '/projects')
api.add_resource(ProjectResource, '/projects/<int:id>')
api.add_resource(TaskListResource, '/projects/<int:project_id>/tasks')

if __name__ == '__main__':
    db.create_all()
    app.run(debug=True)