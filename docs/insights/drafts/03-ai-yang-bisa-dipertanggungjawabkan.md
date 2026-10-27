# DRAFT — menunggu review owner

| Field | Isi |
|---|---|
| Judul | AI yang Bisa Dipertanggungjawabkan: Otomasi dengan Kendali Manusia |
| Untuk artikel CMS | **AI & Transformasi Digital** (slug sekarang `ai-digital-transformation`) |
| Kategori | AI · Technology |
| Penulis | **[ISI: nama + jabatan]** |
| Tanggal terbit | **[ISI]** |
| Ringkasan (SEO, ±155 karakter) | AI paling berguna bukan yang paling canggih, tapi yang hasilnya bisa diperiksa. Pelajaran dari dashboard produksi dan DORA, framework OCR milik PASTI. |
| Perkiraan baca | ±3–4 menit |

**Catatan untuk reviewer**
- Layanan Solusi AI Custom (predictive analytics, NLP, dashboard machine learning) diambil dari halaman Technology / COMPRO 2025. Tonggak "Sejak 2024: sistem bisnis berbasis AI" diambil dari timeline perusahaan (halaman About).
- Data Nagaria Textile (40% / 25%) sama dengan draft 01 dan sudah di-approve owner pada 2026-10-07.
- Semua keterangan tentang **DORA** (OCR, klasifikasi, ekstraksi field, indikasi confidence, review oleh manusia, peran, ekspor) diambil dari halaman produk /dora. Draft ini **tidak menyebut klien, akurasi, atau angka DORA** karena datanya tidak ada.
- Bagian "Lima prinsip" dan "Pertanyaan untuk tim Anda" adalah **sudut pandang PASTI yang baru ditulis**. Isinya opini, bukan klaim. Mohon dicek.

---

## AI yang Bisa Dipertanggungjawabkan

**AI yang paling berguna bagi bisnis jarang yang paling canggih. Yang paling berguna adalah AI yang hasilnya bisa diperiksa, dipercaya, dan langsung dipakai dalam pekerjaan sehari-hari.**

Hampir setiap organisasi sekarang ingin "memakai AI". Tapi di lapangan, pertanyaan yang lebih penting biasanya justru lebih sederhana: keputusan apa yang ingin dipercepat, data apa yang dibutuhkan untuk itu, dan siapa yang bertanggung jawab kalau hasilnya keliru?

Sejak 2024, PASTI membangun sistem bisnis berbasis AI, mulai dari *predictive analytics* dan *natural language processing* sampai dashboard *machine learning*. Dari pengalaman itu, kami melihat pola yang sama berulang kali: AI baru bekerja dengan baik kalau fondasinya siap dan manusia tetap memegang kendali.

### Sebelum AI: data harus terlihat dulu

Banyak inisiatif AI tersendat bukan karena modelnya, tapi karena datanya belum siap. Data masih tersebar, dicatat manual, dan baru terkumpul di akhir minggu.

Contohnya Nagaria Textile. Perusahaan ini perlu memantau efisiensi produksi di banyak shift dan banyak mesin tenun, sementara data produksinya tersebar dan pelaporannya masih manual. Langkah pertamanya bukan model prediksi, melainkan dashboard pemantauan produksi yang menyatukan RPM, efisiensi, putus benang, dan kualitas dalam satu tampilan real-time.

Hasil yang tercatat: **pengambilan keputusan 40% lebih cepat** dan **downtime turun 25%**.

Pelajarannya: visibilitas adalah prasyarat. Data yang sudah terkumpul rapi, real-time, dan dipakai setiap hari adalah bahan bakar yang dibutuhkan analitik dan AI berikutnya.

### Ketika AI membaca dokumen

Salah satu pekerjaan yang paling cocok dibantu AI adalah pekerjaan berulang yang memakan waktu: membaca dokumen, mengetik ulang nilainya ke sistem, lalu memeriksanya lagi.

