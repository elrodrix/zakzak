import json
import matplotlib.pyplot as plt
data = json.loads(open("data.json").read())

length = len(data)

for i in range(length):
    x = data[i]["x"]
    y = data[i]["y"]
    color = data[i]["color"]
    plt.plot(x,y, color=color)

plt.show()


