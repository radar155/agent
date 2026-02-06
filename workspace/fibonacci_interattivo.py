#!/usr/bin/env python3
"""
Calcolatore Fibonacci Interattivo
Specificamente progettato per applicazioni fotovoltaiche
"""

def fibonacci_iterativo(n):
    """Calcolo efficiente di Fibonacci"""
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

def calcola_layout_pannelli(larghezza_base, fibonacci_n):
    """
    Calcola layout ottimale per pannelli fotovoltaici usando Fibonacci
    """
    fib_corrente = fibonacci_iterativo(fibonacci_n)
    fib_precedente = fibonacci_iterativo(fibonacci_n - 1) if fibonacci_n > 0 else 1
    
    rapporto = fib_corrente / fib_precedente if fib_precedente != 0 else 1
    
    altezza = larghezza_base * rapporto
    area = larghezza_base * altezza
    
    return {
        'larghezza': larghezza_base,
        'altezza': altezza,
        'area': area,
        'rapporto': rapporto,
        'fibonacci_n': fib_corrente
    }

def main():
    print("=" * 50)
    print("  CALCOLATORE FIBONACCI PER PANNELLI FOTOVOLTAICI")
    print("=" * 50)
    
    while True:
        try:
            print("\nOpzioni disponibili:")
            print("1. Calcola numero di Fibonacci")
            print("2. Genera sequenza")
            print("3. Layout pannelli con rapporto aureo")
            print("4. Analisi efficienza spazio")
            print("5. Esci")
            
            scelta = input("\nSeleziona un'opzione (1-5): ").strip()
            
            if scelta == '1':
                n = int(input("Inserisci il numero (posizione nella sequenza): "))
                if n < 0:
                    print("Inserisci un numero positivo!")
                    continue
                
                risultato = fibonacci_iterativo(n)
                print(f"\nFibonacci({n}) = {risultato}")
                
                if n > 1:
                    precedente = fibonacci_iterativo(n-1)
                    rapporto = risultato / precedente
                    print(f"Rapporto F({n})/F({n-1}) = {rapporto:.6f}")
                    
            elif scelta == '2':
                n = int(input("Quanti numeri della sequenza vuoi vedere? "))
                if n <= 0:
                    print("Inserisci un numero positivo!")
                    continue
                    
                print(f"\nPrimi {n} numeri di Fibonacci:")
                for i in range(n):
                    fib = fibonacci_iterativo(i)
                    print(f"F({i:2d}) = {fib:8d}")
                    
            elif scelta == '3':
                larghezza = float(input("Inserisci larghezza base pannello (cm): "))
                n_fib = int(input("Usa quale numero Fibonacci per il rapporto? (suggerito: 8-15): "))
                
                if n_fib <= 0:
                    print("Il numero Fibonacci deve essere positivo!")
                    continue
                    
                layout = calcola_layout_pannelli(larghezza, n_fib)
                
                print(f"\n=== LAYOUT PANNELLO FOTOVOLTAICO ===")
                print(f"Larghezza:     {layout['larghezza']:.2f} cm")
                print(f"Altezza:       {layout['altezza']:.2f} cm")
                print(f"Area:          {layout['area']:.2f} cm²")
                print(f"Rapporto:      {layout['rapporto']:.4f}")
                print(f"Fibonacci({n_fib}): {layout['fibonacci_n']}")
                
                # Calcolo potenza stimata (esempio)
                area_m2 = layout['area'] / 10000  # conversione da cm² a m²
                potenza_stimata = area_m2 * 200  # ~200W per m² (esempio)
                print(f"Potenza stimata: {potenza_stimata:.1f} W")
                
            elif scelta == '4':
                print("\n=== ANALISI EFFICIENZA SPAZIO ===")
                larghezza_base = float(input("Larghezza disponibile (cm): "))
                altezza_base = float(input("Altezza disponibile (cm): "))
                
                print(f"\nConfronto rapporti per spazio {larghezza_base}x{altezza_base} cm:")
                print(f"{'N':>3} {'Fib(N)':>8} {'Rapporto':>10} {'Largh':>8} {'Alt':>8} {'Efficienza':>12}")
                print("-" * 60)
                
                for n in range(5, 16):
                    fib_n = fibonacci_iterativo(n)
                    fib_prev = fibonacci_iterativo(n-1)
                    rapporto = fib_n / fib_prev
                    
                    # Calcola dimensioni ottimali per lo spazio disponibile
                    if rapporto <= altezza_base / larghezza_base:
                        # Limitato dalla larghezza
                        largh_ott = larghezza_base
                        alt_ott = larghezza_base * rapporto
                    else:
                        # Limitato dall'altezza
                        alt_ott = altezza_base
                        largh_ott = altezza_base / rapporto
                    
                    area_utilizzata = largh_ott * alt_ott
                    area_totale = larghezza_base * altezza_base
                    efficienza = (area_utilizzata / area_totale) * 100
                    
                    print(f"{n:3d} {fib_n:8d} {rapporto:10.4f} {largh_ott:8.1f} {alt_ott:8.1f} {efficienza:11.1f}%")
                
            elif scelta == '5':
                print("\nGrazie per aver usato il calcolatore Fibonacci per fotovoltaico!")
                print("Buona installazione! ☀️")
                break
                
            else:
                print("Opzione non valida! Scegli tra 1-5.")
                
        except ValueError:
            print("Errore: inserisci un numero valido!")
        except KeyboardInterrupt:
            print("\n\nArrivederci! ☀️")
            break
        except Exception as e:
            print(f"Errore: {e}")

if __name__ == "__main__":
    main()