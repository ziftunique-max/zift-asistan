import { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import { callAnthropic } from './api';
import { VARSAYILAN_ESLESTIRME, TEMEL_BILGI } from './constants';
import YonetimPaneli from './YonetimPaneli';

function App() {
  const [soru, setSoru] = useState('');
  const [cevap, setCevap] = useState('');
  const [benzerler, setBenzerler] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showYonetim, setShowYonetim] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [tempApiKey, setTempApiKey] = useState('');
  const [dbStats, setDbStats] = useState({ sorular: 0, kurallar: 0, onaylanan: 0 });
  const [showBenzerler, setShowBenzerler] = useState(false);
  const [showDuzeltme, setShowDuzeltme] = useState(false);
  const [duzeltmeNotu, setDuzeltmeNotu] = useState('');
  const [duzeltmeLoading, setDuzeltmeLoading] = useState(false);
  const [duzeltilmisCevap, setDuzeltilmisCevap] = useState('');
  const [kurallar, setKurallar] = useState([]);
  const [tumKurallar, setTumKurallar] = useState([]);
  const [urunBilgileri, setUrunBilgileri] = useState([]);
  const [dbHata, setDbHata] = useState(null);

  const [eslestirme, setEslestirme] = useState([]);
  const [format, setFormat] = useState('isim');
  const [dropdownAcik, setDropdownAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [seciliUrun, setSeciliUrun] = useState(null);
  const dropdownRef = useRef(null);
  const aramaInputRef = useRef(null);

  /* ─── INIT ─── */
  useEffect(() => {
    const savedKey = localStorage.getItem('zift_api_key');
    if (savedKey) { setApiKey(savedKey); setTempApiKey(savedKey); }

    loadDbStats();
    loadKurallar();
    loadUrunBilgileri();
    loadEslestirme();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownAcik(false);
        setAramaMetni('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ─── VERİ YÜKLEME ─── */
  const loadDbStats = async () => {
    try {
      const [soruRes, kuralRes, onayRes] = await Promise.all([
        supabase.from('sorular').select('id', { count: 'exact', head: true }),
        supabase.from('kurallar').select('id', { count: 'exact', head: true }),
        supabase.from('onaylanan_cevaplar').select('id', { count: 'exact', head: true }),
      ]);
      if (soruRes.error || kuralRes.error || onayRes.error) { setDbHata('Veritabanı yüklenemedi'); return; }
      setDbStats({ sorular: soruRes.count || 0, kurallar: kuralRes.count || 0, onaylanan: onayRes.count || 0 });
      setDbHata(null);
    } catch { setDbHata('Veritabanına bağlanılamadı'); }
  };

  const loadKurallar = async () => {
    const { data, error } = await supabase.from('kurallar').select('id, kural, oncelik, aktif').order('oncelik', { ascending: false });
    if (error) { console.error('Kurallar yüklenemedi:', error.message); return; }
    setTumKurallar(data || []);
    setKurallar((data || []).filter(k => k.aktif));
  };

  const loadUrunBilgileri = async () => {
    const { data, error } = await supabase.from('urun_bilgileri').select('id, urun_adi, bilgi_turu, bilgi');
    if (error) { console.error('Ürün bilgileri yüklenemedi:', error.message); return; }
    setUrunBilgileri(data || []);
  };

  const loadEslestirme = async () => {
    try {
      const { data, error } = await supabase.from('eslestirme').select('id, barkod, isim, model_kodu').order('isim');
      if (error) throw error;
      if (data && data.length > 0) {
        setEslestirme(data);
      } else {
        const { error: seedError } = await supabase.from('eslestirme').insert(VARSAYILAN_ESLESTIRME);
        if (seedError) { console.error('Eslestirme seed hatası:', seedError.message); setEslestirme(VARSAYILAN_ESLESTIRME); return; }
        const { data: seeded } = await supabase.from('eslestirme').select('id, barkod, isim, model_kodu').order('isim');
        setEslestirme(seeded || VARSAYILAN_ESLESTIRME);
      }
    } catch {
      setEslestirme(VARSAYILAN_ESLESTIRME);
    }
  };

  /* ─── API KEY ─── */
  const saveApiKey = () => {
    localStorage.setItem('zift_api_key', tempApiKey);
    setApiKey(tempApiKey);
    setShowSettings(false);
  };

  /* ─── ÜRÜN SEÇİCİ ─── */
  const secilenModelKodlari = () => {
    if (!seciliUrun) return [];
    const kodlar = new Set();
    eslestirme.forEach(item => {
      if (format === 'isim' && item.isim === seciliUrun.isim) kodlar.add(item.model_kodu);
      else if (format === 'barkod' && item.barkod === seciliUrun.barkod) kodlar.add(item.model_kodu);
      else if (format === 'modelkodu' && item.model_kodu === seciliUrun.model_kodu) kodlar.add(item.model_kodu);
    });
    return Array.from(kodlar);
  };

  const filtreliListe = () => {
    const q = aramaMetni.toLowerCase();
    if (!q) return eslestirme;
    return eslestirme.filter(item => {
      if (format === 'isim') return item.isim.toLowerCase().includes(q);
      if (format === 'barkod') return item.barkod.toLowerCase().includes(q);
      if (format === 'modelkodu') return item.model_kodu.toLowerCase().includes(q);
      return false;
    });
  };

  const dropdownLabel = (item) => {
    if (format === 'isim') return item.isim;
    if (format === 'barkod') return item.barkod;
    return item.model_kodu;
  };

  /* ─── BENZER SORU ARAMA (iyileştirilmiş) ─── */
  const findSimilarQuestions = async (searchText, modelKodlari) => {
    if (!searchText || searchText.length < 3) return [];
    const keywords = searchText.toLowerCase().split(/\s+/).filter(w => w.length > 2).slice(0, 5);
    if (keywords.length === 0) return [];
    let results = [];

    // Önce onaylanan cevaplardan ara (en güvenilir kaynak)
    for (const keyword of keywords.slice(0, 3)) {
      let q = supabase.from('onaylanan_cevaplar').select('soru, dogru_cevap, urun_adi').ilike('soru', `%${keyword}%`).limit(5);
      const { data, error } = await q;
      if (error) continue;
      if (data) results = [...results, ...data.map(d => ({ soru: d.soru, cevap: d.dogru_cevap, urun_adi: d.urun_adi, kaynak: 'onaylanan' }))];
    }

    // Sonra eski sorulardan ara (ama onaylananlarda zaten olan soruları hariç tut)
    const onaylananSorular = new Set(results.map(r => r.soru?.trim().toLowerCase()));
    for (const keyword of keywords.slice(0, 2)) {
      let q = supabase.from('sorular').select('soru, cevap, urun_adi').ilike('soru', `%${keyword}%`).limit(5);
      if (modelKodlari.length > 0) q = q.in('model_kodu', modelKodlari);
      const { data, error } = await q;
      if (error) continue;
      if (data) {
        const filtered = data.filter(d => !onaylananSorular.has(d.soru?.trim().toLowerCase()));
        results = [...results, ...filtered.map(d => ({ ...d, kaynak: 'eski' }))];
      }
    }

    const unique = results.filter((item, index, self) => index === self.findIndex(t => t.soru === item.soru));
    unique.sort((a, b) => {
      if (a.kaynak === 'onaylanan' && b.kaynak !== 'onaylanan') return -1;
      if (a.kaynak !== 'onaylanan' && b.kaynak === 'onaylanan') return 1;
      return 0;
    });
    return unique.slice(0, 10);
  };

  const getUrunBilgileri = (modelKodlari) => {
    if (!modelKodlari || modelKodlari.length === 0) return urunBilgileri.filter(u => u.urun_adi === 'GENEL');
    return urunBilgileri.filter(u =>
      u.urun_adi === 'GENEL' ||
      modelKodlari.some(k => u.urun_adi && (
        u.urun_adi.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(u.urun_adi.toLowerCase())
      ))
    );
  };

  /* ─── CEVAP ÜRETME (güçlendirilmiş prompt + self-check) ─── */
  const generateAnswer = async () => {
    if (!soru.trim()) return;
    if (!apiKey) { setShowSettings(true); return; }

    setLoading(true);
    setCevap('');
    setBenzerler([]);
    setCopied(false);
    setAutoSaved(false);
    setShowDuzeltme(false);
    setDuzeltilmisCevap('');
    setDuzeltmeNotu('');

    try {
      const modelKodlari = secilenModelKodlari();
      const similarQuestions = await findSimilarQuestions(soru, modelKodlari);
      setBenzerler(similarQuestions);

      const urunBilgi = getUrunBilgileri(modelKodlari);
      const kurallarText = kurallar.map((k, i) => `${i + 1}. ${k.kural}`).join('\n');

      let examplesText = '';
      if (similarQuestions.length > 0) {
        const onaylananlar = similarQuestions.filter(q => q.kaynak === 'onaylanan');
        const eskiler = similarQuestions.filter(q => q.kaynak === 'eski');

        if (onaylananlar.length > 0) {
          examplesText += '\n\n## ONAYLANMIS ORNEKLER (bu cevaplarin tonunu ve tarzini KESINLIKLE taklit et):\n';
          onaylananlar.slice(0, 4).forEach((q, i) => {
            examplesText += `\nOrnek ${i + 1} [ONAYLANMIS]:\nSoru: ${q.soru}\nCevap: ${q.cevap}\n`;
          });
        }
        if (eskiler.length > 0) {
          examplesText += '\n\n## Eski ornekler (referans icin, ama onaylanmislar her zaman oncelikli):\n';
          eskiler.slice(0, 3).forEach((q, i) => {
            examplesText += `\nReferans ${i + 1}:\nSoru: ${q.soru}\nCevap: ${q.cevap}\n`;
          });
        }
      }

      let urunText = '';
      if (urunBilgi.length > 0) {
        urunText = '\n\n## BU URUN HAKKINDA EK BILGILER:\n';
        urunBilgi.forEach(u => { urunText += `- ${u.urun_adi} (${u.bilgi_turu}): ${u.bilgi}\n`; });
      }

      let urunKapsam = '';
      if (modelKodlari.length > 0) {
        urunKapsam = `\n\n## URUN KAPSAMI:\nBu soru su urun(ler) hakkinda: ${modelKodlari.join(', ')}\nSadece bu urun(ler) hakkinda cevap ver.`;
      }

      const systemPrompt = `${TEMEL_BILGI}

## DAVRANIM KURALLARI (Supabase'den canli - bunlara MUTLAKA uy):
${kurallarText}
${urunKapsam}${urunText}${examplesText}

## ONEMLI KONTROL LISTESI - Cevabini yazmadan once su kurallari kontrol et:
- "2 yil garanti" yazdin mi? YAZMA, "omur boyu garanti" yaz.
- Kesin tarih verdin mi (1-2 gun, 3 gun vs)? VERME.
- "silikon bant" dedin mi? "ozel bant" de.
- Musteri sorusunu tekrarliyor musun? TEKRARLAMA, direkt cozume gec.
- "anladigimiz kadariyla" gibi belirsiz giris yaptin mi? YAPMA, direkt konuya gir.
- "Merhabalar" ile basliyor musun? BASLA.
- Birden fazla "efendim" kullandin mi? SADECE 1 KERE kullan.
- [ONAYLANMIS] orneklerin tarzini taklit ettin mi? ET.

Son not: Sadece cevabi yaz. Aciklama, yorum, not ekleme. Yapay zeka oldugundan bahsetme.`;

      const userMessage = `${seciliUrun ? `Urun: ${seciliUrun.isim} (${modelKodlari.join(', ')})\n` : ''}Musteri Sorusu: ${soru}\n\nBu soruya Zift Unique tarzinda kisa ve profesyonel bir cevap yaz.`;

      const text = await callAnthropic({ apiKey, system: systemPrompt, userMessage });
      setCevap(text);
    } catch (error) {
      setCevap('Hata: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /* ─── KOPYALA VE ÖĞREN ─── */
  const handleCopyAndLearn = async () => {
    navigator.clipboard.writeText(cevap);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Hata mesajını kaydetme
    if (cevap.startsWith('Hata:')) return;

    try {
      const soruTrimmed = soru.trim();

      // Duplicate kontrolü
      const { data: existing } = await supabase
        .from('onaylanan_cevaplar')
        .select('id, dogru_cevap')
        .ilike('soru', soruTrimmed)
        .limit(1);

      if (existing && existing.length > 0) {
        // Zaten öğrenilmiş, en güncel cevapla güncelle
        if (existing[0].dogru_cevap !== cevap) {
          await supabase.from('onaylanan_cevaplar')
            .update({ dogru_cevap: cevap, duzeltme_notu: 'Doğrudan onaylandı (güncelleme)' })
            .eq('id', existing[0].id);
        }
      } else {
        // Yeni öğrenme
        const { error } = await supabase.from('onaylanan_cevaplar').insert({
          soru: soruTrimmed,
          urun_adi: seciliUrun ? seciliUrun.isim : null,
          yanlis_cevap: null,
          dogru_cevap: cevap,
          duzeltme_notu: 'Doğrudan onaylandı'
        });
        if (error) console.error('Öğrenme kayıt hatası:', error.message);
      }

      loadDbStats();
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 3000);
    } catch (err) {
      console.error('Otomatik kaydetme hatası:', err.message);
    }
  };

  /* ─── DÜZELTME ─── */
  const handleDuzelt = async () => {
    if (!duzeltmeNotu.trim()) return;
    setDuzeltmeLoading(true);
    try {
      const modelKodlari = secilenModelKodlari();
      const urunBilgi = getUrunBilgileri(modelKodlari);
      let urunText = '';
      if (urunBilgi.length > 0) {
        urunText = '\n\nURUN BILGILERI:\n';
        urunBilgi.forEach(u => { urunText += `- ${u.urun_adi} (${u.bilgi_turu}): ${u.bilgi}\n`; });
      }

      const text = await callAnthropic({
        apiKey,
        system: `${TEMEL_BILGI}

AKTIF KURALLAR:
${kurallar.map((k, i) => `${i + 1}. ${k.kural}`).join('\n')}${urunText}

GOREV: Duzeltme notuna gore yeni bir cevap uret. Duzeltme notu bozuk Turkce ile yazilmis olabilir, sen duzgun Turkce ile cevap yaz. Her zaman "Merhabalar" ile basla, sadece 1 kere "efendim" kullan. Sadece cevabi yaz, aciklama ekleme.`,
        userMessage: `${seciliUrun ? `Urun: ${seciliUrun.isim} (${modelKodlari.join(', ')})\n` : ''}Musteri Sorusu: ${soru}\n\nYanlis Cevap: ${cevap}\n\nDuzeltme Notu: ${duzeltmeNotu}\n\nBu duzeltme notuna gore yeni dogru cevabi yaz.`
      });
      setDuzeltilmisCevap(text);
    } catch (error) {
      alert('Hata: ' + error.message);
    } finally {
      setDuzeltmeLoading(false);
    }
  };

  const handleOnayla = async () => {
    try {
      const soruTrimmed = soru.trim();

      // Duplicate kontrolü
      const { data: existing } = await supabase
        .from('onaylanan_cevaplar')
        .select('id')
        .ilike('soru', soruTrimmed)
        .limit(1);

      if (existing && existing.length > 0) {
        const { error } = await supabase.from('onaylanan_cevaplar').update({
          urun_adi: seciliUrun ? seciliUrun.isim : null,
          yanlis_cevap: cevap,
          dogru_cevap: duzeltilmisCevap,
          duzeltme_notu: duzeltmeNotu
        }).eq('id', existing[0].id);
        if (error) { alert('Güncelleme hatası: ' + error.message); return; }
      } else {
        const { error } = await supabase.from('onaylanan_cevaplar').insert({
          soru: soruTrimmed,
          urun_adi: seciliUrun ? seciliUrun.isim : null,
          yanlis_cevap: cevap,
          dogru_cevap: duzeltilmisCevap,
          duzeltme_notu: duzeltmeNotu
        });
        if (error) { alert('Kaydetme hatası: ' + error.message); return; }
      }

      setCevap(duzeltilmisCevap);
      setShowDuzeltme(false);
      setDuzeltilmisCevap('');
      setDuzeltmeNotu('');
      loadDbStats();
      navigator.clipboard.writeText(duzeltilmisCevap);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      alert('Kaydetme hatası: ' + error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generateAnswer(); }
  };

  const usePreviousAnswer = (item) => { setCevap(item.cevap); setShowBenzerler(false); };


  /* ─── RENDER ─── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">🛁 Zift Unique Asistan</h1>
            <p className="text-slate-400 text-xs">
              📚 {dbStats.sorular.toLocaleString()} soru • 📋 {dbStats.kurallar} kural • ✅ {dbStats.onaylanan} öğrenilmiş
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowYonetim(true)}
              className="p-3 bg-purple-600/30 hover:bg-purple-600/50 rounded-xl text-purple-300 transition-colors text-sm">🛠️</button>
            <button onClick={() => { setTempApiKey(apiKey); setShowSettings(true); }}
              className="p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl text-slate-300 transition-colors">⚙️</button>
          </div>
        </div>

        {/* UYARILAR */}
        {dbHata && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">⚠️ {dbHata}. <button onClick={() => { loadDbStats(); loadKurallar(); loadUrunBilgileri(); }} className="underline font-medium">Tekrar dene</button></p>
          </div>
        )}

        {!apiKey && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
            <p className="text-amber-400 text-sm">⚠️ API anahtarı gerekli. <button onClick={() => setShowSettings(true)} className="underline font-medium">Ayarlar'dan</button> ekleyin.</p>
          </div>
        )}

        {/* SORU FORMU */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 mb-6 border border-slate-700">
          <div className="flex gap-2 mb-3">
            {[['isim', '🏷️ İsim'], ['barkod', '📦 Barkod'], ['modelkodu', '🔑 Model']].map(([val, label]) => (
              <button key={val} onClick={() => { setFormat(val); setSeciliUrun(null); setAramaMetni(''); }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${format === val ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'}`}>
                {label}
              </button>
            ))}
          </div>

          {/* ÜRÜN DROPDOWN */}
          <div className="mb-4 relative" ref={dropdownRef}>
            <label className="block text-slate-300 text-sm font-medium mb-2">Ürün <span className="text-slate-500">(opsiyonel)</span></label>
            <div onClick={() => { setDropdownAcik(!dropdownAcik); setTimeout(() => aramaInputRef.current?.focus(), 50); }}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white cursor-pointer flex justify-between items-center hover:border-slate-500 transition-colors">
              <span>
                {seciliUrun ? (
                  <>
                    <span className="text-blue-400 font-medium">{dropdownLabel(seciliUrun)}</span>
                    {format !== 'modelkodu' && <span className="text-slate-500 text-xs ml-2">{secilenModelKodlari().join(', ')}</span>}
                  </>
                ) : <span className="text-slate-500">🌐 Genel (tüm ürünler)</span>}
              </span>
              <span className="text-slate-500 text-xs ml-2">{dropdownAcik ? '▲' : '▼'}</span>
            </div>

            {dropdownAcik && (
              <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '300px' }}>
                <input ref={aramaInputRef} value={aramaMetni} onChange={e => setAramaMetni(e.target.value)}
                  placeholder={`${format === 'isim' ? 'İsim' : format === 'barkod' ? 'Barkod' : 'Model kodu'} ara...`}
                  className="bg-slate-900 border-b border-slate-600 px-4 py-2.5 text-white text-sm placeholder-slate-500 outline-none flex-shrink-0" />
                <div className="overflow-y-auto">
                  <div onClick={() => { setSeciliUrun(null); setDropdownAcik(false); setAramaMetni(''); }}
                    className={`px-4 py-2.5 cursor-pointer text-sm border-b border-slate-700 transition-colors ${!seciliUrun ? 'text-blue-400 bg-blue-500/10' : 'text-slate-400 hover:bg-slate-700'}`}>
                    🌐 Genel
                  </div>
                  {(() => {
                    const liste = filtreliListe();
                    if (liste.length === 0) return <div className="px-4 py-3 text-slate-500 text-sm text-center">Sonuç bulunamadı</div>;
                    return liste.map((item) => (
                      <div key={item.barkod} onClick={() => { setSeciliUrun(item); setDropdownAcik(false); setAramaMetni(''); }}
                        className={`px-4 py-2.5 cursor-pointer text-sm flex justify-between items-center transition-colors hover:bg-slate-700 ${seciliUrun && dropdownLabel(seciliUrun) === dropdownLabel(item) ? 'bg-blue-500/10 text-blue-400' : 'text-slate-200'}`}>
                        <span className="font-medium">{dropdownLabel(item)}</span>
                        {format !== 'modelkodu' && <span className="text-slate-500 text-xs ml-4 truncate">{item.model_kodu}</span>}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-slate-300 text-sm font-medium mb-2">Müşteri Sorusu <span className="text-red-400">*</span></label>
            <textarea value={soru} onChange={(e) => setSoru(e.target.value)} onKeyDown={handleKeyDown}
              placeholder="Müşterinin sorusunu buraya yapıştırın..." rows={3}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none" />
          </div>

          <button onClick={generateAnswer} disabled={loading || !soru.trim()}
            className={`w-full py-4 rounded-xl font-semibold text-white transition-all ${loading || !soru.trim() ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25'}`}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Cevap Üretiliyor...
              </span>
            ) : '✨ Cevap Üret'}
          </button>
        </div>

        {/* CEVAP PANELİ */}
        {cevap && !showDuzeltme && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700 mb-6">
            <h2 className="text-lg font-semibold text-white mb-4">📝 Önerilen Cevap</h2>
            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700 mb-4">
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{cevap}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleCopyAndLearn}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${copied ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                {copied ? '✓ Kopyalandı!' : '✓ Kopyala & Öğret'}
              </button>
              <button onClick={() => setShowDuzeltme(true)}
                className="flex-1 py-3 rounded-xl font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all">
                ❌ Yanlış
              </button>
            </div>
            {autoSaved && (
              <p className="text-center text-xs text-green-400/70 mt-2 animate-pulse">✓ Otomatik öğrenildi</p>
            )}
          </div>
        )}

        {/* DÜZELTME PANELİ */}
        {showDuzeltme && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-orange-500/30 mb-6">
            <h2 className="text-lg font-semibold text-orange-400 mb-4">🔧 Düzeltme</h2>
            <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-700 mb-4">
              <p className="text-slate-400 text-sm mb-1">Yanlış Cevap:</p>
              <p className="text-slate-300 text-sm">{cevap}</p>
            </div>
            {!duzeltilmisCevap ? (
              <>
                <div className="mb-4">
                  <label className="block text-slate-300 text-sm font-medium mb-2">Ne yanlış? <span className="text-slate-500">(kısa not yeterli, bozuk Türkçe de olur)</span></label>
                  <textarea value={duzeltmeNotu} onChange={(e) => setDuzeltmeNotu(e.target.value)}
                    placeholder="Örn: 3 adet geliyo 1 deil, hediye yok dememiz lazım..." rows={2}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors resize-none" />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setShowDuzeltme(false)} className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">İptal</button>
                  <button onClick={handleDuzelt} disabled={duzeltmeLoading || !duzeltmeNotu.trim()}
                    className={`flex-1 py-3 rounded-xl font-medium text-white transition-all ${duzeltmeLoading || !duzeltmeNotu.trim() ? 'bg-slate-600 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-500'}`}>
                    {duzeltmeLoading ? '⏳ Düzeltiliyor...' : '🔧 Düzelt'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30 mb-4">
                  <p className="text-green-400 text-sm mb-1">✓ Düzeltilmiş Cevap:</p>
                  <p className="text-slate-200">{duzeltilmisCevap}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setDuzeltilmisCevap(''); setDuzeltmeNotu(''); }}
                    className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">Hala Yanlış</button>
                  <button onClick={handleOnayla} className="flex-1 py-3 rounded-xl font-medium text-white bg-green-600 hover:bg-green-500 transition-colors">✓ Tamam, Kaydet & Öğret</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* BENZER SORULAR */}
        {benzerler.length > 0 && !showDuzeltme && (
          <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-slate-700">
            <button onClick={() => setShowBenzerler(!showBenzerler)} className="flex items-center justify-between w-full text-left">
              <h2 className="text-lg font-semibold text-white">🔍 Benzer Sorular ({benzerler.length})</h2>
              <span className="text-slate-400">{showBenzerler ? '▲' : '▼'}</span>
            </button>
            {showBenzerler && (
              <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
                {benzerler.map((item, index) => (
                  <button key={`${item.kaynak}-${index}`} onClick={() => usePreviousAnswer(item)}
                    className={`w-full text-left rounded-xl p-4 transition-colors ${item.kaynak === 'onaylanan' ? 'bg-green-500/10 hover:bg-green-500/20 border border-green-500/30' : 'bg-slate-700/50 hover:bg-slate-700'}`}>
                    {item.kaynak === 'onaylanan' && <span className="text-green-400 text-xs mb-1 block">✓ Öğrenilmiş</span>}
                    <p className="text-white text-sm font-medium mb-1">{item.soru}</p>
                    <p className="text-slate-400 text-xs line-clamp-2">{item.cevap}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">💡 Kopyala = otomatik öğrenir • Yanlış = düzeltip öğretirsin • 🛠️ = kuralları ve bilgileri yönet</p>
        </div>
      </div>

      {/* AYARLAR MODAL */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">⚙️ Ayarlar</h3>
            <div className="mb-4">
              <label className="block text-slate-300 text-sm font-medium mb-2">Anthropic API Anahtarı</label>
              <input type="password" value={tempApiKey} onChange={(e) => setTempApiKey(e.target.value)} placeholder="sk-ant-..."
                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500" />
              <p className="text-slate-500 text-xs mt-2">
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">console.anthropic.com</a> adresinden alın.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowSettings(false)} className="flex-1 py-3 rounded-xl font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">İptal</button>
              <button onClick={saveApiKey} className="flex-1 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {/* YÖNETİM PANELİ */}
      {showYonetim && (
        <YonetimPaneli
          onClose={() => setShowYonetim(false)}
          kurallar={tumKurallar}
          loadKurallar={loadKurallar}
          urunBilgileri={urunBilgileri}
          loadUrunBilgileri={loadUrunBilgileri}
          eslestirme={eslestirme}
          loadEslestirme={loadEslestirme}
          dbStats={dbStats}
          loadDbStats={loadDbStats}
        />
      )}
    </div>
  );
}

export default App;
