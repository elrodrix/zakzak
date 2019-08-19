import json
import matplotlib.pyplot as plt
data = json.loads(open("data.json").read())


x = data["x"]
y = data["y"]

plt.plot(x, y)
plt.show()


