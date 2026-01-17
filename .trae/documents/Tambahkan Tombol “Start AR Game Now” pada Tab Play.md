## Ringkasan
Saat ini, layar Play adalah Ruang Cerita dan tidak memiliki tombol “Start AR Game Now”. Route AR tetap tersedia di stack game ([_layout.tsx](file:///d:/Ngoding/expr/gili-main/app/game/_layout.tsx#L5-L10)), namun tidak di-ekspos di UI. Saya akan menambahkan tombol CTA “Start AR Game Now” yang menavigasi ke [/game/ar-camera], mengikuti gaya komponen yang sudah ada.

## Perubahan yang Diusulkan
1. Tambah CTA di Ruang Cerita
- Lokasi: bagian atas konten di [game.tsx](file:///d:/Ngoding/expr/gili-main/app/(tabs)/game.tsx#L157-L170), tepat setelah header.
- Komponen: TouchableOpacity + LinearGradient, label “Start AR Game Now”.
- Aksi: `router.push('/game/ar-camera')`.

2. Konsistensi Desain
- Warna gradien selaras dengan palet yang ada (hijau/teal atau biru sesuai preferensi aplikasi).
- Padding, radius, dan tipografi mengikuti style yang sudah ada di `styles`.

3. Aksesibilitas & Responsif
- Letakkan tombol di atas list konten agar selalu terlihat.
- Tambahkan sedikit margin/spacing agar tidak menutupi elemen lain.

## Catatan Teknis
- Route AR sudah tersedia: [game/_layout.tsx](file:///d:/Ngoding/expr/gili-main/app/game/_layout.tsx#L5-L10) termasuk `ar-camera`.
- Implementasi AR di [/game/ar-camera](file:///d:/Ngoding/expr/gili-main/app/game/ar-camera.tsx) menggunakan Vision Camera + Face Detector, siap dijalankan.

## Pengujian
- Buka tab Play, pastikan tombol terlihat dan responsif.
- Tekan tombol → navigasi ke layar AR berfungsi.
- Verifikasi layar AR menampilkan pertanyaan di dahi dan dua opsi di kiri/kanan dengan deteksi gerakan kepala (threshold ±15°), serta feedback visual saat terpilih.

## Alternatif (opsional)
- Tambahkan FAB “AR” mengambang di kanan bawah agar akses cepat selalu tersedia.
- Tambah item menu di header untuk membuka AR dari mana saja.

Apakah Anda setuju dengan rencana ini? Jika ya, saya akan menerapkan perubahan di file [game.tsx](file:///d:/Ngoding/expr/gili-main/app/(tabs)/game.tsx) dan menyesuaikan style seperlunya.