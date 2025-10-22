// Fungsi untuk mengambil dan menampilkan data Wikipedia
        async function fetchWikipediaContent() {
            const wikiContent = document.getElementById('wiki-content');
            
            try {
                // Tambahkan header User-Agent untuk menghindari error
                const response = await fetch('https://id.wikipedia.org/api/rest_v1/page/html/Candi_Borobudur', {
                    headers: {
                        'User-Agent': 'BorobudurWebApp/1.0 (https://example.com; admin@example.com)',
                        'Accept': 'text/html'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const htmlContent = await response.text();
                
                // Parse HTML dan bersihkan konten yang tidak diperlukan
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, 'text/html');
                
                // Hapus elemen yang tidak diinginkan (navbar, sidebar, dll)
                const unwantedElements = doc.querySelectorAll(
                    '.navbox, .infobox, .reference, .mw-editsection, .metadata, .ambox, .sistersitebox'
                );
                unwantedElements.forEach(el => el.remove());
                
                // Ambil hanya konten utama
                const mainContent = doc.querySelector('main') || doc.body;
                
                // Update semua link internal Wikipedia untuk membuka di tab baru
                const links = mainContent.querySelectorAll('a[href^="/"]');
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('/wiki/')) {
                        link.target = '_blank';
                        link.href = 'https://id.wikipedia.org' + href;
                    }
                });

                // Tampilkan konten yang sudah dibersihkan
                wikiContent.innerHTML = mainContent.innerHTML;
                
            } catch (error) {
                console.error('Error fetching Wikipedia content:', error);
                wikiContent.innerHTML = `
                    <div class="error">
                        <h3>Gagal memuat konten</h3>
                        <p>Terjadi kesalahan saat mengambil data dari Wikipedia. Silakan refresh halaman atau coba lagi nanti.</p>
                        <p><small>Error: ${error.message}</small></p>
                    </div>
                `;
            }
        }

        // Fungsi untuk menangani error gambar
        function handleImageErrors() {
            const images = document.querySelectorAll('#wiki-content img');
            images.forEach(img => {
                img.onerror = function() {
                    this.style.display = 'none';
                };
            });
        }

        // Event listener untuk memuat konten ketika halaman siap
        document.addEventListener('DOMContentLoaded', function() {
            fetchWikipediaContent();
            
            // Set interval untuk menangani gambar yang mungkin load terlambat
            setTimeout(handleImageErrors, 2000);
        });

        // Event listener untuk navbar - mencegah perilaku default
        document.querySelectorAll('.navbar a').forEach(link => {
            link.addEventListener('click', function(e) {
                if (this.getAttribute('href') === '#' || 
                    this.getAttribute('href') === '/sejarah.html') {
                    e.preventDefault();
                    // Tambahkan logika tambahan di sini jika diperlukan
                    if (this.getAttribute('href') === '/sejarah.html') {
                        window.scrollTo({
                            top: document.querySelector('.wiki-container').offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });

        // Main function - hanya jalankan API di halaman sejarah
        document.addEventListener('DOMContentLoaded', function() {
            const currentPage = getCurrentPage();
            
            if (currentPage === 'sejarah.html' || currentPage === 'sejarah') {
                // Tampilkan konten sejarah dan sembunyikan konten lain
                document.getElementById('sejarah-content').style.display = 'block';
                document.getElementById('other-content').style.display = 'none';
                
                // Jalankan API Wikipedia
                fetchWikipediaContent();
            } else {
                // Sembunyikan konten sejarah dan tampilkan konten default
                document.getElementById('sejarah-content').style.display = 'none';
                document.getElementById('other-content').style.display = 'block';
            }
        });