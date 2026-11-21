# Spesifikasi Redesign UI/UX: Collision Week

**Tujuan:** mengganti seluruh lapisan visual Collision Week agar meniru bahasa desain LMS "Trenning" pada 3 gambar referensi, dan menerjemahkan seluruh teks antarmuka ke Bahasa Indonesia.

**Status:** instruksi eksekusi. Dokumen ini adalah sumber kebenaran. Kalau ada bagian kode yang bertentangan dengan dokumen ini, kode yang salah.

**Target repo:** `E:\ProjectWebsitev2\CollisionWeek`

**Stack yang dipakai (jangan diganti):** Next.js 14 App Router, React 18, Tailwind CSS 3.4, `lucide-react`, `recharts`, `date-fns`, Prisma 5, SQLite.

**Referensi visual:** `image_177a3f.png` (dasbor My Learning), `image_fe3482.png` (shell rail + sidebar + grid kartu), `image_a22fc0.png` (modal Create new content).

---

## 0. Cara pakai dokumen ini

1. Baca bagian 2 (diagnosis) dulu supaya tahu apa yang harus dihapus, bukan cuma ditambah.
2. Terapkan bagian 4 (token) lebih dulu. Jangan sentuh komponen sebelum token beres, kalau tidak hasilnya tambal sulam.
3. Kerjakan bagian 9 (urutan eksekusi) dari atas ke bawah. Setiap langkah punya file target yang eksplisit.
4. Sebelum menyatakan selesai, jalankan checklist bagian 12. Kalau satu baris gagal, pekerjaan belum selesai.

---

## 1. Ringkasan keputusan (TL;DR)

| Aspek | Sekarang | Target |
|---|---|---|
| Aksen | 6 warna bersaing: ungu `#5850EC`, rose, amber, emerald, sky, slate-900 | 1 aksen ungu `#5850EC`. Warna semantik hanya di ring/titik/teks, tidak jadi badge penuh |
| Tombol | 3 gaya acak: hitam `slate-900`, ungu penuh, putih outline | 1 primer ungu, 1 sekunder outline, 1 ghost. Tombol hitam dihapus |
| Navigasi | Sidebar berisi 6 menu **dan** header berisi 6 tab yang sama | Sidebar = koleksi/favorit/proyek. Tab = halaman. Tidak duplikat |
| Tipografi | `text-[10px]` dan `text-[11px]` di 100+ tempat | Minimum 11px, body 13px, judul kartu 15px, judul halaman 20px |
| Kartu | Border ganda (border-t di dalam + footer ber-border), 5-6 badge per kartu | 1 hairline per kartu, maksimum 2 badge, 1 aksi |
| Status | Badge merah/kuning/hijau penuh + `animate-pulse` | Ring 32px + teks 12px. Tanpa pulse |
| Bahasa | Inggris campur jargon kompetisi di dalam produk | Bahasa Indonesia konsisten, jargon kompetisi dipindah ke /tentang |
| Nama internal | Kelas `.trenning-card`, komentar "Matching Image 1 & 2" | `.cw-card`, tanpa komentar referensi gambar |

---

## 2. Diagnosis: kenapa UI sekarang terasa slop

Ini daftar konkret, bukan opini. Setiap baris punya bukti di kode.

### 2.1 Warna bersaing (masalah terbesar)

Satu kartu pekan memuat sekaligus: badge ungu, badge rose `animate-pulse`, ring rose, tag abu, tombol `slate-900`. Halaman `/analytics` memakai rose + amber + ungu + emerald dalam satu layar. Di `/help` ada rose, amber, emerald, ungu, dan `slate-900` sekaligus.

**Akibat:** tidak ada satu pun elemen yang terbaca sebagai "yang penting di sini". Referensi hanya memakai ungu untuk aksi, hijau untuk progres, dan sisanya netral. Itu sebabnya referensi terlihat tenang walau padat.

**Bukti:** `src/components/HeatMapGrid.tsx` baris 262-286, `src/app/analytics/page.tsx` baris 108-145, `src/app/help/page.tsx` baris 148-190.

### 2.2 Tombol hitam yang tidak ada di referensi

Ada 21 kemunculan `bg-slate-900` sebagai tombol. Referensi tidak punya satu pun tombol hitam. Aksi sekunder di referensi selalu outline tipis, aksi primer ungu.

**Bukti:** `src/app/page.tsx` baris 143 dan 205 (`Inspect & Shift`), `src/app/import/page.tsx` baris 136 dan 197, `src/app/about/page.tsx` baris 80.

### 2.3 Navigasi ganda

`AppHeader` merender tab: Heat Map, Week Inspector, Peer Help, Analytics, Import, About. `Sidebar` merender menu yang sama persis ditambah daftar Courses. Pengguna melihat dua daftar tujuan yang identik, dan tidak jelas mana yang otoritatif.

**Bukti:** `src/components/AppHeader.tsx` baris 24-31 vs `src/components/Sidebar.tsx` baris 40-47.

### 2.4 Tipografi terlalu kecil dan terlalu banyak level

`text-[10px]` muncul 52 kali, `text-[11px]` 50 kali. Body copy utama di kartu 12px. Referensi memakai 13px untuk body, 15-17px untuk judul kartu, 20-24px untuk judul seksi. Hierarki sekarang dibangun dari ukuran mikro, bukan dari bobot dan warna.

### 2.5 Border dan shadow berlapis

Kartu punya `border` luar + `border-t` di dalam badan + footer dengan `border-t` lagi + `shadow` + `ring`. Referensi: satu border tipis, satu hairline sebelum footer, shadow hanya saat hover.

**Bukti:** `src/components/HeatMapGrid.tsx` baris 190-320, `src/app/page.tsx` baris 100-160.

### 2.6 Animasi tanpa alasan

`animate-pulse` dipakai di 8 tempat, termasuk badge status `C=4` dan tombol "Needs Peer Help". Pulse menyala terus tanpa henti. Di referensi, tidak ada elemen yang berdenyut. Animasi hanya dipakai untuk transisi hover dan masuknya modal.

### 2.7 Sisa-sisa penyalinan yang terlihat di kode

- Nama kelas CSS `.trenning-card` (nama produk referensi, bukan produk kita).
- Komentar `{/* 6-Tile Grid (Exact layout from Image 3) */}`, `{/* Card Thumbnail Banner with Illustration (Image 1 style) */}`, `{/* Matching Image 1 & 2 */}`.
- `Sidebar` masih menyimpan variabel `courses` dengan 6 kode matkul hardcoded padahal data sudah ada di API.
- `src/components/Navbar.tsx` (232 baris) dan `src/components/Footer.tsx` (91 baris) tidak di-import di mana pun. Dead code.

Semua ini dihapus. Penyalinan harus berhenti di level *bahasa visual*, bukan di level nama dan komentar.

### 2.8 Konten kompetisi bocor ke dalam produk

Banner `GDGoC ITB STACK 2026`, "Final Day Milestone #3: Export RPS Report", "Target: Semifinal Phase (Nov 2026)", "Team: daftar krna gratis" muncul di dalam antarmuka produk. Pengguna produk adalah dosen dan mahasiswa, bukan juri. Semua narasi kompetisi pindah ke `/tentang` saja.

**Bukti:** `src/app/analytics/page.tsx` baris 86-92, `src/app/import/page.tsx` baris 320-380, `src/components/Navbar.tsx` baris 60-75.

### 2.9 Semantik yang salah

`CircularProgressRing` selalu menampilkan `%`. Di `HeatMapGrid` dipakai untuk "Indeks Beban" yang satuannya poin, jadi tertulis `16%` padahal maksudnya 16 poin. Ring juga tidak punya label aksesibel.

**Bukti:** `src/components/CircularProgressRing.tsx` baris 41, dipakai di `HeatMapGrid.tsx` baris 275.

### 2.10 Tidak ada state fokus keyboard

Semua interaksi hanya punya `hover:` dan `active:`. Tidak ada `focus-visible:` di seluruh `src/`. Ini regresi aksesibilitas dan mudah diperbaiki.

### 2.11 Utilitas Tailwind v4 dipakai di proyek v3 (bug senyap)

Proyek memakai `tailwindcss ^3.4.14`, tetapi kode memakai kelas yang baru ada di Tailwind v4. Kelas-kelas ini **tidak menghasilkan CSS apa pun**, tanpa error, tanpa warning. Efeknya: 52 deklarasi gaya hilang diam-diam.

