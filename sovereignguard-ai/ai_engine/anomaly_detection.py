from sklearn.ensemble import IsolationForest
import numpy as np

data = np.array([
    [100,2],
    [120,3],
    [150,4],
    [5000,50] 
])

model = IsolationForest(contamination=0.1)
model.fit(data)

prediction = model.predict(data)

print(prediction)