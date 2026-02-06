#!/usr/bin/env python3
"""
Calcolatore Fibonacci Interattivo
Applicazioni per impianti fotovoltaici
"""

import sys
import time
from fibonacci_iterativo import fibonacci_iterativo, fibonacci_sequenza, fibonacci_fino_a_valore
from fibonacci_ricorsivo import fibonacci_memoized
from fibonacci_avanzato import (fibonacci_formula_binet, fibonacci_matrice, 
                                applicazione_layout_pannelli, analisi_rapporto_aureo)
from config_fibonacci import get_config, get_scenario, validate_input, format_number

class FibonacciCalculator:
    def __init__(self):
        self.config = get_config()
        self.metodi_disponibili = {
            '1': ('Iterativo', fibonacci_iterativo),
            '2': ('Ricorsivo Memoized', lambda n: fibonacci_memoized(n, {})),
            '3': ('Formula di Binet', fibonacci_formula_binet),
            '4': ('Metodo Matrice', fibonacci_matrice),
        }
    
    def menu_principale(self):
        """Menu principale dell'applicazione"""
        while True:
            print("\n" + "=" * 60)
            print("🌞 CALCOLATORE FIBONACCI FOTOVOLTAICO 🌞")
            print("=" * 60)
            print("\n📊 CALCOLI FIBONACCI:")
            print("  1. Calcola singolo numero F(n)")
            print("  2. Genera sequenza Fibonacci")
            print("  3. Confronta metodi di calcolo")
            print("  4. Analisi rapporto aureo")
            print("\n🏠 APPLICAZIONI FOTOVOLTAICHE:")
            print("  5. Layout ottimale pannelli")
            print("  6. Analisi scenario impianto")
            print("  7. Rapporto costi/benefici")
            print("\n⚙️  UTILITÀ:")
            print("  8. Configurazione")
            print("  9. Test prestazioni")
            print("  0. Esci")
            
            try:
                scelta = input("\n➤ Scegli un'opzione (0-9): ").strip()
                
                if scelta == '0':
                    print("\n👋 Grazie per aver usato il Calcolatore Fibonacci!")
                    print("🌱 Buona progettazione di impianti sostenibili!")
                    break
                elif scelta == '1':
                    self.calcola_singolo_numero()
                elif scelta == '2':
                    self.genera_sequenza()
                elif scelta == '3':
                    self.confronta_metodi()
                elif scelta == '4':
                    self.analizza_rapporto_aureo()
                elif scelta == '5':
                    self.layout_pannelli()
                elif scelta == '6':
                    self.analizza_scenario()
                elif scelta == '7':
                    self.rapporto_costi_benefici()
                elif scelta == '8':
                    self.mostra_configurazione()
                elif scelta == '9':
                    self.test_prestazioni()
                else:
                    print("❌ Opzione non valida. Riprova.")
                    
            except KeyboardInterrupt:
                print("\n\n👋 Uscita richiesta dall'utente.")
                break
            except Exception as e:
                print(f"❌ Errore: {e}")
    
    def calcola_singolo_numero(self):
        """Calcola un singolo numero di Fibonacci"""
        print("\n🔢 CALCOLO SINGOLO NUMERO")
        print("-" * 30)
        
        try:
            n_str = input("Inserisci n per calcolare F(n): ")
            n = validate_input(n_str, 'int')
            
            print(f"\nCalcolo F({n})...")
            
            # Mostra tutti i metodi
            print("\n📈 RISULTATI:")
            for key, (nome, funzione) in self.metodi_disponibili.items():
                try:
                    start = time.time()
                    risultato = funzione(n)
                    tempo = time.time() - start
                    
                    print(f"  {nome}: {format_number(risultato)} (tempo: {tempo:.6f}s)")
                except Exception as e:
                    print(f"  {nome}: ERRORE - {e}")
                    
        except ValueError as e:
            print(f"❌ {e}")
        except Exception as e:
            print(f"❌ Errore inaspettato: {e}")
    
    def genera_sequenza(self):
        """Genera una sequenza di Fibonacci"""
        print("\n📈 GENERAZIONE SEQUENZA")
        print("-" * 30)
        
        try:
            n_str = input("Quanti numeri generare? ")
            n = validate_input(n_str, 'int')
            
            print(f"\nGenerazione primi {n} numeri di Fibonacci...")
            
            start = time.time()
            sequenza = fibonacci_sequenza(n)
            tempo = time.time() - start
            
            print(f"\n📊 SEQUENZA GENERATA (tempo: {tempo:.6f}s):")
            
            # Mostra solo primi e ultimi elementi se troppo lunga
            max_display = self.config['output']['max_elementi_display']
            if len(sequenza) <= max_display:
                for i, val in enumerate(sequenza):
                    print(f"  F({i}) = {format_number(val)}")
            else:
                # Mostra primi 10
                print("  Primi 10:")
                for i in range(10):
                    print(f"    F({i}) = {format_number(sequenza[i])}")
                
                print("  ...")
                
                # Mostra ultimi 10
                print("  Ultimi 10:")
                for i in range(len(sequenza)-10, len(sequenza)):
                    print(f"    F({i}) = {format_number(sequenza[i])}")
            
            # Analisi aggiuntiva
            if len(sequenza) > 1:
                print(f"\n📊 ANALISI:")
                print(f"  Valore massimo: {format_number(max(sequenza))}")
                print(f"  Somma totale: {format_number(sum(sequenza))}")
                if len(sequenza) > 2:
                    ultimo_rapporto = sequenza[-1] / sequenza[-2]
                    print(f"  Ultimo rapporto: {ultimo_rapporto:.6f}")
                    print(f"  Vicinanza al φ: {abs(ultimo_rapporto - 1.618034):.6f}")
                    
        except ValueError as e:
            print(f"❌ {e}")
        except Exception as e:
            print(f"❌ Errore: {e}")
    
    def confronta_metodi(self):
        """Confronta diversi metodi di calcolo"""
        print("\n⚡ CONFRONTO METODI")
        print("-" * 25)
        
        try:
            n_str = input("Numero per il confronto F(n): ")
            n = validate_input(n_str, 'int')
            
            print(f"\n🏃 BENCHMARK F({n}):")
            
            risultati = []
            for key, (nome, funzione) in self.metodi_disponibili.items():
                try:
                    start = time.time()
                    risultato = funzione(n)
                    tempo = time.time() - start
                    
                    risultati.append((nome, risultato, tempo))
                    print(f"  {nome}: {tempo:.6f}s")
                    
                except Exception as e:
                    print(f"  {nome}: ERRORE - {e}")
            
            # Trova il più veloce
            if risultati:
                piu_veloce = min(risultati, key=lambda x: x[2])
                print(f"\n🏆 VINCITORE: {piu_veloce[0]} ({piu_veloce[2]:.6f}s)")
                print(f"📊 RISULTATO: {format_number(piu_veloce[1])}")
                
        except ValueError as e:
            print(f"❌ {e}")
        except Exception as e:
            print(f"❌ Errore: {e}")
    
    def analizza_rapporto_aureo(self):
        """Analizza la convergenza al rapporto aureo"""
        print("\n✨ ANALISI RAPPORTO AUREO")
        print("-" * 30)
        
        try:
            n_str = input("Numero di termini da analizzare: ")
            n = validate_input(n_str, 'int')
            
            rapporti, phi_teorico = analisi_rapporto_aureo(n)
            
            print(f"\n🔢 ANALISI SU {n} TERMINI:")
            print(f"  Rapporto aureo teorico: {phi_teorico:.10f}")
            
            if rapporti:
                print(f"\n📈 CONVERGENZA:")
                
                # Mostra ultimi 10 rapporti
                ultimi = rapporti[-10:] if len(rapporti) > 10 else rapporti
                for i, rapporto in enumerate(ultimi):
                    posizione = len(rapporti) - len(ultimi) + i + 1
                    errore = abs(rapporto - phi_teorico)
                    print(f"    F({posizione+1})/F({posizione}) = {rapporto:.10f} (errore: {errore:.2e})")
                
                # Statistiche
                errore_finale = abs(rapporti[-1] - phi_teorico)
                print(f"\n📊 STATISTICHE:")
                print(f"  Errore finale: {errore_finale:.2e}")
                print(f"  Precisione: {100*(1-errore_finale):.8f}%")
                
                # Applicazioni estetiche
                print(f"\n🎨 APPLICAZIONI ESTETICHE:")
                print(f"  Rapporto pannelli: {rapporti[-1]:.3f}:1")
                if 1.6 < rapporti[-1] < 1.64:
                    print("  ✅ OTTIMO per estetica architettonica!")
                elif 1.5 < rapporti[-1] < 1.7:
                    print("  ✅ BUONO per integrazione visiva")
                else:
                    print("  ⚠️  Potrebbe non essere ottimale esteticamente")
                    
        except ValueError as e:
            print(f"❌ {e}")
        except Exception as e:
            print(f"❌ Errore: {e}")
    
    def layout_pannelli(self):
        """Calcola layout ottimale per pannelli fotovoltaici"""
        print("\n🏠 LAYOUT OTTIMALE PANNELLI")
        print("-" * 35)
        
        try:
            area_str = input("Area disponibile (m²): ")
            area = validate_input(area_str, 'float')
            
            print(f"\n🔍 Analisi area di {area} m²...")
            
            configurazioni = applicazione_layout_pannelli(area)
            
            if configurazioni:
                print(f"\n📋 TOP 5 CONFIGURAZIONI:")
                
                for i, config in enumerate(configurazioni[:5]):
                    print(f"\n  {i+1}. Layout {config['pannelli_x']} × {config['pannelli_y']}:")
                    print(f"     • Pannelli totali: {config['pannelli_x'] * config['pannelli_y']}")
                    print(f"     • Area utilizzata: {config['area_utilizzata']} m²")
                    print(f"     • Efficienza spazio: {config['efficienza_spazio']:.1%}")
                    print(f"     • Rapporto aspetto: {config['rapporto_aspetto']:.3f}")
                    
                    # Valutazione estetica
                    rapporto = config['rapporto_aspetto']
                    if 1.6 < rapporto < 1.64:
                        print(f"     • Estetica: ⭐⭐⭐⭐⭐ (rapporto aureo!)")
                    elif 1.5 < rapporto < 1.7:
                        print(f"     • Estetica: ⭐⭐⭐⭐ (molto buona)")
                    elif 1.4 < rapporto < 1.8:
                        print(f"     • Estetica: ⭐⭐⭐ (buona)")
                    else:
                        print(f"     • Estetica: ⭐⭐ (accettabile)")
                
                # Raccomandazione
                migliore = configurazioni[0]
                print(f"\n🏆 RACCOMANDAZIONE:")
                print(f"   Layout {migliore['pannelli_x']} × {migliore['pannelli_y']} pannelli")
                print(f"   Efficienza: {migliore['efficienza_spazio']:.1%}")
                print(f"   Rapporto: {migliore['rapporto_aspetto']:.3f}")
            else:
                print("❌ Nessuna configurazione trovata per quest'area.")
                
        except ValueError as e:
            print(f"❌ {e}")
        except Exception as e:
            print(f"❌ Errore: {e}")
    
    def analizza_scenario(self):
        """Analizza uno scenario specifico di impianto"""
        print("\n🏭 ANALISI SCENARIO IMPIANTO")
        print("-" * 35)
        
        # Mostra scenari disponibili
        scenari = {
            '1': 'residenziale_piccolo',
            '2': 'residenziale_medio', 
            '3': 'industriale',
            '4': 'utility_scale'
        }
        
        print("📋 SCENARI DISPONIBILI:")
        for key, nome in scenari.items():
            scenario = get_scenario(nome)
            print(f"  {key}. {nome.replace('_', ' ').title()}")
            print(f"     Area max: {scenario.get('area_max', 'N/A')} m²")
            print(f"     Budget max: €{scenario.get('budget_max', 'N/A'):,}")
            print(f"     Priorità: {scenario.get('priorita', 'N/A')}")
            print()
        
        try:
            scelta = input("Scegli scenario (1-4): ").strip()
            
            if scelta in scenari:
                nome_scenario = scenari[scelta]
                scenario = get_scenario(nome_scenario)
                
                print(f"\n🔍 ANALISI SCENARIO: {nome_scenario.replace('_', ' ').title()}")
                print(f"Area massima: {scenario['area_max']} m²")
                print(f"Budget massimo: €{scenario['budget_max']:,}")
                print(f"Priorità: {scenario['priorita']}")
                
                # Calcola configurazioni per questo scenario
                configurazioni = applicazione_layout_pannelli(scenario['area_max'])
                
                if configurazioni:
                    migliore = configurazioni[0]
                    
                    print(f"\n📊 CONFIGURAZIONE OTTIMALE:")
                    print(f"  Layout: {migliore['pannelli_x']} × {migliore['pannelli_y']}")
                    print(f"  Pannelli totali: {migliore['pannelli_x'] * migliore['pannelli_y']}")
                    print(f"  Efficienza spazio: {migliore['efficienza_spazio']:.1%}")
                    
                    # Stime economiche (approssimative)
                    n_pannelli = migliore['pannelli_x'] * migliore['pannelli_y']
                    costo_pannello = 200  # €/pannello (stima)
                    costo_totale = n_pannelli * costo_pannello
                    potenza_kw = n_pannelli * 0.3  # 300W per pannello
                    
                    print(f"\n💰 STIME ECONOMICHE:")
                    print(f"  Potenza installata: {potenza_kw:.1f} kW")
                    print(f"  Costo stimato: €{costo_totale:,}")
                    print(f"  Costo per kW: €{costo_totale/potenza_kw:.0f}/kW")
                    
                    if costo_totale <= scenario['budget_max']:
                        print(f"  ✅ DENTRO BUDGET!")
                    else:
                        print(f"  ⚠️  Supera budget di €{costo_totale - scenario['budget_max']:,}")
                        
            else:
                print("❌ Scenario non valido.")
                
        except Exception as e:
            print(f"❌ Errore: {e}")
    
    def rapporto_costi_benefici(self):
        """Analizza il rapporto costi/benefici"""
        print("\n💰 ANALISI COSTI/BENEFICI")
        print("-" * 30)
        print("🚧 Funzionalità in sviluppo...")
        print("   Verranno incluse:")
        print("   • Calcolo ROI")
        print("   • Tempo di payback")
        print("   • NPV e IRR")
        print("   • Incentivi fiscali")
        input("\n📱 Premi INVIO per continuare...")
    
    def mostra_configurazione(self):
        """Mostra la configurazione corrente"""
        print("\n⚙️  CONFIGURAZIONE SISTEMA")
        print("-" * 35)
        
        config = self.config
        
        print("🔧 PARAMETRI GENERALI:")
        print(f"  Max iterazioni: {config['max_iterazioni']:,}")
        print(f"  Max valore singolo: {format_number(config['max_valore_singolo'])}")
        print(f"  Timeout: {config['timeout_calcolo']}s")
        
        print(f"\n🔋 PANNELLI FOTOVOLTAICI:")
        pannelli = config['pannelli']
        print(f"  Dimensioni standard: {pannelli['larghezza']}m × {pannelli['altezza']}m")
        print(f"  Area: {pannelli['area']} m²")
        print(f"  Potenza: {pannelli['potenza_standard']} W")
        print(f"  Efficienza: {pannelli['efficienza_media']:.0%}")
        
        print(f"\n📐 PROPORZIONI:")
        prop = config['proporzioni']
        print(f"  Rapporto aureo: {prop['rapporto_aureo']:.6f}")
        print(f"  Tolleranza: ±{prop['tolleranza_rapporto']:.1%}")
        
        print(f"\n⚡ PERFORMANCE:")
        perf = config['performance']
        print(f"  Metodo default: {perf['metodo_default']}")
        print(f"  Soglia veloce: < {perf['soglia_metodo_veloce']}")
        print(f"  Cache size: {perf['cache_size']:,}")
        
        input("\n📱 Premi INVIO per continuare...")
    
    def test_prestazioni(self):
        """Esegue test di prestazioni"""
        print("\n⚡ TEST PRESTAZIONI")
        print("-" * 25)
        
        numeri_test = [10, 20, 30, 40, 50]
        
        print("🏃 Esecuzione benchmark...")
        print("\n📊 RISULTATI (tempo in secondi):")
        print(f"{'Metodo':<20} | " + " | ".join([f"F({n})" for n in numeri_test]))
        print("-" * (20 + len(numeri_test) * 8))
        
        for key, (nome, funzione) in self.metodi_disponibili.items():
            tempi = []
            for n in numeri_test:
                try:
                    start = time.time()
                    funzione(n)
                    tempo = time.time() - start
                    tempi.append(f"{tempo:.6f}")
                except:
                    tempi.append("ERROR")
            
            print(f"{nome:<20} | " + " | ".join([f"{t:>6}" for t in tempi]))
        
        input("\n📱 Premi INVIO per continuare...")

def main():
    """Funzione principale"""
    try:
        calculator = FibonacciCalculator()
        calculator.menu_principale()
    except KeyboardInterrupt:
        print("\n\n👋 Uscita richiesta dall'utente.")
    except Exception as e:
        print(f"\n❌ Errore critico: {e}")
        print("🔧 Controlla la configurazione e riprova.")

if __name__ == "__main__":
    main()