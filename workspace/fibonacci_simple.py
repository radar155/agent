#!/usr/bin/env python3
"""
Versione semplice per calcolare la sequenza di Fibonacci
"""

def fibonacci(n):
    """Calcola il numero di Fibonacci alla posizione n"""
    if n <= 1:
        return n
    
    a, b = 0, 1
    for i in range(2, n + 1):
        a, b = b, a + b
    
    return b

def stampa_fibonacci(count):
    """Stampa i primi 'count' numeri di Fibonacci"""
    print(f"Primi {count} numeri di Fibonacci:")
    for i in range(count):
        print(f"F({i}) = {fibonacci(i)}")

# Esempio di utilizzo
if __name__ == "__main__":
    # Stampa i primi 15 numeri
    stampa_fibonacci(15)
    
    # Calcola un numero specifico
    n = 25
    print(f"\nIl {n}° numero di Fibonacci è: {fibonacci(n)}")