# Diagram & Alur Sistem (Project Flow): Collision Week

> **Platform:** Next.js 14 (App Router) + TypeScript + Prisma 5 (SQLite) + Tailwind CSS 3.4  
> **Kompetisi:** STACK 2026 by GDGoC ITB — *Case 1: Smarter Campus and Learning*  
> **Tim Pengembang:** `daftar krna gratis`  
> **Dokumen Terkait:** [PRD (product_requirements_document_prd_collision_week.md)](file:///e:/ProjectWebsitev2/CollisionWeek/product_requirements_document_prd_collision_week.md) & [UI/UX Spec (UIUX_REDESIGN_SPEC.md)](file:///e:/ProjectWebsitev2/CollisionWeek/UIUX_REDESIGN_SPEC.md)

---

## 1. Arsitektur Solusi 2-Layer (High-Level Overview)

Collision Week menyelesaikan krisis penumpukan tenggat tugas akademik melalui arsitektur komplementer **dua lapis (Two-Layer Architecture)**:
1. **Layer 1 (Pencegahan di Hulu - *Deterministic Scheduling*):** Mengagregasi seluruh silabus tugas satu program studi ke dalam kalender bersama, menghitung indeks beban dan tabrakan secara matematis murni, serta mengusulkan pergeseran tanggal terkecil (*minimal date moves*) untuk disetujui dosen.
2. **Layer 2 (Peredam di Hilir - *Sub-topic Peer Help*):** Mengakomodasi kebuntuan mahasiswa pada tugas-tugas di pekan yang tetap padat melalui forum bantuan sebaya terstruktur berbasis sub-topik dengan 3 kanal respons inklusif (tulisan, rekaman, sesi 20 menit).

```mermaid
flowchart TD
    subgraph Ingesti["1. Ingesti Data"]
        CSV["Berkas CSV Silabus Tugas"] --> Parser["PapaParse + Validasi Skema Zod"]
        Parser --> DB[("Database Akademik\n(Prisma / SQLite)")]
    end

    subgraph Layer1["2. Layer 1: Deterministic Load Balancing"]
        DB --> CalcEngine["Mesin Kalkulasi Deterministik\n(Tanpa AI/LLM)"]
        CalcEngine --> HeatMap["Semester Heat Map 16 Pekan\n(L_w & C_w Score)"]
        HeatMap --> CheckCollision{"Apakah C_w >= 3?\n(Minggu Kritis)"}
        CheckCollision -- Ya --> Flagged["Tandai Pekan Kritis (Cw >= 3)"]
        CheckCollision -- Tidak --> Safe["Pekan Aman / Waspada"]
        Flagged --> Solver["Algoritma Minimal Date Move"]
        Solver --> ProposalList["Usulan Pergeseran Tanggal Minimal"]
        ProposalList --> LecturerAction{"Persetujuan Dosen\n(1-Click)"}
        LecturerAction -- Setuju (Accept) --> UpdateSchedule["Perbarui Jadwal & Rekalkulasi Peta Beban"]
        UpdateSchedule --> DB
        LecturerAction -- Tolak (Reject) --> KeepSchedule["Pertahankan Jadwal Awal"]
    end

    subgraph Layer2["3. Layer 2: Sub-topic Peer Help"]
        Safe & KeepSchedule & Flagged --> StudentView["Tugas Berjalan di Pekan Tersebut"]
        StudentView --> Blocked{"Mahasiswa Mengalami\nKebuntuan Belajar?"}
        Blocked -- Ya --> CreateHelp["Pilih Sub-topik Spesifik & Buat Pertanyaan"]
        CreateHelp --> WholeClassBoard["Papan Bantuan Tingkat Kelas\n(Whole-class Visibility)"]
        WholeClassBoard --> HelperResponse["Respon Rekan Sebaya\n(Tulisan / Rekaman / Sesi 20 Mnt)"]
        HelperResponse --> ResolveLoop["Konfirmasi Selesai (Mark as Resolved)"]
    end

    subgraph Analytics["4. Feedback Loop Dosen"]
        ResolveLoop --> SubtopicStats["Rekapitulasi Hambatan Sub-topik"]
        SubtopicStats --> LecturerDashboard["Dasbor Analitik Dosen\n(Bahan Review Materi / Evaluasi RPS)"]
    end
```

---

## 2. Alur Pengguna Berdasarkan Persona (User Journey Flows)

### 2.1 Persona 1: Admin / Koordinator Program Studi (Ingesti Jadwal)
Tujuan: Mengimpor kalender tugas akademik satu semester penuh agar beban kurikulum langsung terpetakan.

```mermaid
flowchart TD
    A["Mulai: Buka Halaman Impor (/import)"] --> B["Pilih Berkas CSV / Tempel Teks CSV"]
    B --> C["Klik 'Validasi skema'"]
    C --> D{"Apakah Data Valid?\n(Validasi Zod)"}
    D -- Tidak Valid --> E["Tampilkan Kesalahan Rinci per Nomor Baris"]
    E --> F["Perbaiki Baris CSV yang Rusak"]
    F --> C
    D -- Valid --> G["Tampilkan Pratinjau Baris & Ringkasan Metrik"]
    G --> H["Klik 'Simpan dan petakan jadwal'"]
    H --> I["Kirim ke API POST /api/import/csv"]
    I --> J["Hapus Tugas Lama & Simpan Tugas Baru"]
    J --> K["Eksekusi Rekalkulasi computeAllWeeklyMetrics()"]
    K --> L["Perbarui Tabel WeeklyMetric 1..16"]
    L --> M["Munculkan Notifikasi Sukses (Toast)"]
    M --> N["Arahkan ke Dasbor Peta Beban (/)"]
```

---

### 2.2 Persona 2: Dosen Pengampu (Penyeimbangan Beban & Analitik Materi)
Tujuan: Memastikan mahasiswa tidak mengalami *burnout* ekstrem pada pekan ujian/proyek dan mengidentifikasi sub-topik kuliah yang sulit dipahami mahasiswa.

```mermaid
flowchart TD
    subgraph SkenarioA["Skenario A: Penyeimbangan Beban Pekan"]
        D1["Dosen Membuka Dasbor (/)"] --> D2["Melihat Pekan Kritis (Contoh: Pekan 8, Cw = 4)"]
        D2 --> D3["Klik 'Seimbangkan' / Buka /weeks/8"]
        D3 --> D4["Sistem Memuat Tugas & Kandidat Pergeseran"]
        D4 --> D5["Dosen Meninjau Opsi: Misal Geser Proyek Basis Data ke Pekan 9"]
        D5 --> D6["Melihat Dampak Penurunan: Cw Pekan 8 turun dari 4 ke 3, Pekan 9 tetap aman (Cw=2)"]
        D6 --> D7{"Keputusan Dosen"}
        D7 -- Klik 'Terapkan' --> D8["API PATCH /api/proposals/[id] (Action: ACCEPT)"]
        D8 --> D9["Jadwal Diperbarui & Beban Dihitung Ulang Otomatis"]
        D9 --> D10["Peta Beban Berubah Warna Menjadi Aman/Waspada"]
        D7 -- Klik 'Tolak' --> D11["Pertahankan Jadwal Asli"]
    end

    subgraph SkenarioB["Skenario B: Monitoring Evaluasi Materi Kuliah"]
        D12["Dosen Membuka Menu 'Analitik' (/analytics)"] --> D13["Pilih Mata Kuliah yang Diampu (Misal: IF2110)"]
        D13 --> D14["Melihat 4 KPI: Total Pertanyaan, Rasio Selesai, Waktu Respons Awal, Sub-topik Kritis"]
        D14 --> D15["Melihat Peringkat Hambatan Sub-topik (Misal: Normalisasi 3NF, B-Tree Indexing)"]
        D15 --> D16["Membaca Rekomendasi Sistem (Misal: Sediakan sesi asistensi tambahan sebelum ujian)"]
    end
```

---

### 2.3 Persona 3: Mahasiswa (Bantuan Belajar Sebaya Berbasis Sub-topik)
Tujuan: Memecahkan kebuntuan pengerjaan tugas tanpa canggung, menemukan teman sekelas yang paham, serta saling membantu secara asinkron maupun mikro-sesi.

```mermaid
flowchart TD
    subgraph Penanya["Alur Mahasiswa yang Mengalami Kendala (Requester)"]
        M1["Mengerjakan Tugas Kuliah (Misal: Tugas Basis Data Pekan 8)"] --> M2["Mengalami Kebuntuan pada Bagian 'B-Tree Indexing'"]
        M2 --> M3["Klik 'Minta Bantuan' di Pekan / Papan Bantuan (/help)"]
        M3 --> M4["Pilih Tugas & Pilih Tag Sub-topik '#B-Tree Indexing'"]
        M4 --> M5["Tuliskan Pertanyaan Ringkas & Spesifik"]
        M5 --> M6["Kirim Permintaan (POST /api/help-requests)"]
        M6 --> M7["Permintaan Tampil di Papan Kelas dengan Status 'Terbuka' (OPEN)"]
    end

    subgraph Penolong["Alur Rekan Sebaya yang Membantu (Helper)"]
        M7 --> H1["Teman Sekelas Membuka Papan Bantuan (/help)"]
        H1 --> H2["Melihat Pertanyaan dengan Tag '#B-Tree Indexing'"]
        H2 --> H3["Membuka Drawer Tanggapan"]
        H3 --> H4{"Pilih Kanal Bantuan yang Nyaman"}
        H4 -- Opsi 1: Tulisan --> H5["Ketik Penjelasan Langkah / Potongan Logika"]
        H4 -- Opsi 2: Rekaman --> H6["Cantumkan Tautan Rekaman Singkat (Loom/Drive/YouTube)"]
        H4 -- Opsi 3: Sesi 20 Mnt --> H7["Pilih Slot Tanggal & Waktu Sesi Diskusi 20 Menit"]
        H5 & H6 & H7 --> H8["Kirim Tanggapan (POST /api/help-requests/[id]/responses)"]
        H8 --> H9["Status Permintaan Berubah Menjadi 'Sedang Dibahas' (IN_PROGRESS)"]
        H9 --> H10["Waktu Respons Pertama (first_response_at) Otomatis Tercatat"]
    end

    subgraph Resolusi["Alur Siklus Penyelesaian (Resolution)"]
        H10 --> R1["Penanya Membaca / Menonton Penjelasan Rekan"]
        R1 --> R2{"Apakah Masalah Terpecahkan?"}
        R2 -- Ya --> R3["Klik 'Tandai selesai' (PATCH /api/help-requests/[id]/resolve)"]
        R3 --> R4["Status Menjadi 'Selesai' (RESOLVED) & resolved_at Tercatat"]
        R4 --> R5["Skor Tingkat Penyelesaian Kelas di Dasbor Analitik Meningkat"]
        R2 -- Belum --> R6["Beri Tanggapan Balik / Ikuti Sesi 20 Menit"]
    end
```

---

## 3. Sequence Diagram (Detail Interaksi Komponen & API)

### 3.1 Sequence 1: Ingesti Jadwal CSV & Rekalkulasi Peta Beban
Menunjukkan bagaimana file CSV diproses secara deterministik oleh server Next.js dan Prisma ORM.

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Prodi
    participant UI as Browser (CsvIngestionPage)
    participant Parser as csv-parser.ts (PapaParse + Zod)
    participant API as /api/import/csv (Route Handler)
    participant Calc as calculator.ts
    participant DB as Database (SQLite / Prisma)

    Admin->>UI: Unggah berkas CSV / Tempel teks CSV
    Admin->>UI: Klik tombol "Validasi skema"
    UI->>Parser: parseAndValidateCsv(csvText)
    Parser-->>UI: CsvValidationResult (validRows, invalidRows)
    
    alt Terdapat Baris Tidak Valid
        UI-->>Admin: Tampilkan daftar error per baris (Merah)
    else Seluruh Baris Valid
        UI-->>Admin: Pratinjau tugas valid (Hijau) & Tombol Simpan Aktif
        Admin->>UI: Klik "Simpan dan petakan jadwal"
        UI->>API: POST { csvContent }
        API->>DB: Ambil Program Aktif (semesterStartDate, totalWeeks)
        API->>DB: Truncate / Hapus Assignment lama prodi
        loop Setiap Baris Valid
            API->>Calc: calculateWeekNumber(dueDate, semesterStartDate)
            API->>DB: Course.upsert() & Assignment.create()
        end
        API->>DB: Ambil seluruh Assignment prodi
        API->>Calc: computeAllWeeklyMetrics(assignments, totalWeeks)
        Calc-->>API: Map<weekNumber, ComputedWeekMetric>
        loop Pekan 1 s/d 16
            API->>DB: WeeklyMetric.upsert(loadIndex, collisionCount, isFlagged)
        end
        API-->>UI: 200 OK { success: true, importedCount: N }
        UI-->>Admin: Tampilkan Toast Sukses & Arahkan ke Beranda
    end
```

---

### 3.2 Sequence 2: Solver Deterministik & Eksekusi Pergeseran Tanggal
Menunjukkan eksekusi algoritma *Minimal Date Move* tanpa AI/LLM.

```mermaid
sequenceDiagram
    autonumber
    actor Dosen as Dosen Pengampu
    participant Page as WeekInspectorPage (/weeks/[w])
    participant APIWeek as /api/weeks/[weekNumber]
    participant Calc as calculator.ts (findMinimalDateMoveCandidates)
    participant APIProp as /api/proposals/[id]
    participant DB as Database (Prisma)

    Dosen->>Page: Membuka Pekan Kritis (Contoh: Pekan 8)
    Page->>APIWeek: GET /api/weeks/8
    APIWeek->>DB: Ambil Assignment & WeeklyMetric Pekan 8
    APIWeek->>DB: Ambil seluruh Assignment semester
    APIWeek->>Calc: findMinimalDateMoveCandidates(assignments, targetWeek=8)
    Note over Calc: Evaluasi delta pekan [-1, +1, +2, -2]<br/>Cari move dengan C_target < 3 & C_w < 3
    Calc-->>APIWeek: Array DateMoveCandidate (diurutkan delta terkecil)
    APIWeek-->>Page: 200 OK { metric, assignments, candidates }
    Page-->>Dosen: Render tabel tugas + Panel Solver Usulan Pergeseran

    Dosen->>Page: Meninjau kandidat & Klik "Terapkan"
    Page->>APIProp: PATCH /api/proposals/[id] { action: "ACCEPT", candidate }
    APIProp->>DB: Assignment.update(dueDate = proposedDueDate, weekNumber = proposedWeek)
    APIProp->>DB: Ambil seluruh Assignment terupdate
    APIProp->>Calc: computeAllWeeklyMetrics(allAssignments)
    loop Pekan 1 s/d 16
        APIProp->>DB: WeeklyMetric.upsert(loadIndex, collisionCount, isFlagged)
    end
    APIProp-->>Page: 200 OK { success: true, message: "Proposal accepted" }
    Page-->>Dosen: Toast Sukses, Data Pekan Me-refresh, Status Cw Turun
```

---

### 3.3 Sequence 3: Siklus Hidup Permintaan Bantuan Sebaya (Peer Help Lifecycle)
Menunjukkan siklus penanganan kebuntuan belajar dari pembukaan hingga status *Resolved*.

```mermaid
sequenceDiagram
    autonumber
    actor Mhs1 as Mahasiswa (Penanya)
    actor Mhs2 as Teman Sekelas (Penolong)
    participant UI as PeerHelpBoardPage (/help)
    participant APIHelp as /api/help-requests
    participant APIResp as /api/help-requests/[id]/responses
    participant APIRes as /api/help-requests/[id]/resolve
    participant DB as Database (Prisma)

    Mhs1->>UI: Buka Modal Bantuan & Isi Sub-topik + Pertanyaan
    UI->>APIHelp: POST /api/help-requests { assignmentId, requesterId, subtopicLabel, questionDetail }
    APIHelp->>DB: HelpRequest.create(status: "OPEN", createdAt: now())
    APIHelp-->>UI: 201 Created { helpRequest }
    UI-->>Mhs1: Pertanyaan Terbit di Papan Kelas

    Mhs2->>UI: Membuka Papan Bantuan & Memilih Pertanyaan
    UI-->>Mhs2: Buka HelpResponseDrawer
    Mhs2->>UI: Pilih Tab (Tulisan / Rekaman / Sesi 20 Mnt) & Ketik Jawaban
    UI->>APIResp: POST /api/help-requests/[id]/responses { helperId, responseType, contentOrUrl, scheduledSlot }
    APIResp->>DB: HelpResponse.create(...)
    APIResp->>DB: Update HelpRequest (status: "IN_PROGRESS", firstResponseAt: now())
    APIResp-->>UI: 201 Created
    UI-->>Mhs2: Tanggapan Muncul di Thread

    Mhs1->>UI: Membuka Drawer & Mengonfirmasi Bantuan Berhasil
    Mhs1->>UI: Klik Tombol "Tandai selesai"
    UI->>APIRes: PATCH /api/help-requests/[id]/resolve
    APIRes->>DB: Update HelpRequest (status: "RESOLVED", resolvedAt: now())
    APIRes-->>UI: 200 OK
    UI-->>Mhs1: Lencana Berubah Hijau "Selesai" (RESOLVED)
```

---

## 4. State Machine Diagram

### 4.1 State Machine: Status Usulan Pergeseran Tanggal (Date Move Proposal)
```mermaid
stateDiagram-v2
    [*] --> PENDING: Dideteksi oleh Mesin Solver (Cw >= 3)
    PENDING --> ACCEPTED: Dosen Klik "Terapkan"
    PENDING --> REJECTED: Dosen Klik "Tolak"
    ACCEPTED --> [*]: Tanggal Tugas Diubah Permanen & Peta Beban Direkalkulasi
    REJECTED --> [*]: Jadwal Asli Dipertahankan
```

### 4.2 State Machine: Siklus Hidup Permintaan Bantuan (Help Request)
```mermaid
stateDiagram-v2
    [*] --> OPEN: Mahasiswa Membuat Tiket Bantuan Sub-topik
    OPEN --> OPEN_URGENT: Belum Direspon > 12 Jam (Needs Help Urgent)
    OPEN --> IN_PROGRESS: Teman Sekelas Mengirim Tanggapan Pertama
    OPEN_URGENT --> IN_PROGRESS: Teman Sekelas Mengirim Tanggapan Pertama
    IN_PROGRESS --> RESOLVED: Penanya / Penolong Klik "Tandai Selesai"
    RESOLVED --> [*]: Terhitung di KPI Tingkat Penyelesaian Dosen
```

---

## 5. Logika Matematis & Algoritma di Balik Alur

### 5.1 Perhitungan Beban dan Tabrakan (PRD 5.2)
* **Klasifikasi Tugas:**
  $$\text{is\_major}(a) = \begin{cases} \text{true}, & \text{jika } \text{weight\_score}(a) \ge 3 \\ \text{false}, & \text{jika } \text{weight\_score}(a) < 3 \end{cases}$$
* **Collision Count ($C_w$):** Menghitung jumlah mata kuliah unik yang memiliki tugas besar di pekan $w$:
  $$C_w = \left| \{ \text{course\_id} \mid \text{week\_number} = w \land \text{weight\_score} \ge 3 \} \right|$$
* **Load Index ($L_w$):** Akumulasi total bobot seluruh tugas di pekan $w$:
  $$L_w = \sum_{a \in A_w} \text{weight\_score}(a)$$
* **Status Zonasi Semantik:**
  * $C_w \ge 3 \implies$ **Kritis (*Flagged*)** (Merah Kirmizi, badge: `Kritis`)
  * $C_w = 2 \implies$ **Waspada (*Caution*)** (Kuning Emas, badge: `Waspada`)
  * $C_w \le 1 \implies$ **Aman (*Safe*)** (Hijau Zamrud, badge: `Aman`)

### 5.2 Algoritma Deterministik *Minimal Date Move*
Algoritma ini dijamin **100% deterministik, konsisten, dan bebas halusinasi (tanpa LLM)**:
1. **Identifikasi Masalah:** Jika $C_w < 3$, hentikan (pekan sudah seimbang).
2. **Filter Tugas Kandidat:** Ambil tugas besar ($\text{weight\_score} \ge 3$) di pekan $w$.
3. **Eksplorasi Tetangga:** Uji pergeseran hari/pekan dengan prioritas jarak terdekat:
   $$\Delta w \in \{-1, +1, +2, -2, +3, -3\}$$
4. **Validasi Invariant Keamanan (Safety Invariant):**
   * Pekan tujuan $w' = w + \Delta w$ **tidak boleh** menjadi kritis akibat pergeseran ($C_{w'} < 3$).
   * Pergeseran harus menurunkan tabrakan di pekan asal ($C_w^{\text{baru}} < C_w^{\text{lama}}$).
5. **Pengurutan Deterministik (Sorting Tier):**
   * Prioritas 1: Mampu menurunkan $C_w < 3$.
   * Prioritas 2: Jarak perpindahan terkecil ($|\Delta w|$ terkecil).
   * Prioritas 3: Penurunan bobot terbesar ($\text{loadReductionDelta}$).

---

## 6. Peta Rute Aplikasi & Hubungan Antar Layar

```mermaid
flowchart LR
    Root["/ (Dasbor Utama)"]
    Root --- Weeks["/weeks/[weekNumber]\n(Inspeksi Pekan & Solver)"]
    Root --- Help["/help\n(Papan Bantuan Sebaya)"]
    Root --- Analytics["/analytics\n(Dasbor Dosen)"]
    Root --- Import["/import\n(Ingesti Jadwal CSV)"]
    Root --- About["/about\n(Tentang & Riset STACK)"]

    Weeks -. Geser Tanggal .-> Root
    Weeks -. Minta Bantuan .-> Help
    Help -. Data Kendala .-> Analytics
    Import -. Hasil Kalkulasi .-> Root
```

| URL Rute | Komponen Utama | Peran Utama di Alur Sistem |
|---|---|---|
| `/` | `src/app/page.tsx`, `HeatMapGrid.tsx`, `WideWeekCard.tsx` | Menampilkan ringkasan semester, 2 pekan paling kritis, dan grid 16 pekan interaktif. |
| `/weeks/[weekNumber]` | `src/app/weeks/[weekNumber]/page.tsx`, `DateMoveSolver.tsx` | Carousel 16 pekan, rincian per-tugas, metrik bobot, dan eksekusi solver geser tanggal. |
| `/help` | `src/app/help/page.tsx`, `HelpResponseDrawer.tsx`, `HelpRequestModal.tsx` | Papan bantuan publik seluruh kelas, filter status kendala (>12 jam), dan formulir 3 kanal jawaban. |
| `/analytics` | `src/app/analytics/page.tsx` | Pelacakan metrik respon bantuan $< 24$ jam, peringkat sub-topik kendala, dan rekomendasi review untuk dosen. |
| `/import` | `src/app/import/page.tsx` | Antarmuka unggah CSV, verifikasi skema baris, eksekusi penyimpanan, dan tombol reset data demo 16 pekan. |
| `/about` | `src/app/about/page.tsx` | Dokumentasi kepatuhan PRD STACK 2026, hasil riset 53 mahasiswa & 3 dosen, profil tim, dan roadmap *Final Day*. |

---

## 7. Penanganan Kasus Khusus (Edge Cases Handling)

1. **Format Berkas CSV Rusak / Kurang Kolom:**
   * Ditangani oleh `parseAndValidateCsv` dengan Zod. Baris yang salah dipisahkan ke dalam `invalidRows` lengkap dengan nomor baris dan keterangan kesalahan spesifik (misal: format tanggal bukan `YYYY-MM-DD` atau bobot di luar rentang 1-5). Tombol simpan dinonaktifkan sampai CSV diperbaiki.
2. **Seluruh Pekan Tetangga Penuh ($C_{w \pm 1} \ge 2$):**
   * Algoritma *Minimal Date Move* otomatis memperluas radius pencarian ke $\Delta w = \pm 2$ atau $\pm 3$. Jika seluruh pekan tetap padat, sistem secara transparan menampilkan status bahwa pergeseran otomatis tidak dimungkinkan tanpa penyesuaian kalender prodi.
3. **Pertanyaan Mahasiswa Mengalami *Cold-Start* (> 12 Jam Tanpa Tanggapan):**
   * Sistem otomatis menghitung durasi `now() - created_at`. Jika berstatus `OPEN` dan $> 12$ jam, tiket diklasifikasikan sebagai `NEEDS_HELP_URGENT` dan ditempatkan pada filter prioritas atas dengan lencana merah *"Butuh bantuan (>12 jam)"*.
4. **Transparansi Fitur *Final Day*:**
   * Fitur yang disisakan untuk babak Final Day (ekstraksi PDF silabus, sinkronisasi otomatis Moodle, dan pencocokan jadwal kalender otomatis) diberi label jelas *"Segera"* / *"Planned for Final Day"* untuk menjaga integritas dan kepatuhan aturan kompetisi.

---

*Dokumen ini merupakan panduan resmi alur operasional dan teknis sistem Collision Week.*