Bukti terukur (dibandingkan terhadap CSS hasil build di `.next/static/css/app/layout.css`):

| Kelas | Kemunculan di `src/` | Ada di CSS hasil build |
|---|---|---|
| `shadow-xs` | 28 | 0 |
| `outline-hidden` | 12 | 0 |
| `shadow-2xs` | 7 | 0 |
| `backdrop-blur-xs` | 5 | 0 |

Akibat yang bisa dilihat: semua `focus:outline-hidden` tidak menghilangkan outline, sehingga cincin fokus bawaan browser muncul acak di sebagian input saja. Semua `shadow-xs` pada tombol dan badge tidak berefek, jadi elevasi terlihat tidak konsisten antar elemen.

**Perbaikan:** ganti ke padanan v3 saat menulis ulang komponen.

| v4 | v3 |
|---|---|
| `shadow-xs` | `shadow-sm` |
| `shadow-2xs` | `shadow-none` atau hapus (token 4.3 sudah menetapkan shadow eksplisit) |
| `outline-hidden` | `focus:outline-none` |
| `backdrop-blur-xs` | `backdrop-blur-sm` |

---

## 3. Arah desain

**Design read:** ini produk SaaS internal untuk mahasiswa dan dosen di kampus, dengan bahasa visual netral-terang ala LMS modern (Trenning), mengarah ke Tailwind utility + token semantik + lucide dengan stroke seragam.

**Dial:**

- `DESIGN_VARIANCE: 3` (simetris, grid rapi, ini dasbor bukan landing page)
- `MOTION_INTENSITY: 3` (hanya transisi hover/fokus dan masuknya modal)
- `VISUAL_DENSITY: 6` (padat tapi lapang, 3-4 kolom kartu)

**Prinsip yang mengikat seluruh pekerjaan:**

1. **Satu aksen.** Ungu `#5850EC` hanya untuk aksi dan state aktif. Tidak untuk dekorasi.
2. **Warna semantik itu status, bukan hiasan.** Merah/kuning/hijau hanya muncul sebagai ring, titik 6px, atau teks 12px. Maksimum satu badge berwarna per kartu.
3. **Kartu mengelompokkan, hairline memisahkan.** Kalau dua blok bisa dipisah garis tipis, jangan pakai dua kartu.
4. **Ikon hanya kalau menggantikan kata.** Bukan hiasan di setiap label.
5. **Bahasa Indonesia di seluruh permukaan.** Tidak ada campuran Inggris-Indonesia dalam satu layar.

**Mode tema:** light saja. Referensi light-only, dan menambah dark mode di tengah hackathon akan memecah konsentrasi. Token tetap ditulis sebagai CSS variable supaya dark mode bisa ditambah nanti tanpa rewrite. Jangan ada seksi yang tiba-tiba gelap di tengah halaman.

---

## 4. Design token

Semua nilai di bawah masuk ke `tailwind.config.ts` dan `src/app/globals.css`. Tidak boleh ada hex mentah di dalam komponen (`style={{ backgroundColor: "#2563EB" }}` dihapus, diganti token).

### 4.1 Warna

```ts
// tailwind.config.ts -> theme.extend.colors
cw: {
  bg:        "#F7F8FA",  // latar aplikasi
  surface:   "#FFFFFF",  // kartu, sidebar, header
  subtle:    "#FAFBFC",  // strip footer kartu, input
  sunken:    "#F2F4F7",  // tag, chip non-aktif
  line:      "#ECEEF3",  // hairline & border standar
  "line-strong": "#DFE3EA",
  ink:       "#12141A",  // teks utama
  muted:     "#6B7280",  // teks sekunder
  faint:     "#9AA1AC",  // teks tersier, placeholder
  accent:    "#5850EC",  // SATU-SATUNYA aksen
  "accent-hover": "#4B41DE",
  "accent-soft":  "#EEF0FD",
  "accent-line":  "#DDE0FB",
}
```

Warna semantik (hanya untuk status, lihat aturan pemakaian di bawah):

```ts
semantic: {
  danger:  { fg: "#C0243B", soft: "#FDECEF", ring: "#E5484D" },
  warning: { fg: "#A05A00", soft: "#FDF3E3", ring: "#E9A23B" },
  success: { fg: "#17794A", soft: "#E9F7EF", ring: "#22A06B" },
}
```

**Aturan pemakaian warna semantik:**

- Diizinkan: `text-danger-fg` pada angka, `stroke` ring, titik 6px, border kiri 2px, satu badge soft.
- Dilarang: dua badge berwarna di satu kartu, latar kartu berwarna penuh, badge penuh (`bg-rose-600 text-white`), `animate-pulse`.

**Palet ilustrasi banner** (diambil dari sampel piksel referensi, jangan diganti warna lain):

| Nama | Latar gradien | Bentuk |
|---|---|---|
| `biru` | `#EAF4FB` → `#DCEBF8` | `#8ECBED`, `#5FA8D3` |
| `ungu` | `#F0EDFD` → `#E7E2FB` | `#B8A2F3`, `#8F76E0` |
| `pasir` | `#FBF2E3` → `#F7E9D2` | `#EECF96`, `#D9A85F` |
| `koral` | `#FDEDE7` → `#FBE2D8` | `#F2A68C`, `#E07A5F` |
| `mint` | `#E9F6F1` → `#DDF0E9` | `#8FD3B8`, `#5FB79A` |

Ilustrasi hanya boleh memakai satu palet per kartu, dan palet dipilih deterministik dari nomor pekan (mis. `palette = PALETTES[week % 5]`) supaya urutan kartu tidak acak warna.

### 4.2 Tipografi

Font: **Plus Jakarta Sans** lewat `next/font/google`, `display: "swap"`, variabel `--font-sans`. Alasan: geometris, ramah untuk teks Indonesia, dan bukan default Inter.

```ts
// layout.tsx
import { Plus_Jakarta_Sans } from "next/font/google";
const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
```

Skala (pakai kelas Tailwind, jangan nilai arbitrer):

| Peran | Kelas | Spesifikasi |
|---|---|---|
| Judul halaman | `text-xl font-semibold tracking-tight` | 20px / 28px, `text-cw-ink` |
| Judul seksi | `text-base font-semibold` | 16px / 24px |
| Judul kartu | `text-[15px] font-semibold leading-snug` | maksimum 2 baris, `line-clamp-2` |
| Body | `text-[13px] leading-relaxed` | `text-cw-muted` |
| Meta | `text-xs` | 12px, `text-cw-faint` |
| Badge/tag | `text-[11px] font-medium` | 11px, batas bawah mutlak |
| Angka metrik | `text-[22px] font-semibold tabular-nums` | pakai `tabular-nums` |

**Dilarang:** `text-[10px]`, `font-black`, `font-extrabold`, `uppercase tracking-wider` pada label yang bukan header tabel.

### 4.3 Radius, elevasi, border

| Elemen | Radius | Shadow |
|---|---|---|
| Kartu | `rounded-2xl` (16px) | `shadow-[0_1px_2px_rgba(18,20,26,0.04)]`, hover `shadow-[0_6px_20px_-6px_rgba(18,20,26,0.10)]` |
| Banner ilustrasi | `rounded-t-2xl` (sudut atas saja) | tidak ada |
| Tombol, input, select | `rounded-xl` (12px) | tidak ada |
| Pill filter, tag status | `rounded-full` | tidak ada |
| Tag kode matkul | `rounded-md` (6px) | tidak ada |
| Modal & drawer | `rounded-3xl` | `shadow-[0_24px_60px_-20px_rgba(18,20,26,0.28)]` |

Satu hairline `border-cw-line` per kartu, dipakai di antara badan kartu dan footer. Jangan pakai `border` luar **dan** `border-t` dalam sekaligus.

### 4.4 Spacing dan grid

