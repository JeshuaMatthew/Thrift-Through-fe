# Thrift-Through Frontend

Aplikasi frontend interaktif untuk platform Thrift-Through, memudahkan pengguna dalam mengelola e-waste dan berinteraksi dalam ekosistem thrifting.

## Tech Stack

- **Library**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [MapLibre GL](https://maplibre.org/) & [React Map GL](https://visgl.github.io/react-map-gl/)
- **State & Logic**: Axios, Socket.io Client, Supercluster (untuk clustering pin di peta)

## Scripts

Berikut adalah penjelasan script yang tersedia di `package.json`:

- `npm run dev`: Menjalankan aplikasi dalam mode pengembangan (development mode) dengan Vite.
- `npm run build`: Melakukan kompilasi TypeScript (`tsc`) dan membangun aplikasi untuk produksi ke dalam folder `dist`.
- `npm run lint`: Menjalankan ESLint untuk mengecek kualitas dan format kode.
- `npm run preview`: Menjalankan preview dari hasil build produksi secara lokal.
- `npm run env`: Menyalin file `.env.example` menjadi `.env`. Berguna untuk inisialisasi awal environment variables.

## Cara Setup

1.  **Clone & Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Setup Environment Variables**:
    Jalankan script `env`:
    ```bash
    npm run env
    ```
    Sesuaikan `VITE_API_URL` (atau variabel sejenis) di file `.env` jika backend berjalan di host/port yang berbeda.

3.  **Menjalankan Aplikasi**:
    ```bash
    npm run dev
    ```
    Aplikasi dapat diakses melalui browser di `http://localhost:5173`.
