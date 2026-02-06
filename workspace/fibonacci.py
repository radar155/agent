def fibonacci_sequence(n):
    """
    Genera i primi n numeri della sequenza di Fibonacci
    """
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    elif n == 2:
        return [0, 1]
    
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    
    return fib

def fibonacci_nth(n):
    """
    Calcola l'n-esimo numero di Fibonacci (più efficiente per singoli valori)
    """
    if n <= 0:
        return 0
    elif n == 1:
        return 1
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    
    return b

# Esempi di utilizzo
if __name__ == "__main__":
    print("=== Sequenza di Fibonacci ===")
    
    # Stampa i primi 15 numeri di Fibonacci
    n = 15
    sequence = fibonacci_sequence(n)
    print(f"I primi {n} numeri di Fibonacci:")
    print(sequence)
    print()
    
    # Stampa in formato più leggibile
    print("Sequenza formattata:")
    for i, num in enumerate(sequence):
        print(f"F({i}) = {num}")
    print()
    
    # Calcola un singolo numero di Fibonacci
    nth = 20
    result = fibonacci_nth(nth)
    print(f"Il {nth}° numero di Fibonacci è: {result}")