- Padding halaman: `px-6 py-6` di desktop, `px-4 py-4` di mobile.
- Jarak antar seksi: `space-y-7` (28px).
- Gap grid kartu: `gap-5` (20px).
- Padding dalam kartu: `p-4` (16px).
- Lebar konten maksimum: `max-w-[1400px] mx-auto`.
- Grid kartu: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3` untuk kartu standar, `grid-cols-1 lg:grid-cols-2` untuk kartu lebar.

### 4.5 Ikon dan motion

- Satu keluarga: `lucide-react` (sudah dependency, jangan tambah library baru).
- `strokeWidth={1.75}` global. Ukuran 16px di dalam tombol, 18px di header, 20px di rail.
- Maksimum **satu** ikon per baris teks. Label seperti "Due Date" tidak perlu ikon.
- Transisi: `transition-colors duration-150` untuk hover, `transition-shadow duration-200` untuk kartu.
- Modal: `animate-scale-in` 180ms. Drawer: slide 220ms.
- Semua animasi dibungkus `@media (prefers-reduced-motion: reduce) { animation: none; transition: none; }`.
- **Hapus semua `animate-pulse`.**

---

## 5. Kerangka layout target

Tiga kolom horizontal: rail ikon, sidebar, kanvas.

```
┌────┬──────────────────────┬──────────────────────────────────────────────────────────┐
│ 64 │ 264                  │                                                          │
│ px │ px                   │  ┌────────────────────────────────────────────────────┐  │
│    │                      │  │ [ikon] Collision Week   (avatar)(avatar)(+)   Unggah  Buat Baru │
│ CW │  Ruang Akademik      │  ├────────────────────────────────────────────────────┤  │
│    │                      │  │ Dasbor   Pekan   Bantuan   Analitik   Impor   Tentang│  │
│ [] │  ▸ Dasbor            │  ├────────────────────────────────────────────────────┤  │
│ [] │  ▸ Pekan Kritis      │  │ [Semua Status ×]  Atur ulang   + Filter     Urutkan ▾ │ │
│ [] │  ▸ Bantuan Sebaya    │  │                                                      │  │
│ [] │  ▸ Analitik          │  │ 24 pekan            [ Cari pekan atau matkul... ]    │  │
│ [] │                      │  │                                                      │  │
│    │  FAVORIT        3    │  │  ┌────────┐ ┌────────┐ ┌────────┐                    │  │
│ [] │  Pekan 8             │  │  │ kartu  │ │ kartu  │ │ kartu  │                    │  │
│ [] │  Pekan 14            │  │  └────────┘ └────────┘ └────────┘                    │  │
│    │  Bantuan Saya        │  │                                                      │  │
│    │                      │  │                                    (?) tombol bantuan │  │
│ [+]│  PROYEK         6    │  │                                                      │  │
│ [] │  ● Teknik Informatika│  │                                                      │  │
│    │                      │  │                                                      │  │
│ () │  ┌────────────────┐  │  │                                                      │  │
│    │  │ Solver         │  │  │                                                      │  │
│    │  │ Deterministik  │  │  │                                                      │  │
│    │  │ [Jalankan →]   │  │  │                                                      │  │
│    │  └────────────────┘  │  │                                                      │  │
└────┴──────────────────────┴──────────────────────────────────────────────────────────┘
```

Pemetaan dari gambar referensi:

| Referensi | Padanan di Collision Week |
|---|---|
| Icon rail kiri (logo, home, search, inbox, video, people, history, folder; bawah: tombol ungu +, AI kuning, tugas, setelan, avatar) | Rail 64px: logo CW, Dasbor, Pekan, Bantuan, Analitik, Impor. Bawah: tombol ungu `+` (buka modal buat baru), Tentang, avatar |
| Sidebar "Learning Content" + Recents/Shared/Archived/Templates + Favorites + Projects + kartu promo AI | Sidebar "Ruang Akademik": tautan cepat, Favorit (pekan yang di-pin), Proyek (program studi), kartu promo "Solver Deterministik" |
| Header proyek: ikon persegi + nama + avatar group + tombol + ; kanan: Unggah (outline) + New Content (ungu) | Header: ikon persegi ungu + "Collision Week" + nama program + avatar dosen; kanan: "Unggah CSV" (outline) + "Buat Baru" (ungu) |
| Tab: Folder, Page, Course, Quiz, Assignment, Learning Path, Wiki | Tab: Dasbor, Pekan, Bantuan, Analitik, Impor, Tentang |
| Toolbar: chip filter aktif ×, Reset, Add Filter, kanan: sort + grid/list | Toolbar: chip status aktif ×, "Atur ulang", "+ Filter", kanan: "Urutkan: Pekan" + toggle grid/list |
| Baris "100 content" + Search | Baris "16 pekan" + input cari |
| Grid 3 kolom kartu berilustrasi + badge gelap + 2 ring KPI + tag + footer "Edited 2h ago • 10 Question" + "..." | Grid 3 kolom kartu pekan berilustrasi + badge gelap "Pekan 8" + 2 ring (Indeks Beban, Tabrakan) + tag kode matkul + footer "Diperbarui ..." + aksi |
| Tombol "?" melayang kanan bawah | Sama, membuka panel bantuan singkat (boleh dihapus kalau tidak ada isinya) |
| Modal "Create new content": grid 2×3 kartu, ikon berwarna, badge "AI Powered"/"SOON", tombol Batal | Modal "Buat baru": 2×3 kartu aksi (Minta bantuan, Geser tanggal, Impor CSV, Sesi 20 menit, Analitik, Atur ulang data) |

---

## 6. Spesifikasi komponen

### 6.1 Icon rail (`src/components/AppShell.tsx` + `Rail.tsx` baru)

- Lebar 64px, `bg-cw-surface`, `border-r border-cw-line`, `sticky top-0 h-dvh`.
- Atas: logo 32×32 `rounded-xl bg-cw-accent text-white` dengan teks `cw`, lalu 4-5 ikon nav. Item aktif: `bg-cw-sunken text-cw-ink` (bukan ungu penuh, mengikuti referensi).
- Bawah: tombol `+` 36×36 ungu (buka modal buat baru), ikon Tentang, avatar 32×32.
- Setiap tombol: `aria-label` berbahasa Indonesia, `title` sama, `focus-visible:ring-2`.
- Di bawah `lg` (1024px): rail disembunyikan, diganti tombol hamburger di header yang membuka sidebar sebagai drawer.

### 6.2 Sidebar (`src/components/Sidebar.tsx`, ditulis ulang)

- Lebar 264px, bisa diciutkan jadi 0 (`lg:` ke atas saja).
- Judul "Ruang Akademik" `text-base font-semibold`, di bawahnya satu baris konteks `text-xs text-cw-faint`: "Teknik Informatika · Semester Ganjil".
- Grup tautan (label grup `text-[11px] font-medium text-cw-faint`, tanpa ikon):
  - `Dasbor`, `Pekan Kritis` (dengan hitungan pekan bertabrakan), `Bantuan Sebaya`, `Analitik`, `Impor`.
- Grup **Favorit**: daftar pekan yang di-pin pengguna, dengan angka di kanan (mengikuti referensi: "Favorites 3"). Kalau kosong, tampilkan satu baris `text-xs text-cw-faint`: "Belum ada pekan yang di-pin".
- Grup **Proyek**: satu baris aktif dengan titik 6px ungu + nama program.
- Kartu promo di bawah: `rounded-2xl bg-cw-subtle border border-cw-line p-3`, judul "Solver Deterministik" `text-[13px] font-semibold`, satu kalimat 12px, tombol teks ungu "Jalankan →".
- **Daftar `courses` hardcoded di Sidebar dihapus.** Kalau perlu daftar matkul, ambil dari `/api/courses` dan tampilkan di halaman, bukan di sidebar.

### 6.3 Header (`src/components/AppHeader.tsx`)

- Tinggi total ≤ 108px (header 64px + tab 44px). `sticky top-0 z-20 bg-cw-surface/95 backdrop-blur`.
- Baris 1: ikon persegi 32×32 `rounded-lg bg-cw-accent-soft text-cw-accent` berisi inisial program, judul "Collision Week" `text-[15px] font-semibold`, subjudul `text-xs text-cw-faint`. Kanan: `Unggah CSV` (outline) + `Buat Baru` (primer ungu, ikon `Plus`).
- Baris 2: tab. Tab aktif: `text-cw-ink font-semibold` + `border-b-2 border-cw-accent`. Non-aktif: `text-cw-muted hover:text-cw-ink`.
- **Hapus** tombol "Solve Collisions" duplikat, ikon lonceng dengan titik merah, ikon pesan, dan search global di header. Search ada di toolbar konten, tempat ia dipakai.
- Pencarian global hanya boleh ada kalau benar-benar berfungsi. Kalau tidak, hapus (sekarang input tanpa handler).

### 6.4 Toolbar filter (`src/components/ContentToolbar.tsx` baru)

Satu baris, `flex items-center justify-between gap-3`:

- Kiri: pill status `Semua`, `Kritis`, `Waspada`, `Aman`. Pill aktif: `bg-cw-ink text-white`. Non-aktif: `bg-cw-surface border border-cw-line text-cw-muted`.
- Kalau filter non-default aktif, tampilkan chip `Pekan Kritis ×` dengan tombol hapus, plus tautan teks "Atur ulang".
- Kanan: select urutan (`Urutkan: Pekan` / `Urutkan: Beban`), lalu toggle grid/list (`rounded-lg border border-cw-line p-0.5`, item aktif `bg-cw-sunken`).

### 6.5 Kartu pekan (komponen utama, `src/components/WeekCard.tsx` baru)

Struktur, atas ke bawah:

```
┌───────────────────────────────────┐
│ banner ilustrasi 100% × 112px     │  ← pastel, rounded-t-2xl
│  [Pekan 8]            [Kritis]    │  ← badge gelap kiri, badge soft kanan (maks 1)
├───────────────────────────────────┤
│ Ujian Tengah Semester &           │  ← 15px semibold, line-clamp-2
│ Tenggat Proyek                    │
│                                   │
│ (ring 32) 18 poin   (ring 32) 4   │  ← 2 metrik, label 11px di bawah
│           Beban            Tabrakan│
│                                   │
│ [IF2110] [IF2120] [IF2150]        │  ← tag 11px, bg-cw-sunken, maks 3 + "+n"
├───────────────────────────────────┤  ← SATU hairline
│ Diperbarui 2 jam lalu    Lihat →  │  ← 12px faint + tombol outline 12px
└───────────────────────────────────┘
```

Aturan ketat:

- Banner: `PastelIllustration` dengan palet deterministik. Badge kiri-atas: `bg-cw-ink/78 text-white text-[11px] font-medium px-2 py-0.5 rounded-md backdrop-blur-sm`, isi `Pekan 8`.
- Badge kanan-atas hanya untuk status kritis: `bg-semantic-danger-soft text-semantic-danger-fg`, teks `Kritis`. Kalau aman, tidak ada badge sama sekali.
- Ring: komponen `MetricRing` (lihat 6.6). Ring kiri = Indeks Beban (warna `semantic.*.ring` sesuai status), ring kanan = Jumlah Tabrakan. **Angka di tengah ring, bukan persen.** Label di bawah ring, 11px, `text-cw-faint`.
- Tag: kode matkul, maksimum 3, sisanya `+3`. Jangan pakai warna per-matkul di sini (warna matkul hanya di halaman detail).
- Footer: `pt-3` setelah hairline, kiri teks meta, kanan tombol `Lihat` (outline) atau `Seimbangkan` (primer) hanya kalau kritis. Satu tombol saja, tidak ada pasangan.
- Hover: shadow naik, border jadi `cw-line-strong`, judul jadi `text-cw-accent`. Tanpa translasi/scale pada kartu.
- Seluruh kartu bisa diklik (`<Link>` membungkus kartu), tapi tombol di dalam tetap `<button>` yang menghentikan propagasi.

### 6.6 `MetricRing` (ganti `CircularProgressRing`)

```tsx
interface MetricRingProps {
  value: number;        // nilai mentah, mis. 18
  max: number;          // pembagi untuk busur, mis. 20
  label: string;        // "Beban"
  display?: string;     // teks di tengah, default String(value)
  tone: "neutral" | "success" | "warning" | "danger";
  size?: number;        // default 32
}
```

- SVG 32px, `strokeWidth 3`, track `#EDEFF3`, busur warna sesuai `tone`.
- Teks di tengah 11px `font-semibold tabular-nums`. Kalau `size < 40`, teks pindah ke samping ring.
- `role="img"` + `aria-label="Indeks beban 18 dari 20"`.
- `max` wajib dikirim eksplisit. Dilarang menampilkan `%` untuk nilai non-persentase.

