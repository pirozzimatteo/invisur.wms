# 🚂 Guida al Deployment su Railway (Single Service)

Questa guida ti aiuterà a deployare l'intero WMS (Backend + Frontend) come **unico servizio** su [Railway.app](https://railway.app/).

## 1. Come Funziona
Abbiamo creato un `Dockerfile` nella root del progetto che:
1.  Compila il Frontend (React/Vite).
2.  Compila il Backend (Spring Boot) includendo i file del Frontend.
3.  Crea un'unica immagine Docker pronta all'uso.

## 2. Preparazione Database (PostgreSQL)

1.  Vai su Railway e crea un **New Project**.
2.  Scegli **Provision PostgreSQL**.
3.  Clicca sul database, vai su **Data** o **Connect** e copia la **JDBC URL** (es. `jdbc:postgresql://...`).

## 3. Deploy del Servizio Unico

1.  Nel tuo progetto Railway, clicca **New** -> **GitHub Repo**.
2.  Seleziona il repo del WMS.
3.  Clicca sul servizio appena creato e vai su **Settings**.
4.  **Root Directory**: Lascia vuoto (o `/`) perché useremo il `Dockerfile` nella root.
5.  **Docker Command**: Lascia vuoto (Railway userà l'ENTRYPOINT del Dockerfile).
6.  Vai su **Variables** e aggiungi:
    *   `DATABASE_URL`: La JDBC URL del tuo database.
    *   `DATABASE_USERNAME`: `postgres` (o username del DB).
    *   `DATABASE_PASSWORD`: Password del DB.
    *   `PORT`: `8080`.
7.  Railway rileverà il `Dockerfile` e inizierà il build (ci metterà qualche minuto perché deve compilare sia FE che BE).

## 4. Verifica

1.  Una volta finito il deploy, Railway ti darà un URL pubblico (es. `https://wms-production.up.railway.app`).
2.  Aprendo quell'URL vedrai direttamente l'interfaccia React.
3.  L'interfaccia parlerà con il backend (stesso dominio/porta), quindi non avrai problemi di CORS.

## Troubleshooting

-   **Build Fallito?** Controlla i log di Build. Se vedi errori su `npm install` o `mvn package`, verifica che i file `package.json` e `pom.xml` siano al posto giusto.
-   **Pagina Bianca?** Apri la console del browser (F12). Se vedi 404 sui file JS/CSS, potrebbe esserci un problema nel path dei file statici, ma con questa configurazione standard dovrebbe funzionare tutto.
