import os
from pymongo import MongoClient
import certifi
import gridfs

MONGO_URI = os.environ.get(
    "MONGO_URI", 
    "mongodb+srv://onlywebsite2592_db_user:Ai6YKCsDs5zFp7gh@cluster0.0qvgtkh.mongodb.net/?appName=Cluster0"
)

# Use certifi for TLS verification to avoid SSL errors with MongoDB Atlas
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = client.churnai_db
fs = gridfs.GridFS(db)

def get_db():
    return db

def get_fs():
    return fs