### 6.7 Kartu lebar "Lanjutkan" (untuk dasbor, mengikuti gambar 1)

Dipakai di seksi teratas dasbor untuk 2 pekan paling kritis:

- Layout horizontal: banner 176×112 `rounded-xl` di kiri, konten fleksibel di kanan.
- Konten: label tipe dengan satu ikon (`Calendar` + "Pekan"), judul 15px 2 baris, bar progres 6px `bg-cw-sunken` dengan isi `semantic-success.ring` (hanya di sini bar progres diizinkan), tombol outline "Seimbangkan".
- Strip footer `bg-cw-subtle` `rounded-xl` di bawah: satu kalimat rekomendasi 12px + tautan ungu "Terapkan →".
- Di mobile: banner jadi `w-full h-28`, konten menumpuk.

### 6.8 Modal "Buat baru" (`src/components/CreateContentModal.tsx`)

Mengikuti gambar 3 secara struktur, bukan warna acak:

- Scrim `bg-cw-ink/40 backdrop-blur-[2px]`, kartu `max-w-[680px] rounded-3xl`.
- Header: judul "Buat baru" `text-base font-semibold` + tombol tutup `X` ghost.
- Grid `sm:grid-cols-2 gap-3`, 6 kartu. Setiap kartu: `rounded-2xl border border-cw-line p-4 hover:border-cw-accent-line hover:bg-cw-subtle`.
  - Baris atas: kotak ikon 32×32 `rounded-lg` dengan **satu** warna latar soft per kartu (dari palet ilustrasi, bukan 6 warna acak), judul 13px semibold.
  - Deskripsi 12px `text-cw-muted`, maksimum 2 baris.
  - Badge hanya kalau informatif: `Deterministik` (netral), `Segera` (netral, untuk fitur yang belum ada). Maksimum satu per kartu.
- Footer: `Batal` (ghost) di kanan. Tidak ada tombol primer karena setiap kartu adalah aksinya.
- Isi 6 kartu: `Minta bantuan sebaya`, `Geser tanggal`, `Impor CSV`, `Sesi 20 menit`, `Lihat analitik`, `Atur ulang data demo`.

### 6.9 Drawer bantuan (`src/components/HelpResponseDrawer.tsx`)

- Lebar `max-w-xl`, header `sticky` dengan judul tugas + baris meta (`text-xs text-cw-faint`: "Ditanyakan Budi · 2 jam lalu").
- Tab respons: `Tulisan`, `Rekaman`, `Sesi 20 menit` sebagai segmented control `bg-cw-sunken rounded-xl p-1`.
- Kotak pertanyaan: `rounded-xl border border-cw-line bg-cw-subtle p-4`, label "Kendala" 11px `text-cw-faint` (tanpa `uppercase tracking-wider`).
- Blok status: satu baris dengan titik status 6px + teks. Hapus banner hijau besar dan emoji.
- Semua string → Indonesia (lihat 8.2).

### 6.10 State kosong, loading, error

- **Skeleton:** bentuk harus meniru kartu akhir (banner 112px, 2 baris teks, ring). `animate-pulse` **hanya** di skeleton, tidak di elemen nyata.
- **Kosong:** ikon 20px `text-cw-faint`, satu judul 13px semibold, satu kalimat 12px, satu tombol aksi primer. Contoh: "Belum ada pekan pada filter ini" + "Atur ulang filter".
- **Error:** inline di dekat aksi, `rounded-xl border border-semantic-danger-soft bg-semantic-danger-soft/60 px-3 py-2 text-xs`. Tidak ada `alert()`.

**Wajib:** ganti semua `alert()` dan `confirm()` (13 kemunculan) dengan komponen `Toast` dan `ConfirmDialog` internal.

---

## 7. Peta halaman

### 7.1 `/` Dasbor

1. Header halaman: judul "Peta Beban Semester" + badge netral "16 pekan".
2. Seksi **Pekan Paling Padat**: 2 kartu lebar (6.7).
3. Seksi **Semua Pekan** dengan toolbar (6.4), baris hitungan + pencarian, lalu grid kartu (6.5).
4. Tidak ada KPI card row di sini. Metrik sudah ada di ring tiap kartu.

### 7.2 `/weeks/[weekNumber]`

- Breadcrumb `Dasbor / Pekan 8` 12px.
- Header: judul "Pekan 8" + status, kanan: pemilih pekan berbentuk deret angka 1-16 (kotak 28px, aktif ungu, kritis diberi titik 4px bukan latar merah penuh).
- Dua kolom `lg:grid-cols-12`: kiri `col-span-4` daftar tugas (baris, bukan kartu bertumpuk, item aktif `border-cw-accent-line bg-cw-accent-soft/40`), kanan `col-span-8` detail tugas + panel solver.
- Detail tugas: judul, meta 3 kolom (`Tenggat`, `Bobot`, `Pertanyaan`) dengan label 11px dan nilai 13px, lalu tag sub-topik.
- Panel solver (`DateMoveSolver.tsx`): daftar kandidat sebagai baris ber-hairline, bukan kartu di dalam kartu. Setiap baris: `IF2110 · Judul` / `Pekan 8 → Pekan 9` / `C = 4 → 3` / tombol `Terapkan` (primer) + `Tolak` (ghost).
- Ganti `—` dan `→` teks menjadi ikon `ArrowRight` 14px.

