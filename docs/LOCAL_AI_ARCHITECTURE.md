# 🐼 DomoDomo Local AI & Autopilot Architecture Specification

This document details the systems design, execution pipelines, and data flows of DomoDomo's **Local AI Suite** and **Agentic Autopilot**. All components are engineered under a **zero-leak mandate**, executing offline in browser sandboxes and local machine processes.

---

## 1. Local AI System Topography
The system utilizes a client-to-host architecture bridged via Model Context Protocol (MCP) over Server-Sent Events (SSE). This allows the browser-native React client to control native system APIs (e.g. file systems, external HDDs, and Ollama shell processes) without cloud dependencies.

```mermaid
graph TD
    subgraph Client [Browser Sandbox Client]
        A[React Frontend App] -->|HTTP Requests| B[AI Service Utils]
        A -->|SSE Transport / Messages| C[Domo MCP Client]
    end

    subgraph Local_Server [Domo Local Server]
        C -->|SSE Channels Port 3001| D[Express MCP Server]
        D -->|Spawns CLI/Env Override| E[Ollama EXE Process]
        D -->|Base64 Encoded PowerShell| F[Windows Forms Dialogs]
        D -->|File Stream Copy| G[External HDD / Seagate USB]
    end

    subgraph Native_Daemon [Ollama Engine]
        E -->|System Daemon Port 11434| H[Ollama Local Registry]
        H -->|Local Cache| I[C:/Users/Arron/.ollama/models]
    end

    G -.->|Portable Backup Files| I
```

---

## 2. Agentic Autopilot Orchestration
The Autopilot is a multi-turn voice and text task agent that navigates the dashboard, triggers tools, and recommends relevant utilities when instructions are ambiguous.

```mermaid
sequenceDiagram
    autonumber
    actor User as User Interface
    participant AP as AutoPilot Provider (React)
    participant RG as Skills Registry
    participant LLM as Local AI Engine (Ollama)
    participant UI as Page Navigation / Router

    User->>AP: Input Voice/Text Command ("open crop tool")
    AP->>RG: Query registry matching rules
    RG-->>AP: Returns closest matches
    
    alt Ambiguous Command ("do something with image")
        AP->>User: Suggest Recommendations ("Did you mean Crop, Resize or Background Remover?")
    else Direct Match Found
        AP->>UI: Trigger Router Navigation ("/tool/crop-rotate")
    end

    AP->>LLM: Stream command context for execution details
    LLM-->>AP: Stream parameters & follow-up steps
    AP->>User: Display Status Overlay & Complete Action
```

---

## 3. Direct-to-HDD Model Migration Pipeline
To prevent laptop space exhaustion, the model migrator supports direct-to-drive downloads. It bypasses internal disks by overriding environmental variables on spawned threads.

```mermaid
graph TD
    A[User clicks Download + Save to Seagate] --> B[Frontend calls pull_model_direct tool]
    B --> C[Domo MCP Server starts job]
    C --> D[Generate unique Job ID & temp status file]
    
    subgraph Background_Process [Spawning Isolated Process]
        C -->|Override Env: OLLAMA_MODELS = D:/ollama_models| E[Spawn Child Process: ollama pull]
    end
    
    E -->|Write output streams| F[Write progress to JSON status file]
    C -->|Return Job ID| B
    
    subgraph UI_Polling [Frontend Live Loop]
        B -->|Every 2s: check_pull_status| G[Read JSON status file]
        G -->|Update progress bars / terminal logs| H[User View]
    end

    E -->|Exit code 0| I[Mark job as done & clean up status file]
    E -->|Exit code != 0| J[Write error status & clean up status file]
```

---

## 4. Components Directory Summary
* **`/src/tools/ai/ModelMigrator.tsx`**: Visual control dashboard managing registry catalog, imports, exports, and direct HDD pulling.
* **`/mcp-server/src/index.ts`**: Host-level dispatcher managing file copy loops, base64-encoded PowerShell system dialogue wrappers, and background spawns.
* **`/src/tools/autopilot`**: Contains `AutoPilotProvider.tsx`, `AutoPilotWorkspace.tsx`, and `skillsRegistry.ts` organizing nav targets and local intent resolution.
