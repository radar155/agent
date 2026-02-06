#!/usr/bin/env python3
"""
Versione semplice per generare la sequenza di Fibonacci
"""

def fibonacci(n):
    """Genera i primi n numeri di Fibonacci"""
    if n <= 0:
        return []
    
    # Inizializza i primi due numeri
    fib = [0, 1]
    
    # Se servono più di 2 numeri, continua la sequenza
    for i in range(2, n):
        # Ogni numero è la somma dei due precedenti
        prossimo = fib[i-1] + fib[i-2]
        fib.append(prossimo)
    
    return fib[:n]  # Ritorna esattamente n numeri

# Test del programma
if __name__ == "__main__":
    print("Generatore di sequenza di Fibonacci")
    print("=" * 40)
    
    # Esempi
    for i in [5, 10, 15]:
        risultato = fibonacci(i)
        print(f"Primi {i} numeri: {risultato}")
    
    print("\nRapporto aureo (phi) - rapporti tra numeri consecutivi:")
    fib_20 = fibonacci(20)
    for i in range(1, len(fib_20)-1):
        if fib_20[i] != 0:
            rapporto = fib_20[i+1] / fib_20[i]
            print(f"F({i+1})/F({i}) = {fib_20[i+1]}/{fib_20[i]} ~ {rapporto:.6f}")