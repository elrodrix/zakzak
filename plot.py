import json
import matplotlib.pyplot as plt
data = json.loads(open("data.json").read())


x = data["x"]
y = data["y"]

fig, ax = plt.subplots()
ax.plot(x,y)
# ax.ticklabel_format(useOffset=False, style='plain')
plt.show()


