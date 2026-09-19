"use client";

export default function ExportExcelButton({
  prospects,
}: {
  prospects: any[];
}) {
  async function downloadExcel() {
    const response = await fetch("/api/hercules/export", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prospects }),
    });

    if (!response.ok) {
      alert("No se pudo generar el Excel.");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "CACERIA-HERCULES-TTP.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={downloadExcel}
      className="mt-4 inline-block bg-gold text-black font-bold rounded-lg px-5 py-3"
    >
      📊 DESCARGAR CACERÍA EXCEL
    </button>
  );
}
