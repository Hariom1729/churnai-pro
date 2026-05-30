import pandas as pd
from database import get_db, get_fs
from bson import ObjectId
import io

fs = get_fs()
# Let's insert a small csv
file_id = fs.put(b"col1,col2\n1,2", filename="test.csv")

grid_out = fs.get(ObjectId(file_id))
try:
    df = pd.read_csv(grid_out)
    print("Columns:", list(df.columns))
except Exception as e:
    print("Error:", e)
