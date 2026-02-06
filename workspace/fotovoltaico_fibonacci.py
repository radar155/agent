#!/usr/bin/env python3
"""
CALCOLATORE AVANZATO PER IMPIANTI FOTOVOLTAICI CON FIBONACCI
Ottimizza layout, disposizione e calcoli energetici
"""

def fibonacci_iterativo(n):
    """Calcolo efficiente di Fibonacci"""
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

def calcola_array_fibonacci(area_totale_m2, potenza_pannello_w=300):
    """
    Calcola configurazione ottimale di array fotovoltaico usando Fibonacci
    """
    print("=== CALCOLATORE ARRAY FOTOVOLTAICO ===")
    print(f"Area disponibile: {area_totale_m2} m²")
    print(f"Potenza pannello standard: {potenza_pannello_w} W")
    print()
    
    # Dimensioni pannello standard (esempio)
    larghezza_pannello = 1.0  # metri
    
    migliori_configurazioni = []
    
    # Testa diverse configurazioni basate su Fibonacci
    for n in range(8, 16):  # Fibonacci da 8 a 15
        fib_n = fibonacci_iterativo(n)
        fib_prev = fibonacci_iterativo(n-1)
        rapporto = fib_n / fib_prev
        
        altezza_pannello = larghezza_pannello * rapporto
        area_pannello = larghezza_pannello * altezza_pannello
        
        # Calcola quanti pannelli entrano
        pannelli_per_fila = int(area_totale_m2**0.5 / larghezza_pannello)
        pannelli_per_colonna = int(area_totale_m2**0.5 / altezza_pannello)
        
        if pannelli_per_fila > 0 and pannelli_per_colonna > 0:
            totale_pannelli = pannelli_per_fila * pannelli_per_colonna
            area_utilizzata = totale_pannelli * area_pannello
            efficienza_spazio = (area_utilizzata / area_totale_m2) * 100
            potenza_totale = totale_pannelli * potenza_pannello_w
            
            config = {
                'fibonacci_n': n,
                'rapporto': rapporto,
                'dimensioni_pannello': (larghezza_pannello, altezza_pannello),
                'pannelli_fila': pannelli_per_fila,
                'pannelli_colonna': pannelli_per_colonna,
                'totale_pannelli': totale_pannelli,
                'area_utilizzata': area_utilizzata,
                'efficienza_spazio': efficienza_spazio,
                'potenza_totale': potenza_totale
            }
            
            migliori_configurazioni.append(config)
    
    return migliori_configurazioni

def stampa_configurazioni(configurazioni):
    """Stampa le configurazioni in formato tabellare"""
    print(f"{'Fib':>3} {'Rapporto':>8} {'Dim.Pan(m)':>12} {'N.Pan':>6} {'Pot(kW)':>8} {'Eff%':>6}")
    print("-" * 55)
    
    for config in configurazioni:
        largh, alt = config['dimensioni_pannello']
        print(f"{config['fibonacci_n']:3d} " +
              f"{config['rapporto']:8.3f} " +
              f"{largh:.1f}x{alt:.1f} " +
              f"{config['totale_pannelli']:8d} " +
              f"{config['pannelli_fila']:2d}x{config['pannelli_colonna']:2d} " +
              f"{config['potenza_totale']/1000:7.1f} " +
              f"{config['efficienza_spazio']:5.1f}")

def calcola_produzione_annuale(potenza_kw, ore_sole_giorno=5, giorni_anno=365):
    """Calcola produzione energetica annuale stimata"""
    return potenza_kw * ore_sole_giorno * giorni_anno

def analisi_economica(potenza_kw, costo_per_watt=1.5, prezzo_kwh=0.25):
    """Analisi economica semplificata"""
    costo_impianto = potenza_kw * 1000 * costo_per_watt
    produzione_annua = calcola_produzione_annuale(potenza_kw)
    ricavo_annuo = produzione_annua * prezzo_kwh
    anni_rientro = costo_impianto / ricavo_annuo if ricavo_annuo > 0 else float('inf')
    
    return {
        'costo_impianto': costo_impianto,
        'produzione_annua_kwh': produzione_annua,
        'ricavo_annuo': ricavo_annuo,
        'anni_rientro': anni_rientro
    }

def main():
    print("=" * 60)
    print("   PROGETTAZIONE IMPIANTO FOTOVOLTAICO CON FIBONACCI")
    print("=" * 60)
    
    # Input utente
    try:
        area = float(input("Inserisci area disponibile (m²): "))
        potenza_pannello = float(input("Potenza per pannello (W, default 300): ") or 300)
        
        # Calcola configurazioni
        configurazioni = calcola_array_fibonacci(area, potenza_pannello)
        
        if not configurazioni:
            print("Nessuna configurazione valida trovata per quest'area.")
            return
        
        # Ordina per efficienza decrescente
        configurazioni.sort(key=lambda x: x['efficienza_spazio'], reverse=True)
        
        print("\n=== CONFIGURAZIONI OTTIMALI ===")
        stampa_configurazioni(configurazioni[:5])  # Top 5
        
        # Analizza la migliore configurazione
        migliore = configurazioni[0]
        potenza_kw = migliore['potenza_totale'] / 1000
        
        print(f"\n=== CONFIGURAZIONE RACCOMANDATA ===")
        print(f"Fibonacci({migliore['fibonacci_n']}) - Rapporto: {migliore['rapporto']:.3f}")
        print(f"Pannelli: {migliore['totale_pannelli']} ({migliore['pannelli_fila']}x{migliore['pannelli_colonna']})")
        print(f"Potenza totale: {potenza_kw:.1f} kW")
        print(f"Efficienza spazio: {migliore['efficienza_spazio']:.1f}%")
        
        # Analisi energetica
        print(f"\n=== ANALISI ENERGETICA ===")
        produzione_annua = calcola_produzione_annuale(potenza_kw)
        print(f"Produzione annua stimata: {produzione_annua:,.0f} kWh")
        print(f"Produzione giornaliera media: {produzione_annua/365:.1f} kWh")
        
        # Analisi economica
        print(f"\n=== ANALISI ECONOMICA ===")
        economia = analisi_economica(potenza_kw)
        print(f"Costo stimato impianto: €{economia['costo_impianto']:,.0f}")
        print(f"Ricavo annuo stimato: €{economia['ricavo_annuo']:,.0f}")
        print(f"Tempo di rientro: {economia['anni_rientro']:.1f} anni")
        
        # Confronto rispetto al quadrato classico
        print(f"\n=== CONFRONTO CON DISPOSIZIONE QUADRATA ===")
        lato_quadrato = area**0.5
        pannelli_lato = int(lato_quadrato / 1.0)  # pannello 1x1m per semplicità
        pannelli_quadrato = pannelli_lato**2
        potenza_quadrato = pannelli_quadrato * potenza_pannello / 1000
        
        print(f"Disposizione quadrata: {pannelli_quadrato} pannelli, {potenza_quadrato:.1f} kW")
        print(f"Disposizione Fibonacci: {migliore['totale_pannelli']} pannelli, {potenza_kw:.1f} kW")
        
        vantaggio = ((migliore['totale_pannelli'] - pannelli_quadrato) / pannelli_quadrato * 100) if pannelli_quadrato > 0 else 0
        print(f"Vantaggio Fibonacci: {vantaggio:+.1f}% pannelli")
        
    except ValueError:
        print("Errore: inserisci numeri validi!")
    except KeyboardInterrupt:
        print("\nCalcolo interrotto dall'utente.")
    except Exception as e:
        print(f"Errore: {e}")

if __name__ == "__main__":
    main()