### 7.3 `/help`

- Judul "Bantuan Sebaya" + jumlah `text-xs text-cw-faint`.
- Toolbar: pill `Semua`, `Butuh bantuan`, `Sedang dibahas`, `Selesai` + select matkul + pencarian.
- Grid 3 kolom kartu: banner ilustrasi, badge gelap kode matkul, judul tugas, cuplikan pertanyaan 2 baris, baris meta (avatar 20px + nama + jumlah respons).
- Tanpa ring KPI di kartu bantuan (ring di sana tidak mengukur apa pun yang berguna).
- Klik kartu membuka drawer.

### 7.4 `/analytics`

- 4 metrik sebagai **baris tanpa kartu** dipisah hairline vertikal (mengikuti prinsip "jangan kartu kalau garis cukup"): Total pertanyaan, Tingkat selesai, Respons pertama rata-rata, Topik berisiko. Label 11px, angka 22px `tabular-nums`.
- Peringkat sub-topik: tabel/daftar ber-hairline. Kolom: peringkat, kode matkul, sub-topik, jumlah, tingkat selesai (ring 24px), rekomendasi (satu kalimat 12px, hanya muncul untuk baris kritis lewat disclosure).
- Hapus progress bar bertrack penuh; ganti ring atau angka.
- Hapus badge "Final Day Milestone #3".

### 7.5 `/import`

- Dua kolom `lg:grid-cols-2`: kiri editor CSV (textarea `font-mono text-xs`), kanan inspektur validasi.
- Tombol aksi: `Unduh templat` (ghost), `Validasi skema` (outline), `Simpan & hitung` (primer, disabled sampai valid).
- Ringkasan validasi: 3 angka dengan hairline, bukan 3 kotak berwarna.
- Daftar error: baris `text-xs` dengan nomor baris monospace, warna teks danger. Tanpa kotak merah bertumpuk.
- Seksi "Rencana rilis final" (PDF parser, LMS sync) **dipindah ke `/tentang`**. Halaman impor hanya berisi fitur yang berfungsi.

### 7.6 `/about`

Satu-satunya tempat narasi kompetisi boleh muncul. Struktur: judul, paragraf ringkas, 4 angka survei dalam grid 2×2 dengan angka 24px, daftar tim (baris, bukan kartu), deklarasi determinisme, tautan repo. Tanpa `trenning-card` bertumpuk.

---

## 8. Terjemahan ke Bahasa Indonesia

### 8.1 Glosarium (wajib konsisten di seluruh aplikasi)

| Inggris | Indonesia | Catatan |
|---|---|---|
| Collision Week | Collision Week | nama produk, jangan diterjemahkan |
| Heat map | Peta beban | |
| Week | Pekan | "Pekan 8", bukan "Minggu ke-8" |
| Assignment | Tugas | |
| Sub-topic | Sub-topik | |
| Peer help | Bantuan sebaya | |
| Crunch week / collision week | Pekan padat / pekan bertabrakan | |
| Load index | Indeks beban | satuan "poin" |
| Collision count (Cw) | Jumlah tabrakan (Cw) | notasi `Cw` dipertahankan |
| Major assignment | Tugas besar | bobot ≥ 3 |
| Weight score | Bobot | "Bobot 4/5" |
| Due date | Tenggat | |
| Date move | Pergeseran tanggal | |
| Solver | Solver | istilah teknis, jangan diterjemahkan |
| Deterministic | Deterministik | |
| Lecturer | Dosen | |
| Dashboard | Dasbor | |
| Analytics | Analitik | |
| Import / upload | Impor / unggah | |
| About | Tentang | |
| Draft | Draf | |
| Search | Cari | placeholder: "Cari pekan atau matkul" |
| Filter | Filter | "Tambah filter", "Atur ulang" |
| Sort by | Urutkan | |
| Reset | Atur ulang | |
| Cancel | Batal | |
| Save | Simpan | |
| View | Lihat | |
| Continue | Lanjutkan | |
| Start | Mulai | |
| Resolved | Selesai | |
| In progress | Sedang dibahas | |
| Open | Terbuka | |
| Needs help (>12h) | Butuh bantuan (>12 jam) | |
| Response | Tanggapan | |
| Requester / helper | Penanya / penolong | |
| Blocker | Kendala | |
| Resolution rate | Tingkat penyelesaian | |
| First response | Respons pertama | |

### 8.2 Tabel string per file

**`src/app/layout.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| `Collision Week \| Academic Load Balancing & Sub-topic Peer Help` | `Collision Week \| Penyeimbang Beban Tugas & Bantuan Sebaya` |
| `Deterministic academic load balancing...` | `Penyeimbang beban tugas akademik dan bantuan sebaya berbasis sub-topik untuk program studi.` |
| `<html lang="en">` | `<html lang="id">` |

**`src/components/AppHeader.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| Heat Map | Dasbor |
| Week Inspector | Pekan |
| Peer Help | Bantuan |
| Analytics | Analitik |
| Import | Impor |
| About | Tentang |
| Solve Collisions | Seimbangkan |
| Upload | Unggah CSV |
| New Action | Buat baru |
| `Search assignments, sub-topics...` | (dihapus dari header) |

**`src/components/Sidebar.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| Semester Heat Map | Peta Beban |
| Week Inspector | Pekan Kritis |
| Peer Help Board | Bantuan Sebaya |
| Lecturer Analytics | Analitik Dosen |
| Schedule Ingestion | Impor Jadwal |
| About & Team | Tentang & Tim |
| Courses (6) | (dihapus, pindah ke halaman) |
| Deterministic Solver | Solver Deterministik |
| `Calculates minimal date shifts...` | `Menghitung pergeseran tanggal terkecil untuk menurunkan puncak beban tanpa tabrakan baru.` |
| Solve Collisions | Jalankan → |
| Switch Persona (Demo) | Ganti peran (demo) |
| GDGoC ITB STACK 2026 · Case 1... | (dihapus, pindah ke /tentang) |

**`src/app/page.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| Critical Crunch Weeks | Pekan Paling Padat |
| `{n} Flagged` | `{n} pekan kritis` |
| Launch Solver | Buka solver |
| All Academic Weeks | Semua Pekan |
| `16 Weeks` | `16 pekan` |
| Load Density | Indeks beban |
| `16 pts — Critical` | `16 poin · kritis` |
| High student load clustering | Beban mahasiswa menumpuk |
| Pre-final submissions clash | Tenggat pra-ujian akhir bertabrakan |
| Inspect & Shift | Seimbangkan |
| `Optimal: Shift Database Project to Week 9 to reduce C to 3` | `Optimal: geser Proyek Basis Data ke Pekan 9 agar Cw turun ke 3` |
| Apply → | Terapkan → |
| Midterm Collision (Cw = 4) | Tabrakan UTS (Cw = 4) |
| Pre-Final Collision (Cw = 3) | Tabrakan pra-UAS (Cw = 3) |
| Midterm Examination & Major Project Crunch | Ujian Tengah Semester & Tenggat Proyek Besar |
| End-of-Semester Project Milestones Crunch | Tenggat Proyek Akhir Semester |

**`src/components/HeatMapGrid.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| All Status (16) | Semua (16) |
| Collision Weeks (≥3) | Kritis (≥3) |
| Caution (2) | Waspada (2) |
| Safe (≤1) | Aman (≤1) |
| `Search weeks...` | `Cari pekan atau matkul` |
| Midterm Week | Pekan UTS |
| Final Exam | Ujian akhir |
| Collision / Caution / Safe | Kritis / Waspada / Aman |
| `Semester Week {n} Academic Schedule` | `Jadwal Pekan {n}` |
| Load Index | Beban |
| Major Tasks | Tugas besar |
| `{n} Course(s)` | `{n} matkul` |
| High clustering / Balanced load | Menumpuk / Seimbang |
| Solve / View | Seimbangkan / Lihat |
| Collisions | Tabrakan |
| Inspect | Buka |

**`src/app/weeks/[weekNumber]/page.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| `Week {n} Academic Schedule` | `Pekan {n}` |
| `Collision Crunch (Cw = 4)` | `Pekan bertabrakan (Cw = 4)` |
| `{n} Assignments • Load Index: 16 pts` | `{n} tugas · indeks beban 16 poin` |
| Assignments Due (4) | Tugas jatuh tempo (4) |
| + Ask Help | + Minta bantuan |
| `Weight: 4/5` | `Bobot 4/5` |
| `Due: 12 Nov 2026 • 4 sub-topics` | `Tenggat 12 Nov 2026 · 4 sub-topik` |
| Collision Crunch Active | Pekan ini bertabrakan |
| Due Date | Tenggat |
| Weight Score | Bobot |
| Peer Help Density | Pertanyaan bantuan |
| `{n} Questions Asked` | `{n} pertanyaan` |
| Structured Sub-topic Tags | Sub-topik |
| Ask Sub-topic Help | Minta bantuan sub-topik |

