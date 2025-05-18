// Tampilkan modal saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  var announcementModal = new bootstrap.Modal(
    document.getElementById("announcementModal")
  );
  announcementModal.show();
});

const GEMINI_API_KEY = "AIzaSyCAC9o0F-8jwueQ2N1P1YyOPaviqjwghPY";
const scriptURL =
  "https://script.google.com/macros/s/AKfycbwpbrGU9O267069K9OClGtwQ34FzWmGZzqkpLJCyg9J3QtfX2dvRRHNGxy14yhCv1E0/exec";

const form = document.forms["Form"];
const dateInput = document.getElementById("date");
const filterInput = document.getElementById("filter");
const laguInput = document.getElementById("lagu");
const artisInput = document.getElementById("artist");
const genreInput = document.getElementById("genre");
const loader = document.getElementById("loader");

async function cekLaguDenganGemini(namaLagu, artist, genre) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
  const prompt = `Apakah lagu berjudul "${namaLagu}" dengan artist/band ${artist} dan genre ${genre} layak untuk diputar di sekolah saat jam istirahat? Jawab dengan "Layak karena ..." atau "Tidak layak karena ...". 

Pertimbangkan bahwa:
- Lagu akan diputar saat jam istirahat sebagai hiburan siswa.
- Sebagian besar siswa adalah pelajar Indonesia dan tidak memahami lirik berbahasa Inggris secara mendalam, kecuali kata-kata kasar yang sangat umum diketahui seperti "fuck", "bitch", dsb.
- Lagu boleh bergenre apapun selama tidak mengandung lirik eksplisit secara jelas, termasuk kekerasan ekstrem, pornografi, ujaran kebencian, atau tema negatif seperti narkoba.
- Genre seperti pop punk, rock ringan, R&B modern, atau K-Pop juga boleh jika energinya masih cocok untuk suasana sekolah.
- Penilaian tidak perlu terlalu ketat dan mempertimbangkan popularitas lagu di kalangan pelajar.

Jika tidak mengetahui lagu tersebut berikan jawaban dengan "Tidak Ada Informasi".`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return (
      data.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Gagal mendapatkan jawaban dari AI."
    );
  } catch (error) {
    return "Gagal koneksi ke AI.";
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  loader.style.display = "block"; // Tampilkan loader

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");

  dateInput.value = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

  const hasilAI = await cekLaguDenganGemini(
    laguInput.value,
    artisInput.value,
    genreInput.value
  );
  filterInput.value = hasilAI;

  fetch(scriptURL, { method: "POST", body: new FormData(form) })
    .then(() => {
      alert("✅ Request berhasil dikirim!");
      form.reset();
    })
    .catch((error) => {
      alert("❌ Gagal mengirim data: " + error.message);
    })
    .finally(() => {
      loader.style.display = "none"; // Sembunyikan loader setelah semua selesai
    });
});
