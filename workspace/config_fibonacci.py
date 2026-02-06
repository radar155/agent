#!/usr/bin/env python3
"""
Configurazione per calcoli Fibonacci applicati al fotovoltaico
"""

# Parametri generali
FIBONACCI_CONFIG = {
    # Limiti di calcolo
    'max_iterazioni': 1000,
    'max_valore_singolo': 10**15,
    'timeout_calcolo': 30,  # secondi
    
    # Parametri layout pannelli fotovoltaici
    'pannelli': {
        'dimensione_standard': {
            'larghezza': 1.65,  # metri
            'altezza': 1.00,    # metri
            'area': 1.65        # m²
        },
        'potenza_standard': 300,  # Watt
        'efficienza_media': 0.20,  # 20%
        'fattore_spazio': 0.8,    # 80% dell'area utilizzabile
    },
    
    # Rapporti e proporzioni
    'proporzioni': {
        'rapporto_aureo': 1.618033988749895,
        'tolleranza_rapporto': 0.05,  # 5% di tolleranza
        'rapporti_ottimali': [
            1.0,    # quadrato
            1.414,  # √2
            1.5,    # 3:2
            1.618,  # aureo
            1.732   # √3
        ]
    },
    
    # Performance e ottimizzazione
    'performance': {
        'metodo_default': 'iterativo',
        'soglia_metodo_veloce': 50,     # sotto usa iterativo
        'soglia_metodo_matrice': 1000,  # sopra usa matrice
        'cache_size': 10000,
        'batch_size_numpy': 10000
    },
    
    # Output e visualizzazione
    'output': {
        'precision_display': 6,
        'max_elementi_display': 20,
        'formato_numeri': 'scientific',  # 'decimal' o 'scientific'
        'separatore_migliaia': True
    },
    
    # Validazione e sicurezza
    'validazione': {
        'min_valore': 0,
        'max_valore_input': 10000,
        'controllo_overflow': True,
        'controllo_memoria': True
    }
}

# Configurazioni predefinite per diversi scenari
SCENARI_FOTOVOLTAICI = {
    'residenziale_piccolo': {
        'area_max': 50,      # m²
        'budget_max': 15000, # euro
        'priorita': 'estetica',
        'fibonacci_limit': 34
    },
    
    'residenziale_medio': {
        'area_max': 150,
        'budget_max': 40000,
        'priorita': 'efficienza',
        'fibonacci_limit': 89
    },
    
    'industriale': {
        'area_max': 1000,
        'budget_max': 200000,
        'priorita': 'massima_produzione',
        'fibonacci_limit': 610
    },
    
    'utility_scale': {
        'area_max': 50000,
        'budget_max': 5000000,
        'priorita': 'costo_kwh',
        'fibonacci_limit': 17711
    }
}

# Template per report
TEMPLATE_REPORT = """
REPORT ANALISI FIBONACCI - LAYOUT FOTOVOLTAICO
===============================================

Scenario: {scenario}
Area disponibile: {area} m²
Configurazione ottimale: {config_x} x {config_y} pannelli

DETTAGLI TECNICI:
- Numero pannelli totale: {n_pannelli}
- Potenza installata: {potenza_kw:.1f} kW
- Producibilità annua stimata: {producibilita_kwh:.0f} kWh/anno
- Efficienza utilizzo spazio: {efficienza_spazio:.1%}
- Rapporto di forma: {rapporto_forma:.3f}

ANALISI FIBONACCI:
- Numeri utilizzati: F({fib_x}) = {fib_x_val}, F({fib_y}) = {fib_y_val}
- Rapporto Fibonacci: {rapporto_fib:.3f}
- Deviazione da rapporto aureo: {dev_aureo:.1%}

VALUTAZIONE ESTETICA:
- Armonia visiva: {armonia}/10
- Integrazione architettonica: {integrazione}/10
- Impatto paesaggistico: {impatto}/10

STIMA ECONOMICA:
- Costo totale stimato: €{costo_totale:,.0f}
- Costo per kW: €{costo_per_kw:,.0f}/kW
- Tempo di rientro: {payback:.1f} anni
- IRR a 20 anni: {irr:.1%}
"""

def get_config(chiave=None):
    """Ottieni configurazione specifica o completa"""
    if chiave:
        return FIBONACCI_CONFIG.get(chiave, {})
    return FIBONACCI_CONFIG

def get_scenario(nome_scenario):
    """Ottieni configurazione per scenario specifico"""
    return SCENARI_FOTOVOLTAICI.get(nome_scenario, {})

def validate_input(valore, tipo='int'):
    """Valida input secondo configurazione"""
    config_val = FIBONACCI_CONFIG['validazione']
    
    try:
        if tipo == 'int':
            val = int(valore)
            if val < config_val['min_valore'] or val > config_val['max_valore_input']:
                raise ValueError(f"Valore fuori range [{config_val['min_valore']}, {config_val['max_valore_input']}]")
            return val
        elif tipo == 'float':
            val = float(valore)
            return val
    except ValueError as e:
        raise ValueError(f"Errore validazione: {e}")

def format_number(numero, formato=None):
    """Formatta numero secondo configurazione"""
    config_out = FIBONACCI_CONFIG['output']
    
    if formato is None:
        formato = config_out['formato_numeri']
    
    if formato == 'scientific' and abs(numero) > 10**6:
        return f"{numero:.{config_out['precision_display']}e}"
    elif config_out['separatore_migliaia']:
        return f"{numero:,}"
    else:
        return str(numero)

# Test configurazione
if __name__ == "__main__":
    print("CONFIGURAZIONE FIBONACCI FOTOVOLTAICO")
    print("=" * 50)
    
    # Test configurazione base
    config = get_config()
    print(f"Metodo default: {config['performance']['metodo_default']}")
    print(f"Rapporto aureo: {config['proporzioni']['rapporto_aureo']}")
    
    # Test scenari
    print("\nSCENARI DISPONIBILI:")
    for nome, scenario in SCENARI_FOTOVOLTAICI.items():
        print(f"- {nome}: area max {scenario['area_max']}m², priorità {scenario['priorita']}")
    
    # Test validazione
    print("\nTEST VALIDAZIONE:")
    try:
        val_ok = validate_input("25", "int")
        print(f"Input '25' validato: {val_ok}")
        
        val_err = validate_input("999999", "int")
        print(f"Input '999999' validato: {val_err}")
    except ValueError as e:
        print(f"Errore validazione: {e}")
    
    # Test formattazione
    print("\nTEST FORMATTAZIONE:")
    numeri_test = [123, 1234567, 1.23456789e15]
    for num in numeri_test:
        print(f"{num} -> {format_number(num)}")
    
    print("\nConfigurazione caricata correttamente!")