**`src/components/DateMoveSolver.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| Deterministic Minimal Date Move Engine | Mesin pergeseran tanggal minimal |
| `Mathematical heuristic solver: evaluates...` | `Menilai pekan tetangga (w-1, w+1, w+2) untuk mencari pergeseran terkecil yang menurunkan tabrakan di bawah 3 tanpa memicu tabrakan baru.` |
| `Current Week 8:` | `Pekan 8 saat ini:` |
| Rank #1 Optimal Shift | Paling optimal |
| Approve & Shift Date | Terapkan |
| Decline | Tolak |
| `No date shift required...` | `Tidak perlu pergeseran tanggal.` |
| `Processing...` | `Memproses...` |
| `Load: -4 pts` | `Beban -4 poin` |

**`src/components/DeterministicSolverModal.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| Deterministic Minimal Date Move Solver | Solver pergeseran tanggal |
| `100% deterministic heuristic...` | `Heuristik deterministik: menyeimbangkan tenggat yang bertabrakan tanpa memicu tabrakan baru.` |
| Minimal Date Moves | Pergeseran minimal |
| Load Delta Simulation | Simulasi selisih beban |
| Multi-Scenario What-If | Skenario ganda |
| `Target Crunch Week to Balance:` | `Pekan yang ingin diseimbangkan:` |
| Week 8 (Midterms) | Pekan 8 (UTS) |
| Week 14 (Pre-Finals) | Pekan 14 (pra-UAS) |
| `C = 4 Clashing` | `Cw = 4` |
| Heuristic Constraint Level | Tingkat batasan |
| Strict (C < 3 Required) | Ketat (Cw < 3) |
| Minimal Shift (+1 week) | Geser 1 pekan |
| Max Load Delta | Selisih beban maksimum |
| Recommended Date Move Solutions | Usulan pergeseran |
| `Computing minimal moves...` | `Menghitung pergeseran...` |
| `No candidates found for this week.` | `Tidak ada usulan untuk pekan ini.` |
| Alternative | Alternatif |
| `Zero AI hallucination • 100% Deterministic heuristic calculation` | `Perhitungan heuristik deterministik, tanpa model bahasa.` |
| Close | Tutup |

**`src/components/CreateContentModal.tsx`** (judul modal: "Buat baru")

| Sekarang | Ganti jadi |
|---|---|
| Create new content & actions | Buat baru |
| Sub-topic Peer Help | Minta bantuan sebaya |
| `Ask a specific question...` | `Ajukan pertanyaan spesifik pada satu sub-topik tugas.` |
| Deterministic Date Move | Geser tanggal |
| `Execute mathematical heuristic solver...` | `Jalankan solver untuk menyeimbangkan pekan padat.` |
| CSV Schedule Ingestion | Impor CSV |
| `Upload academic assignment deadlines...` | `Unggah tenggat tugas untuk memetakan 16 pekan.` |
| 20-Min Micro-Session | Sesi 20 menit |
| `Offer or request an interactive...` | `Buka atau ikuti sesi diskusi 20 menit.` |
| Lecturer Bottlenecks | Lihat analitik |
| `Analyze sub-topic friction density...` | `Lihat sub-topik dengan kendala terbanyak.` |
| Reset Synthetic Data | Atur ulang data |
| `Restore the full 16-week...` | `Kembalikan data demo 16 pekan.` |
| Most Used / Deterministic / Layer 1 / Peer Help / Pedagogy / Demo Kit | (dihapus atau diganti `Deterministik` / `Segera` saja) |
| Cancel | Batal |

**`src/components/HelpRequestModal.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| Request Sub-topic Peer Help | Minta bantuan sub-topik |
| `Post your specific blocker...` | `Tuliskan kendala spesifikmu agar dibaca seluruh kelas.` |
| Whole-Class Visibility: | Terlihat seluruh kelas: |
| `Automatically published to all enrolled peers...` | `Otomatis tampil untuk semua mahasiswa di matkul ini.` |
| Select Assignment: | Pilih tugas |
| Select Sub-topic Tag: | Pilih sub-topik |
| Click a tag below | Pilih salah satu |
| `Or type custom sub-topic tag...` | `Atau tulis sub-topik sendiri` |
| Describe your question or blocker: | Jelaskan kendalamu |
| `Please select an assignment.` | `Pilih tugas terlebih dahulu.` |
| `Please select or specify a sub-topic tag.` | `Pilih atau tulis sub-topik.` |
| `Please describe your academic blocker in at least 15 characters.` | `Jelaskan kendala minimal 15 karakter.` |
| Cancel / Post Help Request | Batal / Kirim permintaan |
| `Publishing...` | `Mengirim...` |

**`src/app/help/page.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| Sub-topic Peer Help Board | Bantuan Sebaya |
| `{n} Questions Active` | `{n} pertanyaan` |
| `Class-wide peer unblocking across specific...` | `Bantuan dari teman sekelas untuk sub-topik tertentu, lewat tulisan, rekaman, atau sesi 20 menit.` |
| Ask for Peer Help | Minta bantuan |
| All Questions (n) | Semua (n) |
| Needs Peer Help (>12h) (n) | Butuh bantuan (>12 jam) |
| In Discussion (n) | Sedang dibahas (n) |
| Resolved (n) | Selesai (n) |
| All Courses | Semua matkul |
| `Search #subtopic...` | `Cari sub-topik` |
| `No help requests found matching filter.` | `Belum ada permintaan pada filter ini.` |
| `Be the first to ask a question on your assignments!` | `Jadilah yang pertama bertanya.` |
| View Thread | Buka |
| `{n} response(s)` | `{n} tanggapan` |
| In Progress / Open | Sedang dibahas / Terbuka |

**`src/components/HelpResponseDrawer.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| Blocker Description | Kendala |
| `Asked by X • date` | `Ditanyakan X · date` |
| `Problem Successfully Resolved 🎉` | `Kendala selesai` (emoji dihapus) |
| Ready to close this question? | Tandai selesai? |
| Mark as Resolved | Tandai selesai |
| `Both requester and helper can mark...` | `Penanya dan penolong sama-sama bisa menandai selesai.` |
| `No peer responses yet.` | `Belum ada tanggapan.` |
| `Propose a 20-Minute Focus Slot:` | `Usulkan sesi 20 menit:` |
| `Meeting link (Google Meet / Zoom) or notes...` | `Tautan rapat (Meet/Zoom) atau catatan` |
| `Paste Loom / Google Drive / YouTube recording URL...` | `Tempel tautan rekaman (Loom, Drive, YouTube)` |
| `Provide your solution explanation...` | `Tulis penjelasan atau langkah penyelesaian` |
| `Short description / timestamp notes (optional)...` | `Catatan singkat (opsional)` |
| Submit Response | Kirim tanggapan |
| `Failed to mark as resolved.` | `Gagal menandai selesai.` |
| `Network error sending response.` | `Koneksi gagal saat mengirim tanggapan.` |
| WRITTEN / RECORDED_LINK / SESSION_20MIN | Tulisan / Rekaman / Sesi 20 menit |

**`src/app/analytics/page.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| Academic Sub-topic Friction Analytics | Analitik Sub-topik |
| Lecturer Insights (US-08) | Untuk dosen |
| `Evaluates which assignment sub-topics cause the highest friction...` | `Menunjukkan sub-topik tugas yang paling sering menjadi kendala, untuk menentukan sesi review dan pengaturan tenggat.` |
| Final Day Milestone #3: Export RPS Report | (dihapus) |
| Total Questions | Total pertanyaan |
| Tracked across 6 courses | Dari 6 matkul |
| Resolution Rate | Tingkat penyelesaian |
| `{n} resolved by peers` | `{n} selesai lewat bantuan sebaya` |
| Avg First Response | Respons pertama |
| Target SLA: < 24h | Target < 24 jam |
| High Friction Topics | Topik berisiko |
| Pedagogical review recommended | Perlu sesi review |
| Sub-topic Inquiry Density Ranking | Peringkat sub-topik |
| `Ranked by student question volume...` | `Diurutkan dari jumlah pertanyaan. Sub-topik dengan tingkat selesai di bawah 60% ditandai.` |
| High Friction | Berisiko |
| Pedagogical Recommendation: | Saran: |
| Inquiries | Pertanyaan |
| Resolved | Selesai |

