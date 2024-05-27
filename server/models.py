from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

load_dotenv()  # take environment variables from .env.

app = Flask(__name__)
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

if __name__ == '__main__':
    db.create_all()