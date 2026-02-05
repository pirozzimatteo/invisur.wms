# Manuale Utente WMS

Benvenuto nel manuale d'uso del **Warehouse Management System (WMS)**. Questa guida ti aiuterà a gestire il tuo magazzino in modo semplice e veloce.

---

## 1. Introduzione
Questa applicazione ti permette di:
*   Sapere sempre **cosa** c'è in magazzino e **dove** si trova.
*   Registrare la merce in **entrata** (dai fornitori).
*   Gestire le spedizioni in **uscita** (verso i clienti).
*   Monitorare le scorte per evitare di rimanere senza prodotti ("Low Stock").

---

## 2. Dashboard (Pannello di Controllo)
Appena entri nell'applicazione, vedi la **Dashboard**. Qui hai una visione d'insieme:
*   **Total Items**: Numero di tipi di prodotti diversi registrati.
*   **Total Locations**: Numero di posti (scaffali, aree) disponibili.
*   **Occupancy Rate**: Quanto è pieno il tuo magazzino in percentuale.
*   **Low Stock Alerts**: Ti avvisa se qualche prodotto sta finendo (sotto la soglia di riordino).
*   **Recent Activity**: Le ultime operazioni fatte (chi ha spostato cosa).
*   **Warehouse Map**: Una mappa visiva a zone del magazzino.

---

## 3. Anagrafica Articoli (Items)
Prima di poter gestire la merce, devi dire al sistema quali prodotti tratti.
1.  Clicca su **Items** nel menu laterale.
2.  Vedi la lista di tutti i prodotti.
3.  Per creare un nuovo prodotto, clicca su **Add Item**.
4.  Inserisci i dati:
    *   **Codice**: Il codice univoco (es. SKU-123).
    *   **Descrizione**: Nome del prodotto (es. Trapano Elettrico).
    *   **Reorder Point**: Molto importante! Inserisci il numero minimo di pezzi che vuoi sempre avere (es. 10). Se scendi sotto questo numero, la Dashboard ti avviserà.
5.  Clicca **Salva**.

---

## 4. Mappa Magazzino (Locations)
Qui definisci **dove** metti la merce. Il magazzino è organizzato come un albero:
*   **SITE**: Il magazzino principale.
*   **AREA**: Una zona (es. Zona A, Zona B).
*   **AISLE**: Un corridoio.
*   **RACK**: Uno scaffale.
*   **BIN**: La singola casella o cassetto dove metti gli oggetti.

**Come fare:**
1.  Clicca su **Locations**.
2.  Usa le frecce per espandere le zone.
3.  Clicca l'icona **Occhio** per vedere cosa c'è in una posizione.
4.  Clicca **+** per aggiungere una sotto-zona (es. aggiungere uno scaffale in un corridoio).

---

## 5. Ingresso Merce (Inbound)
Usa questa funzione quando arriva il corriere con nuova merce.
1.  Clicca su **Inbound**.
2.  **Passo 1: Scansiona**. Scrivi il codice del prodotto arrivato o selezionalo dalla lista. Clicca **Find**.
3.  **Passo 2: Dettagli**.
    *   Vedi i dettagli del prodotto per conferma.
    *   Inserisci la **Quantità** arrivata.
    *   Scegli la **Location** (dove la stai mettendo fisicamente).
    *   (Opzionale) Inserisci il numero di Lotto/Batch.
4.  Clicca **Confirm Putaway**.
5.  Fatto! La merce è ora disponibile a sistema.

---

## 6. Uscita Merce (Outbound)
Usa questa funzione per preparare e spedire ordini ai clienti.
1.  Clicca su **Outbound**.
2.  Clicca **Create Order**.
3.  Inserisci il **Nome Cliente**.
4.  Aggiungi i prodotti all'ordine:
    *   Seleziona il prodotto.
    *   Il sistema ti mostrerà dove si trova ("Available Stock"). Clicca su **Select** per scegliere da quale scaffale prenderlo.
    *   Inserisci la quantità e clicca **Add**.
5.  Quando hai aggiunto tutto, clicca **Create Order**.
6.  L'ordine ora è "In preparazione" (Status: PICKING).
7.  Vai nella tabella **Picking Tasks** sotto. Per ogni riga, l'operatore deve andare allo scaffale indicato, prendere la merce e cliccare **Confirm Pick**.
8.  Quando tutto è stato prelevato, l'ordine diventa "Pronto" (Status: PICKED).
9.  Clicca **Ship** per confermare la spedizione e scaricare definitivamente la merce.

---

## 7. Consultazione Magazzino (Inventory)
Per vedere velocemente quanta merce hai:
1.  Clicca su **Inventory**.
2.  Vedi la lista dei prodotti con la quantità totale (**On Hand**).
3.  Clicca sulla freccia accanto a un prodotto per vedere esattamente in quali scaffali è distribuito.
