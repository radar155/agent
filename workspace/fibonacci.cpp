#include <iostream>
#include <vector>
#include <chrono>
#include <unordered_map>

/**
 * Implementazioni della sequenza di Fibonacci in C++
 */

// Implementazione iterativa
long long fibonacci_iterativo(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    
    long long a = 0, b = 1;
    for (int i = 2; i <= n; i++) {
        long long temp = b;
        b = a + b;
        a = temp;
    }
    return b;
}

// Implementazione ricorsiva semplice
long long fibonacci_ricorsivo(int n) {
    if (n <= 0) return 0;
    if (n == 1) return 1;
    return fibonacci_ricorsivo(n - 1) + fibonacci_ricorsivo(n - 2);
}

// Implementazione con memoization
std::unordered_map<int, long long> memo;

long long fibonacci_memoized(int n) {
    if (memo.find(n) != memo.end()) {
        return memo[n];
    }
    
    if (n <= 0) {
        memo[n] = 0;
    } else if (n == 1) {
        memo[n] = 1;
    } else {
        memo[n] = fibonacci_memoized(n - 1) + fibonacci_memoized(n - 2);
    }
    
    return memo[n];
}

// Genera una sequenza di fibonacci
std::vector<long long> fibonacci_sequenza(int n) {
    std::vector<long long> sequenza;
    
    if (n <= 0) return sequenza;
    
    sequenza.push_back(0);
    if (n == 1) return sequenza;
    
    sequenza.push_back(1);
    if (n == 2) return sequenza;
    
    for (int i = 2; i < n; i++) {
        sequenza.push_back(sequenza[i-1] + sequenza[i-2]);
    }
    
    return sequenza;
}

int main() {
    std::cout << "=== NUMERI DI FIBONACCI (C++) ===" << std::endl << std::endl;
    
    int n = 10;
    std::cout << "I primi " << n << " numeri di Fibonacci:" << std::endl;
    std::vector<long long> sequenza = fibonacci_sequenza(n);
    for (size_t i = 0; i < sequenza.size(); i++) {
        std::cout << sequenza[i];
        if (i < sequenza.size() - 1) std::cout << ", ";
    }
    std::cout << std::endl << std::endl;
    
    // Test delle implementazioni
    int test_n = 40;
    std::cout << "Il " << test_n << "-esimo numero di Fibonacci:" << std::endl;
    
    // Test iterativo
    auto start = std::chrono::high_resolution_clock::now();
    long long result_iter = fibonacci_iterativo(test_n);
    auto end = std::chrono::high_resolution_clock::now();
    auto duration_iter = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    std::cout << "Iterativo: " << result_iter << " (tempo: " << duration_iter.count() << " μs)" << std::endl;
    
    // Test memoized
    memo.clear(); // Reset memoization
    start = std::chrono::high_resolution_clock::now();
    long long result_memo = fibonacci_memoized(test_n);
    end = std::chrono::high_resolution_clock::now();
    auto duration_memo = std::chrono::duration_cast<std::chrono::microseconds>(end - start);
    std::cout << "Memoized: " << result_memo << " (tempo: " << duration_memo.count() << " μs)" << std::endl;
    
    // Test ricorsivo per n più piccolo (troppo lento per n=40)
    int test_n_small = 35;
    start = std::chrono::high_resolution_clock::now();
    long long result_rec = fibonacci_ricorsivo(test_n_small);
    end = std::chrono::high_resolution_clock::now();
    auto duration_rec = std::chrono::duration_cast<std::chrono::milliseconds>(end - start);
    std::cout << "Ricorsivo (n=" << test_n_small << "): " << result_rec << " (tempo: " << duration_rec.count() << " ms)" << std::endl;
    
    return 0;
}