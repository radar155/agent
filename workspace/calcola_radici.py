import math

# Calcola la radice quadrata dei numeri da 1300 a 1350
numeri = list(range(1300, 1351))
radici_quadrate = [math.sqrt(n) for n in numeri]

# Stampa i risultati
print("Numero -> Radice Quadrata")
print("-" * 25)
for i, n in enumerate(numeri):
    print(f"{n} -> {radici_quadrate[i]:.4f}")

print(f"\nCalcolate {len(numeri)} radici quadrate da {min(numeri)} a {max(numeri)}")