Di banyak organisasi, PDF dan hasil scan datang setiap hari. Masih ada orang yang harus membacanya satu per satu, mengetik nilai yang sama ke sistem, dan mencarinya lagi ketika dibutuhkan. Belum lagi setiap jenis dokumen punya tata letak dan field yang berbeda, dan setiap organisasi punya alur persetujuan sendiri.

Untuk masalah inilah PASTI membangun **DORA**, framework pengenalan dokumen yang dapat dikonfigurasi. DORA membaca teks dari dokumen digital maupun hasil scan dengan OCR, mengenali jenis dokumennya, lalu mengekstrak nilai seperti nomor dokumen, tanggal, perihal, dan nama ke dalam field terstruktur sesuai template yang dikonfigurasi.

Yang paling penting justru langkah setelahnya. **Hasil OCR ditinjau, bukan dianggap benar.** Setiap field punya indikasi *confidence*, sehingga reviewer tahu mana yang perlu dicek lebih dulu. Setiap nilai ditampilkan di samping posisinya di halaman sumber, lalu dicek, dikoreksi bila perlu, dan diputuskan oleh orang yang berwenang. Setelah itu, datanya bisa dicari dan diekspor untuk langkah berikutnya dalam proses bisnis.

### Otomasi dengan kendali manusia

Pendekatan "manusia tetap memutuskan" sering dianggap memperlambat otomasi. Kenyataannya sebaliknya. AI yang hasilnya bisa diperiksa adalah AI yang berani dipakai organisasi untuk pekerjaan sungguhan.

Ada tiga alasan:

- **Kepercayaan.** Tim lebih mudah menerima sistem yang menunjukkan dasar hasilnya daripada sistem yang meminta hasilnya dipercaya begitu saja.
- **Akuntabilitas.** Ketika keputusan akhir dipegang orang dengan peran yang jelas, selalu ada yang bertanggung jawab atas data yang masuk ke sistem.
- **Perbaikan berkelanjutan.** Koreksi dari reviewer menunjukkan di mana sistem masih lemah, sehingga konfigurasinya bisa terus disempurnakan.

### Lima prinsip yang kami pegang

**1. Mulai dari keputusan, bukan dari modelnya.**
Tentukan dulu keputusan apa yang ingin dipercepat atau diperbaiki. Teknologinya mengikuti.

**2. Rapikan datanya sebelum mengotomasi.**
Visibilitas real-time sering memberi dampak besar bahkan sebelum ada model prediksi apa pun.

**3. Tunjukkan dasar setiap hasil.**
Confidence, posisi sumber, dan riwayat koreksi membuat hasil AI bisa diperiksa, bukan sekadar dipercaya.

**4. Sesuaikan dengan proses yang sudah ada.**
Setiap organisasi punya jenis dokumen, field, dan SOP sendiri. AI harus dikonfigurasi mengikuti itu, bukan sebaliknya.

**5. Atur siapa boleh melakukan apa.**
Siapa yang boleh mengunggah, mengoreksi, memutuskan, dan mengekspor perlu diatur per peran, terutama ketika datanya sensitif.

### Pertanyaan untuk tim Anda

- Keputusan apa yang paling sering tertunda karena menunggu data?
- Berapa banyak pekerjaan tim Anda yang sebenarnya hanya memindahkan nilai dari dokumen ke sistem?
- Kalau sebuah sistem AI memberi hasil yang keliru, siapa yang akan menyadarinya, dan bagaimana caranya?
- Apakah data Anda hari ini sudah cukup rapi untuk dipakai sebagai dasar analitik?

### Penutup

Transformasi digital dengan AI bukan soal mengganti orang dengan mesin. Ini soal membebaskan orang dari pekerjaan berulang, supaya waktu dan perhatian mereka dipakai untuk keputusan yang benar-benar membutuhkan penilaian manusia.

*Pelajari lebih lanjut: DORA — pengenalan dokumen & verifikasi OCR · Kapabilitas teknologi PASTI*