**`src/app/import/page.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| Schedule Ingestion & Calendar Config | Impor Jadwal |
| Layer 1 (US-01) | (dihapus) |
| `Upload departmental CSV assignment spreadsheets...` | `Unggah CSV tenggat tugas. Sistem memetakan tanggal ke pekan 1-16 dan menghitung tabrakan.` |
| Sample Template | Unduh templat |
| Reset Demo | Atur ulang data |
| `Successfully imported {n} assignments!` | `{n} tugas berhasil diimpor.` |
| CSV Input & File Upload | Berkas CSV |
| `Select local .csv file:` | `Pilih berkas .csv` |
| `Or paste / edit CSV text directly:` | `Atau tempel dan sunting langsung` |
| Validate Schema | Validasi skema |
| `Commit & Calculate Heat Map` | `Simpan & hitung` |
| Validation Inspector | Hasil validasi |
| Not validated yet | Belum divalidasi |
| Valid (100%) / Errors Found | Valid / Ada kesalahan |
| Total Rows / Valid / Invalid | Baris / Valid / Bermasalah |
| Line Errors: | Kesalahan per baris |
| `Row #3 Error:` | `Baris 3:` |
| Valid Assignments Preview: | Pratinjau tugas |
| `Click "Validate Schema" to preview rows...` | `Klik "Validasi skema" untuk melihat pratinjau.` |
| PDF Syllabus Text & Deadline Parser | (pindah ke /tentang) |
| Moodle / Google Classroom Direct Ingestion | (pindah ke /tentang) |
| Planned for Final Day | Segera |
| Final Day Milestone #1 | (pindah ke /tentang) |

**`src/app/about/page.tsx`**

| Sekarang | Ganti jadi |
|---|---|
| About Collision Week & Team | Tentang |
| STACK 2026 Entry | Peserta STACK 2026 |
| Case 1: Smarter Campus and Learning • Team "daftar krna gratis" | `Case 1: Smarter Campus and Learning · Tim "daftar krna gratis"` |
| GitHub Repository | Repositori GitHub |
| Survey of 53 University Students Across 48 Study Programs | Survei 53 mahasiswa dari 48 program studi |
| `Empirical validation conducted November 2026...` | `Validasi lapangan, November 2026, tentang kebutuhan penyeimbangan beban dan bantuan sebaya.` |
| Multi-Course Clustering | Tugas menumpuk lintas matkul |
| Extreme Collision | Tabrakan ekstrem |
| Severe Sleep Deprivation | Kurang tidur berat |
| Knowledge Asymmetry | Tidak tahu siapa yang menguasai |
| Lecturer Validation: | Validasi dosen: |
| Competition Transparency & Determinism Declaration | Deklarasi determinisme |
| Explore 16-Week Heat Map | Buka peta beban |

### 8.3 Yang tidak diterjemahkan

- Nama produk `Collision Week`.
- Notasi matematis `Cw`, `C = 4`, `w-1`, `w+1`.
- Kode matkul `IF2110` dst.
- Nama orang, nama tim, nama program studi berbahasa Inggris pada data.
- Istilah teknis pada data: `3NF Normalization`, `B-Tree Indexing`, `Master Theorem`, `fork() System Call`. Ini judul topik akademik, menerjemahkannya akan merusak istilah.
- Nama variabel, tipe, dan komentar kode. Kode tetap berbahasa Inggris.

### 8.4 Data demo (`scripts/seed.mjs`)

Nama matkul diterjemahkan, judul tugas dan sub-topik dibiarkan:

| Sekarang | Ganti jadi |
|---|---|
| Database Systems | Sistem Basis Data |
| Software Engineering | Rekayasa Perangkat Lunak |
| Computer Networks | Jaringan Komputer |
| Design & Analysis of Algorithms | Desain & Analisis Algoritma |
| Operating Systems | Sistem Operasi |
| Artificial Intelligence | Kecerdasan Buatan |
| Informatics Engineering (Teknik Informatika) | Teknik Informatika |

Nama dosen dan mahasiswa sudah Indonesia, tidak perlu diubah. Setelah mengubah seed: `pnpm prisma:seed` lalu `POST /api/seed`.

---

## 9. Urutan eksekusi

Kerjakan berurutan. Jangan lompat.

**Langkah 1 - Fondasi token**

- `tailwind.config.ts`: ganti blok `colors` dengan token `cw` + `semantic` dari 4.1. Hapus `trenning` dan `collision`.
- `src/app/globals.css`: tulis ulang. Hapus `.trenning-card`, `.cw-btn-primary`, `.cw-btn-ghost`. Sisakan `@tailwind` directives, reset, scrollbar 8px `#D6DAE1`, dan utilitas `.cw-card`, `.cw-hairline`, `.animate-scale-in`, plus blok `prefers-reduced-motion`.
- `src/app/layout.tsx`: pasang `Plus_Jakarta_Sans`, `lang="id"`, metadata Indonesia, `bg-cw-bg text-cw-ink font-sans`.
- Verifikasi: `pnpm build` harus lolos sebelum lanjut. Kalau ada kelas `trenning-*` yang tersisa, build tetap lolos tapi tampilan rusak. Cek dengan `grep -rn "trenning" src` harus kosong.

**Langkah 2 - Hapus dead code**

- Hapus `src/components/Navbar.tsx` dan `src/components/Footer.tsx` (tidak di-import di mana pun). Konfirmasi dulu: `grep -rn "from \"@/components/Navbar\"\|from \"@/components/Footer\"" src`.
- Hapus komentar yang menyebut gambar referensi (`Matching Image`, `Exact layout from Image`, `Image 1 style`). Cari dengan `grep -rn "Image [0-9]" src`.

**Langkah 3 - Primitif komponen**

Buat `src/components/ui/`:

- `Button.tsx` (`variant: primary | outline | ghost`, `size: sm | md`, `focus-visible:ring-2 ring-cw-accent/40 ring-offset-2`).
- `Tag.tsx`, `Badge.tsx`, `Pill.tsx`.
- `MetricRing.tsx` (6.6).
- `Field.tsx` (label di atas, helper di bawah, error di bawah, `htmlFor` wajib).
- `Modal.tsx` (scrim + fokus trap + `Escape`).
- `ConfirmDialog.tsx`, `Toast.tsx` untuk menggantikan `alert()`/`confirm()`.
- `EmptyState.tsx`, `Skeleton.tsx`.

**Langkah 4 - Shell**

- `AppShell.tsx`: rail + sidebar + kanvas. Tambah `Rail.tsx`. Sidebar ditulis ulang (6.2). Header ditulis ulang (6.3). Buat `ContentToolbar.tsx`.

**Langkah 5 - Kartu dan ilustrasi**

- `WeekCard.tsx` (6.5), `WideWeekCard.tsx` (6.7).
- `PastelIllustrations.tsx`: sisakan 4 tipe (`laptop`, `notebook`, `analytics`, `document`), hapus `palette`, `collaboration`, `mobile`, `code`, dan ganti palet ke 4.1. Tambah prop `palette` supaya bisa dipilih deterministik.
- `HeatMapGrid.tsx` ditulis ulang memakai `WeekCard`.

**Langkah 6 - Halaman**

Urutan: `/` → `/weeks/[weekNumber]` → `/help` → `/analytics` → `/import` → `/about`. Terapkan struktur 7.1-7.6 dan string 8.2.

**Langkah 7 - Modal dan drawer**

`CreateContentModal`, `HelpRequestModal`, `DeterministicSolverModal`, `HelpResponseDrawer` memakai `Modal`/`Button` baru dan string Indonesia.

**Langkah 8 - Terjemahan data**

`scripts/seed.mjs` (8.4), lalu seed ulang.

**Langkah 9 - Sapu bersih**

