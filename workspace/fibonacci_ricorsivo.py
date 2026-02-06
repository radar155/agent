#!/usr/bin/env python3
"""
Calcolo della sequenza di Fibonacci - Metodo Ricorsivo
Con ottimizzazione tramite memoization
"""

def fibonacci_ricorsivo_semplice(n):
    """
    Implementazione ricorsiva base (inefficiente per n grandi)
    """
    if n <= 1:
        return n
    return fibonacci_ricorsivo_semplice(n-1) + fibonacci_ricorsivo_semplice(n-2)

def fibonacci_memoized(n, memo={}):
    """
    Fibonacci ricorsivo ottimizzato con memoization
    Molto più efficiente per calcoli complessi
    """
    if n in memo:
        return memo[n]
    
    if n <= 1:
        return n
    
    memo[n] = fibonacci_memoized(n-1, memo) + fibonacci_memoized(n-2, memo)
    return memo[n]

# Decorator per memoization automatica
def memoize(func):
    cache = {}
    def wrapper(n):
        if n not in cache:
            cache[n] = func(n)
        return cache[n]
    return wrapper

@memoize
def fibonacci_decorator(n):
    """
    Fibonacci con decorator per memoization
    """
    if n <= 1:
        return n
    return fibonacci_decorator(n-1) + fibonacci_decorator(n-2)

# Test e confronto prestazioni
if __name__ == "__main__":
    import time
    
    print("=== FIBONACCI RICORSIVO ===")
    print("Confronto prestazioni diverse implementazioni\n")
    
    # Test con numero piccolo
    n_piccolo = 10
    print(f"Calcolo F({n_piccolo}):")
    
    start = time.time()
    result1 = fibonacci_ricorsivo_semplice(n_piccolo)
    time1 = time.time() - start
    print(f"  Ricorsivo semplice: {result1} (tempo: {time1:.6f}s)")
    
    start = time.time()
    result2 = fibonacci_memoized(n_piccolo)
    time2 = time.time() - start
    print(f"  Memoized: {result2} (tempo: {time2:.6f}s)")
    
    start = time.time()
    result3 = fibonacci_decorator(n_piccolo)
    time3 = time.time() - start
    print(f"  Decorator: {result3} (tempo: {time3:.6f}s)")
    
    # Test con numero più grande (solo metodi ottimizzati)
    n_grande = 35
    print(f"\nCalcolo F({n_grande}) - solo metodi ottimizzati:")
    
    start = time.time()
    result_memo = fibonacci_memoized(n_grande, {})  # Reset memo
    time_memo = time.time() - start
    print(f"  Memoized: {result_memo} (tempo: {time_memo:.6f}s)")
    
    # Reset decorator creando una nuova istanza
    @memoize
    def fibonacci_decorator_reset(n):
        if n <= 1:
            return n
        return fibonacci_decorator_reset(n-1) + fibonacci_decorator_reset(n-2)
    
    start = time.time()
    result_dec = fibonacci_decorator_reset(n_grande)
    time_dec = time.time() - start
    print(f"  Decorator: {result_dec} (tempo: {time_dec:.6f}s)")
    
    print(f"\nNOTA: Il metodo ricorsivo semplice per F({n_grande}) richiederebbe troppo tempo!")
    print("Questo dimostra l'importanza dell'ottimizzazione nei calcoli per impianti fotovoltaici.")