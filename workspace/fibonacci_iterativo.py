#!/usr/bin/env python3
"""
Calcolo della sequenza di Fibonacci - Metodo Iterativo
Utile per calcoli di ottimizzazione nell'installazione di pannelli solari
"""

def fibonacci_iterativo(n):
    """
    Calcola l'n-esimo numero di Fibonacci usando il metodo iterativo
    
    Args:
        n (int): posizione nella sequenza (0, 1, 2, 3, ...)
    
    Returns:
        int: n-esimo numero di Fibonacci
    """
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    
    return b

def fibonacci_sequenza(limite):
    """
    Genera una sequenza di Fibonacci fino al limite specificato
    
    Args:
        limite (int): numero di elementi della sequenza da generare
    
    Returns:
        list: lista dei primi 'limite' numeri di Fibonacci
    """
    if limite <= 0:
        return []
    elif limite == 1:
        return [0]
    
    sequenza = [0, 1]
    for i in range(2, limite):
        sequenza.append(sequenza[i-1] + sequenza[i-2])
    
    return sequenza

def fibonacci_fino_a_valore(max_valore):
    """
    Genera numeri di Fibonacci fino a un valore massimo
    Utile per calcolare disposizioni ottimali di pannelli
    """
    sequenza = []
    a, b = 0, 1
    
    while a <= max_valore:
        sequenza.append(a)
        a, b = b, a + b
    
    return sequenza

# Test del codice
if __name__ == "__main__":
    print("=== CALCOLO FIBONACCI ===")
    print("Applicazione: Ottimizzazione layout pannelli fotovoltaici\n")
    
    # Test numero singolo
    n = 10
    result = fibonacci_iterativo(n)
    print(f"F({n}) = {result}")
    
    # Test sequenza
    print(f"\nPrimi 15 numeri di Fibonacci:")
    sequenza = fibonacci_sequenza(15)
    print(sequenza)
    
    # Test fino a valore massimo (utile per dimensionamento impianti)
    max_pannelli = 100
    fib_layout = fibonacci_fino_a_valore(max_pannelli)
    print(f"\nNumeri di Fibonacci fino a {max_pannelli} (layout ottimali):")
    print(fib_layout)
    
    # Rapporto aureo (utile per proporzioni estetiche pannelli)
    if len(sequenza) > 1:
        rapporti = []
        for i in range(1, len(sequenza)):
            if sequenza[i-1] != 0:
                rapporti.append(sequenza[i] / sequenza[i-1])
        
        print(f"\nRapporti consecutivi (convergenza al rapporto aureo 1.618...):")
        for i, rapporto in enumerate(rapporti[-5:]):  # ultimi 5
            print(f"F({len(sequenza)-5+i+1})/F({len(sequenza)-5+i}) = {rapporto:.6f}")