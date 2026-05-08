import matplotlib.pyplot as plt
import numpy as np

labels = ['Sprint 6', 'Sprint 7', 'Sprint 8']
planeado = [32, 40, 59]
real = [32, 40, 7]

x = np.arange(len(labels))
width = 0.35

fig, ax = plt.subplots(figsize=(8, 6))

rects1 = ax.bar(x - width/2, planeado, width, label='Planeado', color='#3498db', edgecolor='gray')
rects2 = ax.bar(x + width/2, real, width, label='Real', color='#2ecc71', edgecolor='gray')

ax.set_ylabel('Puntos de historia', fontsize=12)
ax.set_title('Velocity Time Chart - Proyecto SCRUM', fontsize=14, fontweight='bold')
ax.set_xticks(x)
ax.set_xticklabels(labels)
ax.legend()

def autolabel(rects):
    for rect in rects:
        height = rect.get_height()
        if height > 0:
            ax.annotate('{}'.format(height),
                        xy=(rect.get_x() + rect.get_width() / 2, height),
                        xytext=(0, 3),
                        textcoords="offset points",
                        ha='center', va='bottom', fontweight='bold')

autolabel(rects1)
autolabel(rects2)

ax.yaxis.grid(True, linestyle='--', alpha=0.6)
ax.set_axisbelow(True)

plt.tight_layout()
plt.savefig('velocity_chart.png', dpi=150)
plt.show()
