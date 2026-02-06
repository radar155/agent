#!/usr/bin/env python3
"""
Test per verificare la correttezza delle funzioni Fibonacci
"""

def fibonacci_iterativo(n):
    """Calcolo efficiente di Fibonacci"""
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

def test_fibonacci():
    """Test dei primi numeri di Fibonacci"""
    # Valori noti della sequenza di Fibonacci
    valori_attesi = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377]
    
    print("=== TEST FIBONACCI ===")
    print("Verifica dei primi 15 numeri della sequenza")
    print(f"{'N':>3} {'Atteso':>8} {'Calcolato':>10} {'OK':>5}")
    print("-" * 30)
    
    tutti_corretti = True
    
    for i, atteso in enumerate(valori_attesi):
        calcolato = fibonacci_iterativo(i)
        corretto = calcolato == atteso
        if not corretto:
            tutti_corretti = False
        
        status = "OK" if corretto else "NO"
        print(f"{i:3d} {atteso:8d} {calcolato:10d} {status:>5}")
    
    print("-" * 30)
    if tutti_corretti:
        print("*** TUTTI I TEST SUPERATI! ***")
    else:
        print("*** Alcuni test falliti! ***")
    
    return tutti_corretti

def test_performance():
    """Test delle performance per numeri grandi"""
    print("\n=== TEST PERFORMANCE ===")
    import time
    
    numeri_test = [100, 500, 1000]
    
    for n in numeri_test:
        start = time.time()
        risultato = fibonacci_iterativo(n)
        end = time.time()
        tempo = (end - start) * 1000  # millisecondi
        
        print(f"Fibonacci({n}) = {risultato}")
        print(f"Tempo di calcolo: {tempo:.2f} ms")
        print()

if __name__ == "__main__":
    # Esegui i test
    test_fibonacci()
    test_performance()
    
    print("=== ESEMPI PRATICI ===")
    print("Applicazioni nel fotovoltaico:")
    print(f"- Rapporto aureo (F(13)/F(12)): {fibonacci_iterativo(13)/fibonacci_iterativo(12):.6f}")
    print(f"- Per pannello 100x161.8 cm: area = {100 * 161.8:.0f} cm²")
    print(f"- Potenza stimata: {(100 * 161.8 / 10000) * 200:.1f} W")