```bash
grep -rn "text-\[10px\]" src          # harus 0
grep -rn "animate-pulse" src          # hanya boleh di Skeleton.tsx
grep -rn "bg-slate-900" src           # harus 0
grep -rn "trenning" src               # harus 0
grep -rn "alert(\|confirm(" src       # harus 0
grep -rn "bg-rose-\|bg-amber-\|bg-emerald-" src  # harus 0 (pakai token semantic)
grep -rn "style={{" src               # hanya boleh untuk lebar progres/ring
grep -rn "font-black\|font-extrabold" src        # harus 0
grep -rn ">•" src                     # harus 0
grep -rn "shadow-xs\|shadow-2xs\|outline-hidden\|backdrop-blur-xs" src  # harus 0 (Tailwind v4)
```

**Langkah 9b - Verifikasi CSS benar-benar terbentuk**

Grep saja tidak cukup: kesalahan seperti 2.11 lolos dari grep. Setelah `pnpm build`, pastikan kelas baru yang dipakai benar-benar ada di CSS hasil build.

```bash
pnpm build
F=$(find .next/static/css -name "*.css" | head -1)
for c in "cw-card" "bg-cw-accent" "text-cw-muted" "rounded-2xl" "tabular-nums"; do
  printf "%-18s %s\n" "$c" "$(grep -o "$c" "$F" | wc -l)"
done
```

Semua baris harus > 0. Kalau ada yang 0, kelas itu ditulis salah atau tidak ada di Tailwind v3.

**Langkah 10 - Verifikasi visual**

Jalankan `pnpm dev`, buka keenam rute, bandingkan dengan referensi. Lihat bagian 12.

---

## 10. Larangan (anti-slop)

Kalau salah satu muncul di hasil akhir, pekerjaan dianggap gagal.

1. **Jangan pakai lebih dari satu aksen.** Ungu `#5850EC` untuk aksi dan state aktif saja.
2. **Jangan pakai tombol hitam** (`bg-slate-900`, `bg-cw-ink`) sebagai CTA.
3. **Jangan `animate-pulse` di elemen nyata.** Hanya di skeleton.
4. **Jangan dua badge berwarna dalam satu kartu.**
5. **Jangan `text-[10px]`.** Batas bawah 11px.
6. **Jangan `font-black` / `font-extrabold`.** Maksimum `font-semibold`.
7. **Jangan border ganda.** Satu border luar, satu hairline sebelum footer, tidak lebih.
8. **Jangan ikon di setiap label.** Maksimum satu ikon per baris.
9. **Jangan navigasi duplikat.** Sidebar ≠ tab. Kalau sebuah tautan ada di tab, jangan ulangi di sidebar.
10. **Jangan hex mentah di komponen.** Semua lewat token.
11. **Jangan bullet `•` sebagai pemisah default.** Maksimum satu per baris meta, dan lebih baik pakai hairline atau kolom.
12. **Jangan jargon kompetisi di dalam produk.** Hanya di `/tentang`.
13. **Jangan `alert()` atau `confirm()` bawaan browser.**
14. **Jangan progress bar bertrack penuh** untuk perbandingan data. Pakai ring atau angka.
15. **Jangan `uppercase tracking-wider`** untuk label biasa. Hanya untuk header tabel.
16. **Jangan teks Inggris di tengah kalimat Indonesia.** Konsisten satu bahasa.
17. **Jangan gradient ungu di kartu, tombol, atau header.** Referensi tidak punya gradient selain latar ilustrasi.
18. **Jangan emoji** di antarmuka.
19. **Jangan angka palsu** tanpa label data demo. Semua angka harus dari API.
20. **Jangan `hover:scale` pada kartu.** Hanya shadow dan warna.

---

## 11. Aksesibilitas dan responsif

**Aksesibilitas**

- Setiap tombol ikon: `aria-label` Indonesia. Contoh: `aria-label="Tutup dialog"`.
- `focus-visible:ring-2 focus-visible:ring-cw-accent/40 focus-visible:ring-offset-2` di semua elemen interaktif. Tab harus bisa menelusuri seluruh halaman.
- Kontras: teks `cw-ink` di `cw-surface` (≈15:1), `cw-muted` di `cw-surface` (≈5.1:1), putih di `cw-accent` (≈5.4:1). Jangan turunkan `cw-muted` lebih terang.
- Modal: fokus masuk ke elemen pertama, `Escape` menutup, fokus kembali ke pemicu.
- Status tidak boleh disampaikan warna saja. Tambahkan teks (`Kritis`, `Aman`) di samping warna.
- Ring dan grafik: `role="img"` + `aria-label` berisi nilai.

**Responsif**

| Breakpoint | Perilaku |
|---|---|
| `< 640px` | Rail dan sidebar jadi drawer (hamburger di header). Grid 1 kolom. Header aksi jadi ikon saja. Tab bisa di-scroll horizontal, tanpa wrap |
| `640-1023px` | Sidebar drawer. Grid 2 kolom. Toolbar membungkus ke 2 baris |
| `1024-1279px` | Rail + sidebar tampil. Grid 2 kolom |
| `≥ 1280px` | Grid 3 kolom, sidebar terbuka penuh |

Wajib dideklarasikan eksplisit per komponen, bukan diasumsikan.

---

## 12. Definition of done

**Build dan runtime**

- [ ] `pnpm install` bersih.
- [ ] `pnpm prisma:generate && pnpm prisma:push && pnpm prisma:seed` lolos.
- [ ] `pnpm build` lolos tanpa error dan tanpa warning baru.
- [ ] `pnpm dev` menyajikan 6 rute tanpa error di console browser.

**Kesesuaian dengan referensi**

- [ ] Ada rail ikon 64px + sidebar 264px + header 2 baris + toolbar filter + grid kartu.
- [ ] Kartu punya banner ilustrasi pastel, badge gelap kiri-atas, judul 2 baris, 2 ring metrik, tag kode matkul, satu hairline, footer meta + satu aksi.
- [ ] Modal buat baru berbentuk grid 2×3 kartu aksi dengan tombol Batal.
- [ ] Palet sesuai 4.1. Sampel acak 5 piksel di halaman tidak menghasilkan rose/amber/emerald penuh di area chrome.

**Kebersihan**

- [ ] Semua perintah `grep` di Langkah 9 mengembalikan hasil yang diharapkan.
- [ ] Tidak ada string Inggris tersisa di antarmuka (kecuali yang diizinkan 8.3).
- [ ] Tidak ada komentar yang menyebut gambar referensi.
- [ ] Tidak ada file komponen yang tidak di-import.

**Bahasa**

- [ ] `<html lang="id">`.
- [ ] Metadata dan judul halaman Indonesia.
- [ ] Glosarium 8.1 dipakai konsisten (cek: tidak ada "Minggu" untuk week, tidak ada "Assignment").
- [ ] Nama matkul di data demo sudah Indonesia.

**Aksesibilitas**

- [ ] Seluruh alur bisa diselesaikan dengan keyboard saja.
- [ ] Setiap tombol ikon punya `aria-label`.
- [ ] Tidak ada `alert()`/`confirm()`.
- [ ] `prefers-reduced-motion` mematikan animasi.

**Bukti**

- [ ] Screenshot 6 halaman (1440px) dan 2 halaman mobile (390px) dilampirkan di PR.
- [ ] `git diff --stat` menunjukkan perubahan terkonsentrasi di `src/components`, `src/app`, `tailwind.config.ts`, `globals.css`.

---

## 13. Prompt siap tempel

Kalau pekerjaan ini diserahkan ke agen koding lain, kirim teks ini sebagai instruksi:

> Kamu mengerjakan repo Next.js 14 + Tailwind 3 di `E:\ProjectWebsitev2\CollisionWeek`. Baca `UIUX_REDESIGN_SPEC.md` sampai habis, lalu eksekusi bagian 9 secara berurutan tanpa melompat. Aturan yang tidak bisa dinegosiasikan: satu aksen ungu `#5850EC`, warna semantik hanya untuk status, tanpa tombol hitam, tanpa `animate-pulse` di elemen nyata, minimum font 11px, satu hairline per kartu, dan seluruh teks antarmuka berbahasa Indonesia sesuai glosarium 8.1. Jangan mengubah skema Prisma, route URL, atau logika API: ini pekerjaan lapisan tampilan dan teks saja. Sebelum selesai, jalankan seluruh perintah `grep` di Langkah 9 dan checklist bagian 12, lalu laporkan hasil tiap baris checklist beserta output grep yang sebenarnya.
