import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Upload, Image as ImageIcon } from 'lucide-react';
import './App.css';
import defaultLogo from './assets/altma_logo.png';
import metaLogo from './assets/meta_logo.png';

function App() {
  const [name, setName] = useState('Oseias Oliveira de Souza');
  const [role, setRole] = useState('Soldador III');
  const [phone, setPhone] = useState('(65) 99688-7206');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(defaultLogo);

  const badgeRef = useRef<HTMLDivElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generatePDF = async () => {
    if (!badgeRef.current) return;

    try {
      // Small timeout to ensure fonts/images are ready
      await new Promise(resolve => setTimeout(resolve, 500));

      const canvas = await html2canvas(badgeRef.current, {
        scale: 2, // 2x scale is usually enough and prevents huge memory limits
        useCORS: true,
        backgroundColor: '#ffffff',
        // Make sure it captures the entire element
        width: badgeRef.current.scrollWidth,
        height: badgeRef.current.scrollHeight
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // The grid has 2 columns, 2 rows.
      // We know 1 CSS pixel was mapped to 0.25mm in CSS.
      // (240px width = 6cm, 480px height = 12cm)
      // We can easily convert the exact rendered pixel dimensions of the preview box to millimeters.
      const cssWidthPx = badgeRef.current.scrollWidth;
      const cssHeightPx = badgeRef.current.scrollHeight;

      let finalWidth = cssWidthPx * 0.25;
      let finalHeight = cssHeightPx * 0.25;

      // Ensure it doesn't somehow overflow A4 just in case
      if (finalWidth > pdfWidth) {
        const ratio = pdfWidth / finalWidth;
        finalWidth = pdfWidth;
        finalHeight = finalHeight * ratio;
      }
      if (finalHeight > pdfHeight) {
        const ratio = pdfHeight / finalHeight;
        finalHeight = pdfHeight;
        finalWidth = finalWidth * ratio;
      }

      // Center the image horizontally and vertically
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = (pdfHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'JPEG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`cracha_loto_${name.replace(/\s+/g, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF', error);
      alert('Houve um erro ao gerar o PDF. Verifique o console.');
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Criador de Crachás de Bloqueio (LOTO)</h1>
      </header>

      <main className="main-content">
        {/* FORM PANEL */}
        <section className="form-panel">
          <h2>Dados do Funcionário</h2>

          <div className="form-group">
            <label>Nome Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: João da Silva"
            />
          </div>

          <div className="form-group">
            <label>Função / Cargo</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Ex: Eletricista"
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="form-group">
            <label>Foto do Funcionário</label>
            <div className="file-input-wrapper">
              <input type="file" accept="image/*" onChange={handlePhotoUpload} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <Upload size={32} color="#6b7280" />
                <span className="file-input-text">
                  Clique ou arraste a foto aqui<br />
                  <small style={{ fontWeight: 'normal' }}>Recomendado 3x4 (com proporção retrato)</small>
                </span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Logo da Empresa (Verso)</label>
            <select
              value={logoUrl || defaultLogo}
              onChange={(e) => setLogoUrl(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value={defaultLogo}>Altma</option>
              <option value={metaLogo}>Meta Industrial</option>
            </select>
          </div>

          <div className="action-buttons">
            <button className="btn btn-primary" onClick={generatePDF}>
              <Download size={20} />
              Salvar em PDF
            </button>
          </div>
        </section>

        {/* PREVIEW PANEL */}
        <section className="preview-panel">
          <h2>Visualização</h2>

          <div className="badge-wrapper">
            <div className="print-page-container" ref={badgeRef}>
              <div className="badges-grid">

                {/* 1. TOP LEFT: FRONT BADGE */}
                <div className="grid-cell">
                  <BadgeFront
                    name={name}
                    role={role}
                    phone={phone}
                    photoUrl={photoUrl}
                  />
                </div>

                {/* 2. TOP RIGHT: BACK BADGE */}
                <div className="grid-cell">
                  <BadgeBack logoUrl={logoUrl} />
                </div>

                {/* 3. BOTTOM LEFT: FRONT BADGE */}
                <div className="grid-cell">
                  <BadgeFront
                    name={name}
                    role={role}
                    phone={phone}
                    photoUrl={photoUrl}
                  />
                </div>

                {/* 4. BOTTOM RIGHT: BACK BADGE */}
                <div className="grid-cell">
                  <BadgeBack logoUrl={logoUrl} />
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// Extracted Components for Reusability

function BadgeFront({ name, role, phone, photoUrl }: { name: string, role: string, phone: string, photoUrl: string | null }) {
  return (
    <div className="badge-card">
      <div className="badge-header-black">
        <div className="perigo-pill">PERIGO</div>
      </div>

      <div className="nao-ligue-box ">
        NÃO LIGUE
      </div>

      <div className="front-main-content">
        <div className="front-top-section ">
          <div className="text-estou-trabalhando">
            <span>ESTOU</span>
            <span>TRABALHANDO</span>
            <span>NESTE</span>
            <span>EQUIPAMENTO</span>
          </div>
          <div className="photo-container">
            {photoUrl ? (
              <img src={photoUrl} alt="Foto funcionário" />
            ) : (
              <ImageIcon size={40} color="#9ca3af" />
            )}
          </div>
        </div>

        <div className="front-bottom-info">
          <div className="info-line">
            <strong>NOME:</strong> {name.toUpperCase()}
          </div>
          <div className="info-line">
            <strong>FUNÇÃO:</strong> {role}
          </div>
          <div className="info-line-center">
            Telefone: {phone}
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgeBack({ logoUrl }: { logoUrl: string | null }) {
  return (
    <div className="badge-card">
      <div className="badge-header-black">
        <div className="perigo-pill">PERIGO</div>
      </div>

      <div className="back-main-content">
        ESTA ETIQUETA E<br />CADEADO SÓ PODEM<br />SER REMOVIDOS PELA<br />PESSOA INDICADA<br />NO VERSO
      </div>

      <div className="back-logo-container">
        {logoUrl && (
          <img src={logoUrl} alt="Logo Empresa" className="back-logo-image" />
        )}
      </div>
    </div>
  );
}

export default App;
