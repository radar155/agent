#!/usr/bin/env python3
"""
Implementazioni avanzate di Fibonacci
Applicazioni nell'ingegneria fotovoltaica
"""

import math
import numpy as np
from typing import List, Tuple

def fibonacci_formula_binet(n):
    """
    Formula di Binet per calcolo diretto di Fibonacci
    Molto veloce ma limitata dalla precisione floating-point
    """
    phi = (1 + math.sqrt(5)) / 2  # Rapporto aureo
    psi = (1 - math.sqrt(5)) / 2  # Rapporto aureo coniugato
    
    return int((phi**n - psi**n) / math.sqrt(5))

def fibonacci_matrice(n):
    """
    Calcolo Fibonacci tramite moltiplicazione di matrici
    Efficiente per n molto grandi usando exponentiazione veloce
    """
    def matrix_multiply(A, B):
        return [[A[0][0]*B[0][0] + A[0][1]*B[1][0], A[0][0]*B[0][1] + A[0][1]*B[1][1]],
                [A[1][0]*B[0][0] + A[1][1]*B[1][0], A[1][0]*B[0][1] + A[1][1]*B[1][1]]]
    
    def matrix_power(matrix, power):
        if power == 1:
            return matrix
        if power % 2 == 0:
            half_power = matrix_power(matrix, power // 2)
            return matrix_multiply(half_power, half_power)
        else:
            return matrix_multiply(matrix, matrix_power(matrix, power - 1))
    
    if n <= 1:
        return n
    
    base_matrix = [[1, 1], [1, 0]]
    result_matrix = matrix_power(base_matrix, n)
    return result_matrix[0][1]

def fibonacci_generatore():
    """
    Generatore infinito di numeri di Fibonacci
    Efficiente per l'uso della memoria
    """
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

def fibonacci_array_numpy(n):
    """
    Calcolo vettorizzato con NumPy per sequenze grandi
    """
    if n <= 0:
        return np.array([])
    elif n == 1:
        return np.array([0])
    elif n == 2:
        return np.array([0, 1])
    
    fib = np.zeros(n, dtype=np.int64)
    fib[0], fib[1] = 0, 1
    
    for i in range(2, n):
        fib[i] = fib[i-1] + fib[i-2]
    
    return fib

def fibonacci_modulo(n, m):
    """
    Calcolo Fibonacci modulo m (utile per hash e crittografia)
    Applicazione: sistemi di sicurezza per impianti fotovoltaici
    """
    if n <= 1:
        return n % m
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b % m, (a + b) % m
    
    return b

def analisi_rapporto_aureo(limite=20):
    """
    Analizza la convergenza al rapporto aureo
    Utile per proporzioni estetiche nell'installazione pannelli
    """
    fib = fibonacci_array_numpy(limite)
    rapporti = []
    
    for i in range(1, len(fib)):
        if fib[i-1] != 0:
            rapporti.append(fib[i] / fib[i-1])
    
    phi_teorico = (1 + math.sqrt(5)) / 2
    
    return rapporti, phi_teorico

def applicazione_layout_pannelli(area_disponibile, modulo_base=1):
    """
    Applicazione pratica: calcolo layout ottimale pannelli fotovoltaici
    usando le proporzioni di Fibonacci per massimizzare efficienza estetica
    """
    # Trova il numero di Fibonacci più vicino all'area disponibile
    gen = fibonacci_generatore()
    fibonacci_numbers = []
    
    for _ in range(50):  # limite per evitare loop infinito
        fib_num = next(gen)
        if fib_num > area_disponibile:
            break
        fibonacci_numbers.append(fib_num)
    
    # Configurazioni possibili
    configurazioni = []
    for i, fib in enumerate(fibonacci_numbers[-10:]):  # ultimi 10
        if fib <= area_disponibile:
            pannelli_x = fib
            pannelli_y = fibonacci_numbers[max(0, len(fibonacci_numbers)-10+i-1)]
            area_utilizzata = pannelli_x * pannelli_y
            efficienza_spazio = area_utilizzata / area_disponibile
            
            configurazioni.append({
                'pannelli_x': pannelli_x,
                'pannelli_y': pannelli_y,
                'area_utilizzata': area_utilizzata,
                'efficienza_spazio': efficienza_spazio,
                'rapporto_aspetto': pannelli_x / pannelli_y if pannelli_y > 0 else 0
            })
    
    return sorted(configurazioni, key=lambda x: x['efficienza_spazio'], reverse=True)

# Test delle implementazioni avanzate
if __name__ == "__main__":
    print("=== FIBONACCI AVANZATO ===")
    print("Applicazioni nell'ingegneria fotovoltaica\n")
    
    # Test diversi metodi
    n = 20
    print(f"Confronto metodi per F({n}):")
    print(f"  Formula di Binet: {fibonacci_formula_binet(n)}")
    print(f"  Metodo matrice: {fibonacci_matrice(n)}")
    
    # Test generatore
    print(f"\nPrimi 10 numeri con generatore:")
    gen = fibonacci_generatore()
    primi_10 = [next(gen) for _ in range(10)]
    print(primi_10)
    
    # Test NumPy
    print(f"\nSequenza con NumPy (primi 15):")
    fib_numpy = fibonacci_array_numpy(15)
    print(fib_numpy.tolist())
    
    # Analisi rapporto aureo
    print(f"\nAnalisi convergenza rapporto aureo:")
    rapporti, phi = analisi_rapporto_aureo(15)
    print(f"Rapporto aureo teorico: {phi:.6f}")
    print(f"Ultimi 3 rapporti calcolati: {[f'{r:.6f}' for r in rapporti[-3:]]}")
    
    # Applicazione pratica layout pannelli
    print(f"\nAPPLICAZIONE PRATICA - Layout pannelli ottimale:")
    area = 100  # metri quadri disponibili
    layout = applicazione_layout_pannelli(area)
    print(f"Per un'area di {area} m²:")
    for i, config in enumerate(layout[:3]):  # top 3
        print(f"  Opzione {i+1}: {config['pannelli_x']}x{config['pannelli_y']} pannelli")
        print(f"    Area utilizzata: {config['area_utilizzata']} m²")
        print(f"    Efficienza spazio: {config['efficienza_spazio']:.2%}")
        print(f"    Rapporto aspetto: {config['rapporto_aspetto']:.3f}")
        print()